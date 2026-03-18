<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-heading font-bold text-navy-500">Rapports</h1>
      <p class="text-gray-500 mt-1">Génération de rapports financiers</p>
    </div>

    <!-- Selection -->
    <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
      <h2 class="text-lg font-heading font-semibold text-navy-500 mb-4">Générer un rapport</h2>
      <div class="flex flex-wrap gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type de rapport</label>
          <select v-model="rapportType" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400 min-w-[200px]">
            <option value="trimestriel">Trimestriel</option>
            <option value="annuel">Annuel</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Année</label>
          <select v-model="selectedYear" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400">
            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
        
        <div v-if="rapportType === 'trimestriel'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Trimestre</label>
          <select v-model="selectedTrimestre" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400">
            <option v-for="t in 4" :key="t" :value="t">T{{ t }} ({{ getTrimestreMois(t) }})</option>
          </select>
        </div>
        
        <button @click="generateReport('json')" class="px-6 py-2 bg-navy-500 text-white rounded-lg hover:bg-navy-600 flex items-center gap-2">
          <EyeIcon class="w-5 h-5" /> Aperçu
        </button>
        <button @click="generateReport('pdf')" class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2">
          <DocumentArrowDownIcon class="w-5 h-5" /> Télécharger PDF
        </button>
      </div>
    </div>

    <!-- Aperçu -->
    <div v-if="reportData" class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-6 border-b flex justify-between items-center">
        <h2 class="text-xl font-heading font-bold text-navy-500">
          Rapport {{ rapportType === 'trimestriel' ? 'Trimestriel' : 'Annuel' }}
          {{ selectedYear }} {{ rapportType === 'trimestriel' ? `- T${selectedTrimestre}` : '' }}
        </h2>
        <div class="flex gap-2">
          <button @click="printReport" class="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <PrinterIcon class="w-5 h-5" /> Imprimer
          </button>
        </div>
      </div>
      
      <div class="p-6">
        <!-- Résumé -->
        <div class="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 class="text-lg font-heading font-semibold text-navy-500 mb-4">Résumé financier</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p class="text-sm text-gray-500">Total Cotisations</p>
              <p class="text-xl font-bold font-mono text-green-600">{{ formatNumber(reportData.totalCotisations) }} F</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Total Dons</p>
              <p class="text-xl font-bold font-mono text-gold-500">{{ formatNumber(reportData.totalDons) }} F</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Total Dépenses</p>
              <p class="text-xl font-bold font-mono text-red-600">{{ formatNumber(reportData.totalDepenses) }} F</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Solde</p>
              <p class="text-xl font-bold font-mono" :class="reportData.solde >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatNumber(reportData.solde) }} F
              </p>
            </div>
          </div>
        </div>

        <!-- Cotisations -->
        <div v-if="reportData.cotisations?.length" class="mb-8">
          <h3 class="text-lg font-heading font-semibold text-navy-500 mb-4">Cotisations ({{ reportData.cotisations.length }})</h3>
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-gray-500 border-b">
                <th class="pb-2">Choriste</th>
                <th class="pb-2">Période</th>
                <th class="pb-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in reportData.cotisations.slice(0, 10)" :key="c.id" class="border-b">
                <td class="py-2">{{ c.nom }} {{ c.prenom }}</td>
                <td class="py-2">{{ moisNoms[c.mois - 1] }} {{ c.annee }}</td>
                <td class="py-2 text-right font-mono">{{ formatNumber(c.montant) }} F</td>
              </tr>
            </tbody>
          </table>
          <p v-if="reportData.cotisations.length > 10" class="text-gray-500 text-sm mt-2">
            ... et {{ reportData.cotisations.length - 10 }} autres cotisations
          </p>
        </div>

        <!-- Dons -->
        <div v-if="reportData.dons?.length" class="mb-8">
          <h3 class="text-lg font-heading font-semibold text-navy-500 mb-4">Dons ({{ reportData.dons.length }})</h3>
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-gray-500 border-b">
                <th class="pb-2">Donateur</th>
                <th class="pb-2">Date</th>
                <th class="pb-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in reportData.dons.slice(0, 10)" :key="d.id" class="border-b">
                <td class="py-2">{{ d.donateur }}</td>
                <td class="py-2">{{ formatDate(d.date) }}</td>
                <td class="py-2 text-right font-mono">{{ formatNumber(d.montant) }} F</td>
              </tr>
            </tbody>
          </table>
          <p v-if="reportData.dons.length > 10" class="text-gray-500 text-sm mt-2">
            ... et {{ reportData.dons.length - 10 }} autres dons
          </p>
        </div>

        <!-- Dépenses -->
        <div v-if="reportData.depenses?.length">
          <h3 class="text-lg font-heading font-semibold text-navy-500 mb-4">Dépenses ({{ reportData.depenses.length }})</h3>
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-gray-500 border-b">
                <th class="pb-2">Date</th>
                <th class="pb-2">Libellé</th>
                <th class="pb-2">Catégorie</th>
                <th class="pb-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in reportData.depenses.slice(0, 10)" :key="d.id" class="border-b">
                <td class="py-2">{{ formatDate(d.date) }}</td>
                <td class="py-2">{{ d.libelle }}</td>
                <td class="py-2"><span class="px-2 py-0.5 rounded text-xs" :class="getCategoryClass(d.categorie)">{{ d.categorie }}</span></td>
                <td class="py-2 text-right font-mono">{{ formatNumber(d.montant) }} F</td>
              </tr>
            </tbody>
          </table>
          <p v-if="reportData.depenses.length > 10" class="text-gray-500 text-sm mt-2">
            ... et {{ reportData.depenses.length - 10 }} autres dépenses
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { EyeIcon, DocumentArrowDownIcon, PrinterIcon } from '@heroicons/vue/24/outline'
import { rapportService } from '../services/api'

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
const moisNoms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const trimestreMois = { 1: 'Jan-Mar', 2: 'Avr-Juin', 3: 'Juil-Sep', 4: 'Oct-Déc' }

const rapportType = ref('trimestriel')
const selectedYear = ref(currentYear)
const selectedTrimestre = ref(Math.ceil((new Date().getMonth() + 1) / 3))
const reportData = ref(null)

const getTrimestreMois = (t) => trimestreMois[t]

const getCategoryClass = (cat) => ({
  transport: 'bg-blue-100 text-blue-700',
  materiel: 'bg-purple-100 text-purple-700',
  evenement: 'bg-red-100 text-red-700',
  autre: 'bg-gray-100 text-gray-600'
}[cat])

const generateReport = async (format) => {
  try {
    if (rapportType.value === 'trimestriel') {
      const { data } = await rapportService.getTrimestriel(selectedYear.value, selectedTrimestre.value, format)
      if (format === 'pdf') {
        const url = window.URL.createObjectURL(new Blob([data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `rapport-T${selectedTrimestre.value}-${selectedYear.value}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
      } else {
        reportData.value = data
      }
    } else {
      const { data } = await rapportService.getAnnuel(selectedYear.value, format)
      if (format === 'pdf') {
        const url = window.URL.createObjectURL(new Blob([data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `rapport-annuel-${selectedYear.value}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
      } else {
        reportData.value = data
      }
    }
  } catch (error) {
    console.error('Erreur génération rapport:', error)
    alert('Erreur lors de la génération du rapport')
  }
}

const printReport = () => {
  window.print()
}

const formatNumber = (num) => new Intl.NumberFormat('fr-FR').format(num || 0)
const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR')

onMounted(() => {
  generateReport('json')
})
</script>
