<template>
  <div class="mm-viewport"
       ref="viewport"
       :style="{ height: viewportHeight, '--fs': fontScale }"
       @mousedown="onMouseDown"
       @mousemove="onMouseMove"
       @mouseup="onMouseUp"
       @mouseleave="onMouseUp"
       @wheel.prevent="onWheel">

    <!-- 顶部工具条：字号实时可调 + 视图控制 -->
    <div class="mm-toolbar" @mousedown.stop>
      <div class="tb-font">
        <span class="tb-label">字号</span>
        <button @click="changeFont(-0.1)" title="缩小字号">A−</button>
        <input type="range" min="0.7" max="1.8" step="0.05" v-model.number="fontScale" />
        <button @click="changeFont(0.1)" title="放大字号">A＋</button>
        <span class="tb-val">{{ Math.round(fontScale * 100) }}%</span>
      </div>
      <div class="tb-sep"></div>
      <div class="tb-view">
        <button @click="zoomBy(1.2)" title="放大视图">＋</button>
        <span>{{ Math.round(scale * 100) }}%</span>
        <button @click="zoomBy(1 / 1.2)" title="缩小视图">－</button>
        <button class="tb-text" @click="fitView" title="适应窗口宽度">适应</button>
        <button class="tb-text" @click="resetLayout" title="节点恢复自动排列">重置</button>
      </div>
    </div>

    <!-- 画布：所有节点和连线都放在这个可平移缩放的层里 -->
    <div class="mm-world" :style="worldStyle">

      <!-- 连线层：贝塞尔曲线（先画，位于节点下方） -->
      <svg class="mm-links" :width="bounds.w" :height="bounds.h">
        <path v-for="edge in edges" :key="edge.id"
              :d="edge.d" :stroke="edge.color"
              fill="none" :stroke-width="edge.width" />
      </svg>

      <!-- 节点层 -->
      <div v-for="n in nodes" :key="n.node.id"
           class="mm-node"
           :class="'lv-' + n.depth + ' ' + nodeStateClass(n.node) + (nodeDrag && nodeDrag.id === n.node.id ? ' is-dragging' : '')"
           :style="{ left: n.x + 'px', top: (n.y - n.h / 2) + 'px', width: n.w + 'px', height: n.h + 'px' }"
           @mousedown="onNodeMouseDown($event, n)"
           @click="onNodeClick(n)">

        <span v-if="n.depth === 0" class="mm-root-dot"></span>
        <span v-else-if="n.node.status" class="mm-dot" :class="'dot-' + n.node.status"></span>
        <span v-else class="mm-dot dot-normal"></span>

        <div class="mm-node-body">
          <div class="mm-name-row">
            <span class="mm-name">{{ n.node.name }}</span>
            <!-- 有子节点：折叠开关 -->
            <span v-if="n.node.children && n.node.children.length"
                  class="mm-fold" :title="n.expanded ? '收起' : '展开'"
                  @mousedown.stop
                  @click.stop="toggleNode(n.node)">
              {{ n.expanded ? '−' : '+' }}
            </span>
          </div>
          <div v-if="n.node.desc" class="mm-desc">{{ n.node.desc }}</div>
          <div v-if="n.node.status" class="mm-progress">
            <ProgressBar :value="n.node.progress" :status="n.node.status" :show-label="true" />
          </div>
          <!-- 最深层考点：独立的"去刷题"按钮入口 -->
          <button v-if="n.depth === 3 && n.setId"
                  class="mm-practice-btn"
                  @mousedown.stop
                  @click.stop="goPractice(n.setId)">
            去刷题 ›
          </button>
        </div>
      </div>
    </div>

    <!-- 操作提示（固定在视口左下，不随画布移动） -->
    <div class="mm-tip">拖节点改位置 · 拖空白移动画布 · 滚轮缩放 · 点「去刷题」进题集</div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import ProgressBar from './ProgressBar.vue'

const props = defineProps({
  tree: { type: Object, required: true },
  // 外部下发的展开/收起指令：{ version, mode }, mode = expand | collapse
  expandCtrl: { type: Object, default: null }
})

