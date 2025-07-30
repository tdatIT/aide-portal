<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores'

const appStore = useAppStore()

onMounted(() => {
  // Initialize theme
  document.documentElement.setAttribute('data-theme', appStore.theme)
})
</script>

<template>
  <router-view />
</template>

<style>
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
  line-height: 1.5;
  color: #333;
  background-color: #f0f2f5;
}

[data-theme="dark"] body {
  background-color: #000;
  color: #fff;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

[data-theme="dark"] ::-webkit-scrollbar-track {
  background: #2f2f2f;
}

[data-theme="dark"] ::-webkit-scrollbar-thumb {
  background: #6f6f6f;
}

[data-theme="dark"] ::-webkit-scrollbar-thumb:hover {
  background: #8f8f8f;
}
</style>
