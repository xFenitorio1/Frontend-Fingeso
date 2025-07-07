<template>
  <v-app style="background-color: #fffdfc;">
    <v-container v-if="accesoPermitido">
      <v-row justify="center" align="center" style="min-height: 80vh;">
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="text-h5">Citas Médicas</v-card-title>
            <v-card-text>
              <v-text-field
                v-model="rutBusqueda"
                label="Buscar por RUN del Paciente"
                @input="formatearRutBusqueda"
                clearable
                class="mb-4"
              ></v-text-field>

              <v-alert v-if="rutBusqueda && citasFiltradas.length === 0" type="info" class="mb-4">
                No se encontraron citas para este RUN.
              </v-alert>

              <div v-if="citasFiltradas.length > 0">
                <div v-for="cita in citasFiltradas" :key="cita.idCita" class="mb-4">
                  <v-card outlined>
                    <v-card-title>
                      <strong>Medico:</strong> {{ cita.medico.nombre }}
                    </v-card-title>
                    <v-card-text>
                      <p><strong>Fecha:</strong> {{ formatearFecha(cita.fechaCita) }}</p>
                      <p><strong>Especialidad:</strong> {{ cita.medico?.especialidad }}</p>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn
                            color="error"
                            variant="flat"
                            @click="llegadaPaciente(cita.idCita)"
                            :disabled="cita.agendaPaciente === false"
                        >
                            Asistió
                        </v-btn>
                        <v-btn
                            color="warning"
                            variant="flat"
                            @click="cancelarCitaPaciente(cita.idCita)"
                            :disabled="cita.agendaPaciente === false"
                            >
                            Cancelar Cita
                        </v-btn>
                    </v-card-actions>
                  </v-card>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const rutBusqueda = ref('')
const citas = ref([])
const idPaciente = ref(null)

const router = useRouter()
const accesoPermitido = ref(false)

onMounted(() => {
  const rolUsuario = localStorage.getItem('rol')

  if (rolUsuario === 'paciente') {
    accesoPermitido.value = true
  } else {
    alert('No tienes permiso para acceder a esta página.')
    router.push('/')
  }
})

function formatearRutBusqueda() {
  let valor = rutBusqueda.value.replace(/[^\dkK]/g, '')
  let cuerpo = valor.slice(0, -1)
  let dv = valor.slice(-1)
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  rutBusqueda.value = cuerpo ? `${cuerpo}-${dv}` : dv
}

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO)
  const dia = String(fecha.getDate()).padStart(2, '0')
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const anio = fecha.getFullYear()
  return `${dia}/${mes}/${anio}`
}

watch(rutBusqueda, async (nuevoRut) => {
  if (!nuevoRut || nuevoRut.length < 9) {
    citas.value = []
    return
  }

  try {
    // Obtener el ID del paciente
    const respId = await axios.get(`http://localhost:8080/api/paciente/getIdByRut/${nuevoRut}`)
    idPaciente.value = respId.data
    console.log('ID del paciente:', idPaciente.value)

    // Obtener todas las citas
    const respCitas = await axios.get(`http://localhost:8080/api/cita/getCitas`)
    citas.value = respCitas.data
    console.log('Todas las citas:', citas.value)
  } catch (error) {
    console.error('Error al obtener citas o ID del paciente:', error)
    citas.value = []
  }
})

async function llegadaPaciente(idCita) {
  try {
    await axios.put(`http://localhost:8080/api/cita/llegadaPaciente/${idCita}`)
    const cita = citas.value.find(c => c.idCita === idCita)
    if (cita) cita.agendaPaciente = false 
  } catch (error) {
    console.error('Error al cancelar la cita:', error)
    alert('No se pudo cancelar la cita.')
  }
}
async function cancelarCitaPaciente(idCita) {
  try {
    await axios.put(`http://localhost:8080/api/cita/eliminarCita/${idCita}`)
    const cita = citas.value.find(c => c.idCita === idCita)
    if (cita) cita.eliminada = true
  } catch (error) {
    console.error('Error al cancelar la cita por el paciente:', error)
    alert('No se pudo cancelar la cita.')
  }
}

const citasFiltradas = computed(() => {
  if (!idPaciente.value) return []
  return citas.value.filter(c => c.paciente?.id === idPaciente.value
    && c.eliminada === false
    && c.agendaMedico === true
    && c.agendaPaciente === true
  )
})
</script>
