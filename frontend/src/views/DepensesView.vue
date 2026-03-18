<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-heading font-bold text-navy-500">Dépenses</h1>
        <p class="text-gray-500 mt-1">Gestion des dépenses de la chorale</p>
      </div>
      <button @click="openModal()" class="bg-gold-400 hover:bg-gold-500 text-navy-500 font-medium px-4 py-2 rounded-lg flex items-center gap-2">
        <PlusIcon class="w-5 h-5" /> Nouvelle dépense
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl p-4 shadow-sm mb-6 flex gap-4 flex-wrap items-center">
      <select v-model="filters.categorie" @change="loadDepenses" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400">
        <option value="">Toutes catégories</option>
        <option value="transport">Transport</option>
        <option value="materiel">Matériel</option>
        <option value="evenement">Événement</option>
        <option value="autre">Autre</option>
      </select>
      <input v-model="filters.debut" type="date" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400" />
      <span class="text-gray-400">à</span>
      <input v-model="filters.fin" type="date" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400" />
      <button @click="loadDepenses" class="px-4 py-2 bg-navy-500 text-white rounded-lg hover:bg-navy-600">Filtrer</button>
      <button @click="exportExcel" class="px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 flex items-center gap-2 ml-auto">
        <ArrowDownTrayIcon class="w-5 h-5" /> Export
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-3 h-3 rounded-full bg-blue-500"></div>
          <span class="text-sm text-gray-500">Transport</span>
        </div>
        <p class="text-xl font-bold font-mono">{{ formatNumber(totals.transport) }} F</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-3 h-3 rounded-full bg-purple-500"></div>
          <span class="text-sm text-gray-500">Matériel</span>
        </div>
        <p class="text-xl font-bold font-mono">{{ formatNumber(totals.materiel) }} F</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-3 h-3 rounded-full bg-red-500"></div>
          <span class="text-sm text-gray-500">Événement</span>
        </div>
        <p class="text-xl font-bold font-mono">{{ formatNumber(totals.evenement) }} F</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-3 h-3 rounded-full bg-gray-400"></div>
          <span class="text-sm text-gray-500">Autre</span>
        </div>
        <p class="text-xl font-bold font-mono">{{ formatNumber(totals.autre) }} F</p>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr class="text-left text-sm text-gray-500">
            <th class="px-6 py-4 font-medium">Date</th>
            <th class="px-6 py-4 font-medium">Libellé</th>
            <th class="px-6 py-4 font-medium">Catégorie</th>
            <th class="px-6 py-4 font-medium">Description</th>
            <th class="px-6 py-4 font-medium text-right">Montant</th>
            <th class="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="depense in depenses" :key="depense.id" class="border-t hover:bg-gray-50">
            <td class="px-6 py-4 text-gray-600">{{ formatDate(depense.date) }}</td>
            <td class="px-6 py-4 font-medium">{{ depense.libelle }}</td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getCategoryClass(depense.categorie)">
                {{ getCategoryLabel(depense.categorie) }}
              </span>
            </td>
            <td class="px-6 py-4 text-gray-500 text-sm">{{ depense.description || '-' }}</td>
            <td class="px-6 py-4 text-right font-mono text-red-600">{{ formatNumber(depense.montant) }} F</td>
            <td class="px-6 py-4 text-right">
              <button @click="openModal(depense)" class="text-blue-500 hover:text-blue-600 mr-3">
                <PencilIcon class="w-5 h-5 inline" />
              </button>
              <button @click="confirmDelete(depense)" class="text-red-500 hover:text-red-600">
                <TrashIcon class="w-5 h-5 inline" />
              </button>
            </td>
          </tr>
          <tr v-if="depenses.length === 0">
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">Aucune dépense trouvée</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="bg-gray-50 font-bold">
            <td colspan="4" class="px-6 py-3 text-right">Total :</td>
            <td class="px-6 py-3 text-right font-mono text-red-600">{{ formatNumber(totalDepenses) }} F</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeModal">
      <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 class="text-xl font-heading font-bold text-navy-500 mb-6">
          {{ editingDepense ? 'Modifier la dépense' : 'Nouvelle dépense' }}
        </h2>
        <form @submit.prevent="saveDepense">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Libellé *</label>
              <input v-model="form.libelle" type="text" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
              <select v-model="form.categorie" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400">
                <option value="transport">Transport</option>
                <option value="materiel">Matériel</option>
                <option value="evenement">Événement</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA) *</label>
              <input v-model.number="form.montant" type="number" required min="1" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Activité liée (Optionnel)</label>
              <select v-model="form.activite_id" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400">
                <option :value="null">Aucune activité</option>
                <option v-for="act in activites" :key="act.id" :value="act.id">
                  {{ act.nom }} ({{ act.annee }})
                </option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="closeModal" class="px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
            <button type="submit" class="px-4 py-2 bg-gold-400 text-navy-500 font-medium rounded-lg hover:bg-gold-500">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h2 class="text-lg font-heading font-bold text-navy-500 mb-4">Confirmer la suppression</h2>
        <p class="text-gray-600 mb-6">Voulez-vous vraiment supprimer cette dépense ?</p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteConfirm = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
          <button @click="deleteDepense" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Supprimer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PlusIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import { depenseService, exportService } from '../services/api'
