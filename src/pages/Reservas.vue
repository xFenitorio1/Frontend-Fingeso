<template>
  <v-app>
    <Header />
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
          <div v-if="paso > 5 && medico"><strong>Médico:</strong> {{ medico }}</div>
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

        <v-btn
          color="primary"
          class="mt-4"
          block
          type="submit"
        >
          {{ paso < 6 ? 'Siguiente' : 'Reservar' }}
        </v-btn>
      </v-form>
      <v-alert
        v-if="mensaje"
        type="success"
        class="mt-4"
        border="start"
        prominent
      >
        {{ mensaje }}
      </v-alert>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Header from '@/components/header/HeaderPatient.vue'
import axios from 'axios'

const paso = ref(1)
const rut = ref('')
const sucursal = ref('')
const especialidad = ref('')
const fecha = ref('')
const medico = ref('')
const hora = ref('')
const mensaje = ref('')

const hoy = new Date();
const fechaMin = hoy.toISOString().split('T')[0];

const tresMesesDespues = new Date();
tresMesesDespues.setMonth(tresMesesDespues.getMonth() + 3);
const fechaMax = tresMesesDespues.toISOString().split('T')[0];


const sucursales = [
  'Sucursal Centro',
  'Sucursal Norte',
  'Sucursal Sur'
]

const especialidades = [
  'Medicina General',
  'Pediatría',
  'Dermatología',
  'Traumatología',
  'Cardiología'
]

const medicosPorEspecialidad = {
  'Medicina General': ['Dr. Soto', 'Dra. Pérez'],
  'Pediatría': ['Dr. Ramírez', 'Dra. López'],
  'Dermatología': ['Dra. Torres'],
  'Traumatología': ['Dr. Díaz'],
  'Cardiología': ['Dr. Silva']
}

const medicosDisponibles = computed(() => {
  if (!especialidad.value) return []
  return medicosPorEspecialidad[especialidad.value] || []
})

const horasPorMedico = {
  'Dr. Soto': ['09:00:00', '10:00:00', '11:00:00'],
  'Dra. Pérez': ['12:00:00', '13:00:00'],
  'Dr. Ramírez': ['09:30:00', '10:30:00'],
  'Dra. López': ['11:30:00', '12:30:00'],
  'Dra. Torres': ['14:00:00', '15:00:00'],
  'Dr. Díaz': ['16:00:00', '17:00:00'],
  'Dr. Silva': ['08:00:00', '09:00:00']
}

const horasDisponibles = computed(() => {
  if (!medico.value) return []
  return horasPorMedico[medico.value] || []
})

function formatearRut(valor) {
  valor = valor.replace(/[^\dkK]/g, '');
  let cuerpo = valor.slice(0, -1);
  let dv = valor.slice(-1);
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return cuerpo ? `${cuerpo}-${dv}` : dv;
}

function validarRut(rut) {
  const limpio = rut.replace(/[^\dkK]/g, '');
  return limpio.length >= 8 && limpio.length <= 9 || 'El RUT debe tener entre 8 y 9 dígitos';
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
    // 1. Obtener el pacienteId
    const respuestaPaciente = await axios.get(`http://localhost:8080/api/paciente/getIdByRut/${rut.value}`)
    const pacienteId = respuestaPaciente.data

    // 2. Armar la cita
    const nuevaCita = {
      sucursal: sucursal.value,
      medicoId: 1,
      pacienteId: pacienteId,
      fechaCita: fecha.value,
      HoraCita: hora.value
    }

    // 3. Enviar la cita al backend
    await axios.post('http://localhost:8080/api/cita/crearCita', nuevaCita)
    
    // 4. Mostrar mensaje de confirmación
    mensaje.value = `¡Reserva realizada para RUT ${rut.value} en ${sucursal.value}, especialidad ${especialidad.value}, el ${fecha.value} con ${medico.value} a las ${hora.value}!`
  
  } catch (error) {
    mensaje.value = 'Error al registrar la cita. Intenta nuevamente.'
    console.error(error)
  }
}

watch(rut, (nuevo) => {
  const limpio = nuevo.replace(/[^\dkK]/g, '');
  if (nuevo && nuevo !== formatearRut(limpio)) {
    rut.value = formatearRut(limpio);
  }
});
</script>