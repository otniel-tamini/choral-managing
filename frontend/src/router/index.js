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

const routes = [
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

export default router
