<template>
  <v-app style="background-color: #fffdfc;">
    <v-container>
      <v-row justify="center" align="center" style="min-height: 80vh;">
        <v-col cols="12" md="8">
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
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const examenes = ref([])
const recetas = ref([]) 

onMounted(async () => { 

  const idPaciente = localStorage.getItem('idPaciente')
  if (!idPaciente) return alert('Porfavor, ingrese a su cuenta para ver su historial médico.')

  try {
    const res = await fetch(`http://localhost:8080/api/paciente/${idPaciente}/historial`)
    if (!res.ok) throw new Error('Error al obtener historial médico')

    const data = await res.json()
    console.log('Respuesta completa:', data)

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
    alert('No se pudo cargar el historial médico')
  }
})
</script>
