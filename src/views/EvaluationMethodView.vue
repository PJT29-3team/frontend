<script setup>
import { useRouter } from 'vue-router'
import EvaluationMethodModal from '../components/EvaluationMethodModal.vue'

const router = useRouter()
</script>

<template>
  <EvaluationMethodModal page @close="router.push('/main')" />
</template>
