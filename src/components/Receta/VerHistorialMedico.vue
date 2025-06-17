<template>
  <v-dialog v-model="dialog" max-width="800">
    <v-card>
      <v-card-title class="text-h5">Historial Médico</v-card-title>
      <v-card-text>
        <!-- Sección de Exámenes -->
        <div v-if="examenes.length > 0">
          <h3 class="text-h6 mb-4">Exámenes</h3>
          <div v-for="examen in examenes" :key="examen.id" class="mb-4">
            <v-card outlined>
              <v-card-title>
                <strong>Examen:</strong> {{ examen.nombre }}
              </v-card-title>
              <v-card-text>
                <strong>Fecha:</strong> {{ examen.fecha }}
              </v-card-text>
            </v-card>
          </div>
        </div>

        <!-- Panel para Recetas -->
        <v-card class="mt-6" outlined>
          <v-card-title class="text-h6">Recetas</v-card-title>
          <v-card-text>
            <div v-if="recetas.length === 0">No hay recetas disponibles.</div>
            <div v-for="receta in recetas" :key="receta.idReceta" class="mb-4">
              <p><strong>Diagnóstico:</strong> {{ receta.diagnostico }}</p>
              <p><strong>Examen indicado:</strong> {{ receta.examenIndicado }}</p>
              <p><strong>Fecha emisión:</strong> {{ receta.fechaEmision.split('T')[0] }}</p>

              <strong>Medicamentos:</strong>
              <ul>
                <li v-for="med in receta.medicamentosList" :key="med.idMedicamento">
                  {{ med.nombreComercial }}
                </li>
              </ul>
            </div>
          </v-card-text>
        </v-card>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text color="primary" @click="dialog = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAttrs } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  cita: Object
})

const emit = defineEmits(['update:modelValue'])

const dialog = ref(false)
watch(() => props.modelValue, (val) => dialog.value = val)
watch(dialog, val => emit('update:modelValue', val))

const examenes = ref([])
const recetas = ref([])

watch(() => props.cita, async (nuevaCita) => {
  if (!nuevaCita?.paciente?.id) return

  const idPaciente = nuevaCita.paciente.id
  try {
    const res = await fetch(`http://localhost:8080/api/paciente/${idPaciente}/historial`)
    const data = await res.json()

    if (data.examenes && Array.isArray(data.examenes)) {
      examenes.value = data.examenes.map(e => ({
        id: e.idExamen,
        nombre: e.tipo,
        fecha: e.fechaExamen.split('T')[0],
        sintomas: e.sintomas ?? [],
        medicamentos: e.medicamentos ?? []
      }))
    }

    if (data.recetas && Array.isArray(data.recetas)) {
      recetas.value = data.recetas
    }
  } catch (error) {
    console.error('Error al cargar historial médico:', error)
  }
})
</script>
