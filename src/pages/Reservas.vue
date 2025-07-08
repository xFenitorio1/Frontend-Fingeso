<template>
  <v-app>
    <v-container max-width="500px" style="margin-top: 100px;">
      <h2 class="text-h4 mb-6">Reserva tu hora médica</h2>
      <v-form @submit.prevent="siguientePaso">
        <!-- Resumen -->
        <div class="mb-2" v-if="paso > 1">
          <div v-if="rut"><strong>RUN:</strong> {{ rut }}</div>
          <div v-if="correo"><strong>Correo:</strong> {{ correo }}</div>
          <div v-if="paso > 2 && sucursal"><strong>Sucursal:</strong> {{ sucursal }}</div>
          <div v-if="paso > 3 && especialidad"><strong>Especialidad:</strong> {{ especialidad }}</div>
          <div v-if="paso > 4 && fecha"><strong>Fecha:</strong> {{ fechaFormateada }}</div>
          <div v-if="paso > 5 && medico"><strong>Médico:</strong> {{ medicoNombre }}</div>
        </div>

        <!-- Paso 1: Datos personales -->
        <div v-if="paso === 1">
          <v-text-field
            v-model="rut"
            label="RUN del paciente"
            :rules="[validarRut]"
            required
            class="mb-4"
          />
          <v-text-field
            v-model="correo"
            label="Correo electrónico"
            type="email"
            :rules="[v => !!v || 'El correo es requerido', v => /.+@.+\..+/.test(v) || 'Correo inválido']"
            required
          />
        </div>

        <!-- Paso 2: Sucursal -->
        <v-select
          v-if="paso === 2"
          v-model="sucursal"
          :items="sucursales"
          label="Sucursal"
          :rules="[v => !!v || 'Selecciona una sucursal']"
          required
          @change="limpiarEspecialidadMedico"
        />

        <!-- Paso 3: Especialidad -->
        <v-select
          v-if="paso === 3"
          v-model="especialidad"
          :items="especialidadesPorSucursal"
          label="Especialidad"
          :rules="[v => !!v || 'Selecciona una especialidad']"
          required
          @change="limpiarMedico"
          :disabled="!sucursal"
        />

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

        <!-- Paso 5: Médico -->
        <v-select
          v-if="paso === 5"
          v-model="medico"
          :items="medicosPorSucursalEspecialidad"
          item-title="nombre"
          item-value="id"
          label="Médico disponible"
          :rules="[v => !!v || 'Selecciona un médico']"
          required
          :disabled="!especialidad"
        />

        <!-- Paso 6: Hora -->
        <v-select
          v-if="paso === 6"
          v-model="hora"
          :items="horasDisponibles"
          label="Hora disponible"
          :rules="[v => !!v || 'Selecciona una hora']"
          required
        />

        <!-- Botones -->
        <v-row class="mt-4" dense>
          <v-col cols="6" v-if="paso > 1">
            <v-btn color="secondary" block @click="paso--">Volver</v-btn>
          </v-col>
          <v-col :cols="paso > 1 ? 6 : 12">
            <v-btn color="primary" block type="submit" :loading="cargando" :disabled="cargando">
              {{ paso < 6 ? 'Siguiente' : 'Reservar' }}
            </v-btn>
          </v-col>
        </v-row>
      </v-form>

      <v-alert v-if="mensaje" type="success" class="mt-4" border="start" prominent>
        {{ mensaje }}
      </v-alert>

      <!-- Diálogo de pago -->
      <v-dialog v-model="mostrarDialogoPago" max-width="400">
        <v-card>
          <v-card-title class="text-h6">¿Cómo deseas pagar?</v-card-title>
          <v-card-text>Elige si deseas pagar ahora o al llegar presencialmente a la consulta.</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="blue" @click="redirigirPagoOnline">Pagar ahora</v-btn>
            <v-btn color="grey" @click="cerrarDialogo">Pagar presencialmente</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// Refs
const paso = ref(1)
const rut = ref('')
const correo = ref('')
const sucursal = ref('')
const especialidad = ref('')
const fecha = ref('')
const medico = ref(null)
const hora = ref('')
const mensaje = ref('')
const citasDisponibles = ref([])
const cargando = ref(false)
const mostrarDialogoPago = ref(false)
const reservasLocales = ref({})
const datosParaPago = ref({})

