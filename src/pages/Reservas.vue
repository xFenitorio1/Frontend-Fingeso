<template>
  <v-app>
    <!-- Esto se debe de poder refactorizar, pero lo hare mas tarde-->
    <v-container max-width="500px" style="margin-top: 100px;">
      <h2 class="text-h4 mb-6">Reserva tu hora médica</h2>
      <v-form @submit.prevent="siguientePaso">
        <!-- Resumen dinámico -->
        <div class="mb-2" v-if="paso > 1">
          <div v-if="rut"><strong>RUN:</strong> {{ rut }}</div>
          <div v-if="correo"><strong>Correo:</strong> {{ correo }}</div>
          <div v-if="paso > 2 && sucursal"><strong>Sucursal:</strong> {{ sucursal }}</div>
          <div v-if="paso > 3 && especialidad"><strong>Especialidad:</strong> {{ especialidad }}</div>
          <div v-if="paso > 4 && fecha"><strong>Fecha:</strong> {{ fechaFormateada }}</div>
          <div v-if="paso > 5 && medico"><strong>Médico:</strong> {{ medicoNombre }}</div>
        </div>

        <!-- Paso 1: RUT -->
        <div v-if="paso === 1">
          <v-text-field
            v-model="rut"
            label="RUN del paciente"
            :rules="[validarRut]"
            required
            class="mb-4"
          ></v-text-field>
          <v-text-field
            v-model="correo"
            label="Correo electrónico"
            type="email"
            :rules="[
              v => !!v || 'El correo es requerido',
              v => /.+@.+\..+/.test(v) || 'Correo inválido'
            ]"
            required
          ></v-text-field>
        </div>

        <!-- Paso 2: Sucursal -->
        <v-select
          v-if="paso === 2"
          v-model="sucursal"
          :items="sucursales"
          label="Sucursal"
          :rules="[v => !!v || 'Selecciona una sucursal']"
          required
        ></v-select>

        <!-- Paso 3: Especialidad -->
        <v-select
          v-if="paso === 3"
          v-model="especialidad"
          :items="especialidades"
          label="Especialidad"
          :rules="[v => !!v || 'Selecciona una especialidad']"
          required
        ></v-select>

        <!-- Paso 4: Fecha -->
        <v-menu
          v-if="paso === 4"
          v-model="menuFecha"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
        >
          <template #activator="{ props }">
            <v-text-field
              :model-value="fechaVisual"
              label="Fecha"
              prepend-icon="mdi-calendar"
              readonly
              v-bind="props"
              :rules="[v => !!v || 'Selecciona una fecha válida']"
            />
          </template>

          <v-date-picker
            v-model="fecha"
            :min="fechaMin"
            :max="fechaMax"
            :allowed-dates="soloDiasHabiles"
            @update:model-value="menuFecha = false"
          />
        </v-menu>

        <!-- Paso 5: Médico disponible -->
        <v-select
          v-if="paso === 5"
          v-model="medico"
          :items="medicosDisponibles"
          item-title="nombre"
          item-value="idUsuario"
          label="Médico disponible"
          :rules="[v => !!v || 'Selecciona un médico']"
          required
        ></v-select>

        <!-- Paso 6: Hora disponible -->
        <v-select
          v-if="paso === 6"
          v-model="hora"
          :items="horasDisponibles"
          label="Hora disponible"
          :rules="[v => !!v || 'Selecciona una hora']"
          required
        ></v-select>

      <v-row class="mt-4" dense>
        <v-col cols="6" v-if="paso > 1">
          <v-btn color="secondary" block @click="paso--">
            Volver
          </v-btn>
        </v-col>
        <v-col :cols="paso > 1 ? 6 : 12">
          <v-btn
            color="primary"
            block
            type="submit"
            :loading="cargando"
            :disabled="cargando"
          >
            {{ paso < 6 ? 'Siguiente' : 'Reservar' }}
          </v-btn>
        </v-col>
      </v-row>
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

