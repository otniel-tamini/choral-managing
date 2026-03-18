<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-heading font-bold text-navy-500">Tableau de bord</h1>
      <p class="text-gray-500 mt-1">Vue d'ensemble de la situation financière</p>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl">💰</div>
          <span class="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Année {{ currentYear }}</span>
        </div>
        <p class="text-sm text-gray-500">Total Cotisations</p>
        <p class="text-2xl font-bold font-mono text-navy-500">{{ formatNumber(stats.totalCotisations) }} F</p>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl">🎁</div>
          <span class="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">Année {{ currentYear }}</span>
        </div>
        <p class="text-sm text-gray-500">Total Dons</p>
        <p class="text-2xl font-bold font-mono text-navy-500">{{ formatNumber(stats.totalDons) }} F</p>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xl">💸</div>
          <span class="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">Année {{ currentYear }}</span>
        </div>
        <p class="text-sm text-gray-500">Total Dépenses</p>
        <p class="text-2xl font-bold font-mono text-navy-500">{{ formatNumber(stats.totalDepenses) }} F</p>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow" :class="stats.solde >= 0 ? 'ring-2 ring-green-400' : 'ring-2 ring-red-400'">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 text-xl">⚖️</div>
          <span class="text-xs font-medium px-2 py-1 rounded-full" :class="stats.solde >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'">
            {{ stats.solde >= 0 ? 'Positif' : 'Négatif' }}
          </span>
        </div>
        <p class="text-sm text-gray-500">Solde Actuel</p>
        <p class="text-2xl font-bold font-mono" :class="stats.solde >= 0 ? 'text-green-600' : 'text-red-600'">
          {{ formatNumber(stats.solde) }} F
        </p>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-heading font-semibold text-navy-500">Évolution mensuelle</h2>
          <select v-model="selectedYear" @change="loadEvolution" class="text-sm border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-400">
            <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
        <div class="h-64">
          <Line v-if="chartData" :data="chartData" :options="lineOptions" />
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-lg font-heading font-semibold text-navy-500 mb-6">Répartition des dépenses</h2>
        <div class="h-64 flex items-center justify-center">
          <Doughnut v-if="doughnutData" :data="doughnutData" :options="doughnutOptions" />
        </div>
      </div>
    </div>

    <!-- Transactions -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h2 class="text-lg font-heading font-semibold text-navy-500 mb-6">Dernières transactions</h2>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-sm text-gray-500 border-b">
              <th class="pb-3 font-medium">Date</th>
              <th class="pb-3 font-medium">Type</th>
              <th class="pb-3 font-medium">Description</th>
              <th class="pb-3 font-medium text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in stats.transactions" :key="tx.id + tx.type" class="border-b last:border-0 hover:bg-gray-50">
              <td class="py-3 text-sm">{{ formatDate(tx.date) }}</td>
              <td class="py-3">
                <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getTypeClass(tx.type)">
                  {{ getTypeLabel(tx.type) }}
                </span>
              </td>
              <td class="py-3 text-sm text-gray-600">{{ tx.description }}</td>
              <td class="py-3 text-right font-mono text-sm" :class="tx.type === 'depense' ? 'text-red-600' : 'text-green-600'">
                {{ tx.type === 'depense' ? '-' : '+' }}{{ formatNumber(tx.montant) }} F
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Line, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { dashboardService } from '../services/api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)

const stats = ref({ totalCotisations: 0, totalDons: 0, totalDepenses: 0, solde: 0, transactions: [] })
const evolutionData = ref([])
const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)
const availableYears = computed(() => { const y = []; for (let i = currentYear; i >= currentYear - 5; i--) y.push(i); return y })

const chartData = computed(() => {
  if (!evolutionData.value.length) return null
  return {
    labels: evolutionData.value.map(d => d.moisNom),
    datasets: [
      { label: 'Cotisations', data: evolutionData.value.map(d => d.cotisations), borderColor: '#27AE60', backgroundColor: 'rgba(39, 174, 96, 0.1)', fill: true, tension: 0.4 },
      { label: 'Dons', data: evolutionData.value.map(d => d.dons), borderColor: '#D4AF37', backgroundColor: 'rgba(212, 175, 55, 0.1)', fill: true, tension: 0.4 },
      { label: 'Dépenses', data: evolutionData.value.map(d => d.depenses), borderColor: '#E74C3C', backgroundColor: 'rgba(231, 76, 60, 0.1)', fill: true, tension: 0.4 }
    ]
  }
})

const doughnutData = computed(() => {
  if (!evolutionData.value.length) return null
  const cats = {
    transport: evolutionData.value.reduce((sum, d) => sum + parseFloat(d.depensesParCategorie?.transport || 0), 0),
    materiel: evolutionData.value.reduce((sum, d) => sum + parseFloat(d.depensesParCategorie?.materiel || 0), 0),
    evenement: evolutionData.value.reduce((sum, d) => sum + parseFloat(d.depensesParCategorie?.evenement || 0), 0),
    autre: evolutionData.value.reduce((sum, d) => sum + parseFloat(d.depensesParCategorie?.autre || 0), 0)
  }
  return { labels: ['Transport', 'Matériel', 'Événement', 'Autre'], datasets: [{ data: [cats.transport, cats.materiel, cats.evenement, cats.autre], backgroundColor: ['#3498DB', '#9B59B6', '#E74C3C', '#95A5A6'], borderWidth: 0 }] }
})

const lineOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }
const doughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }

const loadStats = async () => { try { const { data } = await dashboardService.getStats(); stats.value = data } catch (error) { console.error('Erreur:', error) } }
const loadEvolution = async () => { try { const { data } = await dashboardService.getEvolution(selectedYear.value); evolutionData.value = data.evolution } catch (error) { console.error('Erreur:', error) } }
const formatNumber = (num) => new Intl.NumberFormat('fr-FR').format(num || 0)
const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR')
const getTypeClass = (type) => ({ cotisation: 'bg-green-100 text-green-700', don: 'bg-yellow-100 text-yellow-700', depense: 'bg-red-100 text-red-700' }[type] || 'bg-gray-100 text-gray-700')
const getTypeLabel = (type) => ({ cotisation: 'Cotisation', don: 'Don', depense: 'Dépense' }[type] || type)

onMounted(() => { loadStats(); loadEvolution() })
</script>
