<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => route.meta.title || '준비 중인 페이지')
const description = computed(() => route.meta.description || '이 단계의 화면을 준비하고 있습니다.')
</script>

<template>
  <main class="placeholder-page">
    <section>
      <p>홀家분 서비스</p>
      <h1>{{ title }}</h1>
      <span>{{ description }}</span>
    </section>
  </main>
</template>

<style scoped>
.placeholder-page { min-height: calc(100vh - 184px); display: grid; place-items: center; padding: 30px; background: #f8f8f6; text-align: center; }.placeholder-page section { width: min(100%, 550px); padding: 64px 28px; border: 1px solid #e8e4dc; border-radius: 18px; background: #fff; }.placeholder-page p { margin: 0 0 10px; color: #b27a00; font-weight: 800; }.placeholder-page h1 { margin: 0; color: #545045; font-size: 30px; }.placeholder-page span { display: block; margin-top: 14px; color: #77736b; font-size: 17px; line-height: 1.6; }
</style>
