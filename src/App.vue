<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

// Inicializar autenticación al cargar la app
const { initAuth } = useAuth()

onMounted(() => {
  initAuth()
})
</script>