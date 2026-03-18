<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-8">
      <div><h1 class="text-3xl font-heading font-bold text-navy-500">Dons</h1><p class="text-gray-500 mt-1">Gestion des dons reçus</p></div>
      <button @click="openModal()" class="bg-gold-400 hover:bg-gold-500 text-navy-500 font-medium px-4 py-2 rounded-lg">➕ Nouveau</button>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm"><p class="text-sm text-gray-500">Total dons</p><p class="text-2xl font-bold font-mono text-yellow-500">{{ formatNumber(totalDons) }} F</p></div>
      <div class="bg-white rounded-xl p-4 shadow-sm"><p class="text-sm text-gray-500">Nombre</p><p class="text-2xl font-bold font-mono text-navy-500">{{ dons.length }}</p></div>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50"><tr class="text-left text-sm text-gray-500"><th class="px-6 py-4">Donateur</th><th class="px-6 py-4">Date</th><th class="px-6 py-4">Description</th><th class="px-6 py-4 text-right">Montant</th><th class="px-6 py-4 text-right">Actions</th></tr></thead>
        <tbody>
          <tr v-for="d in dons" :key="d.id" class="border-t hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">{{ d.donateur }}</td>
            <td class="px-6 py-4">{{ formatDate(d.date) }}</td>
            <td class="px-6 py-4 text-gray-500 text-sm">{{ d.description || '-' }}</td>
            <td class="px-6 py-4 text-right font-mono text-yellow-600">{{ formatNumber(d.montant) }} F</td>
            <td class="px-6 py-4 text-right"><button @click="openModal(d)" class="mr-3">✏️</button><button @click="confirmDelete(d)" class="text-red-500">🗑️</button></td>
          </tr>
          <tr v-if="!dons.length"><td colspan="5" class="px-6 py-8 text-center text-gray-500">Aucun don</td></tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeModal">
      <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 class="text-xl font-heading font-bold text-navy-500 mb-6">{{ editingDon ? 'Modifier' : 'Nouveau' }} don</h2>
        <form @submit.prevent="saveDon">
          <div class="space-y-4">
            <div><label class="block text-sm font-medium mb-1">Donateur *</label><input v-model="form.donateur" type="text" required class="w-full px-4 py-2 border rounded-lg" /></div>
            <div><label class="block text-sm font-medium mb-1">Montant (FCFA) *</label><input v-model.number="form.montant" type="number" required min="1" class="w-full px-4 py-2 border rounded-lg" /></div>
            <div><label class="block text-sm font-medium mb-1">Date *</label><input v-model="form.date" type="date" required class="w-full px-4 py-2 border rounded-lg" /></div>
            <div><label class="block text-sm font-medium mb-1">Description</label><textarea v-model="form.description" rows="2" class="w-full px-4 py-2 border rounded-lg"></textarea></div>
          </div>
          <div class="flex justify-end gap-3 mt-6"><button type="button" @click="closeModal" class="px-4 py-2 border rounded-lg">Annuler</button><button type="submit" class="px-4 py-2 bg-gold-400 text-navy-500 font-medium rounded-lg">Enregistrer</button></div>
        </form>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h2 class="text-lg font-bold text-navy-500 mb-4">Confirmer ?</h2>
        <div class="flex justify-end gap-3"><button @click="showDeleteConfirm=false" class="px-4 py-2 border rounded-lg">Annuler</button><button @click="deleteDon" class="px-4 py-2 bg-red-500 text-white rounded-lg">Supprimer</button></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { donService } from '../services/api'

const dons = ref([])
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editingDon = ref(null)
const donToDelete = ref(null)
const form = ref({ donateur:'', montant:null, date:new Date().toISOString().split('T')[0], description:'' })

const totalDons = computed(() => dons.value.reduce((s,d) => s + parseFloat(d.montant), 0))

const loadDons = async () => { try { const {data} = await donService.getAll(); dons.value = data } catch(e) {console.error(e)} }
const openModal = (d = null) => { editingDon.value = d; form.value = d ? {...d} : {donateur:'', montant:null, date:new Date().toISOString().split('T')[0], description:''}; showModal.value = true }
const closeModal = () => { showModal.value = false; editingDon.value = null }
const saveDon = async () => { try { if(editingDon.value) await donService.update(editingDon.value.id, form.value); else await donService.create(form.value); closeModal(); loadDons() } catch(e) { alert(e.response?.data?.error||'Erreur') } }
const confirmDelete = (d) => { donToDelete.value = d; showDeleteConfirm.value = true }
const deleteDon = async () => { try { await donService.delete(donToDelete.value.id); showDeleteConfirm.value = false; loadDons() } catch(e) { alert('Erreur') } }
const formatNumber = (n) => new Intl.NumberFormat('fr-FR').format(n||0)
const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR')

onMounted(loadDons)
</script>
