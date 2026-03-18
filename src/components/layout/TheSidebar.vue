<template>
  <aside class="fixed left-0 top-0 h-screen w-64 bg-navy-500 text-white flex flex-col shadow-xl z-50">
    <div class="p-6 border-b border-white/10">
      <h1 class="text-2xl font-heading font-bold text-gold-400">David Sewa</h1>
      <p class="text-sm text-white/60 mt-1">Gestion Comptable</p>
    </div>

    <nav class="flex-1 py-6">
      <ul class="space-y-1">
        <li v-for="item in menuItems" :key="item.path">
          <router-link
            :to="item.path"
            class="flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-all duration-200"
            :class="isActive(item.path) 
              ? 'bg-gold-400/20 text-gold-400 border-l-4 border-gold-400' 
              : 'text-white/70 hover:bg-white/5 hover:text-white'"
          >
            <span v-html="item.icon" class="w-5 h-5"></span>
            <span>{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <div class="p-4 border-t border-white/10">
      <div class="flex items-center gap-3 px-4">
        <div class="w-10 h-10 rounded-full bg-gold-400 flex items-center justify-center text-navy-500 font-bold">
          DS
        </div>
        <div>
          <p class="text-sm font-medium">Chorale David Sewa</p>
          <p class="text-xs text-white/50">Administration</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const menuItems = [
  { path: '/', label: 'Tableau de bord', icon: '📊' },
  { path: '/choristes', label: 'Choristes', icon: '👥' },
  { path: '/cotisations', label: 'Cotisations', icon: '💰' },
  { path: '/dons', label: 'Dons', icon: '🎁' },
  { path: '/depenses', label: 'Dépenses', icon: '💸' },
  { path: '/rapports', label: 'Rapports', icon: '📄' },
]

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>
