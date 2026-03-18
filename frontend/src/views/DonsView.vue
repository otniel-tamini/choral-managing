<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-heading font-bold text-navy-500">Dons</h1>
        <p class="text-gray-500 mt-1">Gestion des dons reçus</p>
      </div>
      <button @click="openModal()" class="bg-gold-400 hover:bg-gold-500 text-navy-500 font-medium px-4 py-2 rounded-lg flex items-center gap-2">
        <PlusIcon class="w-5 h-5" /> Nouveau don
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl p-4 shadow-sm mb-6 flex gap-4 flex-wrap items-center">
      <input v-model="filters.search" type="text" placeholder="Rechercher un donateur..." class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400 flex-1" />
      <input v-model="filters.debut" type="date" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400" />
      <span class="text-gray-400">à</span>
      <input v-model="filters.fin" type="date" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400" />
      <button @click="loadDons" class="px-4 py-2 bg-navy-500 text-white rounded-lg hover:bg-navy-600">Filtrer</button>
      <button @click="exportExcel" class="px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 flex items-center gap-2 ml-auto">
        <ArrowDownTrayIcon class="w-5 h-5" /> Export
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">Total des dons</p>
        <p class="text-2xl font-bold font-mono text-gold-500">{{ formatNumber(totalDons) }} F</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">Nombre de dons</p>
        <p class="text-2xl font-bold font-mono text-navy-500">{{ dons.length }}</p>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr class="text-left text-sm text-gray-500">
            <th class="px-6 py-4 font-medium">Donateur</th>
            <th class="px-6 py-4 font-medium">Date</th>
            <th class="px-6 py-4 font-medium">Description</th>
            <th class="px-6 py-4 font-medium text-right">Montant</th>
            <th class="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="don in dons" :key="don.id" class="border-t hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">{{ don.donateur }}</td>
            <td class="px-6 py-4 text-gray-600">{{ formatDate(don.date) }}</td>
            <td class="px-6 py-4 text-gray-500 text-sm">{{ don.description || '-' }}</td>
            <td class="px-6 py-4 text-right font-mono text-gold-600">{{ formatNumber(don.montant) }} F</td>
            <td class="px-6 py-4 text-right">
              <button @click="openModal(don)" class="text-blue-500 hover:text-blue-600 mr-3">
                <PencilIcon class="w-5 h-5 inline" />
              </button>
              <button @click="confirmDelete(don)" class="text-red-500 hover:text-red-600">
                <TrashIcon class="w-5 h-5 inline" />
              </button>
            </td>
          </tr>
          <tr v-if="dons.length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-gray-500">Aucun don trouvé</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeModal">
      <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 class="text-xl font-heading font-bold text-navy-500 mb-6">
          {{ editingDon ? 'Modifier le don' : 'Nouveau don' }}
        </h2>
        <form @submit.prevent="saveDon">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom du donateur *</label>
              <input v-model="form.donateur" type="text" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400" />
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
        <p class="text-gray-600 mb-6">Voulez-vous vraiment supprimer ce don de <strong>{{ donToDelete?.donateur }}</strong> ?</p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteConfirm = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
          <button @click="deleteDon" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Supprimer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PlusIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import { donService, exportService } from '../services/api'
import axios from 'axios'

const dons = ref([])
const activites = ref([])
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editingDon = ref(null)
const donToDelete = ref(null)

const filters = ref({ search: '', debut: '', fin: '' })
const form = ref({ donateur: '', montant: null, activite_id: null, date: new Date().toISOString().split('T')[0], description: '' })

const totalDons = computed(() => dons.value.reduce((sum, d) => sum + parseFloat(d.montant), 0))

const loadDons = async () => {
  try {
    const params = {}
    if (filters.value.debut) params.debut = filters.value.debut
    if (filters.value.fin) params.fin = filters.value.fin
    const { data } = await donService.getAll(params)
    dons.value = data
  } catch (error) {
    console.error('Erreur chargement dons:', error)
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

const openModal = (don = null) => {
  if (don) {
    editingDon.value = don
    form.value = { ...don }
  } else {
    editingDon.value = null
    form.value = { donateur: '', montant: null, activite_id: null, date: new Date().toISOString().split('T')[0], description: '' }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingDon.value = null
}

const saveDon = async () => {
  try {
    if (editingDon.value) {
      await donService.update(editingDon.value.id, form.value)
    } else {
      await donService.create(form.value)
    }
    closeModal()
    loadDons()
  } catch (error) {
    alert(error.response?.data?.error || 'Erreur lors de l\'enregistrement')
  }
}

const confirmDelete = (don) => {
  donToDelete.value = don
  showDeleteConfirm.value = true
}

const deleteDon = async () => {
  try {
    await donService.delete(donToDelete.value.id)
    showDeleteConfirm.value = false
    loadDons()
  } catch (error) {
    alert(error.response?.data?.error || 'Erreur lors de la suppression')
  }
}

const exportExcel = () => {
  window.open(exportService.exportExcel('dons', new Date().getFullYear()), '_blank')
}

const formatNumber = (num) => new Intl.NumberFormat('fr-FR').format(num || 0)
const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR')

onMounted(() => {
  loadDons()
  loadActivites()
})
</script>
