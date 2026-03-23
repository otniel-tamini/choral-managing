<template>
  <div class="min-h-screen flex items-center justify-center bg-navy-900 px-4 py-12 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center">
    <!-- Overlay for better readability -->
    <div class="absolute inset-0 bg-navy-900/80 backdrop-blur-sm"></div>

    <div class="max-w-md w-full space-y-8 relative z-10 bg-white p-8 rounded-2xl shadow-2xl">
      <div class="text-center">
        <div class="mx-auto h-20 w-20 bg-gold-400 rounded-full flex items-center justify-center text-navy-500 text-3xl font-bold shadow-lg">
          DS
        </div>
        <h2 class="mt-6 text-3xl font-heading font-extrabold text-navy-900">
          David Sewa
        </h2>
        <p class="mt-2 text-sm text-gray-600 font-body">
          Connectez-vous pour accéder à la gestion comptable
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
            <input 
              id="username" 
              name="username" 
              type="text" 
              required 
              v-model="username"
              class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-gold-500 focus:border-gold-500 focus:z-10 sm:text-sm transition-all" 
              placeholder="votre_nom" 
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              v-model="password"
              class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-gold-500 focus:border-gold-500 focus:z-10 sm:text-sm transition-all" 
              placeholder="••••••••" 
            />
          </div>
        </div>

        <div v-if="error" class="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-pulse">
          {{ error }}
        </div>

        <div>
          <button 
            type="submit" 
            :disabled="loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-navy-500 bg-gold-400 hover:bg-gold-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-all disabled:opacity-50 shadow-md"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-navy-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </div>
      </form>

      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">
              © 2024 David Sewa
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/api'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await authService.login({
      username: username.value,
      password: password.value
    })
    
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    
    router.push('/')
  } catch (err) {
    console.error('Login error:', err)
    error.value = err.response?.data?.error || 'Une erreur est survenue lors de la connexion'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.font-heading {
  font-family: 'Playfair Display', serif;
}
.font-body {
  font-family: 'Inter', sans-serif;
}
</style>
