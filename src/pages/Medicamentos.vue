<template>
  <v-app>
    <v-container style="margin-top: 64px;">
      <v-row class="my-6" align="center">
        <v-col cols="8">
          <h2 class="text-h4">Listado de Medicamentos</h2>
        </v-col>
        <v-col cols="4">
          <v-text-field
            v-model="search"
            label="Buscar medicamento"
            prepend-inner-icon="mdi-magnify"
            clearable
          ></v-text-field>
        </v-col>
      </v-row>

      <v-slide-y-transition>
        <v-row
          v-if="cargado && filteredMedicamentos.length > 0"
          class="animacion-entrada"
        >
          <v-col
            cols="12"
            md="6"
            lg="4"
            v-for="med in filteredMedicamentos"
            :key="med.id"
          >
            <v-card class="mb-4">
              <v-card-title>{{ med.nombreComercial }}</v-card-title>
              <v-card-text>
                <div class="mb-2">
                  <strong>Tipo de Medicamento: </strong>{{ med.tipoMedicamento }}
                </div>
                <div>
                  <strong>Stock disponible:</strong>
                  {{ med.stockReal ?? 'No especificado' }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-slide-y-transition>

      <div
        v-if="cargado && filteredMedicamentos.length === 0"
        class="text-center my-10"
      >
        <span>No se encontraron medicamentos.</span>
      </div>

      <!-- Botón flotante -->
      <v-btn
        icon
        color="primary"
        class="ma-4"
        style="position: fixed; bottom: 24px; right: 24px;"
        @click="dialog = true"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>

      <!-- Diálogo para agregar medicamento -->
      <v-dialog v-model="dialog" max-width="600px">
        <v-card>
          <v-card-title class="text-h5">Agregar Nuevo Medicamento</v-card-title>
          <v-card-text>
            <AgregarMedicamento @cerrar="dialog = false" @agregado="refrescarMedicamentos" />
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AgregarMedicamento from '@/components/Medicamentos/AgregarMedicamentos.vue'

const search = ref('')
const cargado = ref(false)
const medicamentos = ref([])
const dialog = ref(false)

async function cargarMedicamentos() {
  try {
    const response = await fetch('http://localhost:8080/api/medicamento/getMedicamentos');
    if (!response.ok) {
      throw new Error(`Error al obtener medicamentos: ${response.status}`);
    }
    medicamentos.value = await response.json();

  } catch (error) {
    console.error('Error al cargar medicamentos:', error.message);
  } finally {
  
    cargado.value = true;
  }
}

function refrescarMedicamentos() {
  cargarMedicamentos()
  dialog.value = false
}

onMounted(cargarMedicamentos)

const filteredMedicamentos = computed(() =>
  medicamentos.value.filter(med =>
    med?.nombreComercial?.toLowerCase().includes(search.value.toLowerCase())
  )
)
</script>
