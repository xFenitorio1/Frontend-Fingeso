import { createRouter, createWebHistory } from 'vue-router'
import Reservas from '../pages/Reservas.vue'
import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'
import Medicamentos from '../pages/Medicamentos.vue'
import HistorialMedico from '../pages/HistorialMedico.vue'


const routes = [
  { path: '/Reservas', component: Reservas },
  { path: '/', component: Home},
  { path: '/Login', component: Login },
  { path: '/Medicamentos', component: Medicamentos },
  { path: '/HistorialMedico', component: HistorialMedico },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