const medicos = ref([])
const sucursales = ['Sucursal Centro', 'Sucursal Norte', 'Sucursal Sur']

const hoy = new Date()
const fechaMin = hoy.toISOString().split('T')[0]
const fechaMax = new Date(hoy.setMonth(hoy.getMonth() + 3)).toISOString().split('T')[0]
const menuFecha = ref(false)

const citasDelMedico = ref([])

watch([medico, fecha], async ([nuevoMedico, nuevaFecha]) => {
  if (!nuevoMedico || !nuevaFecha) {
    citasDelMedico.value = []
    return
  }

  try {
    const res = await axios.get(`http://localhost:8080/api/cita/disponibles/medico/${nuevoMedico}`)
    // Filtra por fecha exacta
    const fechaSeleccionada = new Date(nuevaFecha).toISOString().split('T')[0]

    citasDelMedico.value = res.data.filter(cita => {
      const citaFecha = new Date(cita.fechaCita).toISOString().split('T')[0]
      return citaFecha === fechaSeleccionada
    })

    console.log("Citas disponibles ese día:", citasDelMedico.value)
  } catch (error) {
    console.error('Error al cargar citas del médico:', error)
    citasDelMedico.value = []
  }
})

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/medico/getMedicos')
    medicos.value = res.data
    console.log('Médicos cargados:', medicos.value)
  } catch (e) {
    console.error('Error al cargar médicos:', e)
  }

  await cargarCitasDisponibles()
  console.log('Citas disponibles cargadas:', citasDisponibles.value)
})

// Filtra médicos por sucursal seleccionada
const medicosPorSucursal = computed(() => {
  if (!sucursal.value) return []
  return medicos.value.filter(m =>
    m.sucursales?.some(s => s.nombreSucursal === sucursal.value)
  )
})

// Filtra especialidades según médicos de la sucursal
const especialidadesPorSucursal = computed(() => {
  const esp = medicosPorSucursal.value.map(m => m.especialidad)
  return [...new Set(esp)]
})

// Filtra médicos que además tienen la especialidad seleccionada
const medicosPorSucursalEspecialidad = computed(() => {
  if (!especialidad.value) return []
  return medicosPorSucursal.value.filter(m => m.especialidad === especialidad.value)
})


const medicoNombre = computed(() => {
  const m = medicos.value.find(m => m.id === medico.value)
  return m ? m.nombre : ''
})

const fechasDisponibles = computed(() => {
  const fechas = citasDisponibles.value.map(cita => {
    const d = new Date(cita.fecha)
    return d.toISOString().split('T')[0]
  })
  return [...new Set(fechas)]
})

const horasDisponibles = computed(() => {
  const horasUnicas = new Set(citasDelMedico.value.map(cita => cita.horaCita))
  return Array.from(horasUnicas)
})

watch(horasDisponibles, (nuevas) => {
  console.log("Horas disponibles para la fecha y médico seleccionados:", nuevas)
})

const fechaFormateada = computed(() => {
  if (!fecha.value) return ''
  const d = new Date(fecha.value)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-CL')
})

const fechaVisual = computed(() => {
  if (!fecha.value) return ''
  const d = new Date(fecha.value)
  if (isNaN(d.getTime())) return ''
  const opciones = { weekday: 'short', day: '2-digit', month: 'short' }
  return d.toLocaleDateString('es-CL', opciones)
})

function soloDiasHabiles(dateString) {
  const day = new Date(dateString).getDay()
  return day >= 1 && day <= 5
}

function validarRut(rut) {
  const limpio = rut.replace(/[^\dkK]/g, '')
  return (limpio.length >= 8 && limpio.length <= 9) || 'RUN inválido'
}

watch(rut, (nuevo) => {
  const limpio = nuevo.replace(/[^\dkK]/g, '')
  rut.value = formatearRut(limpio)
})

// Limpia y formatea rut
function formatearRut(valor) {
  valor = valor.replace(/[^\dkK]/g, '')
  let cuerpo = valor.slice(0, -1)
  let dv = valor.slice(-1)
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return cuerpo ? `${cuerpo}-${dv}` : dv
}

function limpiarEspecialidadMedico() {
  especialidad.value = ''
  medico.value = null
}

function limpiarMedico() {
  medico.value = null
}

