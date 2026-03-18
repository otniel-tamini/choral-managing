<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-heading font-bold text-navy-500">Cotisations</h1>
        <p class="text-gray-500 mt-1">Gestion des cotisations mensuelles</p>
      </div>
      <button @click="openModal()" class="bg-gold-400 hover:bg-gold-500 text-navy-500 font-medium px-4 py-2 rounded-lg flex items-center gap-2">
        <PlusIcon class="w-5 h-5" /> Nouvelle cotisation
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl p-4 shadow-sm mb-6 flex gap-4 flex-wrap">
      <select v-model="selectedYear" @change="loadCotisations" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400">
        <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
      </select>
      <button @click="exportExcel" class="ml-auto px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 flex items-center gap-2">
        <ArrowDownTrayIcon class="w-5 h-5" /> Export Excel
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">Total Annuel Perçu</p>
        <p class="text-2xl font-bold font-mono text-green-600">{{ formatNumber(totalPeriode) }} F</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">Nombre de cotisations</p>
        <p class="text-2xl font-bold font-mono text-navy-500">{{ cotisations.length }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">Choristes à jour (Soldé)</p>
        <p class="text-2xl font-bold font-mono text-gold-500">{{ choristesAJour }}</p>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr class="text-left text-sm text-gray-500">
            <th class="px-6 py-4 font-medium">Choriste</th>
            <th class="px-6 py-4 font-medium">Progression Annuelle</th>
            <th class="px-6 py-4 font-medium text-right">Total Payé</th>
            <th class="px-6 py-4 font-medium text-right">Reste à Payer</th>
            <th class="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in resumeParChoriste" :key="c.choriste_id" class="border-t hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">{{ c.nom }} {{ c.prenom }}</td>
            <td class="px-6 py-4">
              <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div class="h-2.5 rounded-full" :class="c.totalPaye >= 1200 ? 'bg-green-500' : 'bg-gold-400'" :style="{ width: Math.min(100, (c.totalPaye / 1200) * 100) + '%' }"></div>
              </div>
              <span class="text-xs text-gray-500">{{ Math.min(100, Math.round((c.totalPaye / 1200) * 100)) }}% de 1200 F</span>
            </td>
            <td class="px-6 py-4 text-right font-mono text-green-600">{{ formatNumber(c.totalPaye) }} F</td>
            <td class="px-6 py-4 text-right font-mono" :class="1200 - c.totalPaye > 0 ? 'text-red-500' : 'text-gray-400'">
              {{ Math.max(0, 1200 - c.totalPaye) }} F
            </td>
            <td class="px-6 py-4 text-right">
              <button @click="openModal(null, c.choriste_id)" class="text-green-500 hover:text-green-600 mr-3" title="Ajouter un paiement">
                <PlusIcon class="w-5 h-5 inline" />
              </button>
              <button @click="voirHistorique(c)" class="text-navy-500 hover:text-navy-600">
                Historique
              </button>
            </td>
          </tr>
          <tr v-if="resumeParChoriste.length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-gray-500">Aucune cotisation trouvée pour cette année</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeModal">
      <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 class="text-xl font-heading font-bold text-navy-500 mb-6">
          {{ editingCotisation ? 'Modifier la cotisation' : 'Nouvelle cotisation' }}
        </h2>
        <form @submit.prevent="saveCotisation">
          <div class="space-y-4">
            <div v-if="!editingCotisation">
              <label class="block text-sm font-medium text-gray-700 mb-1">Choriste *</label>
              <select v-model="form.choriste_id" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400">
                <option value="">Sélectionner un choriste</option>
                <option v-for="c in choristesList" :key="c.id" :value="c.id">{{ c.nom }} {{ c.prenom }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA) *</label>
                <input v-model.number="form.montant" type="number" required min="1" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Année d'imputation *</label>
                <select v-model="form.annee" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400">
                  <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                </select>
              </div>
            </div>

            <div v-if="!editingCotisation" class="flex items-center mt-2">
              <input 
                type="checkbox" 
                id="payerAnnuel" 
                v-model="form.payerAnnuel" 
                class="h-4 w-4 text-gold-400 focus:ring-gold-400 border-gray-300 rounded"
              >
              <label for="payerAnnuel" class="ml-2 block text-sm text-gray-900">
                Solder le reste de l'année (Jusqu'à 1200 F)
              </label>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de paiement *</label>
              <input v-model="form.date_paiement" type="date" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400" />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="closeModal" class="px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
            <button type="submit" class="px-4 py-2 bg-gold-400 text-navy-500 font-medium rounded-lg hover:bg-gold-500">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Historique Modal -->
    <div v-if="showHistoriqueModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showHistoriqueModal = false">
      <div class="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto">
        <h2 class="text-xl font-heading font-bold text-navy-500 mb-6 flex justify-between">
          <span>Historique: {{ choristeHistorique?.nom }} {{ choristeHistorique?.prenom }} ({{ selectedYear }})</span>
          <button @click="showHistoriqueModal = false" class="text-gray-400 hover:text-gray-600">&times;</button>
        </h2>
        
        <table class="w-full mb-6">
          <thead class="bg-gray-50 text-left text-sm text-gray-500">
            <tr>
              <th class="px-4 py-2">Date Paiement</th>
              <th class="px-4 py-2 text-right">Montant</th>
              <th class="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in choristeHistorique?.details || []" :key="h.id" class="border-t">
              <td class="px-4 py-2">{{ formatDate(h.date_paiement) }}</td>
              <td class="px-4 py-2 text-right font-mono">{{ formatNumber(h.montant) }} F</td>
              <td class="px-4 py-2 text-right">
                <button @click="confirmDelete(h)" class="text-red-500 hover:text-red-700">Supprimer</button>
              </td>
            </tr>
            <tr v-if="!choristeHistorique?.details?.length">
              <td colspan="3" class="text-center py-4 text-gray-500">Aucun historique pour cette année.</td>
            </tr>
          </tbody>
        </table>
        <div class="text-right">
            <button @click="showHistoriqueModal = false" class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Fermer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PlusIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import { cotisationService, choristeService, exportService } from '../services/api'
