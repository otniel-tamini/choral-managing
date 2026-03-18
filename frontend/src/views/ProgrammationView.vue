<template>
  <div class="p-8 min-h-screen bg-gray-50/50">
    <!-- Header with Glassmorphism Effect -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
      <div class="relative">
        <div class="absolute -left-4 top-0 bottom-0 w-1 bg-gold-400 rounded-full"></div>
        <h1 class="text-4xl font-heading font-extrabold text-navy-800 tracking-tight">
          Programmation <span class="text-gold-500">des Chants</span>
        </h1>
        <p class="text-gray-500 mt-2 font-medium flex items-center gap-2">
          <CalendarIcon class="w-4 h-4 text-gold-500" />
          Planification hebdomadaire des choristes
        </p>
      </div>

      <div class="flex flex-wrap gap-4 items-center bg-white/70 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-white">
        <button 
          @click="handleExport" 
          class="bg-navy-600 text-white hover:bg-navy-700 font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all hover:shadow-lg active:scale-95"
        >
          <DocumentArrowDownIcon class="w-5 h-5 text-gold-400" /> Exporter PDF
        </button>
        
        <div class="h-8 w-[1px] bg-gray-200 hidden md:block"></div>

        <div class="flex gap-3">
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1">Du</span>
            <input v-model="startDate" type="date" @change="loadProgrammation" class="px-3 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gold-400 text-sm font-medium transition-all" />
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1">Au</span>
            <input v-model="endDate" type="date" @change="loadProgrammation" class="px-3 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gold-400 text-sm font-medium transition-all" />
          </div>
        </div>
      </div>
    </div>

    <!-- Stats / Summary Bar -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
        <div class="w-12 h-12 rounded-xl bg-gold-50 flex items-center justify-center">
          <CalendarIcon class="w-6 h-6 text-gold-600" />
        </div>
        <div>
          <p class="text-sm text-gray-500 font-medium">Nombre de dimanches</p>
          <p class="text-2xl font-bold text-navy-800">{{ rangeSundays.length }}</p>
        </div>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
        <div class="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
          <UserGroupIcon class="w-6 h-6 text-green-600" />
        </div>
        <div>
          <p class="text-sm text-gray-500 font-medium">Choristes actifs</p>
          <p class="text-2xl font-bold text-navy-800">{{ activeChoristes.length }}</p>
        </div>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
        <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
          <SparklesIcon class="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <p class="text-sm text-gray-500 font-medium">Taux de programmation</p>
          <p class="text-2xl font-bold text-navy-800">{{ programmingProgress }}%</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
      <div class="relative">
        <div class="w-16 h-16 border-4 border-gold-100 rounded-full animate-pulse"></div>
        <div class="absolute inset-0 w-16 h-16 border-t-4 border-gold-500 rounded-full animate-spin"></div>
      </div>
      <p class="mt-4 text-gray-500 font-medium animate-pulse">Chargement du programme...</p>
    </div>

    <!-- Schedule List -->
    <div v-else class="grid gap-4">
      <div class="bg-navy-800 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between px-8 text-sm font-bold uppercase tracking-wider hidden md:flex">
        <div class="w-48">Date & Dimanche</div>
        <div class="flex-1 px-4 text-center">Chanteur Principal</div>
        <div class="flex-1 px-4 text-center">Remplaçant</div>
        <div class="flex-1 px-4 text-center">Description / Chants</div>
        <div class="w-20 text-right">Etat</div>
      </div>

      <div 
        v-for="sunday in rangeSundays" 
        :key="sunday.dateStr" 
        class="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-gold-200"
        :class="{'border-l-4 border-l-gold-400': sunday.id_chanteur_principal}"
      >
        <div class="flex flex-col md:flex-row items-center gap-6">
          <!-- Date Column -->
          <div class="w-full md:w-48 flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-gray-50 flex flex-col items-center justify-center border border-gray-100 group-hover:bg-gold-50 transition-colors">
              <span class="text-[10px] font-bold text-gray-400 uppercase">{{ getShortMonth(sunday.date) }}</span>
              <span class="text-xl font-black text-navy-800 leading-none">{{ getDayNumber(sunday.date) }}</span>
            </div>
            <div>
              <div class="font-bold text-navy-800 capitalize">{{ getWeekday(sunday.date) }}</div>
              <div class="text-xs text-gray-400 font-medium">{{ sunday.dateStr }}</div>
            </div>
          </div>

          <!-- Principal Selector -->
          <div class="flex-1 w-full relative group/select">
            <div class="absolute -top-2 left-3 px-2 bg-white text-[10px] font-black text-gold-600 uppercase tracking-tighter z-10 opacity-0 group-hover/select:opacity-100 transition-opacity">Principal</div>
            <div class="relative flex items-center">
              <UserIcon class="absolute left-3 w-4 h-4 text-gray-300 group-hover/select:text-gold-400 transition-colors" />
              <select 
                v-model="sunday.id_chanteur_principal" 
                @change="saveEntry(sunday)"
                class="w-full pl-9 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gold-400 text-sm font-bold text-navy-700 appearance-none cursor-pointer transition-all"
                :class="{'bg-gold-50/50 text-gold-700': sunday.id_chanteur_principal}"
              >
                <option :value="null">Choisir le lead...</option>
                <option v-for="c in activeChoristes" :key="c.id" :value="c.id">
                  {{ c.nom }} {{ c.prenom }}
                </option>
              </select>
            </div>
          </div>

          <!-- Secondary Selector -->
          <div class="flex-1 w-full relative group/select">
            <div class="absolute -top-2 left-3 px-2 bg-white text-[10px] font-black text-navy-400 uppercase tracking-tighter z-10 opacity-0 group-hover/select:opacity-100 transition-opacity">Secondaire</div>
            <div class="relative flex items-center">
              <UserGroupIcon class="absolute left-3 w-4 h-4 text-gray-300 group-hover/select:text-navy-400 transition-colors" />
              <select 
                v-model="sunday.id_chanteur_secondaire" 
                @change="saveEntry(sunday)"
                class="w-full pl-9 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-navy-400 text-sm font-bold text-navy-700 appearance-none cursor-pointer transition-all"
                :class="{'bg-navy-50/50 text-navy-600': sunday.id_chanteur_secondaire}"
              >
                <option :value="null">Choisir l'aide...</option>
                <option v-for="c in activeChoristes" :key="c.id" :value="c.id">
                  {{ c.nom }} {{ c.prenom }}
                </option>
              </select>
            </div>
          </div>

          <!-- Description Input -->
          <div class="flex-1 w-full relative group/select">
            <div class="absolute -top-2 left-3 px-2 bg-white text-[10px] font-black text-gray-400 uppercase tracking-tighter z-10 opacity-0 group-hover/select:opacity-100 transition-opacity">Chants / Notes</div>
            <input 
              v-model="sunday.description" 
              @blur="saveEntry(sunday)"
              type="text" 
              placeholder="Ex: Thème et Cantiques..."
              class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-200 text-sm font-medium transition-all"
            />
          </div>

          <!-- Status Indicator -->
          <div class="w-20 flex justify-end">
            <div v-if="saving === sunday.dateStr" class="w-8 h-8 flex items-center justify-center">
              <div class="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div v-else-if="sunday.id_chanteur_principal" class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600" title="Programmé">
              <CheckBadgeIcon class="w-5 h-5" />
            </div>
            <div v-else class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-300" title="En attente">
              <EllipsisHorizontalIcon class="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="rangeSundays.length === 0" class="py-20 text-center bg-white rounded-3xl shadow-sm border border-gray-100 border-dashed">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <MagnifyingGlassIcon class="w-8 h-8 text-gray-300" />
        </div>
        <p class="text-gray-500 font-semibold text-lg">Aucun dimanche trouvé</p>
        <p class="text-gray-400 max-w-xs mx-auto mt-2">Ajustez les dates pour voir les dimanches disponibles pour la programmation.</p>
      </div>
    </div>

    <!-- Info Box -->
    <div class="mt-12 group">
      <div class="bg-gradient-to-r from-navy-800 to-navy-700 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-gold-400/10 rounded-full blur-3xl"></div>
        <div class="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div class="w-16 h-16 rounded-2xl bg-gold-400/20 flex items-center justify-center backdrop-blur-md">
            <InformationCircleIcon class="w-8 h-8 text-gold-400" />
          </div>
          <div>
            <h3 class="text-xl font-heading font-bold text-white mb-2">Guide de programmation</h3>
            <p class="text-navy-100 leading-relaxed max-w-3xl">
              Les modifications sont sauvegardées <strong>automatiquement</strong> lorsque vous sélectionnez un chanteur ou terminez la saisie d'une note.
              Le <span class="text-gold-400 font-bold underline">chanteur principal</span> est le lead désigné, tandis que le <span class="text-gold-200 font-bold underline">remplaçant</span> assure la continuité en cas de besoin.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  CheckIcon, 
  InformationCircleIcon, 
  DocumentArrowDownIcon,
  CalendarIcon,
  UserGroupIcon,
  SparklesIcon,
  UserIcon,
  CheckBadgeIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'