// Estado
const formulario = ref(null)
const paso = ref(1)
const rut = ref('')
const correo = ref('')
const sucursal = ref('')
const especialidad = ref('')
const fecha = ref('')
const medico = ref(null)
const hora = ref('')
const mensaje = ref('')
const reservasLocales = ref({})
const cargando = ref(false)

const medicos = ref([])
const especialidades = ref([])
const sucursales = ['Sucursal Centro', 'Sucursal Norte', 'Sucursal Sur']

// Fechas límites
const hoy = new Date()
const fechaMin = hoy.toISOString().split('T')[0]
const tresMesesDespues = new Date()
tresMesesDespues.setMonth(tresMesesDespues.getMonth() + 3)
const fechaMax = tresMesesDespues.toISOString().split('T')[0]

const menuFecha = ref(false)

// Solo permite días lunes a viernes
function soloDiasHabiles(dateString) {
  const day = new Date(dateString).getDay()
  return day >= 1 && day <= 5 // 1 = Lunes, ..., 5 = Viernes
}

// Obtener médicos al montar
onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/medico/getMedicos')
    medicos.value = res.data
    especialidades.value = [...new Set(medicos.value.map(m => m.especialidad))]
  } catch (e) {
    console.error('Error al cargar médicos:', e)
  }
})

// Computed
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



// Ajustar horas disponibles según médico seleccionado (ejemplo)
const horasPorMedico = {
  1: ['09:00:00', '10:00:00', '11:00:00'],
  2: ['12:00:00', '13:00:00'],
  3: ['09:30:00', '10:30:00'],
  4: ['11:30:00', '12:30:00'],
  5: ['14:00:00', '15:00:00'],
  6: ['08:00:00', '09:00:00'],
  7: ['10:00:00', '11:00:00'],
  8: ['12:00:00', '13:00:00'],
  9: ['14:00:00', '15:00:00'],
  10: ['09:00:00', '10:00:00'],
  11: ['11:00:00', '12:00:00'],
  12: ['13:00:00', '14:00:00'],
  13: ['15:00:00', '16:00:00'],
  14: ['08:30:00', '09:30:00'],
  15: ['10:30:00', '11:30:00'],
}

const horasDisponibles = computed(() => {
  if (!medico.value || !fecha.value) return []
  const idMedico = Number(medico.value)
  const disponibles = horasPorMedico[idMedico] || []

  const clave = `${medico.value}-${fecha.value}`
  const ocupadas = reservasLocales.value[clave] || []

  return disponibles.filter(hora => !ocupadas.includes(hora))
})

// Funciones
function formatearRut(valor) {
  valor = valor.replace(/[^\dkK]/g, '')
  let cuerpo = valor.slice(0, -1)
  let dv = valor.slice(-1)
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return cuerpo ? `${cuerpo}-${dv}` : dv
}

const fechaFormateada = computed(() => {
  if (!fecha.value) return ''
  return new Date(fecha.value).toLocaleDateString('es-CL') 
})

const fechaVisual = computed(() => {
  if (!fecha.value) return ''
  const opciones = { weekday: 'short', day: '2-digit', month: 'short' }
  return new Date(fecha.value).toLocaleDateString('es-CL', opciones)
})

function formatearFechaParaEmail(fechaObj) {
  const dia = fechaObj.getDate().toString().padStart(2, '0')
  const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0')
  const año = fechaObj.getFullYear()
  return `${dia}/${mes}/${año}`
}


function validarRut(rut) {
  const limpio = rut.replace(/[^\dkK]/g, '')
  return (limpio.length >= 8 && limpio.length <= 9) || 'El RUN debe tener entre 8 y 9 dígitos'
}

watch(rut, (nuevo) => {
  const limpio = nuevo.replace(/[^\dkK]/g, '')
  if (nuevo && nuevo !== formatearRut(limpio)) {
    rut.value = formatearRut(limpio)
  }
})

