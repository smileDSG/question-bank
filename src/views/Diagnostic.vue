<template>
  <div class="page">
    <div class="page-head">
      <div class="eyebrow">Diagnostic Report</div>
      <h1 class="page-title">学习诊断报告</h1>
      <p class="page-sub">依据模拟测试结果定位薄弱知识点。红=薄弱需补漏，绿=已掌握可巩固。</p>
    </div>

    <template v-if="report">
      <!-- 概览指标 -->
      <div class="metrics">
        <div class="metric card">
          <div class="m-label">本次得分</div>
          <div class="m-value">{{ report.score }}<small> / {{ report.total }}</small></div>
        </div>
        <div class="metric card">
          <div class="m-label">用时</div>
          <div class="m-value">{{ report.duration }}<small> 分钟</small></div>
        </div>
        <div class="metric card">
          <div class="m-label">薄弱知识点</div>
          <div class="m-value m-coral">{{ report.weakPoints.length }}<small> 个</small></div>
        </div>
        <div class="metric card">
          <div class="m-label">已掌握</div>
          <div class="m-value m-jade">{{ report.masteredPoints.length }}<small> 个</small></div>
        </div>
      </div>

      <div class="cols">
        <!-- 薄弱 -->
        <section class="panel card weak-panel">
          <div class="panel-head">
            <span class="panel-dot weak"></span>
            <h2>薄弱知识点</h2>
            <span class="badge badge-coral">优先补漏</span>
          </div>
          <p class="panel-tip">点击"去练习"直达对应题集，针对性刷题。</p>
          <div class="pt-list">
            <div class="pt-row" v-for="p in report.weakPoints" :key="p.id">
              <div class="pt-info">
                <div class="pt-name">{{ p.name }}</div>
                <div class="pt-acc">正确率 {{ p.accuracy }}%</div>
              </div>
              <div class="pt-bar">
                <ProgressBar :value="p.accuracy" status="weak" :show-label="false" />
              </div>
              <router-link :to="weakSetLink(p.id)" class="btn btn-coral pt-btn">去练习</router-link>
            </div>
          </div>
        </section>

        <!-- 已掌握 -->
        <section class="panel card strong-panel">
          <div class="panel-head">
            <span class="panel-dot strong"></span>
            <h2>已掌握知识点</h2>
            <span class="badge badge-jade">保持巩固</span>
          </div>
          <p class="panel-tip">这些知识点掌握良好，可定期进行巩固练习。</p>
          <div class="pt-list">
            <div class="pt-row" v-for="p in report.masteredPoints" :key="p.id">
              <div class="pt-info">
                <div class="pt-name">{{ p.name }}</div>
                <div class="pt-acc">正确率 {{ p.accuracy }}%</div>
              </div>
              <div class="pt-bar">
                <ProgressBar :value="p.accuracy" status="mastered" :show-label="false" />
              </div>
              <span class="pt-check">✓</span>
            </div>
          </div>
        </section>
      </div>

      <div class="action-bar card">
        <div>
          <div class="ab-title">按薄弱点生成专项练习</div>
          <div class="ab-sub">系统将按考纲分值比例，从薄弱知识点中随机抽题组卷。</div>
        </div>
        <button class="btn btn-primary" @click="startPractice">开始针对性练习</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProgressBar from '../components/ProgressBar.vue'
import { diagnostic, knowledgeTree } from '../mock/data.js'

const report = ref(diagnostic)

// 把知识点 id 映射到题集 id
function weakSetLink(kid) {
  for (const ch of knowledgeTree.children) {
    for (const leaf of ch.children) {
      if (leaf.id === kid && leaf.setId) return '/set/' + leaf.setId
    }
  }
  return '/'
}
function startPractice() {
  window.alert('原型演示：真实项目会调用后端"按薄弱知识点+考纲比例组卷"接口生成模拟卷。')
}
</script>

<style scoped>
.metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 22px; }
.metric { padding: 18px 20px; }
.m-label { font-size: 12px; color: var(--ink-2); margin-bottom: 6px; }
.m-value { font-family: var(--font-serif); font-size: 30px; font-weight: 700; line-height: 1.1; }
.m-value small { font-family: var(--font-sans); font-size: 13px; font-weight: 400; color: var(--ink-3); }
.m-coral { color: var(--coral-dark); }
.m-jade { color: var(--jade); }

.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 22px; }
.panel { padding: 22px 24px; }
.panel-head { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.panel-head h2 { font-family: var(--font-serif); font-size: 18px; font-weight: 700; }
.panel-dot { width: 10px; height: 10px; border-radius: 50%; }
.panel-dot.weak { background: var(--coral); }
.panel-dot.strong { background: var(--jade-2); }
.panel-tip { font-size: 12px; color: var(--ink-3); margin-bottom: 16px; }

.pt-list { display: flex; flex-direction: column; gap: 8px; }
.pt-row {
  display: grid;
  grid-template-columns: 130px 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 11px 12px;
  border-radius: 9px;
  background: var(--paper);
}
.pt-name { font-size: 13px; color: var(--ink); font-weight: 500; }
.pt-acc { font-size: 11px; color: var(--ink-3); margin-top: 2px; }
.pt-btn { padding: 6px 12px; font-size: 12px; }
.pt-check { color: var(--jade-2); font-size: 17px; padding: 0 10px; }

.action-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  padding: 20px 24px;
}
.ab-title { font-size: 14px; font-weight: 600; color: var(--ink); }
.ab-sub { font-size: 12px; color: var(--ink-3); margin-top: 4px; }

@media (max-width: 860px) {
  .metrics { grid-template-columns: repeat(2, 1fr); }
  .cols { grid-template-columns: 1fr; }
}
</style>
