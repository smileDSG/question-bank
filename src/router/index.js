import { createRouter, createWebHashHistory } from 'vue-router'
import KnowledgeMap from '../views/KnowledgeMap.vue'
import QuestionSet from '../views/QuestionSet.vue'
import QuestionDetail from '../views/QuestionDetail.vue'
import Diagnostic from '../views/Diagnostic.vue'

// 使用 hash 历史模式：刷新页面不会 404，部署到任何静态服务器都能用
const routes = [
  { path: '/', name: 'map', component: KnowledgeMap, meta: { title: '知识地图' } },
  { path: '/set/:id', name: 'set', component: QuestionSet, meta: { title: '题集' } },
  { path: '/question/:setId/:qid', name: 'question', component: QuestionDetail, meta: { title: '作答' } },
  { path: '/diagnostic', name: 'diagnostic', component: Diagnostic, meta: { title: '诊断报告' } }
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})
