<template>
  <v-dialog :model-value="modelValue" @update:model-value="val => $emit('update:modelValue', val)" max-width="700">
    <v-card v-if="cita">
      <v-card-title>Emitir Receta</v-card-title>
      <v-card-text>
        <v-form>
          <div class="mb-4">
            <div><strong>Paciente:</strong> {{ cita.paciente?.nombre }}</div>
            <div><strong>RUN:</strong> {{ cita.paciente?.rut }}</div>
          </div>

          <v-textarea
            v-model="diagnostico"
            label="Diagnóstico"
            rows="2"
          />

          <v-textarea
            v-model="observaciones"
            label="Observaciones"
            rows="3"
          />

          <v-textarea
            v-model="examenIndicado"
            label="Examen indicado"
            rows="2"
          />

          <v-menu
            v-model="menuFecha"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
          >
            <template #activator="{ props }">
              <v-text-field
                :model-value="vigenciaVisual"
                label="Vigencia"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="props"
              />
            </template>

            <v-date-picker
              v-model="vigencia"
              @update:model-value="menuFecha = false"
            />
          </v-menu>

          <v-divider class="my-4" />
          <h4>Medicamentos</h4>

          <!-- Selector tipo medicamento -->
          <v-select
            v-model="tipoMedicamentoSeleccionado"
            :items="tiposMedicamentos"
            label="Filtrar por tipo de medicamento"
            clearable
            class="mb-4"
          />

          <div v-for="(med, index) in medicamentosList" :key="index" class="d-flex align-center mb-2">
            <v-autocomplete
              :items="medicamentosFiltrados"
              :item-title="mostrarNombreConStock"
              item-value="idMedicamento"
              v-model="med.idMedicamento"
              label="Medicamento"
              class="me-4"
              style="flex: 1"
              :disabled="!medicamentosFiltrados.length"
            />
            <v-text-field
              v-model="cantidades[index]"
              label="Cantidad"
              type="number"
              style="width: 100px"
            />
            <v-btn icon @click="eliminarMedicamento(index)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
          <v-btn color="green" @click="agregarMedicamento">Agregar medicamento</v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-btn color="primary" @click="emitirReceta">
          {{ confirmarSinStock ? 'Emitir de todos modos' : 'Emitir Receta' }}
        </v-btn>
        <v-btn color="grey" @click="$emit('update:modelValue', false)">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const props = defineProps({
  modelValue: Boolean,
  cita: Object
})
const emit = defineEmits(['update:modelValue', 'recetaEmitida'])

const observaciones = ref('')
const diagnostico = ref('')
const examenIndicado = ref('')
const vigencia = ref('')
const menuFecha = ref(false)
const fechaEmision = ref(new Date().toISOString().substr(0, 10))
const medicamentosList = ref([{ idMedicamento: null }])
const cantidades = ref([1])
const listaMedicamentos = ref([])
const confirmarSinStock = ref(false)

const tipoMedicamentoSeleccionado = ref(null)

// Obtener tipos únicos de medicamento para el filtro
const tiposMedicamentos = computed(() => {
  const tipos = listaMedicamentos.value.map(m => m.tipoMedicamento).filter(Boolean)
  return [...new Set(tipos)]
})

// Filtrar medicamentos según tipo seleccionado
const medicamentosFiltrados = computed(() => {
  if (!tipoMedicamentoSeleccionado.value) return listaMedicamentos.value
  return listaMedicamentos.value.filter(m => m.tipoMedicamento === tipoMedicamentoSeleccionado.value)
})

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/medicamento/getMedicamentos')
    listaMedicamentos.value = res.data
  } catch (e) {
    console.error('Error cargando medicamentos:', e)
  }
})

function agregarMedicamento() {
  medicamentosList.value.push({ idMedicamento: null })
  cantidades.value.push(1)
}

function eliminarMedicamento(index) {
  medicamentosList.value.splice(index, 1)
  cantidades.value.splice(index, 1)
}

function mostrarNombreConStock(item) {
  return `${item.nombreComercial} (Stock: ${item.stockReal ?? 'N/A'})`
}

const vigenciaVisual = computed(() => {
  if (!vigencia.value) return ''
  const d = new Date(vigencia.value)
  if (isNaN(d.getTime())) return ''
  const opciones = { weekday: 'short', day: '2-digit', month: 'short' }
  return d.toLocaleDateString('es-CL', opciones)
})

function resetearFormulario() {
  observaciones.value = ''
  diagnostico.value = ''
  examenIndicado.value = ''
  vigencia.value = ''
  medicamentosList.value = [{ idMedicamento: null }]
  cantidades.value = [1]
  tipoMedicamentoSeleccionado.value = null
  confirmarSinStock.value = false
}



async function emitirReceta() {
  for (let i = 0; i < medicamentosList.value.length; i++) {
    const idMed = medicamentosList.value[i].idMedicamento
    const cantidadDeseada = parseInt(cantidades.value[i])
    const medicamento = listaMedicamentos.value.find(m => m.idMedicamento === idMed)

    if (!medicamento) {
      alert(`Medicamento con ID ${idMed} no encontrado.`)
      return
    }

    if (medicamento.stockReal - cantidadDeseada < 0) {
      if (!confirmarSinStock.value) {
        alert(`⚠️ El medicamento "${medicamento.nombreComercial}" no tiene stock suficiente. Si deseas emitir la receta igualmente, presiona el botón "Emitir de todos modos".`)
        confirmarSinStock.value = true
        return
      }
    }
  }

  const receta = {
    fechaEmision: new Date(fechaEmision.value).toISOString(),
    vigencia: new Date(vigencia.value).toISOString(),
    observaciones: observaciones.value,
    diagnostico: diagnostico.value,
    examenIndicado: examenIndicado.value,
    medico: { id: localStorage.getItem('idMedico') },
    paciente: { id: props.cita.paciente.id },
    medicamentosList: medicamentosList.value.map(m => ({ idMedicamento: m.idMedicamento })),
    cantidadMedicamentos: cantidades.value.map(c => parseInt(c))
  }

  try {
    await axios.post('http://localhost:8080/api/receta/crearReceta', receta)
    await axios.put(`http://localhost:8080/api/cita/atendidoPorMedico/${props.cita.idCita}`)
    emit('recetaEmitida', props.cita.idCita)
    alert('Receta emitida con éxito y cita marcada como atendida.')

    resetearFormulario()
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Error al emitir receta o marcar cita:', error)
    alert('Error al emitir receta o marcar cita como atendida.')
  }
}
</script>
