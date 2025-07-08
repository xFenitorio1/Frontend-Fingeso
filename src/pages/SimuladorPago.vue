<!-- src/views/SimuladorPago.vue -->
<template>
  <v-container class="mt-12">
    <v-card class="mx-auto" max-width="600">
      <v-card-title class="text-h5">Simulación de Pago en Línea</v-card-title>
      <v-card-text>
        <p><strong>Paciente:</strong> {{ rut }}</p>
        <p><strong>Especialidad:</strong> {{ especialidad }}</p>
        <p><strong>Médico:</strong> {{ medico }}</p>
        <p><strong>Fecha y hora:</strong> {{ fecha }} a las {{ hora }}</p>
        <p><strong>Total a pagar:</strong> ${{ precioEspecialidad.toLocaleString('es-CL') }}</p>

        <v-form @submit.prevent="procesarPago">
          <v-text-field v-model="rutPago" label="RUN del titular" :rules="[validarRut]" required />
          <v-text-field v-model="nombreTitular" label="Nombre del titular" required />
          <v-select v-model="medioPago" :items="medios" label="Medio de pago" required />
          <v-btn type="submit" color="primary" class="mt-4" :loading="cargando" :disabled="cargando">Confirmar pago</v-btn>
        </v-form>

        <v-alert v-if="mensaje" type="success" class="mt-4" border="start" prominent>
          {{ mensaje }}
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const rut = route.query.rut || ''
const correo = route.query.correo || ''
const especialidad = route.query.especialidad || ''
const medico = route.query.medico || ''
const fecha = route.query.fecha || ''
const hora = route.query.hora || ''

const precios = {
  'Medicina General': 20000,
  'Pediatría': 25000,
  'Cardiología': 40000,
  'Dermatología': 35000,
  'Ginecología': 30000
}
const precioEspecialidad = precios[especialidad] || 30000

const rutPago = ref('')
const nombreTitular = ref('')
const medioPago = ref('')
const medios = ['RedCompra', 'Tarjeta de Crédito', 'Tarjeta de Débito']

const cargando = ref(false)
const mensaje = ref('')

function validarRut(rut) {
  const limpio = rut.replace(/[^\dkK]/g, '')
  return (limpio.length >= 8 && limpio.length <= 9) || 'RUN inválido'
}

async function procesarPago() {
  if (!rutPago.value || !nombreTitular.value || !medioPago.value) {
    mensaje.value = 'Completa todos los campos para continuar.'
    return
  }

  cargando.value = true
  mensaje.value = ''

  try {

    // Enviar correo de comprobante
    const emailParams = new URLSearchParams()
    emailParams.append('to', correo)
    emailParams.append('subject', 'Confirmación de de Cita Médica')
    emailParams.append('fecha', fecha)
    emailParams.append('hora', hora)
    emailParams.append('servicio', especialidad)
    emailParams.append('nombre', medico)

    await axios.post(`http://localhost:8080/api/email/sentEmail?${emailParams.toString()}`)

    mensaje.value = `¡Pago de $${precioEspecialidad.toLocaleString('es-CL')} realizado exitosamente con ${medioPago}! Se ha enviado un correo de confirmación a ${correo}.`

    setTimeout(() => router.push('/'), 4000)
  } catch (error) {
    mensaje.value = 'Error al enviar el correo de confirmación.'
    console.error('Error al enviar correo:', error)
  } finally {
    cargando.value = false
  }
}
</script>