import axios from 'axios'

const moisNoms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

const cotisations = ref([])
const resumeParChoriste = ref([])
const choristesList = ref([])
const selectedYear = ref(currentYear)
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const showHistoriqueModal = ref(false)
const editingCotisation = ref(null)
const cotisationToDelete = ref(null)
const choristeHistorique = ref(null)

const form = ref({ 
  choriste_id: '', 
  annee: currentYear, 
  montant: 100, 
  date_paiement: new Date().toISOString().split('T')[0],
  payerAnnuel: false 
})

const totalPeriode = computed(() => {
  return resumeParChoriste.value.reduce((sum, c) => sum + parseFloat(c.totalPaye), 0)
})

const choristesAJour = computed(() => {
    return resumeParChoriste.value.filter(c => c.totalPaye >= 1200).length
})

const loadCotisations = async () => {
  try {
    const { data } = await axios.get(`/api/cotisations/annee/${selectedYear.value}`)
    
    // Le backend structure data.parChoriste
    if(data.parChoriste) {
        resumeParChoriste.value = data.parChoriste.map((c, i) => ({
            ...c,
            choriste_id: Object.keys(data.parChoriste)[i] // Si le backend renvoie un objet
        }))
        // Fix the object map correctly:
        // Object.values(data.parChoriste) is done in backend. Just need choriste_id manually or update backend to send it.
        // Assuming backend sends array of values. We need to fetch all distinct active choristes.
    }
    
    // Pour s'assurer qu'on liste tous les choristes, on fusionne avec choristesList
    if(choristesList.value.length > 0) {
        const merged = choristesList.value.map(ch => {
            const historique = data.parChoriste && Array.isArray(data.parChoriste) 
                ? data.parChoriste.find(c => c.nom === ch.nom && c.prenom === ch.prenom) 
                : null;
                
            return {
                choriste_id: ch.id,
                nom: ch.nom,
                prenom: ch.prenom,
                totalPaye: historique ? historique.totalPaye : 0,
                details: historique ? historique.details : []
            }
        });
        resumeParChoriste.value = merged;
    }

  } catch (error) {
    console.error('Erreur chargement cotisations:', error)
  }
}

