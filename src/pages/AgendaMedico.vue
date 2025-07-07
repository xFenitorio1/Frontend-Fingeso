<template>
  <v-app>
    <v-container class="mt-16" v-if="accesoPermitido">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="text-h5">Agenda de Citas</v-card-title>
            <v-card-text>
              <v-alert v-if="citasFiltradas.length === 0" type="info">
                No hay citas para mostrar.
              </v-alert>
              <v-row v-else>
                <v-col
                  v-for="cita in citasFiltradas"
                  :key="cita.id"
                  cols="12"
                  class="mb-4"
                >
                  <v-card>
                    <v-card-title class="d-flex justify-space-between align-center">
                      <span>Paciente: {{ cita.paciente?.nombre || 'Desconocido' }}</span>
                      <div class="d-flex flex-column align-end">
                        <v-btn color="primary" class="mb-2" @click="abrirDialogo(cita)">
                          Emitir Receta
                        </v-btn>
                        <v-btn color="info" @click="verHistorial(cita)">
                          Ver Historial Médico
                        </v-btn>
                      </div>
                    </v-card-title>
                    <v-card-text>
                      Fecha: {{ formatearFecha(cita.fechaCita) }}<br>
                      Hora: {{ cita.horaCita }}
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Diálogo externo para mostrar datos del paciente -->
    <EmisionReceta
      v-model="dialogoEmision"
      :cita="citaSeleccionada"
      @recetaEmitida ="eliminarCita"
    />
    <!-- Diálogo para ver historial médico -->
    <VerHistorialMedico
      v-model="dialogoHistorial"
      :cita="citaSeleccionada"
    />
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import EmisionReceta from '@/components/Receta/EmisionReceta.vue'
import VerHistorialMedico from '@/components/Receta/VerHistorialMedico.vue'
import axios from 'axios'

const rol = ref(null)
const idMedico = ref(null)
const citas = ref([])
const dialogoEmision = ref(false)
const dialogoHistorial = ref(false)
const citaSeleccionada = ref(null)

const router = useRouter()
const accesoPermitido = ref(false)

onMounted(() => {
  const rolUsuario = localStorage.getItem('rol')

  if (rolUsuario === 'medico') {
    accesoPermitido.value = true
  } else {
    alert('No tienes permiso para acceder a esta página.')
    router.push('/')
  }
})

onMounted(async () => {
  rol.value = localStorage.getItem('rol')
  idMedico.value = Number(localStorage.getItem('idMedico'))
  try {
    const res = await axios.get('http://localhost:8080/api/cita/getCitas')
    citas.value = res.data

    console.log('Citas cargadas:', citas.value)
  } catch (e) {
    console.error('Error al cargar citas:', e)
  }
})

const citasFiltradas = computed(() =>
  citas.value.filter(cita =>
    cita.medico &&
    cita.medico.id === idMedico.value &&
    cita.eliminada === false &&
    cita.agendaMedico === true
  )
)

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // +1 porque enero es 0
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

function abrirDialogo(cita) {
  citaSeleccionada.value = cita
  dialogoEmision.value = true
}

function verHistorial(cita) {
  citaSeleccionada.value = cita
  dialogoHistorial.value = true
}

function eliminarCita(idCita) {
  const index = citas.value.findIndex(c => c.idCita === idCita)
  if (index !== -1) {
    citas.value.splice(index, 1)
  }
}
</script>