import { programmationService, choristeService } from '../services/api'

// Initialiser avec la période actuelle (3 mois à partir de maintenant)
const today = new Date()
const threeMonthsLater = new Date()
threeMonthsLater.setMonth(today.getMonth() + 3)

const startDate = ref(today.toISOString().split('T')[0])
const endDate = ref(threeMonthsLater.toISOString().split('T')[0])

const choristes = ref([])
const programmations = ref([])
const loading = ref(true)
const saving = ref(null)

const activeChoristes = computed(() => choristes.value.filter(c => c.statut === 'actif'))

const programmingProgress = computed(() => {
  if (rangeSundays.value.length === 0) return 0
  const programmed = rangeSundays.value.filter(s => s.id_chanteur_principal).length
  return Math.round((programmed / rangeSundays.value.length) * 100)
})

// Génère les dimanches de la période et fusionne avec les données de la DB
const rangeSundays = computed(() => {
  if (!startDate.value || !endDate.value) return []
  
  const dates = getSundaysInRange(startDate.value, endDate.value)
  return dates.map(date => {
    const dateStr = date.toISOString().split('T')[0]
    const existing = programmations.value.find(p => p.date_dimanche.startsWith(dateStr))
    
    return {
      date,
      dateStr,
      id: existing?.id || null,
      id_chanteur_principal: existing?.id_chanteur_principal || null,
      id_chanteur_secondaire: existing?.id_chanteur_secondaire || null,
      description: existing?.description || ''
    }
  })
})

