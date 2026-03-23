<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <!-- Mobile Header -->
    <header class="md:hidden fixed top-0 left-0 right-0 h-16 bg-navy-500 text-white flex items-center px-4 z-[60] shadow-md">
      <button @click="isSidebarOpen = !isSidebarOpen" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
        <Bars3Icon v-if="!isSidebarOpen" class="w-6 h-6" />
        <XMarkIcon v-else class="w-6 h-6" />
      </button>
      <h1 class="ml-4 font-heading font-bold text-lg text-gold-400">David Sewa</h1>
    </header>

    <!-- Sidebar Overlay -->
    <div 
      v-if="isSidebarOpen" 
      @click="isSidebarOpen = false"
      class="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
    ></div>

    <TheSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />
    
    <main class="flex-1 overflow-auto transition-all duration-300 pt-16 md:pt-0 md:ml-64">
      <div class="p-4 md:p-8 max-w-7xl mx-auto">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'
import TheSidebar from './components/layout/TheSidebar.vue'

const isSidebarOpen = ref(false)
const route = useRoute()

// Close sidebar on route change (mobile)
watch(() => route.path, () => {
  isSidebarOpen.value = false
})
</script>
