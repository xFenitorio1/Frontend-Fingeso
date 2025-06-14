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

onMounted(() => {
  rol.value = localStorage.getItem('rol')
})

const examenes = ref([
  {
    id: 1,
    nombre: 'Hemograma',
    fecha: '2025-05-10',
    sintomas: ['Fiebre', 'Cansancio'],
    medicamentos: ['Paracetamol', 'Ibuprofeno']
  },
  {
    id: 2,
    nombre: 'Radiografía de Tórax',
    fecha: '2025-04-22',
    sintomas: ['Dolor de pecho'],
    medicamentos: ['Ninguno']
  }
])
</script>