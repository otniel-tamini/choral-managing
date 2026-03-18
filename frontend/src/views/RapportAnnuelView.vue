<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-heading font-bold text-navy-500">Rapport d'Activités</h1>
        <p class="text-gray-500 mt-1">Bilan financier annuel par activité</p>
      </div>
      <select 
        v-model="anneeSelectionnee"
        @change="chargerRapport"
        class="border border-gray-300 rounded-lg px-6 py-2 bg-white text-navy-500 font-bold focus:outline-none focus:ring-2 focus:ring-gold-400 text-lg shadow-sm"
      >
        <option v-for="annee in anneesDisponibles" :key="annee" :value="annee">
          Année {{ annee }}
        </option>
      </select>
    </div>

    <!-- Stats Globales -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3 mb-2 text-gray-500">
          <CalendarIcon class="w-5 h-5 text-blue-500" />
          <h3 class="font-medium">Total Activités</h3>
        </div>
        <p class="text-2xl font-bold font-mono text-navy-500">{{ nbActivites }}</p>
      </div>
      
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3 mb-2 text-gray-500">
          <GiftIcon class="w-5 h-5 text-green-500" />
          <h3 class="font-medium">Dons Reçus</h3>
        </div>
        <p class="text-2xl font-bold font-mono text-green-600">{{ formatNumber(totalDonsGlobal) }} F</p>
      </div>
      
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3 mb-2 text-gray-500">
          <BanknotesIcon class="w-5 h-5 text-red-500" />
          <h3 class="font-medium">Dépenses Effectuées</h3>
        </div>
        <p class="text-2xl font-bold font-mono text-red-600">{{ formatNumber(totalDepensesGlobal) }} F</p>
      </div>
      
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100" :class="soldeGlobal >= 0 ? 'bg-green-50' : 'bg-red-50'">
        <div class="flex items-center gap-3 mb-2 text-gray-500">
          <ChartPieIcon class="w-5 h-5" :class="soldeGlobal >= 0 ? 'text-green-600' : 'text-red-600'" />
          <h3 class="font-medium">Balance Nette</h3>
        </div>
        <p class="text-2xl font-bold font-mono" :class="soldeGlobal >= 0 ? 'text-green-700' : 'text-red-700'">
          {{ soldeGlobal >= 0 ? '+' : '' }}{{ formatNumber(soldeGlobal) }} F
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="chargement" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-gold-400"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="activites.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 py-16 text-center">
      <DocumentChartBarIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-xl font-medium text-gray-900">Aucune activité pour l'année {{ anneeSelectionnee }}</h3>
      <p class="text-gray-500 mt-2">Le rapport d'activité est vide.</p>
    </div>

    <!-- Détail par activité -->
    <div v-else class="space-y-6">
      <h2 class="text-xl font-bold text-navy-500 mb-4 border-b border-gray-200 pb-2">Détail par Activité</h2>
      
      <div v-for="activite in activites" :key="activite.id" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 class="text-xl font-bold text-navy-600 flex items-center gap-2">
                {{ activite.nom }}
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full ml-2"
                  :class="{
                    'bg-blue-100 text-blue-700': activite.statut === 'prevu',
                    'bg-yellow-100 text-yellow-700': activite.statut === 'en cours',
                    'bg-green-100 text-green-700': activite.statut === 'termine',
                    'bg-gray-100 text-gray-700': activite.statut === 'annule'
                  }"
                >
                  {{ activite.statut.charAt(0).toUpperCase() + activite.statut.slice(1) }}
                </span>
              </h3>
              <p class="text-sm text-gray-500 mt-1">
                {{ formaterDate(activite.date_debut) }} <span v-if="activite.date_fin">au {{ formaterDate(activite.date_fin) }}</span>
              </p>
            </div>
            
            <div class="flex items-center gap-6 bg-gray-50 px-6 py-3 rounded-lg border border-gray-100">
              <div class="text-center">
                <p class="text-xs text-gray-500 uppercase font-semibold mb-1">Dons</p>
                <p class="text-lg font-bold font-mono text-green-600">{{ formatNumber(activite.total_dons) }} F</p>
              </div>
              <div class="w-px h-10 bg-gray-200"></div>
              <div class="text-center">
                <p class="text-xs text-gray-500 uppercase font-semibold mb-1">Dépenses</p>
                <p class="text-lg font-bold font-mono text-red-600">{{ formatNumber(activite.total_depenses) }} F</p>
              </div>
              <div class="w-px h-10 bg-gray-200"></div>
              <div class="text-center">
                <p class="text-xs text-gray-500 uppercase font-semibold mb-1">Balance</p>
                <p 
                  class="text-lg font-bold font-mono"
                  :class="activite.solde >= 0 ? 'text-green-600' : 'text-red-600'"
                >
                  {{ activite.solde >= 0 ? '+' : '' }}{{ formatNumber(activite.solde) }} F
                </p>
              </div>
            </div>
          </div>
          
          <div v-if="activite.description" class="text-gray-600 text-sm bg-gray-50 p-4 rounded-lg mt-4 border border-gray-100">
            <p class="font-medium text-gray-700 mb-1">Description:</p>
            <p>{{ activite.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { 
  CalendarIcon, 
  GiftIcon, 
  BanknotesIcon, 
  ChartPieIcon,
  DocumentChartBarIcon
} from '@heroicons/vue/24/outline'

const anneeCourante = new Date().getFullYear()

// State
const anneeSelectionnee = ref(anneeCourante)
const activites = ref([])
const nbActivites = ref(0)
const chargement = ref(false)

// Options
const anneesDisponibles = computed(() => {
  const annees = []
  for (let annee = anneeCourante - 2; annee <= anneeCourante + 2; annee++) {
    annees.push(annee)
  }
  return annees
})

// Computed Totals
const totalDonsGlobal = computed(() => {
  return activites.value.reduce((sum, act) => sum + (parseFloat(act.total_dons) || 0), 0)
})

const totalDepensesGlobal = computed(() => {
  return activites.value.reduce((sum, act) => sum + (parseFloat(act.total_depenses) || 0), 0)
})

const soldeGlobal = computed(() => {
  return totalDonsGlobal.value - totalDepensesGlobal.value
})

// Methods
const formaterDate = (dateString) => {
  if (!dateString) return 'Non définie'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('fr-FR').format(num || 0)
}

const chargerRapport = async () => {
  chargement.value = true
  try {
    const { data } = await axios.get(`/api/rapports/activites/${anneeSelectionnee.value}`)
    activites.value = data.activites
    nbActivites.value = data.nbActivites
  } catch (error) {
    console.error('Erreur lors du chargement du rapport:', error)
  } finally {
    chargement.value = false
  }
}

onMounted(() => {
  chargerRapport()
})
</script>
