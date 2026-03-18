<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-8">
      <div><h1 class="text-3xl font-heading font-bold text-navy-500">Dépenses</h1><p class="text-gray-500 mt-1">Gestion des dépenses</p></div>
      <button @click="openModal()" class="bg-gold-400 hover:bg-gold-500 text-navy-500 font-medium px-4 py-2 rounded-lg">➕ Nouvelle</button>
    </div>

    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm"><div class="flex items-center gap-2 mb-1"><div class="w-3 h-3 rounded-full bg-blue-500"></div><span class="text-sm text-gray-500">Transport</span></div><p class="text-lg font-bold font-mono">{{ formatNumber(totals.transport) }} F</p></div>
      <div class="bg-white rounded-xl p-4 shadow-sm"><div class="flex items-center gap-2 mb-1"><div class="w-3 h-3 rounded-full bg-purple-500"></div><span class="text-sm text-gray-500">Matériel</span></div><p class="text-lg font-bold font-mono">{{ formatNumber(totals.materiel) }} F</p></div>
      <div class="bg-white rounded-xl p-4 shadow-sm"><div class="flex items-center gap-2 mb-1"><div class="w-3 h-3 rounded-full bg-red-500"></div><span class="text-sm text-gray-500">Événement</span></div><p class="text-lg font-bold font-mono">{{ formatNumber(totals.evenement) }} F</p></div>
      <div class="bg-white rounded-xl p-4 shadow-sm"><div class="flex items-center gap-2 mb-1"><div class="w-3 h-3 rounded-full bg-gray-400"></div><span class="text-sm text-gray-500">Autre</span></div><p class="text-lg font-bold font-mono">{{ formatNumber(totals.autre) }} F</p></div>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50"><tr class="text-left text-sm text-gray-500"><th class="px-6 py-4">Date</th><th class="px-6 py-4">Libellé</th><th class="px-6 py-4">Catégorie</th><th class="px-6 py-4 text-right">Montant</th><th class="px-6 py-4 text-right">Actions</th></tr></thead>
        <tbody>
          <tr v-for="d in depenses" :key="d.id" class="border-t hover:bg-gray-50">
            <td class="px-6 py-4">{{ formatDate(d.date) }}</td>
            <td class="px-6 py-4 font-medium">{{ d.libelle }}</td>
            <td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-xs font-medium" :class="getCatClass(d.categorie)">{{ d.categorie }}</span></td>
            <td class="px-6 py-4 text-right font-mono text-red-600">{{ formatNumber(d.montant) }} F</td>
            <td class="px-6 py-4 text-right"><button @click="openModal(d)" class="mr-3">✏️</button><button @click="confirmDelete(d)" class="text-red-500">🗑️</button></td>
          </tr>
          <tr v-if="!depenses.length"><td colspan="5" class="px-6 py-8 text-center text-gray-500">Aucune dépense</td></tr>
        </tbody>
        <tfoot><tr class="bg-gray-50 font-bold"><td colspan="3" class="px-6 py-3 text-right">Total :</td><td class="px-6 py-3 text-right font-mono text-red-600">{{ formatNumber(totalDepenses) }} F</td><td></td></tr></tfoot>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeModal">
      <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 class="text-xl font-heading font-bold text-navy-500 mb-6">{{ editingDepense ? 'Modifier' : 'Nouvelle' }} dépense</h2>
        <form @submit.prevent="saveDepense">
          <div class="space-y-4">
            <div><label class="block text-sm font-medium mb-1">Libellé *</label><input v-model="form.libelle" type="text" required class="w-full px-4 py-2 border rounded-lg" /></div>
            <div><label class="block text-sm font-medium mb-1">Catégorie *</label><select v-model="form.categorie" class="w-full px-4 py-2 border rounded-lg"><option value="transport">Transport</option><option value="materiel">Matériel</option><option value="evenement">Événement</option><option value="autre">Autre</option></select></div>
            <div><label class="block text-sm font-medium mb-1">Montant (FCFA) *</label><input v-model.number="form.montant" type="number" required min="1" class="w-full px-4 py-2 border rounded-lg" /></div>
            <div><label class="block text-sm font-medium mb-1">Date *</label><input v-model="form.date" type="date" required class="w-full px-4 py-2 border rounded-lg" /></div>
            <div><label class="block text-sm font-medium mb-1">Description</label><textarea v-model="form.description" rows="2" class="w-full px-4 py-2 border rounded-lg"></textarea></div>
          </div>
          <div class="flex justify-end gap-3 mt-6"><button type="button" @click="closeModal" class="px-4 py-2 border rounded-lg">Annuler</button><button type="submit" class="px-4 py-2 bg-gold-400 text-navy-500 font-medium rounded-lg">Enregistrer</button></div>
        </form>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl"><h2 class="text-lg font-bold text-navy-500 mb-4">Confirmer ?</h2><div class="flex justify-end gap-3"><button @click="showDeleteConfirm=false" class="px-4 py-2 border rounded-lg">Annuler</button><button @click="deleteDepense" class="px-4 py-2 bg-red-500 text-white rounded-lg">Supprimer</button></div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { depenseService } from '../services/api'

const depenses = ref([])
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editingDepense = ref(null)
const depenseToDelete = ref(null)
const form = ref({ libelle:'', categorie:'autre', montant:null, date:new Date().toISOString().split('T')[0], description:'' })

const totalDepenses = computed(() => depenses.value.reduce((s,d) => s + parseFloat(d.montant), 0))
const totals = computed(() => ({ transport: depenses.value.filter(d=>d.categorie==='transport').reduce((s,d)=>s+parseFloat(d.montant),0), materiel: depenses.value.filter(d=>d.categorie==='materiel').reduce((s,d)=>s+parseFloat(d.montant),0), evenement: depenses.value.filter(d=>d.categorie==='evenement').reduce((s,d)=>s+parseFloat(d.montant),0), autre: depenses.value.filter(d=>d.categorie==='autre').reduce((s,d)=>s+parseFloat(d.montant),0) }))

const getCatClass = (c) => ({ transport:'bg-blue-100 text-blue-700', materiel:'bg-purple-100 text-purple-700', evenement:'bg-red-100 text-red-700', autre:'bg-gray-100 text-gray-600' }[c])

const loadDepenses = async () => { try { const {data} = await depenseService.getAll(); depenses.value = data } catch(e) {console.error(e)} }
const openModal = (d = null) => { editingDepense.value = d; form.value = d ? {...d} : {libelle:'', categorie:'autre', montant:null, date:new Date().toISOString().split('T')[0], description:''}; showModal.value = true }
const closeModal = () => { showModal.value = false; editingDepense.value = null }
const saveDepense = async () => { try { if(editingDepense.value) await depenseService.update(editingDepense.value.id, form.value); else await depenseService.create(form.value); closeModal(); loadDepenses() } catch(e) { alert(e.response?.data?.error||'Erreur') } }
const confirmDelete = (d) => { depenseToDelete.value = d; showDeleteConfirm.value = true }
const deleteDepense = async () => { try { await depenseService.delete(depenseToDelete.value.id); showDeleteConfirm.value = false; loadDepenses() } catch(e) { alert('Erreur') } }
const formatNumber = (n) => new Intl.NumberFormat('fr-FR').format(n||0)
const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR')

onMounted(loadDepenses)
</script>
