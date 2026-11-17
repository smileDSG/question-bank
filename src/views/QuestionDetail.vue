<template>
  <div class="page narrow">
    <div class="back-row">
      <router-link :to="'/set/' + setId" class="back-link">‹ 返回题集</router-link>
      <span class="q-counter" v-if="set">{{ currentIndex + 1 }} / {{ set.questions.length }}</span>
    </div>

    <template v-if="question">
      <QuestionCard
        :question="question"
        :knowledge-name="set?.knowledgeName || ''"
        @answered="onAnswered"
      />

      <!-- 底部导航 -->
      <div class="detail-nav">
        <button class="btn" :disabled="currentIndex === 0" @click="goPrev">上一题</button>
        <button class="btn btn-primary" :disabled="currentIndex >= (set?.questions.length || 0) - 1" @click="goNext">
          下一题 ›
        </button>
      </div>
    </template>

    <div v-else class="empty card">题目不存在。</div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QuestionCard from '../components/QuestionCard.vue'
import { questionSets } from '../mock/data.js'

const route = useRoute()
const router = useRouter()

const set = ref(null)
const question = ref(null)

watch(() => [route.params.setId, route.params.qid], ([setId, qid]) => {
  set.value = questionSets[setId] || null
  question.value = set.value ? (set.value.questions.find(q => q.id === qid) || null) : null
}, { immediate: true })

const setId = computed(() => route.params.setId)
const currentIndex = computed(() => {
  if (!set.value || !question.value) return 0
  return set.value.questions.findIndex(q => q.id === question.value.id)
})

function goNext() {
  const i = currentIndex.value
  if (set.value && i < set.value.questions.length - 1) {
    router.push('/question/' + setId.value + '/' + set.value.questions[i + 1].id)
  }
}
function goPrev() {
  const i = currentIndex.value
  if (set.value && i > 0) {
    router.push('/question/' + setId.value + '/' + set.value.questions[i - 1].id)
  }
}
function onAnswered(payload) {
  // 真实项目：这里 fetch 后端提交判分接口
  console.log('提交作答：', payload)
}
</script>

<style scoped>
.page.narrow { max-width: 800px; }
.back-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.back-link { font-size: 13px; color: var(--ink-2); }
.back-link:hover { color: var(--jade); }
.q-counter { font-size: 12px; color: var(--ink-3); font-variant-numeric: tabular-nums; }
.detail-nav { display: flex; justify-content: space-between; margin-top: 20px; }
.btn:disabled { opacity: .4; cursor: not-allowed; transform: none; }
.empty { padding: 40px; text-align: center; color: var(--ink-2); }
</style>
