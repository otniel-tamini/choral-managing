<template>
  <div class="p-8">
    <div class="mb-8"><h1 class="text-3xl font-heading font-bold text-navy-500">Rapports</h1><p class="text-gray-500 mt-1">Génération de rapports financiers</p></div>

    <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
      <h2 class="text-lg font-heading font-semibold text-navy-500 mb-4">Générer un rapport</h2>
      <div class="flex flex-wrap gap-4 items-end">
        <div><label class="block text-sm font-medium mb-1">Type</label><select v-model="rapportType" class="px-4 py-2 border rounded-lg min-w-[150px]"><option value="trimestriel">Trimestriel</option><option value="annuel">Annuel</option></select></div>
        <div><label class="block text-sm font-medium mb-1">Année</label><select v-model="selectedYear" class="px-4 py-2 border rounded-lg"><option v-for="y in years" :key="y" :value="y">{{ y }}</option></select></div>
        <div v-if="rapportType==='trimestriel'"><label class="block text-sm font-medium mb-1">Trimestre</label><select v-model="selectedTrimestre" class="px-4 py-2 border rounded-lg"><option v-for="t in 4" :key="t" :value="t">T{{ t }}</option></select></div>
        <button @click="generateReport('json')" class="px-6 py-2 bg-navy-500 text-white rounded-lg hover:bg-navy-600">👁️ Aperçu</button>
        <button @click="generateReport('pdf')" class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">📄 PDF</button>
      </div>
    </div>

    <div v-if="reportData" class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-6 border-b"><h2 class="text-xl font-heading font-bold text-navy-500">Rapport {{ rapportType==='trimestriel'?'Trimestriel':'Annuel' }} {{ selectedYear }}{{ rapportType==='trimestriel'?' - T'+selectedTrimestre:'' }}</h2></div>
      <div class="p-6">
        <div class="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 class="text-lg font-heading font-semibold mb-4">Résumé financier</h3>
          <div class="grid grid-cols-4 gap-6">
            <div><p class="text-sm text-gray-500">Cotisations</p><p class="text-xl font-bold font-mono text-green-600">{{ formatNumber(reportData.totalCotisations) }} F</p></div>
            <div><p class="text-sm text-gray-500">Dons</p><p class="text-xl font-bold font-mono text-yellow-500">{{ formatNumber(reportData.totalDons) }} F</p></div>
            <div><p class="text-sm text-gray-500">Dépenses</p><p class="text-xl font-bold font-mono text-red-600">{{ formatNumber(reportData.totalDepenses) }} F</p></div>
            <div><p class="text-sm text-gray-500">Solde</p><p class="text-xl font-bold font-mono" :class="reportData.solde>=0?'text-green-600':'text-red-600'">{{ formatNumber(reportData.solde) }} F</p></div>
          </div>
        </div>
        <p class="text-gray-500 text-center py-8">Rapport généré avec succès. Cliquez sur "PDF" pour télécharger.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { rapportService } from '../services/api'

const currentYear = new Date().getFullYear()
const years = Array.from({length:5},(_,i)=>currentYear-i)

const rapportType = ref('trimestriel')
const selectedYear = ref(currentYear)
const selectedTrimestre = ref(Math.ceil((new Date().getMonth()+1)/3))
const reportData = ref(null)

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
      } else { reportData.value = data }
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
      } else { reportData.value = data }
    }
  } catch (error) { console.error('Erreur:', error); alert('Erreur génération rapport') }
}

const formatNumber = (n) => new Intl.NumberFormat('fr-FR').format(n||0)
</script>
