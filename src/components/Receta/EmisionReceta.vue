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
                v-model="vigencia"
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

          <div v-for="(med, index) in medicamentosList" :key="index" class="d-flex align-center mb-2">
            <v-select
              :items="listaMedicamentos"
              item-title="nombreComercial"
              item-value="idMedicamento"
              v-model="med.idMedicamento"
              label="Medicamento"
              class="me-4"
              style="flex: 1"
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
        <v-btn color="primary" @click="emitirReceta">Emitir Receta</v-btn>
        <v-btn color="grey" @click="$emit('update:modelValue', false)">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  modelValue: Boolean,
  cita: Object
})
const emit = defineEmits(['update:modelValue'])

const observaciones = ref('')
const diagnostico = ref('')
const examen = ref('')
const vigencia = ref('')
const menuFecha = ref(false)
const fechaEmision = ref(new Date().toISOString().substr(0, 10)) // yyyy-mm-dd
const examenIndicado = ref('')
const medicamentosSeleccionados = ref([])


const medicamentosList = ref([{ idMedicamento: null }])
const cantidades = ref([1])
const listaMedicamentos = ref([])

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/medicamento/getMedicamentos')
    listaMedicamentos.value = res.data
    console.log(listaMedicamentos.value)
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
      alert(`No hay stock suficiente para "${medicamento.nombreComercial}". Quedan ${medicamento.stockReal} unidades y se están solicitando ${cantidadDeseada}.`)
      return
    }
  }

  console.log("cantidades:", cantidades.value);
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

  console.log('Receta a emitir:', receta)

  try {
    // 1. Crear la receta
    await axios.post('http://localhost:8080/api/receta/crearReceta', receta)

    // 2. Marcar cita como atendida
    await axios.put(`http://localhost:8080/api/cita/atendidoPorMedico/${props.cita.idCita}`)

    emit('recetaEmitida', props.cita.idCita)

    alert('Receta emitida con éxito y cita marcada como atendida.')
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Error al emitir receta o marcar como atendida:', error)
    alert('Ocurrió un error al emitir la receta o marcar la cita como atendida.')
  }
}

</script>
