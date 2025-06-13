<template>
  <v-app>
    <HeaderPatient v-if="rol === 'paciente'" />
    <HeaderMedico v-else-if="rol === 'medico'" />
    <HeaderQuimico v-else-if="rol === 'quimico'" />
    <HeaderUnlogged v-else />
    <!-- Esto se debe de poder refactorizar, pero lo hare mas tarde-->
    <v-container max-width="500px" class="mt-14">
      <h2 class="text-h4 mb-6">Reserva tu hora médica</h2>
      <v-form @submit.prevent="siguientePaso">
        <!-- Resumen dinámico -->
        <div class="mb-2" v-if="paso > 1">
          <div v-if="rut"><strong>RUT:</strong> {{ rut }}</div>
          <div v-if="paso > 2 && sucursal"><strong>Sucursal:</strong> {{ sucursal }}</div>
          <div v-if="paso > 3 && especialidad"><strong>Especialidad:</strong> {{ especialidad }}</div>
          <div v-if="paso > 4 && fecha"><strong>Fecha:</strong> {{ fecha }}</div>
          <div v-if="paso > 5 && medico"><strong>Médico:</strong> {{ medicoNombre }}</div>
        </div>

        <!-- Paso 1: RUT -->
        <v-text-field
          v-if="paso === 1"
          v-model="rut"
          label="RUT Chileno"
          :rules="[validarRut]"
          required
        ></v-text-field>

        <!-- Paso 2: Sucursal -->
        <v-select
          v-if="paso === 2"
          v-model="sucursal"
          :items="sucursales"
          label="Sucursal"
          required
        ></v-select>

        <!-- Paso 3: Especialidad -->
        <v-select
          v-if="paso === 3"
          v-model="especialidad"
          :items="especialidades"
          label="Especialidad"
          required
        ></v-select>

        <!-- Paso 4: Fecha -->
        <v-text-field
          v-if="paso === 4"
          v-model="fecha"
          label="Fecha"
          type="date"
          :min="fechaMin"
          :max="fechaMax"
          required
        ></v-text-field>

        <!-- Paso 5: Médico disponible -->
        <v-select
          v-if="paso === 5"
          v-model="medico"
          :items="medicosDisponibles"
          item-title="nombre"
          item-value="idUsuario"
          label="Médico disponible"
          required
        ></v-select>

        <!-- Paso 6: Hora disponible -->
        <v-select
          v-if="paso === 6"
          v-model="hora"
          :items="horasDisponibles"
          label="Hora disponible"
          required
        ></v-select>

        <v-btn color="primary" class="mt-4" block type="submit">
          {{ paso < 6 ? 'Siguiente' : 'Reservar' }}
        </v-btn>
      </v-form>

      <v-alert v-if="mensaje" type="success" class="mt-4" border="start" prominent>
        {{ mensaje }}
      </v-alert>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'

import HeaderPatient from '@/components/header/HeaderPatient.vue'
import HeaderMedico from '@/components/header/HeaderMedico.vue'
import HeaderQuimico from '@/components/header/HeaderQuimico.vue'
import HeaderUnlogged from '@/components/header/HeaderUnlogged.vue'

const rol = ref(null)

onMounted(() => {
  rol.value = localStorage.getItem('rol')
})

const paso = ref(1)
const rut = ref('')
const sucursal = ref('')
const especialidad = ref('')
const fecha = ref('')
const medico = ref(null)
const hora = ref('')
const mensaje = ref('')
const medicos = ref([])
const especialidades = ref([])

const hoy = new Date()
const fechaMin = hoy.toISOString().split('T')[0]

const tresMesesDespues = new Date()
tresMesesDespues.setMonth(tresMesesDespues.getMonth() + 3)
const fechaMax = tresMesesDespues.toISOString().split('T')[0]

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/medico/getMedicos')
    medicos.value = res.data

    console.log('Médicos cargados:', medicos.value)
    especialidades.value = [...new Set(medicos.value.map(m => m.especialidad))]
  } catch (e) {
    console.error('Error al cargar médicos:', e)
  }
})

const sucursales = ['Sucursal Centro', 'Sucursal Norte', 'Sucursal Sur']

const medicosDisponibles = computed(() =>
  medicos.value
    .filter(m => m.especialidad === especialidad.value)
    .map(m => ({
      nombre: m.nombre,
      idUsuario: m.id
    }))
)

const medicoNombre = computed(() => {
  const m = medicos.value.find(m => m.id === medico.value)
  return m ? m.nombre : ''
})


watch(medico, (nuevo) => {
  console.log('Medico seleccionado:', nuevo, typeof nuevo)
})

// Ajustar horas disponibles según médico seleccionado (ejemplo)
const horasPorMedico = {
  1: ['09:00:00', '10:00:00', '11:00:00'],
  2: ['12:00:00', '13:00:00'],
  3: ['09:30:00', '10:30:00'],
  4: ['11:30:00', '12:30:00'],
  5: ['14:00:00', '15:00:00'],
}

const horasDisponibles = computed(() => {
  if (!medico.value) return []
  const idMedico = Number(medico.value)
  return horasPorMedico[idMedico] || []
})

function formatearRut(valor) {
  valor = valor.replace(/[^\dkK]/g, '')
  let cuerpo = valor.slice(0, -1)
  let dv = valor.slice(-1)
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return cuerpo ? `${cuerpo}-${dv}` : dv
}

function validarRut(rut) {
  const limpio = rut.replace(/[^\dkK]/g, '')
  return (limpio.length >= 8 && limpio.length <= 9) || 'El RUT debe tener entre 8 y 9 dígitos'
}

async function siguientePaso() {
  if (paso.value < 6) {
    paso.value++
  } else {
    await enviarCita()
  }
}

async function enviarCita() {
  try {
    // Obtener el pacienteId por RUT
    const respuestaPacienteId = await axios.get(`http://localhost:8080/api/paciente/getIdByRut/${rut.value}`)
    const pacienteId = respuestaPacienteId.data

    // Obtener todos los datos del paciente
    const respuestaPacienteCompleto = await axios.get(`http://localhost:8080/api/paciente/getPaciente/${pacienteId}`)
    const pacienteCompleto = respuestaPacienteCompleto.data

    // Obtener todos los datos del médico
    const respuestaMedico = await axios.get(`http://localhost:8080/api/medico/getMedico/${medico.value}`)
    const medicoCompleto = respuestaMedico.data

    // Armar el objeto completo con los datos completos de paciente y médico
    const nuevaCita = {
      fechaCita: fecha.value,
      sucursal: sucursal.value,
      horaCita: hora.value,
      paciente: pacienteCompleto,
      medico: medicoCompleto
    }

    console.log('Datos enviados al backend (con objetos completos):', nuevaCita)

    await axios.post('http://localhost:8080/api/cita/crearCita', nuevaCita)

    mensaje.value = `¡Reserva realizada para RUT ${rut.value} en ${sucursal.value}, especialidad ${especialidad.value}, el ${fecha.value} con ${medicoNombre.value} a las ${hora.value}!`

  } catch (error) {
    mensaje.value = 'Error al registrar la cita. Intenta nuevamente.'
    console.error(error)
    console.error('Error en enviarCita:', error.response?.data || error.message)
  }
}

watch(rut, (nuevo) => {
  const limpio = nuevo.replace(/[^\dkK]/g, '')
  if (nuevo && nuevo !== formatearRut(limpio)) {
    rut.value = formatearRut(limpio)
  }
})

watch(medicosDisponibles, (nuevo) => {
  console.log('medicosDisponibles:', nuevo)
})
</script>