const router = useRouter()
const viewport = ref(null)

// ---------- 0. 字号（真实字体大小，与视图缩放相互独立） ----------
// fontScale 只影响"设计尺寸"：字号、节点宽高、层间距、行距一起等比变化。
// 视图缩放 scale 是另一回事（滚轮控制），两者相乘才是屏幕上看到的大小。
// 默认 110%：比原来更大更清楚，滑块仍可在 70%~180% 之间实时调
const fontScale = ref(1.1)
function changeFont(step) {
  fontScale.value = Math.min(1.8, Math.max(0.7, +(fontScale.value + step).toFixed(2)))
}
// 所有几何尺寸以"基准值 × 字号倍率"计算，保证字变大时框也跟着变大，不会挤在一起
const u = (base) => base * fontScale.value

// ---------- 1. 布局：把树摊平成带坐标的节点 ----------
// 默认整棵树全部展开（根 + 章节 + 知识点 + 最深层考点）
const openState = reactive({})
function initOpen(node) {
  openState[node.id] = true
  for (const c of (node.children || [])) initOpen(c)
}
initOpen(props.tree)

// 基准列坐标（未乘字号倍率）。四列横向铺开，填满视口宽度，不再挤成中间一条竖带
const COL_BASE = [24, 372, 726, 1104]
const ROW_BASE = 118        // 基准行距（叶子之间），略放松，缓解密集感
const PAD_BASE = 44
function colX(depth) {
  if (COL_BASE[depth] !== undefined) return u(COL_BASE[depth])
  return u(COL_BASE[COL_BASE.length - 1] + (depth - 3) * 290)
}

// 手动拖过位置的节点，记录它相对自动布局的偏移（画布坐标）
const nodeOffset = reactive({})

// 递归摊平：叶子依次往下排，父节点取首尾子节点的中间位置。
// 约定：n.y = 节点垂直中心；模板 top = n.y - n.h/2；连线用 (n.x+n.w, n.y) → 子节点 (x, y)。
function buildLayout() {
  const nodes = []
  const edges = []
  const rowGap = u(ROW_BASE)
  const padTop = u(PAD_BASE)
  let leafIndex = 0

  function walk(node, depth, parentSetId) {
    const x = colX(depth)
    const expanded = !!openState[node.id]
    const kids = expanded ? (node.children || []) : []
    // 考点继承父知识点的题集 id，点它也能进对应题集
    const setId = node.setId || parentSetId || ''
    const item = {
      node, depth, x, y: 0,
      w: nodeWidth(depth), h: nodeHeight(depth),
      expanded, setId
    }
    nodes.push(item)

    let childItems = []
    if (!kids.length) {
      item.y = padTop + leafIndex * rowGap
      leafIndex++
    } else {
      childItems = kids.map(child => walk(child, depth + 1, setId))
      item.y = (childItems[0].y + childItems[childItems.length - 1].y) / 2
    }

    // 应用手动拖动偏移
    const off = nodeOffset[node.id]
    if (off) {
      item.x += off.dx
      item.y += off.dy
    }

    // 连线：父节点右边缘中点 → 子节点左边缘中点
    for (const ci of childItems) {
      edges.push({
        id: node.id + '-' + ci.node.id,
        d: bezier(item.x + item.w, item.y, ci.x, ci.y),
        color: edgeColor(ci.node),
        width: Math.max(1.3, 1.6 * fontScale.value)
      })
    }
    return item
  }

  walk(props.tree, 0, '')

  let w = 0, h = 0
  for (const n of nodes) {
    w = Math.max(w, n.x + n.w + u(50))
    h = Math.max(h, n.y + n.h / 2 + u(40))
  }
  return {
    nodes, edges,
    w: Math.max(w, u(760)),
    h: Math.max(h, u(360))
  }
}

