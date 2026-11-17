<template>
  <div class="page">
    <div class="page-head map-head">
      <div>
        <div class="eyebrow">Knowledge Atlas</div>
        <h1 class="page-title">知识地图</h1>
        <p class="page-sub">像思维导图一样从课程向右展开，默认全部展开。右上角「字号」滑块可实时调大调小文字；拖节点改位置，拖空白处移动画布，滚轮缩放；点最深考点「去刷题」进题集。</p>
      </div>
      <div class="head-actions">
        <button class="btn" @click="expandAll">全部展开</button>
        <button class="btn" @click="collapseAll">全部收起</button>
        <router-link to="/diagnostic" class="btn btn-primary">查看诊断报告 ›</router-link>
      </div>
    </div>

    <!-- 图例 -->
    <div class="legend card">
      <span class="legend-title">图例</span>
      <span class="lg"><i class="lg-dot mastered"></i>已掌握</span>
      <span class="lg"><i class="lg-dot learning"></i>学习中</span>
      <span class="lg"><i class="lg-dot weak"></i>薄弱</span>
      <span class="lg"><i class="lg-dot untouched"></i>未开始</span>
      <span class="legend-hint">节点内进度条显示完成度 · 可拖拽/缩放画布</span>
    </div>

    <!-- 思维导图画布：可拖拽平移、滚轮缩放 -->
    <MindMap :tree="knowledgeTree" :expand-ctrl="expandCtrl" />

    <!-- 底部说明 -->
    <div class="footnote">
      <span>数据说明：</span>当前为前端模拟数据。接口对接后，知识树、进度与掌握状态均由后端返回，视图无需改动。
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import MindMap from '../components/MindMap.vue'
import { knowledgeTree } from '../mock/data.js'

// 下发到每个节点的展开控制：改变 version 即触发所有节点同步
const expandCtrl = reactive({ version: 0, mode: 'expand' })

function expandAll() {
  expandCtrl.mode = 'expand'
  expandCtrl.version++
}
function collapseAll() {
  expandCtrl.mode = 'collapse'
  expandCtrl.version++
}
</script>

<style scoped>
.map-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
.head-actions { display: flex; gap: 8px; flex: 0 0 auto; }

.legend {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 18px;
  margin-bottom: 18px;
  font-size: 12px;
  color: var(--ink-2);
  flex-wrap: wrap;
}
.legend-title { font-weight: 600; color: var(--ink); }
.lg { display: flex; align-items: center; gap: 6px; }
.lg-dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
.lg-dot.mastered { background: var(--jade-2); }
.lg-dot.learning { background: var(--jade); }
.lg-dot.weak { background: var(--coral); }
.lg-dot.untouched { background: var(--line-2); }
.legend-hint { margin-left: auto; color: var(--ink-3); }

.footnote { margin-top: 16px; font-size: 12px; color: var(--ink-3); }
.footnote span { color: var(--ink-2); font-weight: 600; }
</style>
