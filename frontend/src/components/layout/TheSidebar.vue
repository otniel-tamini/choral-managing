<template>
  <aside 
    class="fixed left-0 top-0 h-screen w-64 bg-navy-500 text-white flex flex-col shadow-xl z-50 transition-transform duration-300"
    :class="[isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0']"
  >
    <!-- Logo & Close Button (Mobile) -->
    <div class="p-6 border-b border-white/10 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-heading font-bold text-gold-400">David Sewa</h1>
        <p class="text-sm text-white/60 mt-1">Gestion Comptable</p>
      </div>
      <button @click="$emit('close')" class="md:hidden p-2 hover:bg-white/10 rounded-lg">
        <XMarkIcon class="w-6 h-6" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 py-6 overflow-y-auto custom-scrollbar">
      <ul class="space-y-1">
        <li v-for="item in menuItems" :key="item.path">
          <router-link
            :to="item.path"
            class="flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-all duration-200"
            :class="isActive(item.path) 
              ? 'bg-gold-400/20 text-gold-400 border-l-4 border-gold-400' 
              : 'text-white/70 hover:bg-white/5 hover:text-white'"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-white/10">
      <div class="flex items-center gap-3 px-4">
        <div class="w-10 h-10 rounded-full bg-gold-400 flex items-center justify-center text-navy-500 font-bold">
          DS
        </div>
        <div class="flex-1 overflow-hidden">
          <p class="text-sm font-medium truncate">Chorale David Sewa</p>
          <p class="text-xs text-white/50">Administration</p>
        </div>
        <button @click="handleLogout" class="p-2 hover:bg-red-500/20 text-white/50 hover:text-red-400 rounded-lg transition-colors" title="Déconnexion">
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeIcon,
  UsersIcon,
  CurrencyEuroIcon,
  GiftIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  CalendarIcon,
  ChartPieIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const route = useRoute()
const router = useRouter()

const menuItems = [
  { path: '/', label: 'Tableau de bord', icon: HomeIcon },
  { path: '/activites', label: 'Activités (Prog.)', icon: CalendarIcon },
  { path: '/choristes', label: 'Choristes', icon: UsersIcon },
  { path: '/cotisations', label: 'Cotisations', icon: CurrencyEuroIcon },
  { path: '/dons', label: 'Dons', icon: GiftIcon },
  { path: '/depenses', label: 'Dépenses', icon: BanknotesIcon },
  { path: '/rapports', label: 'Rapports Trismestriels', icon: DocumentChartBarIcon },
  { path: '/rapport-activite', label: 'Rapport Annuel', icon: ChartPieIcon },
  { path: '/programmation', label: 'Programmation Chants', icon: CalendarIcon },
]

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const handleLogout = () => {
  // To be implemented with auth logic
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}
</style>
