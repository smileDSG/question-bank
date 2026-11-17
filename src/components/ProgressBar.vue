<template>
  <div class="pb" role="progressbar" :aria-valuenow="value" aria-valuemin="0" aria-valuemax="100">
    <div class="pb-track">
      <div class="pb-fill" :style="{ width: value + '%', background: barColor }"></div>
    </div>
    <span v-if="showLabel" class="pb-label" :style="{ color: textColor }">{{ value }}%</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 },
  status: { type: String, default: '' }, // mastered / weak / learning / untouched
  showLabel: { type: Boolean, default: true }
})

// 颜色随知识点状态变化，对应"绿掌握 / 红薄弱"
const barColor = computed(() => {
  if (props.status === 'weak') return 'var(--coral)'
  if (props.status === 'mastered') return 'var(--jade-2)'
  if (props.status === 'learning') return 'var(--jade)'
  return 'var(--line-2)'
})
const textColor = computed(() => {
  if (props.status === 'weak') return 'var(--coral-dark)'
  if (props.status === 'mastered' || props.status === 'learning') return 'var(--jade)'
  return 'var(--ink-3)'
})
</script>

<style scoped>
.pb { display: flex; align-items: center; gap: 8px; }
.pb-track {
  flex: 1;
  height: 5px;
  background: var(--paper-2);
  border-radius: 99px;
  overflow: hidden;
}
.pb-fill {
  height: 100%;
  border-radius: 99px;
  transition: width .5s cubic-bezier(.22, 1, .36, 1);
}
.pb-label { font-size: 11px; min-width: 30px; text-align: right; font-variant-numeric: tabular-nums; }
</style>
