<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-8">
      <div><h1 class="text-3xl font-heading font-bold text-navy-500">Cotisations</h1><p class="text-gray-500 mt-1">Gestion des cotisations mensuelles</p></div>
      <button @click="openModal()" class="bg-gold-400 hover:bg-gold-500 text-navy-500 font-medium px-4 py-2 rounded-lg flex items-center gap-2">➕ Nouvelle</button>
    </div>

    <div class="bg-white rounded-xl p-4 shadow-sm mb-6 flex gap-4">
      <select v-model="selectedYear" @change="loadCotisations" class="px-4 py-2 border rounded-lg"><option v-for="y in years" :key="y" :value="y">{{ y }}</option></select>
      <select v-model="selectedMonth" @change="loadCotisations" class="px-4 py-2 border rounded-lg"><option value="">Tous les mois</option><option v-for="(m, i) in moisNoms" :key="i" :value="i+1">{{ m }}</option></select>
    </div>

    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm"><p class="text-sm text-gray-500">Total période</p><p class="text-2xl font-bold font-mono text-green-600">{{ formatNumber(totalPeriode) }} F</p></div>
      <div class="bg-white rounded-xl p-4 shadow-sm"><p class="text-sm text-gray-500">Nombre</p><p class="text-2xl font-bold font-mono text-navy-500">{{ cotisations.length }}</p></div>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50"><tr class="text-left text-sm text-gray-500"><th class="px-6 py-4">Choriste</th><th class="px-6 py-4">Période</th><th class="px-6 py-4">Date</th><th class="px-6 py-4 text-right">Montant</th><th class="px-6 py-4 text-right">Actions</th></tr></thead>
        <tbody>
          <tr v-for="c in cotisations" :key="c.id" class="border-t hover:bg-gray-50">
            <td class="px-6 py-4">{{ c.nom }} {{ c.prenom }}</td>
            <td class="px-6 py-4">{{ moisNoms[c.mois-1] }} {{ c.annee }}</td>
            <td class="px-6 py-4">{{ formatDate(c.date_paiement) }}</td>
            <td class="px-6 py-4 text-right font-mono text-green-600">{{ formatNumber(c.montant) }} F</td>
            <td class="px-6 py-4 text-right"><button @click="confirmDelete(c)" class="text-red-500 hover:text-red-600">🗑️</button></td>
          </tr>
          <tr v-if="!cotisations.length"><td colspan="5" class="px-6 py-8 text-center text-gray-500">Aucune cotisation</td></tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeModal">
      <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 class="text-xl font-heading font-bold text-navy-500 mb-6">Nouvelle cotisation</h2>
        <form @submit.prevent="saveCotisation">
          <div class="space-y-4">
            <div><label class="block text-sm font-medium mb-1">Choriste *</label><select v-model="form.choriste_id" required class="w-full px-4 py-2 border rounded-lg"><option value="">Sélectionner</option><option v-for="c in choristesList" :key="c.id" :value="c.id">{{ c.nom }} {{ c.prenom }}</option></select></div>
            <div class="grid grid-cols-2 gap-4"><div><label class="block text-sm font-medium mb-1">Mois *</label><select v-model="form.mois" class="w-full px-4 py-2 border rounded-lg"><option v-for="(m,i) in moisNoms" :key="i" :value="i+1">{{ m }}</option></select></div><div><label class="block text-sm font-medium mb-1">Année *</label><select v-model="form.annee" class="w-full px-4 py-2 border rounded-lg"><option v-for="y in years" :key="y" :value="y">{{ y }}</option></select></div></div>
            <div><label class="block text-sm font-medium mb-1">Montant (FCFA) *</label><input v-model.number="form.montant" type="number" required min="1" class="w-full px-4 py-2 border rounded-lg" /></div>
            <div><label class="block text-sm font-medium mb-1">Date paiement *</label><input v-model="form.date_paiement" type="date" required class="w-full px-4 py-2 border rounded-lg" /></div>
          </div>
          <div class="flex justify-end gap-3 mt-6"><button type="button" @click="closeModal" class="px-4 py-2 border rounded-lg">Annuler</button><button type="submit" class="px-4 py-2 bg-gold-400 text-navy-500 font-medium rounded-lg">Enregistrer</button></div>
        </form>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h2 class="text-lg font-heading font-bold text-navy-500 mb-4">Confirmer la suppression</h2>
        <div class="flex justify-end gap-3"><button @click="showDeleteConfirm=false" class="px-4 py-2 border rounded-lg">Annuler</button><button @click="deleteCotisation" class="px-4 py-2 bg-red-500 text-white rounded-lg">Supprimer</button></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { cotisationService, choristeService } from '../services/api'

const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const currentYear = new Date().getFullYear()
const years = Array.from({length:5},(_,i)=>currentYear-i)

const cotisations = ref([])
const choristesList = ref([])
const selectedYear = ref(currentYear)
const selectedMonth = ref('')
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const cotisationToDelete = ref(null)
const form = ref({ choriste_id:'', mois:new Date().getMonth()+1, annee:currentYear, montant:5000, date_paiement:new Date().toISOString().split('T')[0] })

const totalPeriode = computed(() => cotisations.value.reduce((s,c) => s + parseFloat(c.montant), 0))

const loadCotisations = async () => { try { const p = {annee: selectedYear.value}; if(selectedMonth.value) p.mois = selectedMonth.value; const {data} = await cotisationService.getAll(p); cotisations.value = data } catch(e) {console.error(e)} }
const loadChoristes = async () => { try { const {data} = await choristeService.getAll(); choristesList.value = data } catch(e) {console.error(e)} }
const openModal = () => { form.value = { choriste_id:'', mois:new Date().getMonth()+1, annee:currentYear, montant:5000, date_paiement:new Date().toISOString().split('T')[0] }; showModal.value = true }
const closeModal = () => { showModal.value = false }
const saveCotisation = async () => { try { await cotisationService.create(form.value); closeModal(); loadCotisations() } catch(e) { alert(e.response?.data?.error||'Erreur') } }
const confirmDelete = (c) => { cotisationToDelete.value = c; showDeleteConfirm.value = true }
const deleteCotisation = async () => { try { await cotisationService.delete(cotisationToDelete.value.id); showDeleteConfirm.value = false; loadCotisations() } catch(e) { alert('Erreur') } }
const formatNumber = (n) => new Intl.NumberFormat('fr-FR').format(n||0)
const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR')

onMounted(() => { loadCotisations(); loadChoristes() })
</script>
