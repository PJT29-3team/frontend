<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => route.meta.title)
</script>

<template>
  <section class="placeholder-page">
    <div>
      <p>작은 둥지</p>
      <h1>{{ title }}</h1>
      <span>이 페이지는 다음 작업에서 연결됩니다.</span>
    </div>
  </section>
</template>

<style scoped>
.placeholder-page { min-height: calc(100vh - 182px); display: grid; place-items: center; background: #f8f8f6; text-align: center; }.placeholder-page div { padding: 40px; }.placeholder-page p { margin: 0 0 8px; color: #bd8500; font-weight: 800; }.placeholder-page h1 { margin: 0; color: #545045; font-size: 32px; }.placeholder-page span { display: block; margin-top: 12px; color: #77736b; }
</style>
