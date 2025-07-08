<template>
  <v-container class="mt-10" style="max-width: 600px;">
    <h2 class="text-h5 mb-4">Agendar Hora Disponible para Médico</h2>

    <v-form v-model="formValido" @submit.prevent="agendarCita">
      <v-autocomplete
        v-model="cita.idMedico"
        :items="medicos"
        item-value="id"
        item-title="nombre"
        label="Seleccionar Médico"
        :rules="[v => !!v || 'Seleccione un médico']"
        required
      />

    <v-select
    v-model="cita.sucursal"
    :items="sucursales"
    label="Seleccionar Sucursal"
    :rules="[v => !!v || 'Seleccione una sucursal']"
    required
    />

    <v-text-field
    v-model="hora"
    label="Hora (formato 24h, ej: 14:30)"
    :rules="[
        v => !!v || 'La hora es requerida',
        v => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v) || 'Formato inválido, use HH:mm'
    ]"
    placeholder="HH:mm"
    required
    />

      <v-date-picker v-model="fecha" :min="hoy" title="Seleccione fecha" />

      <v-row class="mt-4" justify="end">
        <v-btn type="submit" :disabled="!formValido" color="primary">Agendar</v-btn>
      </v-row>
    </v-form>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// Form data
const formValido = ref(false)
const cita = ref({
  idMedico: null,
  fecha: '',    
  hora: '',      
  sucursal: ''
})

// Listado de médicos
const medicos = ref([])
const sucursales = [
  'Sucursal Centro',
  'Sucursal Sur',
  'Sucursal Norte'
]


// Fecha y hora seleccionadas
const fecha = ref(null)
const hora = ref(null)

// Hoy para limitar fechas
const hoy = new Date().toISOString().substr(0, 10)

// Cargar médicos desde backend
onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/medico/getMedicos')
    medicos.value = response.data
  } catch (error) {
    console.error('Error cargando médicos:', error)
    alert('No se pudieron cargar los médicos')
  }
})

// Enviar cita al backend
async function agendarCita() {
  try {
    if (!fecha.value || !hora.value) {
      alert('Debe seleccionar fecha y hora')
      return
    }

    const body = {
      idMedico: cita.value.idMedico,
      sucursal: cita.value.sucursal,
      fecha: new Date(fecha.value),
      hora: hora.value // debe estar en "HH:mm" string
    }

    await axios.post('http://localhost:8080/api/cita/crearDisponible', body)
    alert('Cita agendada correctamente')

    // reset
    cita.value = { idMedico: null, sucursal: '' }
    fecha.value = null
    hora.value = null
  } catch (error) {
    console.error('Error al agendar cita:', error)
    alert('Hubo un error al agendar la cita')
  }
}

</script>