async function siguientePaso() {
  const validos = [
    () => rut.value && validarRut(rut.value) === true && correo.value && /.+@.+\..+/.test(correo.value),
    () => !!sucursal.value,
    () => !!especialidad.value,
    () => !!fecha.value,
    () => !!medico.value,
    () => !!hora.value
  ]
  if (!validos[paso.value - 1]()) {
    mensaje.value = 'Completa correctamente este paso antes de continuar.'
    return
  }
  mensaje.value = ''
  if (paso.value < 6) paso.value++
  else {
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
  paso.value = 1
}

async function cargarCitasDisponibles() {
  try {
    const response = await axios.get('http://localhost:8080/api/cita/disponibles/medico/{id}')
    citasDisponibles.value = response.data
  } catch (error) {
    console.error('Error al cargar citas disponibles:', error)
  }
}

async function enviarCita() {
  try {
    let pacienteId

    try {
      // Intentar obtener paciente por RUT
      const { data } = await axios.get(`http://localhost:8080/api/paciente/getIdByRut/${rut.value}`)
      pacienteId = data
    } catch (error) {
      // Si no existe, crear el paciente
      if (error.response && error.response.status === 500) {
        console.warn('Paciente no encontrado. Creando...')

        await axios.post(`http://localhost:8080/api/paciente/crearPaciente`, {
          rut: rut.value,
          correo: correo.value,
          rol: 'PACIENTE'
        })

        // Obtener ID nuevamente
        const { data } = await axios.get(`http://localhost:8080/api/paciente/getIdByRut/${rut.value}`)
        pacienteId = data
      } else {
        throw error
      }
    }

    console.log('paciente:', pacienteId)

      // Buscar cita coincidente
    const citaElegida = citasDelMedico.value.find(cita => {
    const fechaCita = new Date(cita.fechaCita).toLocaleDateString('es-CL')
    const fechaSeleccionada = new Date(fecha.value).toLocaleDateString('es-CL')
    return cita.horaCita === hora.value && fechaCita === fechaSeleccionada
  })

    if (!citaElegida) {
      mensaje.value = 'No se encontró una cita disponible para esa hora.'
      return
    }

    console.log("Cita seleccionada:", citaElegida)
    // Reservar la cita
    await axios.put(`http://localhost:8080/api/cita/reservar/${citaElegida.idCita}/paciente/${pacienteId}`)

    // Actualizar reservas locales
    const clave = `${medico.value}-${fecha.value}`
    if (!reservasLocales.value[clave]) reservasLocales.value[clave] = []
    reservasLocales.value[clave].push(hora.value)

    // Preparar datos para el pago y mostrar diálogo
    datosParaPago.value = {
      rut: rut.value,
      correo: correo.value,
      especialidad: especialidad.value,
      medico: medicoNombre.value,
      fecha: fechaFormateada.value,
      hora: hora.value
    }

    mostrarDialogoPago.value = true

  } catch (error) {
    console.error('Error al reservar la cita:', error)
    mensaje.value = 'Error al reservar la cita. Intenta nuevamente.'
  }
}



function redirigirPagoOnline() {
  mostrarDialogoPago.value = false
  router.push({
    path: '/SimuladorPago',
    query: datosParaPago.value
  })
}

async function cerrarDialogo() {
  mostrarDialogoPago.value = false
  cargando.value = true

  try {
    const emailParams = new URLSearchParams()
    emailParams.append("to", correo.value)
    emailParams.append("subject", "Confirmación de Cita Médica")
    emailParams.append("fecha", fechaFormateada.value)
    emailParams.append("hora", hora.value)
    emailParams.append("servicio", especialidad.value)
    emailParams.append("nombre", medicoNombre.value)

    await axios.post(`http://localhost:8080/api/email/sentEmail?${emailParams.toString()}`)

    mensaje.value = `¡Reserva realizada para RUT ${rut.value} en ${sucursal.value}, especialidad ${especialidad.value}, el ${fecha.value} con ${medicoNombre.value} a las ${hora.value}! Se ha enviado un correo de confirmación a ${correo.value}.`
    resetearFormulario()
  } catch (e) {
    console.error('Error al enviar correo:', e)
    mensaje.value = 'Cita registrada, pero ocurrió un error al enviar el correo.'
  } finally {
    cargando.value = false
  }
}

</script>
