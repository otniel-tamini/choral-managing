import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import ChoristesView from '../views/ChoristesView.vue'
import CotisationsView from '../views/CotisationsView.vue'
import DonsView from '../views/DonsView.vue'
import DepensesView from '../views/DepensesView.vue'
import RapportsView from '../views/RapportsView.vue'
import ActivitesView from '../views/ActivitesView.vue'
import RapportAnnuelView from '../views/RapportAnnuelView.vue'
import ProgrammationView from '../views/ProgrammationView.vue'
import LoginView from '../views/LoginView.vue'

const routes = [
  { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
  { path: '/', name: 'dashboard', component: DashboardView },
  { path: '/choristes', name: 'choristes', component: ChoristesView },
  { path: '/cotisations', name: 'cotisations', component: CotisationsView },
  { path: '/dons', name: 'dons', component: DonsView },
  { path: '/depenses', name: 'depenses', component: DepensesView },
  { path: '/activites', name: 'activites', component: ActivitesView },
  { path: '/rapports', name: 'rapports', component: RapportsView },
  { path: '/rapport-activite', name: 'rapport-activite', component: RapportAnnuelView },
  { path: '/programmation', name: 'programmation', component: ProgrammationView },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (!to.meta.public && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router
