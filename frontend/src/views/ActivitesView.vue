<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-heading font-bold text-navy-500">Programme d'Activités</h1>
        <p class="text-gray-500 mt-1">Gérez les événements et activités de la chorale</p>
      </div>
      <div class="flex items-center gap-4">
        <!-- Sélecteur d'année -->
        <select 
          v-model="anneeSelectionnee"
          @change="chargerActivites"
          class="border border-gray-300 rounded-lg px-4 py-2 bg-white text-navy-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
        >
          <option v-for="annee in anneesDisponibles" :key="annee" :value="annee">
            {{ annee }}
          </option>
        </select>
        
        <button 
          @click="ouvrirModal()"
          class="bg-navy-500 hover:bg-navy-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon class="w-5 h-5" />
          Nouvelle Activité
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
        <div class="relative">
          <MagnifyingGlassIcon class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            v-model="recherche"
            placeholder="Nom de l'activité..."
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-400"
          >
        </div>
      </div>
      <div class="w-48">
        <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
        <select 
          v-model="filtreStatut"
          class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-400"
        >
          <option value="">Tous les statuts</option>
          <option value="prevu">Prévu</option>
          <option value="en cours">En cours</option>
          <option value="termine">Terminé</option>
          <option value="annule">Annulé</option>
        </select>
      </div>
    </div>

    <!-- Grille des Activités -->
    <div v-if="chargement" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
    </div>

    <div v-else-if="activitesFiltrees.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
      <CalendarIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900">Aucune activité trouvée</h3>
      <p class="text-gray-500">Commencez par planifier une nouvelle activité pour cette année.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="activite in activitesFiltrees" 
        :key="activite.id"
        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
      >
        <div class="p-5">
          <div class="flex justify-between items-start mb-4">
            <span 
              class="px-3 py-1 text-xs font-medium rounded-full"
              :class="{
                'bg-blue-100 text-blue-700': activite.statut === 'prevu',
                'bg-yellow-100 text-yellow-700': activite.statut === 'en cours',
                'bg-green-100 text-green-700': activite.statut === 'termine',
                'bg-red-100 text-red-700': activite.statut === 'annule'
              }"
            >
              {{ activite.statut.charAt(0).toUpperCase() + activite.statut.slice(1) }}
            </span>
            <div class="flex gap-2">
              <button @click="ouvrirModal(activite)" class="text-gray-400 hover:text-navy-500">
                <PencilIcon class="w-5 h-5" />
              </button>
              <button @click="confirmerSuppression(activite)" class="text-gray-400 hover:text-red-500">
                <TrashIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <h3 class="text-lg font-bold text-navy-500 mb-2">{{ activite.nom }}</h3>
          
          <div class="space-y-2 mb-4">
            <div class="flex items-center text-sm text-gray-500">
              <CalendarIcon class="w-4 h-4 mr-2" />
              <span>Du: {{ formaterDate(activite.date_debut) }}</span>
            </div>
            <div class="flex items-center text-sm text-gray-500">
              <CalendarDaysIcon class="w-4 h-4 mr-2" />
              <span>Au: {{ formaterDate(activite.date_fin) }}</span>
            </div>
          </div>
          
          <p class="text-sm text-gray-600 line-clamp-3">
            {{ activite.description || 'Aucune description fournie.' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout/modification -->
    <div v-if="modalOuverte" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 class="text-xl font-bold text-navy-500">
            {{ activiteEnCours.id ? 'Modifier l\'activité' : 'Nouvelle activité' }}
          </h2>
          <button @click="fermerModal()" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        
        <form @submit.prevent="sauvegarderActivite" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom de l'activité *</label>
            <input 
              v-model="activiteEnCours.nom" 
              type="text" 
              required
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-400"
            >
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
              <input 
                v-model="activiteEnCours.date_debut" 
                type="date" 
                required
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-400"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input 
                v-model="activiteEnCours.date_fin" 
                type="date" 
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-400"
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Statut *</label>
            <select 
              v-model="activiteEnCours.statut" 
              required
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-400"
            >
              <option value="prevu">Prévu</option>
              <option value="en cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="annule">Annulé</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              v-model="activiteEnCours.description" 
              rows="3"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-400"
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              @click="fermerModal()"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 bg-navy-500 hover:bg-navy-600 text-white rounded-lg transition-colors flex items-center gap-2"
              :disabled="enCoursSub"
            >
              <span v-if="enCoursSub" class="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></span>
              {{ activiteEnCours.id ? 'Mettre à jour' : 'Créer l\'activité' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon,
  CalendarIcon,
  CalendarDaysIcon
} from '@heroicons/vue/24/outline'

const apiBaseUrl = '/api'
const anneeCourante = new Date().getFullYear()

// État
const activites = ref([])
const chargement = ref(false)
const anneeSelectionnee = ref(anneeCourante)
const recherche = ref('')
const filtreStatut = ref('')

// Modal
const modalOuverte = ref(false)
const enCoursSub = ref(false)
const activiteEnCours = ref({
  nom: '',
  date_debut: '',
  date_fin: '',
  statut: 'prevu',
  description: ''
})

// Options
const anneesDisponibles = computed(() => {
  const annees = []
  for (let annee = anneeCourante - 2; annee <= anneeCourante + 2; annee++) {
    annees.push(annee)
  }
  return annees
})

// Filtrage
const activitesFiltrees = computed(() => {
  return activites.value.filter(act => {
    const matchRecherche = act.nom.toLowerCase().includes(recherche.value.toLowerCase()) || 
                           (act.description && act.description.toLowerCase().includes(recherche.value.toLowerCase()))
    const matchStatut = filtreStatut.value === '' || act.statut === filtreStatut.value
    return matchRecherche && matchStatut
  })
})

// Fonctions
const formaterDate = (dateString) => {
  if (!dateString) return 'Non définie'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const chargerActivites = async () => {
  chargement.value = true
  try {
    const response = await axios.get(`${apiBaseUrl}/activites?annee=${anneeSelectionnee.value}`)
    activites.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des activités:', error)
    alert('Impossible de charger les activités')
  } finally {
    chargement.value = false
  }
}

const ouvrirModal = (activite = null) => {
  if (activite) {
    activiteEnCours.value = { 
      ...activite,
      date_debut: activite.date_debut ? activite.date_debut.split('T')[0] : '',
      date_fin: activite.date_fin ? activite.date_fin.split('T')[0] : ''
    }
  } else {
    activiteEnCours.value = {
      nom: '',
      date_debut: '',
      date_fin: '',
      statut: 'prevu',
      description: ''
    }
  }
  modalOuverte.value = true
}

const fermerModal = () => {
  modalOuverte.value = false
}

const sauvegarderActivite = async () => {
  enCoursSub.value = true
  try {
    const payload = {
      ...activiteEnCours.value,
      annee: anneeSelectionnee.value
    }
    
    if (activiteEnCours.value.id) {
      await axios.put(`${apiBaseUrl}/activites/${activiteEnCours.value.id}`, payload)
    } else {
      await axios.post(`${apiBaseUrl}/activites`, payload)
    }
    
    fermerModal()
    chargerActivites()
  } catch (error) {
    console.error('Erreur de sauvegarde:', error)
    alert('Une erreur est survenue lors de la sauvegarde')
  } finally {
    enCoursSub.value = false
  }
}

const confirmerSuppression = async (activite) => {
  if (confirm(`Voulez-vous vraiment supprimer l'activité: ${activite.nom} ? Les dépenses et dons liés seront dissociés.`)) {
    try {
      await axios.delete(`${apiBaseUrl}/activites/${activite.id}`)
      chargerActivites()
    } catch (error) {
      console.error('Erreur de suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }
}

// Initialisation
onMounted(() => {
  chargerActivites()
})
</script>