// 三次贝塞尔：两端水平切线、中间平滑过渡。控制点距离取列间距的 45%，
// 让线在靠近节点处是水平的（顺着节点"长出来"），跨度大时也不会甩出突兀的斜线。
function bezier(x1, y1, x2, y2) {
  const dx = Math.max(u(28), (x2 - x1) * 0.45)
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`
}

function nodeWidth(depth) {
  const base = [224, 214, 232, 256][depth] || 256
  return u(base)
}
// 每层节点高度必须和 CSS 里的实际高度一致，否则连线会错位
// 知识点层(2)给到 92、考点层(3)给到 106，让"名称+说明+进度条/按钮"不再挤
function nodeHeight(depth) {
  const base = [76, 72, 92, 106][depth] || 92
  return u(base)
}

function edgeColor(child) {
  if (child.status === 'weak') return '#e8a48e'
  if (child.status === 'mastered') return '#9fe1cb'
  return '#c9d8d2'
}

function nodeStateClass(node) {
  return node.status ? 'state-' + node.status : ''
}

const layout = computed(() => buildLayout())
const nodes = computed(() => layout.value.nodes)
const edges = computed(() => layout.value.edges)
const bounds = computed(() => ({ w: layout.value.w, h: layout.value.h }))
// 视口高度跟着内容走，页面自然滚动
const viewportHeight = computed(() => Math.max(u(560), bounds.value.h + u(50)) + 'px')

// ---------- 2. 平移 + 缩放 ----------
const offset = reactive({ x: 16, y: u(54) })   // 顶部给工具条留位置
const scale = ref(1)
const dragging = ref(false)
let dragStart = { mx: 0, my: 0, ox: 0, oy: 0 }

const worldStyle = computed(() => ({
  width: bounds.value.w + 'px',
  height: bounds.value.h + 'px',
  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale.value})`
}))

function onMouseDown(e) {
  suppressClick = false
  dragging.value = true
  dragStart = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
}

// 拖动单个节点
const nodeDrag = ref(null)   // { id, mx, my, dx0, dy0, moved }
let suppressClick = false

function onNodeMouseDown(e, n) {
  if (e.button !== 0) return
  suppressClick = false
  e.stopPropagation()   // 别同时触发画布平移
  const off = nodeOffset[n.node.id] || { dx: 0, dy: 0 }
  nodeDrag.value = { id: n.node.id, mx: e.clientX, my: e.clientY, dx0: off.dx, dy0: off.dy, moved: false }
}

function onMouseMove(e) {
  if (nodeDrag.value) {
    const d = nodeDrag.value
    const px = e.clientX - d.mx
    const py = e.clientY - d.my
    if (Math.abs(px) > 3 || Math.abs(py) > 3) d.moved = true
    // 屏幕位移除以视图缩放，得到画布坐标位移
    nodeOffset[d.id] = {
      dx: d.dx0 + px / scale.value,
      dy: d.dy0 + py / scale.value
    }
    return
  }
  if (!dragging.value) return
  offset.x = dragStart.ox + (e.clientX - dragStart.mx)
  offset.y = dragStart.oy + (e.clientY - dragStart.my)
}
function onMouseUp() {
  dragging.value = false
  if (nodeDrag.value && nodeDrag.value.moved) suppressClick = true
  nodeDrag.value = null
}

function resetLayout() {
  for (const id in nodeOffset) delete nodeOffset[id]
}

// 以指针为中心缩放
function onWheel(e) {
  const el = viewport.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const px = e.clientX - rect.left
  const py = e.clientY - rect.top
  const old = scale.value
  const next = Math.min(2, Math.max(0.25, old * (e.deltaY < 0 ? 1.12 : 1 / 1.12)))
  if (next === old) return
  offset.x = px - (px - offset.x) * (next / old)
  offset.y = py - (py - offset.y) * (next / old)
  scale.value = next
}

function zoomBy(factor) {
  const el = viewport.value
  if (!el) return
  const cx = el.clientWidth / 2
  const cy = el.clientHeight / 2
  const old = scale.value
  const next = Math.min(2, Math.max(0.25, old * factor))
  offset.x = cx - (cx - offset.x) * (next / old)
  offset.y = cy - (cy - offset.y) * (next / old)
  scale.value = next
}

