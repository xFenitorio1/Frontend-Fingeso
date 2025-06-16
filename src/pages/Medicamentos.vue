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
                {{ med.descripcion }}
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
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const search = ref('')
const cargado = ref(false)
const medicamentos = ref([])

onMounted(async () => {

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
})

const filteredMedicamentos = computed(() =>
  medicamentos.value.filter(med =>
    med?.nombreComercial?.toLowerCase().includes(search.value.toLowerCase())
  )
)
</script>