import axios from 'axios'

const depenses = ref([])
const activites = ref([])
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editingDepense = ref(null)
const depenseToDelete = ref(null)

const filters = ref({ categorie: '', debut: '', fin: '' })
const form = ref({ libelle: '', categorie: 'autre', montant: null, activite_id: null, date: new Date().toISOString().split('T')[0], description: '' })

const totalDepenses = computed(() => depenses.value.reduce((sum, d) => sum + parseFloat(d.montant), 0))
const totals = computed(() => ({
  transport: depenses.value.filter(d => d.categorie === 'transport').reduce((sum, d) => sum + parseFloat(d.montant), 0),
  materiel: depenses.value.filter(d => d.categorie === 'materiel').reduce((sum, d) => sum + parseFloat(d.montant), 0),
  evenement: depenses.value.filter(d => d.categorie === 'evenement').reduce((sum, d) => sum + parseFloat(d.montant), 0),
  autre: depenses.value.filter(d => d.categorie === 'autre').reduce((sum, d) => sum + parseFloat(d.montant), 0)
}))

const getCategoryClass = (cat) => ({
  transport: 'bg-blue-100 text-blue-700',
  materiel: 'bg-purple-100 text-purple-700',
  evenement: 'bg-red-100 text-red-700',
  autre: 'bg-gray-100 text-gray-600'
}[cat])

const getCategoryLabel = (cat) => ({
  transport: 'Transport',
  materiel: 'Matériel',
  evenement: 'Événement',
  autre: 'Autre'
}[cat])

const loadDepenses = async () => {
  try {
    const params = {}
    if (filters.value.categorie) params.categorie = filters.value.categorie
    if (filters.value.debut) params.debut = filters.value.debut
    if (filters.value.fin) params.fin = filters.value.fin
    const { data } = await depenseService.getAll(params)
    depenses.value = data
  } catch (error) {
    console.error('Erreur chargement dépenses:', error)
  }
}

const loadActivites = async () => {
  try {
    const { data } = await axios.get('/api/activites')
    activites.value = data
  } catch (error) {
    console.error('Erreur chargement activités:', error)
  }
}

const openModal = (depense = null) => {
  if (depense) {
    editingDepense.value = depense
    form.value = { ...depense }
  } else {
    editingDepense.value = null
    form.value = { libelle: '', categorie: 'autre', montant: null, activite_id: null, date: new Date().toISOString().split('T')[0], description: '' }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingDepense.value = null
}

const saveDepense = async () => {
  try {
    if (editingDepense.value) {
      await depenseService.update(editingDepense.value.id, form.value)
    } else {
      await depenseService.create(form.value)
    }
    closeModal()
    loadDepenses()
  } catch (error) {
    alert(error.response?.data?.error || 'Erreur lors de l\'enregistrement')
  }
}

const confirmDelete = (depense) => {
  depenseToDelete.value = depense
  showDeleteConfirm.value = true
}

const deleteDepense = async () => {
  try {
    await depenseService.delete(depenseToDelete.value.id)
    showDeleteConfirm.value = false
    loadDepenses()
  } catch (error) {
    alert(error.response?.data?.error || 'Erreur lors de la suppression')
  }
}

const exportExcel = () => {
  window.open(exportService.exportExcel('depenses', new Date().getFullYear()), '_blank')
}

const formatNumber = (num) => new Intl.NumberFormat('fr-FR').format(num || 0)
const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR')

onMounted(() => {
  loadDepenses()
  loadActivites()
})
</script>