// 适应宽度：优先 100% 显示；树比视口宽时才缩小
function fitView() {
  const el = viewport.value
  if (!el) return
  const vw = el.clientWidth
  const k = Math.min(1, (vw - 40) / bounds.value.w)
  scale.value = Math.max(0.5, k)
  offset.x = Math.max(10, (vw - bounds.value.w * scale.value) / 2)
  offset.y = u(54)
}

// ---------- 3. 点击节点 ----------
function onNodeClick(n) {
  if (suppressClick) { suppressClick = false; return }
  const node = n.node
  if (node.children && node.children.length && n.depth < 2) {
    openState[node.id] = !openState[node.id]
    return
  }
  if (n.setId) router.push('/set/' + n.setId)
}
function toggleNode(node) {
  openState[node.id] = !openState[node.id]
}
function goPractice(setId) {
  if (setId) router.push('/set/' + setId)
}

// ---------- 4. 外部"全部展开/收起" ----------
watch(() => props.expandCtrl && props.expandCtrl.version, () => {
  if (!props.expandCtrl) return
  if (props.expandCtrl.mode === 'collapse') {
    for (const id in openState) openState[id] = false
    openState[props.tree.id] = true
    for (const ch of props.tree.children || []) openState[ch.id] = true
  } else {
    for (const id in openState) openState[id] = true
  }
})

// 字号变化后，重新适应一次宽度并调整顶部留白
watch(fontScale, () => {
  fitView()
  offset.y = u(54)
})

onMounted(() => {
  fitView()
  window.addEventListener('resize', fitView)
})
onBeforeUnmount(() => window.removeEventListener('resize', fitView))
</script>

<style scoped>
.mm-viewport {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background-color: #fff;
  background-image: radial-gradient(var(--line) 0.8px, transparent 0.8px);
  background-size: 22px 22px;
  cursor: grab;
  user-select: none;
  --fs: 1;
}
.mm-viewport:active { cursor: grabbing; }

/* ---------- 顶部工具条 ---------- */
.mm-toolbar {
  position: absolute;
  top: 12px; right: 14px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255,255,255,.96);
  border: 1px solid var(--line-2);
  border-radius: 9px;
  padding: 6px 10px;
  cursor: default;
  box-shadow: 0 2px 8px rgba(44,44,42,.06);
}
.tb-font, .tb-view { display: flex; align-items: center; gap: 6px; }
.tb-label { font-size: 12px; color: var(--ink-2); font-weight: 600; }
.tb-sep { width: 1px; height: 18px; background: var(--line); }
.mm-toolbar button {
  border: 1px solid var(--line-2);
  background: #fff;
  color: var(--ink-2);
  border-radius: 6px;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  font-size: 12px;
  cursor: pointer;
}
.mm-toolbar button:hover { border-color: var(--jade); color: var(--jade); background: var(--jade-soft); }
.mm-toolbar button.tb-text { font-size: 12px; }
.mm-toolbar input[type="range"] { width: 96px; accent-color: var(--jade); cursor: pointer; }
.tb-val, .tb-view span { font-size: 11px; color: var(--ink-3); min-width: 34px; text-align: center; }

.mm-world {
  position: absolute;
  top: 0; left: 0;
  transform-origin: 0 0;
}
.mm-links { position: absolute; top: 0; left: 0; pointer-events: none; }

/* ---------- 节点 ---------- */
.mm-node {
  position: absolute;
  display: flex;
  align-items: flex-start;
  gap: calc(8px * var(--fs));
  padding: calc(10px * var(--fs)) calc(12px * var(--fs));
  border-radius: calc(10px * var(--fs));
  border: 1px solid var(--line-2);
  background: #fff;
  box-shadow: 0 1px 2px rgba(44,44,42,.04);
  cursor: grab;
  transition: border-color .16s ease;
}
.mm-node:hover { border-color: var(--ink-3); }
.mm-node.is-dragging { cursor: grabbing; border-color: var(--jade); box-shadow: 0 6px 16px rgba(15,110,86,.18); z-index: 3; }

