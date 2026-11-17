<template>
  <div class="branch">
    <!-- 节点本体 -->
    <div class="node-wrap">
      <div
        class="box"
        :class="[boxClass, { 'has-kids': hasChildren && expanded, 'is-root': isRoot }]"
        @click="onClick"
      >
        <span v-if="isRoot" class="root-dot"></span>
        <span v-else class="status-dot" :class="'dot-' + (node.status || 'normal')"></span>

        <div class="box-body">
          <div class="box-title-row">
            <span class="box-name">{{ node.name }}</span>
            <span v-if="hasChildren" class="toggle">{{ expanded ? '−' : '+' }}</span>
            <span v-else class="leaf-arrow">›</span>
          </div>
          <div v-if="!isRoot" class="box-progress">
            <ProgressBar :value="node.progress" :status="node.status" :show-label="true" />
          </div>
          <div v-else class="root-meta">共 {{ countLeaves(node) }} 个知识点 · 点击章节展开</div>
        </div>
      </div>
    </div>

    <!-- 子节点：递归渲染自己 -->
    <div v-if="hasChildren && expanded" class="kids">
      <div class="kid" v-for="child in node.children" :key="child.id">
        <TreeNode :node="child" :expand-ctrl="expandCtrl" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import ProgressBar from './ProgressBar.vue'

const props = defineProps({
  node: { type: Object, required: true },
  isRoot: { type: Boolean, default: false },
  // 初始是否展开：根和章节默认展开
  defaultExpand: { type: Boolean, default: true },
  // 父级下发的展开控制：{ version, mode }，mode = expand | collapse
  expandCtrl: { type: Object, default: null }
})

const router = useRouter()
const expanded = ref(props.defaultExpand)

// 监听全局展开/收起指令
watch(() => props.expandCtrl && props.expandCtrl.version, () => {
  if (!props.expandCtrl) return
  if (props.expandCtrl.mode === 'collapse') expanded.value = false
  else if (props.expandCtrl.mode === 'expand') expanded.value = true
})

const hasChildren = computed(() => !!(props.node.children && props.node.children.length))
const boxClass = computed(() => {
  if (props.isRoot) return 'box-root'
  if (!hasChildren.value && props.node.status) return 'box-leaf box-leaf-' + props.node.status
  return 'box-chapter'
})

function onClick() {
  if (hasChildren.value) {
    expanded.value = !expanded.value
  } else if (props.node.setId) {
    router.push('/set/' + props.node.setId)
  }
}

function countLeaves(n) {
  let c = 0
  for (const ch of (n.children || [])) {
    if (ch.children && ch.children.length) c += countLeaves(ch)
    else c++
  }
  return c
}
</script>

<style scoped>
.branch { display: flex; align-items: center; }
.node-wrap { flex: 0 0 auto; }

/* 节点框：固定高度，保证连接线能对齐中线 */
.box {
  position: relative;
  height: 46px;
  min-width: 172px;
  max-width: 230px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 13px;
  border-radius: 11px;
  border: 1px solid var(--line-2);
  background: var(--surface);
  cursor: pointer;
  transition: border-color .18s ease, background .18s ease, transform .18s ease;
}
.box:hover { border-color: var(--ink-3); transform: translateX(2px); }
.box.has-kids::after,
.box.is-root::after {
  content: '';
  position: absolute;
  right: -26px;
  top: 50%;
  width: 26px;
  border-top: 1px solid var(--jade-line);
}
.box-body { flex: 1; min-width: 0; }
.box-title-row { display: flex; align-items: center; gap: 8px; }
.box-name {
  font-size: 13px;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
.toggle { font-size: 16px; color: var(--ink-3); line-height: 1; }
.leaf-arrow { font-size: 17px; color: var(--ink-3); line-height: 1; }
.box-progress { margin-top: 3px; }

/* 状态点 */
.status-dot { width: 8px; height: 8px; border-radius: 50%; flex: 0 0 auto; }
.dot-mastered { background: var(--jade-2); }
.dot-weak { background: var(--coral); }
.dot-learning { background: var(--jade); }
.dot-untouched, .dot-normal { background: var(--line-2); }

/* 根节点 */
.box-root {
  background: var(--jade);
  border-color: var(--jade);
  min-width: 190px;
  height: 56px;
}
.box-root .box-name { color: #fff; font-family: var(--font-serif); font-size: 16px; font-weight: 700; }
.root-dot { width: 9px; height: 9px; border-radius: 50%; background: #9fe1cb; flex: 0 0 auto; }
.root-meta { font-size: 10px; color: #c9e8dd; margin-top: 2px; }

/* 章节节点 */
.box-chapter { background: var(--jade-soft); border-color: var(--jade-2); min-width: 178px; }
.box-chapter .box-name { font-weight: 600; color: var(--jade); }

/* 叶子节点 */
.box-leaf { background: #fff; }
.box-leaf-weak { border-color: var(--coral); border-width: 1.5px; }
.box-leaf-weak .box-name { font-weight: 600; color: var(--coral-dark); }
.box-leaf-mastered { border-color: var(--jade-2); }

/* 子节点容器与连接线 */
.kids {
  margin-left: 26px;
  padding-left: 24px;
  border-left: 1px solid var(--jade-line);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.kid { position: relative; }
.kid::before {
  content: '';
  position: absolute;
  left: -24px;
  top: 23px;
  width: 24px;
  border-top: 1px solid var(--jade-line);
  border-top-left-radius: 8px;
}

/* 需要一个变量颜色，这里补一下 */
.box::after { border-color: var(--jade-line); }
</style>
