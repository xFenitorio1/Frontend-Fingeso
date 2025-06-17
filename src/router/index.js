import { createRouter, createWebHistory } from 'vue-router'
import Reservas from '../pages/Reservas.vue'
import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'
import Medicamentos from '../pages/Medicamentos.vue'
import HistorialMedico from '../pages/HistorialMedico.vue'
import Registro from '../pages/Registro.vue'
import EntregarReceta from '../pages/EntregarReceta.vue'
import Agenda from '../pages/AgendaMedico.vue'
import CrearCuentas from '@/pages/CrearCuentas.vue'
import AgendaPaciente from '@/pages/AgendaPaciente.vue'
import EmitirExamen from '@/pages/EmitirExamen.vue'
import VerCitas from '@/pages/VerCitas.vue'


const routes = [
  { path: '/Reservas', component: Reservas },
  { path: '/', component: Home},
  { path: '/Login', component: Login },
  { path: '/Medicamentos', component: Medicamentos },
  { path: '/HistorialMedico', component: HistorialMedico },
  { path: '/Registro', component: Registro },
  { path: '/EntregarReceta', component: EntregarReceta },
  { path: '/Agenda', component: Agenda },
  { path: '/CrearCuentas', component: CrearCuentas },
  { path: '/AgendaPaciente', component: AgendaPaciente },
  { path: '/EmitirExamen', component: EmitirExamen },
  { path: '/VerCitas', component: VerCitas },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