async function siguientePaso() {
  let valido = false

  if (paso.value === 1) {
    valido = !!rut.value && validarRut(rut.value) === true &&
             !!correo.value && /.+@.+\..+/.test(correo.value)
  } else if (paso.value === 2) {
    valido = !!sucursal.value
  } else if (paso.value === 3) {
    valido = !!especialidad.value
  } else if (paso.value === 4) {
    valido = !!fecha.value
  } else if (paso.value === 5) {
    valido = !!medico.value
  } else if (paso.value === 6) {
    valido = !!hora.value
  }

  if (!valido) {
    mensaje.value = 'Por favor completa correctamente este paso antes de continuar.'
    return
  }

  mensaje.value = ''

  if (paso.value < 6) {
    paso.value++
  } else {
    cargando.value = true
    await enviarCita()
    cargando.value = false
  }
}

function resetearFormulario() {
  rut.value = ''
  correo.value = ''
  sucursal.value = ''
  especialidad.value = ''
  fecha.value = ''
  medico.value = null
  hora.value = ''
}


async function enviarCita() {
  try {
    let pacienteId = null
    let pacienteCompleto = null

    // Primero intenta obtener el paciente por RUT
    try {
      const respuestaPacienteId = await axios.get(`http://localhost:8080/api/paciente/getIdByRut/${rut.value}`)
      pacienteId = respuestaPacienteId.data

      const respuestaPacienteCompleto = await axios.get(`http://localhost:8080/api/paciente/getPaciente/${pacienteId}`)
      pacienteCompleto = respuestaPacienteCompleto.data

    } catch (error) {
      if (error.response && error.response.status === 500) {
        // Si no existe, lo creamos
        const nuevoPaciente = {
          rut: rut.value,
          correo: correo.value,
          rol : 'paciente'
        }
        await axios.post(`http://localhost:8080/api/paciente/crearPaciente`, nuevoPaciente)

        // Luego lo volvemos a buscar
        const respuestaPacienteId = await axios.get(`http://localhost:8080/api/paciente/getIdByRut/${rut.value}`)
        pacienteId = respuestaPacienteId.data

        const respuestaPacienteCompleto = await axios.get(`http://localhost:8080/api/paciente/getPaciente/${pacienteId}`)
        pacienteCompleto = respuestaPacienteCompleto.data
      } else {
        throw error // si es otro error, lo lanzamos
      }
    }

    // Obtener datos del médico
    const respuestaMedico = await axios.get(`http://localhost:8080/api/medico/getMedico/${medico.value}`)
    const medicoCompleto = respuestaMedico.data

    const nuevaCita = {
      fechaCita: fecha.value,
      sucursal: sucursal.value,
      horaCita: hora.value,
      paciente: pacienteCompleto,
      medico: medicoCompleto
    }

    await axios.post('http://localhost:8080/api/cita/crearCita', nuevaCita)

    // Marcar la hora como ocupada localmente
    const clave = `${medico.value}-${fecha.value}`
    if (!reservasLocales.value[clave]) {
      reservasLocales.value[clave] = []
    }
    reservasLocales.value[clave].push(hora.value)

    const fechaFormateada = formatearFechaParaEmail(fecha.value)

    // Enviar correo
    const emailParams = new URLSearchParams()
    emailParams.append("to", correo.value)
    emailParams.append("subject", "Confirmación de Cita Médica")
    emailParams.append("fecha", fechaFormateada)
    emailParams.append("hora", hora.value)
    emailParams.append("servicio", especialidad.value)
    emailParams.append("nombre", medicoCompleto.nombre)

    await axios.post(`http://localhost:8080/api/email/sentEmail?${emailParams.toString()}`)

    mensaje.value = `¡Reserva realizada para RUT ${rut.value} en ${sucursal.value}, especialidad ${especialidad.value}, el ${fecha.value} con ${medicoNombre.value} a las ${hora.value}!`

  } catch (error) {
    mensaje.value = 'Error al registrar la cita o enviar el correo. Intenta nuevamente.'
    console.error('Error en enviarCita:', error.response?.data || error.message)
  }

  resetearFormulario()
  paso.value = 1
}
</script>
