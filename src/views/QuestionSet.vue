<template>
  <div class="page">
    <div class="page-head">
      <div class="eyebrow">Question Set</div>
      <h1 class="page-title">{{ set?.knowledgeName || '题集' }}</h1>
      <p class="page-sub">
        单选题 {{ set?.counts?.single || 0 }} · 多选题 {{ set?.counts?.multiple || 0 }} · 填空题 {{ set?.counts?.blank || 0 }}
      </p>
    </div>

    <template v-if="set">
      <!-- 进度条 + 重置 -->
      <div class="setbar card">
        <div class="setbar-top">
          <span class="setbar-label">本集完成度</span>
          <span class="setbar-frac">{{ doneCount }} / {{ set.total }} 题</span>
        </div>
        <ProgressBar :value="Math.round(doneCount / set.total * 100)" status="learning" :show-label="false" />
        <button class="btn btn-ghost reset-set" @click="resetSet">重置本集进度</button>
      </div>

      <!-- 题目列表 -->
      <div class="qlist">
        <router-link
          v-for="(q, idx) in set.questions"
          :key="q.id"
          :to="'/question/' + set.id + '/' + q.id"
          class="qrow card"
          :class="'row-' + q.status"
        >
          <span class="qnum" :class="'num-' + q.status">{{ idx + 1 }}</span>
          <div class="qrow-main">
            <div class="qrow-stem">{{ q.stem }}</div>
            <div class="qrow-meta">
              <span class="badge" :class="q.type === 'blank' ? 'badge-coral' : 'badge-jade'">{{ typeLabel(q.type) }}</span>
            </div>
          </div>
          <span class="qrow-status" :class="'st-' + q.status">{{ statusLabel(q.status) }}</span>
          <span class="qrow-arrow">›</span>
        </router-link>
      </div>
    </template>

    <div v-else class="empty card">
      没有找到该题集。请从<a href="#/">知识地图</a>进入。
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProgressBar from '../components/ProgressBar.vue'
import { questionSets } from '../mock/data.js'

const route = useRoute()
const set = ref(null)

watch(() => route.params.id, (id) => {
  set.value = questionSets[id] || null
}, { immediate: true })

// 本地维护作答状态，模拟"已答对/答错"，重置后归零
const answered = ref({})
const doneCount = computed(() => {
  if (!set.value) return 0
  return set.value.questions.filter(q => {
    const s = answered.value[q.id]
    return s === 'correct' || s === 'wrong' || (!s && (q.status === 'correct' || q.status === 'wrong'))
  }).length
})

function resetSet() {
  answered.value = {}
  // 原型：直接把本地状态清掉，进度回到初始 mock 的基础值需刷新
  // 这里用提示替代真实后端重置
  window.alert('原型演示：本集进度已重置（真实项目会调用后端接口清零）。')
}

function typeLabel(t) { return t === 'single' ? '单选题' : t === 'multiple' ? '多选题' : '填空题' }
function statusLabel(s) {
  return s === 'correct' ? '已答对' : s === 'wrong' ? '答错' : s === 'doing' ? '作答中' : '未做'
}
</script>

<style scoped>
.setbar { padding: 18px 22px; margin-bottom: 18px; position: relative; }
.setbar-top { display: flex; justify-content: space-between; margin-bottom: 12px; }
.setbar-label { font-size: 13px; color: var(--ink); font-weight: 600; }
.setbar-frac { font-size: 12px; color: var(--ink-2); font-variant-numeric: tabular-nums; }
.reset-set { position: absolute; right: 20px; bottom: 14px; padding: 5px 12px; font-size: 12px; }

.qlist { display: flex; flex-direction: column; gap: 10px; }
.qrow {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 15px 18px;
  transition: border-color .16s ease, transform .16s ease;
}
.qrow:hover { border-color: var(--jade-2); transform: translateX(3px); }
.qnum {
  width: 30px; height: 30px; flex: 0 0 auto;
  border-radius: 8px;
  background: var(--paper-2);
  color: var(--ink-2);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600;
}
.num-correct { background: var(--jade-soft); color: var(--jade); }
.num-wrong { background: var(--coral-soft); color: var(--coral-dark); }
.num-doing { background: var(--jade); color: #fff; }
.qrow-main { flex: 1; min-width: 0; }
.qrow-stem {
  font-size: 14px; color: var(--ink);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 6px;
}
.qrow-status { font-size: 12px; flex: 0 0 auto; }
.st-correct { color: var(--jade); }
.st-wrong { color: var(--coral-dark); }
.st-doing { color: var(--jade); font-weight: 600; }
.st-todo { color: var(--ink-3); }
.qrow-arrow { font-size: 20px; color: var(--ink-3); }
.empty { padding: 40px; text-align: center; color: var(--ink-2); }
</style>