.mm-node-body { min-width: 0; }
.mm-name-row { display: flex; align-items: center; gap: calc(7px * var(--fs)); }
.mm-name {
  font-size: calc(15px * var(--fs));
  line-height: 1.35;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mm-desc {
  font-size: calc(12.5px * var(--fs));
  line-height: 1.4;
  color: var(--ink-2);
  margin-top: calc(4px * var(--fs));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mm-progress { margin-top: calc(5px * var(--fs)); }
.mm-progress :deep(.pb-label) { font-size: calc(11px * var(--fs)); }
.mm-progress :deep(.pb-track) { height: calc(5px * var(--fs)); }

.mm-dot { width: calc(7px * var(--fs)); height: calc(7px * var(--fs)); border-radius: 50%; margin-top: calc(5px * var(--fs)); flex: 0 0 auto; }
.dot-mastered { background: var(--jade-2); }
.dot-weak { background: var(--coral); }
.dot-learning { background: var(--jade); }
.dot-untouched, .dot-normal { background: var(--line-2); }
.mm-root-dot { width: calc(9px * var(--fs)); height: calc(9px * var(--fs)); border-radius: 50%; background: #9fe1cb; margin-top: calc(5px * var(--fs)); flex: 0 0 auto; }

.mm-fold {
  flex: 0 0 auto;
  width: calc(17px * var(--fs)); height: calc(17px * var(--fs));
  border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: calc(13px * var(--fs)); line-height: 1;
  border: 1px solid var(--jade-line);
  color: var(--jade); background: var(--jade-soft);
  cursor: pointer;
}

/* 层级样式 */
.mm-node.lv-0 {
  background: var(--jade); border-color: var(--jade);
  color: #fff; padding: calc(13px * var(--fs)) calc(14px * var(--fs));
}
.mm-node.lv-0 .mm-name { color: #fff; font-family: var(--font-serif); font-size: calc(17px * var(--fs)); font-weight: 700; }
.mm-node.lv-0 .mm-desc { color: #d4efe4; font-size: calc(12px * var(--fs)); }
.mm-node.lv-0 .mm-fold { background: rgba(255,255,255,.18); border-color: rgba(255,255,255,.5); color: #fff; }

.mm-node.lv-1 { background: var(--jade-soft); border-color: var(--jade-2); }
.mm-node.lv-1 .mm-name { color: var(--jade); font-weight: 600; font-size: calc(16px * var(--fs)); }

.mm-node.lv-2.state-weak { border-color: var(--coral); border-width: 1.5px; }
.mm-node.lv-2.state-weak .mm-name { color: var(--coral-dark); font-weight: 600; }
.mm-node.lv-2.state-mastered { border-color: var(--jade-2); }

.mm-node.lv-3 { background: #fcfcfa; border-color: var(--line); }
.mm-node.lv-3 .mm-name { font-size: calc(13.5px * var(--fs)); color: var(--ink); font-weight: 600; }
.mm-node.lv-3 .mm-desc { font-size: calc(11.5px * var(--fs)); color: var(--ink-2); }

/* 最深层的"去刷题"按钮入口 */
.mm-practice-btn {
  margin-top: calc(7px * var(--fs));
  padding: calc(2px * var(--fs)) calc(9px * var(--fs));
  font-size: calc(11px * var(--fs));
  line-height: 1.4;
  border: 1px solid var(--jade-2);
  border-radius: 99px;
  background: var(--jade-soft);
  color: var(--jade);
  cursor: pointer;
  transition: background .16s ease, color .16s ease;
}
.mm-practice-btn:hover { background: var(--jade); color: #fff; }

/* ---------- 操作提示 ---------- */
.mm-tip {
  position: absolute; left: 14px; bottom: 12px;
  font-size: 11px; color: var(--ink-3);
  background: rgba(255,255,255,.9); padding: 5px 10px; border-radius: 6px;
  border: 1px solid var(--line); pointer-events: none;
}
</style>
