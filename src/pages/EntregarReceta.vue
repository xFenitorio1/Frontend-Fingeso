<template>
  <v-app>
    <HeaderPatient v-if="rol === 'paciente'" />
    <HeaderMedico v-else-if="rol === 'medico'" />
    <HeaderQuimico v-else-if="rol === 'quimico'" />
    <HeaderUnlogged v-else />
    <v-container max-width="600px" class="mt-16">
      <h2 class="text-h4 mb-6">Entregar Receta</h2>
      <v-text-field
        v-model="rutBusqueda"
        label="Buscar por RUT Chileno"
        @input="formatearRutBusqueda"
        clearable
        class="mb-4"
      ></v-text-field>

      <v-alert v-if="rutBusqueda && recetasFiltradas.length === 0" type="info" class="mb-4">
        No hay recetas pendientes para este RUT.
      </v-alert>

      <v-list v-if="recetasFiltradas.length > 0">
        <v-list-item
          v-for="receta in recetasFiltradas"
          :key="receta.id"
          class="mb-2"
        >
          <v-card>
            <v-card-title>
              <strong>Paciente:</strong> {{ receta.nombre_paciente }}
            </v-card-title>
            <v-card-text>
              <div><strong>RUT:</strong> {{ receta.rut }}</div>
              <div><strong>Medicamento:</strong> {{ receta.medicamento }}</div>
              <div><strong>Fecha:</strong> {{ receta.fecha }}</div>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="abrirDialogo(receta)" variant="flat">
                Entregar receta
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-list-item>
      </v-list>

      <!-- Cuadrito de confirmación -->
      <v-dialog v-model="dialogo" max-width="500">
        <v-card>
          <v-card-title class="text-h6">¿Está seguro que desea entregar la receta?</v-card-title>
          <v-card-text>
            Esta acción marcará la receta como entregada y no podrá revertirse.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" variant="text" @click="dialogo = false">Cancelar</v-btn>
            <v-btn color="primary" variant="flat" @click="confirmarEntrega">Entregar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import HeaderPatient from '@/components/header/HeaderPatient.vue'
import HeaderMedico from '@/components/header/HeaderMedico.vue'
import HeaderUnlogged from '@/components/header/HeaderUnlogged.vue'
import HeaderQuimico from '@/components/header/HeaderQuimico.vue'

const rol = ref(null)

onMounted(() => {
  rol.value = localStorage.getItem('rol')
})

const recetas = ref([
  {
    id: 1,
    rut: '12.345.678-9',
    nombre_paciente: 'Juan Pérez',
    medicamento: 'Paracetamol 500mg',
    fecha: '2024-06-10',
    es_etiquetado: false
  },
  {
    id: 2,
    rut: '12.345.678-9',
    nombre_paciente: 'Juan Pérez',
    medicamento: 'Ibuprofeno 400mg',
    fecha: '2024-06-09',
    es_etiquetado: true
  },
  {
    id: 3,
    rut: '20.123.456-7',
    nombre_paciente: 'María López',
    medicamento: 'Amoxicilina 500mg',
    fecha: '2024-06-08',
    es_etiquetado: false
  },
    {
    id: 4,
    rut: '12.345.678-9',
    nombre_paciente: 'Juan Pérez',
    medicamento: 'Ibuprofeno 400mg',
    fecha: '2024-06-09',
    es_etiquetado: false
  },
    {
    id: 5,
    rut: '12.345.678-9',
    nombre_paciente: 'Juan Pérez',
    medicamento: 'Ibuprofeno 400mg',
    fecha: '2024-06-09',
    es_etiquetado: false
  },
])

const rutBusqueda = ref('')
const dialogo = ref(false)
const recetaSeleccionada = ref(null)

function formatearRutBusqueda() {
  let valor = rutBusqueda.value.replace(/[^\dkK]/g, '');
  let cuerpo = valor.slice(0, -1);
  let dv = valor.slice(-1);
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  rutBusqueda.value = cuerpo ? `${cuerpo}-${dv}` : dv;
}

function abrirDialogo(receta) {
  recetaSeleccionada.value = receta
  dialogo.value = true
}

function confirmarEntrega() {
  if (recetaSeleccionada.value) {
    recetaSeleccionada.value.es_etiquetado = true
  }
  dialogo.value = false
  recetaSeleccionada.value = null
}

const recetasFiltradas = computed(() => {
  if (!rutBusqueda.value) return [];
  return recetas.value.filter(
    r => r.rut.toLowerCase() === rutBusqueda.value.toLowerCase() && !r.es_etiquetado
  );
});
</script>