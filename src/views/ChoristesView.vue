<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-heading font-bold text-navy-500">Choristes</h1>
        <p class="text-gray-500 mt-1">Gestion des membres de la chorale</p>
      </div>
      <button @click="openModal()" class="bg-gold-400 hover:bg-gold-500 text-navy-500 font-medium px-4 py-2 rounded-lg flex items-center gap-2">
        ➕ Nouveau choriste
      </button>
    </div>

    <div class="bg-white rounded-xl p-4 shadow-sm mb-6 flex gap-4">
      <input v-model="search" type="text" placeholder="Rechercher..." class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400" />
      <select v-model="filterStatut" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400">
        <option value="">Tous</option>
        <option value="actif">Actifs</option>
        <option value="inactif">Inactifs</option>
      </select>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr class="text-left text-sm text-gray-500">
            <th class="px-6 py-4 font-medium">Nom</th>
            <th class="px-6 py-4 font-medium">Prénom</th>
            <th class="px-6 py-4 font-medium">Téléphone</th>
            <th class="px-6 py-4 font-medium">Statut</th>
            <th class="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filteredChoristes" :key="c.id" class="border-t hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">{{ c.nom }}</td>
            <td class="px-6 py-4">{{ c.prenom }}</td>
            <td class="px-6 py-4 text-gray-600">{{ c.telephone || '-' }}</td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 rounded-full text-xs font-medium" :class="c.statut === 'actif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                {{ c.statut === 'actif' ? 'Actif' : 'Inactif' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <button @click="openHistorique(c)" class="text-yellow-500 hover:text-yellow-600 mr-3" title="Historique">📋</button>
              <button @click="openModal(c)" class="text-blue-500 hover:text-blue-600 mr-3" title="Modifier">✏️</button>
              <button @click="confirmDelete(c)" class="text-red-500 hover:text-red-600" title="Supprimer">🗑️</button>
            </td>
          </tr>
          <tr v-if="filteredChoristes.length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-gray-500">Aucun choriste trouvé</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeModal">
      <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 class="text-xl font-heading font-bold text-navy-500 mb-6">{{ editingChoriste ? 'Modifier' : 'Nouveau' }} choriste</h2>
        <form @submit.prevent="saveChoriste">
          <div class="space-y-4">
            <div><label class="block text-sm font-medium mb-1">Nom *</label><input v-model="form.nom" type="text" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400" /></div>
            <div><label class="block text-sm font-medium mb-1">Prénom *</label><input v-model="form.prenom" type="text" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400" /></div>
            <div><label class="block text-sm font-medium mb-1">Téléphone</label><input v-model="form.telephone" type="tel" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400" /></div>
            <div><label class="block text-sm font-medium mb-1">Statut</label><select v-model="form.statut" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold-400"><option value="actif">Actif</option><option value="inactif">Inactif</option></select></div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="closeModal" class="px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
            <button type="submit" class="px-4 py-2 bg-gold-400 text-navy-500 font-medium rounded-lg hover:bg-gold-500">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Historique Modal -->
    <div v-if="showHistorique" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeHistorique">
      <div class="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[80vh] overflow-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-heading font-bold text-navy-500">Historique - {{ selectedChoriste?.nom }} {{ selectedChoriste?.prenom }}</h2>
          <button @click="closeHistorique" class="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        <div v-if="historiqueData" class="space-y-6">
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-lg p-4 text-center"><p class="text-2xl font-bold text-yellow-500">{{ historiqueData.cotisations?.length || 0 }}</p><p class="text-sm text-gray-500">Cotisations</p></div>
            <div class="bg-gray-50 rounded-lg p-4 text-center"><p class="text-2xl font-bold text-green-600">{{ formatNumber(historiqueData.total || 0) }} F</p><p class="text-sm text-gray-500">Total versé</p></div>
            <div class="bg-gray-50 rounded-lg p-4 text-center"><p class="text-2xl font-bold" :class="selectedChoriste?.statut === 'actif' ? 'text-green-600' : 'text-gray-400'">{{ selectedChoriste?.statut === 'actif' ? 'Actif' : 'Inactif' }}</p><p class="text-sm text-gray-500">Statut</p></div>
          </div>
          <div v-if="historiqueData.cotisations?.length">
            <h3 class="font-medium text-gray-700 mb-3">Cotisations</h3>
            <table class="w-full text-sm">
              <thead><tr class="text-left text-gray-500 border-b"><th class="pb-2">Période</th><th class="pb-2">Date</th><th class="pb-2 text-right">Montant</th></tr></thead>
              <tbody>
                <tr v-for="c in historiqueData.cotisations" :key="c.id" class="border-b">
                  <td class="py-2">{{ moisNoms[c.mois - 1] }} {{ c.annee }}</td>
                  <td class="py-2">{{ formatDate(c.date_paiement) }}</td>
                  <td class="py-2 text-right font-mono">{{ formatNumber(c.montant) }} F</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h2 class="text-lg font-heading font-bold text-navy-500 mb-4">Confirmer la suppression</h2>
        <p class="text-gray-600 mb-6">Voulez-vous vraiment supprimer <strong>{{ choristeToDelete?.nom }} {{ choristeToDelete?.prenom }}</strong> ?</p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteConfirm = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
          <button @click="deleteChoriste" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Supprimer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { choristeService } from '../services/api'

const choristes = ref([])
const search = ref('')
const filterStatut = ref('')
const showModal = ref(false)
const showHistorique = ref(false)
const showDeleteConfirm = ref(false)
const editingChoriste = ref(null)
const selectedChoriste = ref(null)
const historiqueData = ref(null)
const choristeToDelete = ref(null)
const form = ref({ nom: '', prenom: '', telephone: '', statut: 'actif' })
const moisNoms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

const filteredChoristes = computed(() => choristes.value.filter(c => {
  const matchSearch = !search.value || c.nom.toLowerCase().includes(search.value.toLowerCase()) || c.prenom.toLowerCase().includes(search.value.toLowerCase()) || (c.telephone && c.telephone.includes(search.value))
  const matchStatut = !filterStatut.value || c.statut === filterStatut.value
  return matchSearch && matchStatut
}))

const loadChoristes = async () => { try { const { data } = await choristeService.getAll(); choristes.value = data } catch (error) { console.error('Erreur:', error) } }
const openModal = (choriste = null) => { editingChoriste.value = choriste; form.value = choriste ? { ...choriste } : { nom: '', prenom: '', telephone: '', statut: 'actif' }; showModal.value = true }
const closeModal = () => { showModal.value = false; editingChoriste.value = null }
const saveChoriste = async () => { try { if (editingChoriste.value) await choristeService.update(editingChoriste.value.id, form.value); else await choristeService.create(form.value); closeModal(); loadChoristes() } catch (error) { alert(error.response?.data?.error || 'Erreur') } }
const openHistorique = async (c) => { selectedChoriste.value = c; try { const { data } = await choristeService.getById(c.id); historiqueData.value = data; showHistorique.value = true } catch (error) { console.error('Erreur:', error) } }
const closeHistorique = () => { showHistorique.value = false; selectedChoriste.value = null; historiqueData.value = null }
const confirmDelete = (c) => { choristeToDelete.value = c; showDeleteConfirm.value = true }
const deleteChoriste = async () => { try { await choristeService.delete(choristeToDelete.value.id); showDeleteConfirm.value = false; loadChoristes() } catch (error) { alert(error.response?.data?.error || 'Erreur') } }
const formatNumber = (num) => new Intl.NumberFormat('fr-FR').format(num || 0)
const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR')

onMounted(loadChoristes)
</script>
