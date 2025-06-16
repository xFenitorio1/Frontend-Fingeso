<template>
  <v-app style="background-color: #fffdfc;">
    <v-container>
      <v-row justify="center" align="center" style="min-height: 80vh;">
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="text-h5">Historial Médico</v-card-title>
            <v-card-text>
              <v-expansion-panels>
                <v-expansion-panel
                  v-for="examen in examenes"
                  :key="examen.id"
                >
                  <v-expansion-panel-title>
                    <div>
                      <strong>Examen:</strong> {{ examen.nombre }}<br>
                      <strong>Fecha:</strong> {{ examen.fecha }}
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div>
                      <strong>Síntomas:</strong>
                      <ul>
                        <li v-for="sintoma in examen.sintomas" :key="sintoma">{{ sintoma }}</li>
                      </ul>
                      <strong>Medicamentos:</strong>
                      <ul>
                        <li v-for="med in examen.medicamentos" :key="med">{{ med }}</li>
                      </ul>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const rol = ref(null)
const examenes = ref([])

onMounted(async () => {
  rol.value = localStorage.getItem('rol')

  const idPaciente = localStorage.getItem('idPaciente')
  if (!idPaciente) return alert('ID del paciente no encontrado')

  try {
    const res = await fetch(`http://localhost:8080/api/paciente/${idPaciente}/historial`)
    if (!res.ok) throw new Error('Error al obtener historial médico')

    const data = await res.json()

    if (data.examenes) {
      examenes.value = data.examenes.map(e => ({
        id: e.id,
        nombre: e.tipo,
        fecha: e.fechaExamen.split('T')[0],
        sintomas: e.sintomas,
        medicamentos: e.medicamentos
      }))
    }

  } catch (error) {
    console.error('Error:', error)
    alert('No se pudo cargar el historial médico')
  }
})
</script>