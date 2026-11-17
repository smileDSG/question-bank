<template>
  <div>
    <header class="topbar">
      <div class="topbar-inner">
        <router-link to="/" class="brand">
          <span class="brand-mark">知</span>
          <span>
            <span class="brand-name">知题</span>
            <span class="brand-tag">ZHITI</span>
          </span>
        </router-link>
        <nav class="nav">
          <router-link to="/" exact-active-class="active">知识地图</router-link>
          <router-link to="/diagnostic" active-class="active">诊断报告</router-link>
        </nav>
      </div>
    </header>

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
</script>
