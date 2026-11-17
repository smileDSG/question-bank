<template>
  <div class="qcard card">
    <!-- 题干 -->
    <div class="q-head">
      <span class="badge" :class="typeBadgeClass">{{ typeLabel }}</span>
      <span class="q-knowledge">{{ knowledgeName }}</span>
    </div>
    <p class="q-stem">{{ question.stem }}</p>

    <!-- 选项区：单选 / 多选 -->
    <div v-if="question.type !== 'blank'" class="options">
      <button
        v-for="opt in question.options"
        :key="opt.key"
        class="option"
        :class="optionClass(opt.key)"
        @click="selectOption(opt.key)"
        :disabled="submitted"
      >
        <span class="opt-key" :class="optKeyClass(opt.key)">{{ opt.key }}</span>
        <span class="opt-text">{{ opt.text }}</span>
        <span v-if="submitted && isAnswerKey(opt.key)" class="opt-flag flag-right">正确答案</span>
        <span v-else-if="submitted && isSelected(opt.key) && !isCorrect" class="opt-flag flag-wrong">你的选择</span>
      </button>
    </div>

    <!-- 填空区 -->
    <div v-else class="blank-area">
      <input
        v-model.trim="blankInput"
        class="blank-input"
        type="text"
        placeholder="在此输入答案"
        :disabled="submitted"
        @keyup.enter="submit"
      />
      <p v-if="submitted" class="blank-result" :class="isCorrect ? 'res-right' : 'res-wrong'">
        {{ isCorrect ? '回答正确' : '回答错误' }} · 正确答案：<b>{{ answerText }}</b>
      </p>
    </div>

    <!-- 操作区 -->
    <div class="q-actions">
      <button v-if="!submitted" class="btn btn-primary" @click="submit">提交答案</button>
      <button v-else class="btn btn-ghost" @click="reset">重新作答</button>
      <span v-if="submitted" class="verdict" :class="isCorrect ? 'v-right' : 'v-wrong'">
        {{ isCorrect ? '✓ 回答正确' : '✕ 回答错误' }}
      </span>
    </div>

    <!-- 解析：提交后显示，对应 AI 双模型比对结果 -->
    <div v-if="submitted" class="analysis">
      <div class="analysis-head">
        <span class="analysis-mark">析</span>
        <span>题目解析</span>
        <span class="badge badge-jade">AI 双模型比对一致</span>
      </div>
      <p class="analysis-text">{{ question.analysis }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  question: { type: Object, required: true },
  knowledgeName: { type: String, default: '' }
})
const emit = defineEmits(['answered'])

const selected = ref([])      // 单选/多选：选中的 key
const blankInput = ref('')    // 填空：用户输入
const submitted = ref(false)

const isSingle = computed(() => props.question.type === 'single')
const isMultiple = computed(() => props.question.type === 'multiple')
const isBlank = computed(() => props.question.type === 'blank')
const typeLabel = computed(() => isSingle.value ? '单选题' : isMultiple.value ? '多选题' : '填空题')
const typeBadgeClass = computed(() => isBlank.value ? 'badge-coral' : 'badge-jade')

const answerArr = computed(() => {
  const a = props.question.answer
  return Array.isArray(a) ? a.slice().sort() : [String(a)]
})
const answerText = computed(() => answerArr.value.join('、'))

const userArr = computed(() => selected.value.slice().sort())
const isCorrect = computed(() => {
  if (isBlank.value) {
    return blankInput.value.toLowerCase() === String(props.question.answer).toLowerCase()
  }
  return JSON.stringify(userArr.value) === JSON.stringify(answerArr.value)
})

// 换题时重置状态
watch(() => props.question.id, () => reset())

function isSelected(key) { return selected.value.includes(key) }
function isAnswerKey(key) { return answerArr.value.includes(key) }

function selectOption(key) {
  if (submitted.value) return
  if (isSingle.value) {
    selected.value = [key]
  } else {
    if (selected.value.includes(key)) selected.value = selected.value.filter(k => k !== key)
    else selected.value.push(key)
  }
}

function optionClass(key) {
  if (!submitted.value) return isSelected(key) ? 'sel' : ''
  if (isAnswerKey(key)) return 'right'
  if (isSelected(key)) return 'wrong'
  return ''
}
function optKeyClass(key) {
  if (!submitted.value) return isSelected(key) ? 'k-sel' : ''
  if (isAnswerKey(key)) return 'k-right'
  if (isSelected(key)) return 'k-wrong'
  return ''
}

function submit() {
  if (submitted.value) return
  if (isBlank.value && !blankInput.value) return
  if (!isBlank.value && selected.value.length === 0) return
  submitted.value = true
  emit('answered', { questionId: props.question.id, correct: isCorrect.value })
}

function reset() {
  selected.value = []
  blankInput.value = ''
  submitted.value = false
}
</script>

<style scoped>
.qcard { padding: 26px 28px; }
.q-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.q-knowledge { font-size: 12px; color: var(--ink-3); }
.q-stem { font-size: 16px; line-height: 1.7; color: var(--ink); margin-bottom: 22px; font-weight: 500; }

.options { display: flex; flex-direction: column; gap: 10px; }
.option {
  display: flex;
  align-items: center;
  gap: 13px;
  width: 100%;
  text-align: left;
  padding: 12px 15px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
  transition: border-color .16s ease, background .16s ease;
}
.option:not(:disabled):hover { border-color: var(--jade-2); }
.option.sel { border-color: var(--jade); background: #f5fbf8; }
.option.right { border-color: var(--jade-2); background: #f2faf6; }
.option.wrong { border-color: var(--coral); background: var(--coral-soft); }
.opt-key {
  width: 26px; height: 26px; flex: 0 0 auto;
  border-radius: 50%;
  border: 1px solid var(--line-2);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; color: var(--ink-2);
}
.k-sel { border-color: var(--jade); color: var(--jade); font-weight: 600; }
.k-right { background: var(--jade-2); border-color: var(--jade-2); color: #fff; }
.k-wrong { background: var(--coral); border-color: var(--coral); color: #fff; }
.opt-text { flex: 1; font-size: 14px; color: var(--ink); }
.opt-flag { font-size: 11px; }
.flag-right { color: var(--jade); }
.flag-wrong { color: var(--coral-dark); }

.blank-area { margin-bottom: 6px; }
.blank-input {
  width: 100%;
  padding: 13px 15px;
  border: 1px solid var(--line-2);
  border-radius: 10px;
  font-size: 14px;
  color: var(--ink);
  background: var(--paper);
  outline: none;
}
.blank-input:focus { border-color: var(--jade); background: #fff; }
.blank-result { margin-top: 12px; font-size: 13px; }
.res-right { color: var(--jade); }
.res-wrong { color: var(--coral-dark); }

.q-actions { display: flex; align-items: center; gap: 16px; margin-top: 22px; }
.verdict { font-size: 14px; font-weight: 600; }
.v-right { color: var(--jade); }
.v-wrong { color: var(--coral-dark); }

.analysis {
  margin-top: 22px;
  padding: 18px 20px;
  background: var(--paper);
  border-left: 3px solid var(--jade-2);
  border-radius: 0 10px 10px 0;
}
.analysis-head { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 10px; }
.analysis-mark {
  width: 22px; height: 22px; border-radius: 6px;
  background: var(--jade-soft); color: var(--jade);
  display: flex; align-items: center; justify-content: center; font-size: 12px;
}
.analysis-text { font-size: 13px; line-height: 1.85; color: var(--ink-2); }
</style>