const loadChoristes = async () => {
  try {
    const { data } = await choristeService.getAll()
    choristesList.value = data
    // Reload cotisations to trigger the merge
    loadCotisations()
  } catch (error) {
    console.error('Erreur chargement choristes:', error)
  }
}

const voirHistorique = (choriste) => {
  choristeHistorique.value = choriste
  showHistoriqueModal.value = true
}

const openModal = (cotisation = null, choristeId = '') => {
  if (cotisation) {
    editingCotisation.value = cotisation
    form.value = {
      choriste_id: cotisation.choriste_id,
      annee: cotisation.annee,
      montant: parseFloat(cotisation.montant),
      date_paiement: cotisation.date_paiement ? cotisation.date_paiement.split('T')[0] : new Date().toISOString().split('T')[0],
      payerAnnuel: false
    }
  } else {
    editingCotisation.value = null
    form.value = { 
      choriste_id: choristeId, 
      annee: selectedYear.value, 
      montant: 100, 
      date_paiement: new Date().toISOString().split('T')[0],
      payerAnnuel: false 
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingCotisation.value = null
}

const saveCotisation = async () => {
  try {
    if (editingCotisation.value) {
      await cotisationService.update(editingCotisation.value.id, { montant: form.value.montant, date_paiement: form.value.date_paiement })
    } else {
      if (form.value.payerAnnuel) {
        // Calculer le reste à payer pour atteindre 1200 F
        const choriste = resumeParChoriste.value.find(c => c.choriste_id === form.value.choriste_id)
        const reste = choriste ? Math.max(0, 1200 - choriste.totalPaye) : 1200;
        
        if(reste > 0) {
            await cotisationService.create({
                choriste_id: form.value.choriste_id,
                annee: form.value.annee,
                montant: reste,
                date_paiement: form.value.date_paiement,
                mois: null
            })
        }
      } else {
        await cotisationService.create({
            choriste_id: form.value.choriste_id,
            annee: form.value.annee,
            montant: form.value.montant,
            date_paiement: form.value.date_paiement,
            mois: null // Assuré par le schéma désormais
        })
      }
    }
    closeModal()
    loadCotisations()
  } catch (error) {
    alert(error.response?.data?.error || 'Erreur lors de l\'enregistrement')
  }
}

const confirmDelete = (c) => {
  cotisationToDelete.value = c
  // Update state to close historique modal and show delete directly, 
  // or handle deletion within historique modal smoothly
  showDeleteConfirm.value = true
}

const deleteCotisation = async () => {
  try {
    await cotisationService.delete(cotisationToDelete.value.id)
    showDeleteConfirm.value = false
    
    // Update the local modal view state so it reflects immediately
    if(choristeHistorique.value && choristeHistorique.value.details) {
        choristeHistorique.value.details = choristeHistorique.value.details.filter(d => d.id !== cotisationToDelete.value.id)
    }
    
    loadCotisations()
  } catch (error) {
    alert(error.response?.data?.error || 'Erreur lors de la suppression')
  }
}

const exportExcel = () => {
  window.open(exportService.exportExcel('cotisations', selectedYear.value), '_blank')
}

const formatNumber = (num) => new Intl.NumberFormat('fr-FR').format(num || 0)
const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR')

onMounted(() => {
  loadCotisations()
  loadChoristes()
})
</script>
