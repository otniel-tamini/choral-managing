<template>
  <div class="flex h-screen bg-gray-50">
    <TheSidebar />
    <main class="flex-1 overflow-auto ml-64">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import TheSidebar from './components/layout/TheSidebar.vue'
</script>