const getSundaysInRange = (start, end) => {
  const sundays = []
  const date = new Date(start)
  const lastDate = new Date(end)
  
  // Trouver le premier dimanche
  while (date.getDay() !== 0) {
    date.setDate(date.getDate() + 1)
  }
  
  while (date <= lastDate) {
    sundays.push(new Date(date))
    date.setDate(date.getDate() + 7)
  }
  return sundays
}

const loadProgrammation = async () => {
  if (!startDate.value || !endDate.value) return
  
  loading.value = true
  try {
    const { data } = await programmationService.getByRange(startDate.value, endDate.value)
    programmations.value = data
  } catch (error) {
    console.error('Erreur chargement programmation:', error)
  } finally {
    loading.value = false
  }
}

const loadChoristes = async () => {
  try {
    const { data } = await choristeService.getAll()
    choristes.value = data
  } catch (error) {
    console.error('Erreur chargement choristes:', error)
  }
}

const saveEntry = async (entry) => {
  saving.value = entry.dateStr
  try {
    await programmationService.createOrUpdate({
      date_dimanche: entry.dateStr,
      id_chanteur_principal: entry.id_chanteur_principal,
      id_chanteur_secondaire: entry.id_chanteur_secondaire,
      description: entry.description
    })
    // Recharger pour avoir les IDs à jour
    const { data } = await programmationService.getByRange(startDate.value, endDate.value)
    programmations.value = data
  } catch (error) {
    alert('Erreur lors de l\'enregistrement : ' + (error.response?.data?.error || error.message))
  } finally {
    saving.value = null
  }
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date)
    .replace(/^\w/, (c) => c.toUpperCase())
}

const getShortMonth = (date) => new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(date).replace('.', '')
const getDayNumber = (date) => date.getDate()
const getWeekday = (date) => new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(date)

const handleExport = () => {
  const url = programmationService.exportPDF(startDate.value, endDate.value)
  window.open(url, '_blank')
}

onMounted(async () => {
  await Promise.all([loadChoristes(), loadProgrammation()])
})
</script>
