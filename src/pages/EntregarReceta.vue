<template>
  <v-app>
    <v-container max-width="600px" class="mt-16" v-if="accesoPermitido">
      <h2 class="text-h4 mb-6">Entregar Receta</h2>
      <v-text-field
        v-model="rutBusqueda"
        label="Buscar por RUN del Paciente"
        @input="formatearRutBusqueda"
        clearable
        class="mb-4"
      ></v-text-field>

      <v-alert v-if="rutBusqueda && recetasFiltradas.length === 0" type="info" class="mb-4">
        No hay recetas pendientes para este RUN.
      </v-alert>

      <v-list v-if="recetasFiltradas.length > 0">
        <v-list-item
          v-for="receta in recetasFiltradas"
          :key="receta.id"
          class="mb-2"
        >
          <v-card>
            <v-card-title>
              <strong>Paciente:</strong> {{ pacienteInfo.nombre }}
            </v-card-title>
            <v-card-text>
              <div><strong>Medicamentos:</strong></div>
              <ul>
                <li v-for="(med, index) in receta.medicamentosList" :key="med.idMedicamento">
                  {{ med.nombreComercial }} - Cantidad: {{ receta.cantidadMedicamentos[index] }}
                </li>
              </ul>
              <div>
                <strong>Fecha de vigencia:</strong> {{ formatearFecha(receta.vigencia) }}
                <span v-if="estaVencida(receta)" style="color: red; font-weight: bold;"> (Receta vencida)</span>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="primary"
                variant="flat"
                :disabled="estaVencida(receta)"
                @click="abrirDialogo(receta)"
              >
                Entregar receta
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-list-item>
      </v-list>

      <!-- Cuadrito de confirmación -->
      <v-dialog v-model="dialogo" max-width="500">
        <v-card>
          <v-card-title class="text-h6">¿Está seguro que desea entregar la receta?</v-card-title>
          <v-card-text>
            Esta acción marcará la receta como entregada y no podrá revertirse.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" variant="text" @click="dialogo = false">Cancelar</v-btn>
            <v-btn color="primary" variant="flat" @click="confirmarEntrega">Entregar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const rutBusqueda = ref('')
const recetas = ref([])
const pacienteInfo = ref({})
const dialogo = ref(false)
const recetaSeleccionada = ref(null)

const router = useRouter()
const accesoPermitido = ref(false)

onMounted(() => {
  const rolUsuario = localStorage.getItem('rol')

  if (rolUsuario === 'quimico_farmaceutico') {
    accesoPermitido.value = true
  } else {
    alert('No tienes permiso para acceder a esta página.')
    router.push('/')
  }
})

function formatearRutBusqueda() {
  let valor = rutBusqueda.value.replace(/[^\dkK]/g, '');
  let cuerpo = valor.slice(0, -1);
  let dv = valor.slice(-1);
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  rutBusqueda.value = cuerpo ? `${cuerpo}-${dv}` : dv;
}

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // +1 porque enero es 0
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

watch(rutBusqueda, async (nuevoRut) => {
  if (!nuevoRut || nuevoRut.length < 9) {
    recetas.value = []
    return
  }

  try {
    // Paso 1: Obtener ID del paciente
    const respId = await axios.get(`http://localhost:8080/api/paciente/getIdByRut/${nuevoRut}`)
    const idPaciente = respId.data

    console.log('ID del paciente:', idPaciente)

    // Paso 2: Obtener recetas por RUT
    const respRecetas = await axios.get(`http://localhost:8080/api/receta/porPacienteRut/${nuevoRut}`)
    recetas.value = respRecetas.data
    console.log('Recetas encontradas:', recetas.value)

    // Paso 3: Obtener el nombre del paciente
    const respPaciente = await axios.get(`http://localhost:8080/api/paciente/getPaciente/${idPaciente}`)
    pacienteInfo.value = respPaciente.data
    console.log('Información del paciente:', pacienteInfo.value)

  } catch (error) {
    console.error('Error al obtener datos:', error)
    recetas.value = []
  }
})

function abrirDialogo(receta) {
  recetaSeleccionada.value = receta
  dialogo.value = true
}

async function confirmarEntrega() {
  if (!recetaSeleccionada.value) return

  try {
    await axios.put(`http://localhost:8080/api/receta/entregarReceta/${recetaSeleccionada.value.idReceta}`)
  } catch (error) {
    console.error('Error al entregar receta:', error)
    alert('Error al marcar la receta como entregada.')
  }
  recetaSeleccionada.value.estado = true
  dialogo.value = false
  recetaSeleccionada.value = null
}

function estaVencida(receta) {
  const hoy = new Date()
  const fechaVigencia = new Date(receta.vigencia)
  return fechaVigencia < hoy
}

const recetasFiltradas = computed(() => {
  return recetas.value.filter(r => !r.estado)
})
</script>