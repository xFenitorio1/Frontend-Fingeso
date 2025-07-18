<template>
  <v-app>
    <v-container style="margin-top: 64px;" v-if="accesoPermitido">
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
            :key="med.idMedicamento"
          >
            <v-card class="mb-4">
              <v-card-title>{{ med.nombreComercial }}</v-card-title>
              <v-card-text>
                <div class="mb-2">
                  <strong>Tipo de Medicamento:</strong> {{ med.tipoMedicamento }}
                </div>
                <div class="mb-2">
                  <strong>Stock disponible:</strong> {{ med.stockReal ?? 'No especificado' }}
                </div>
                <div class="mb-2">
                  <strong>Gramaje / mL:</strong> {{ med.gramageMl ?? 'No especificado' }}
                </div>
                <div>
                  <strong>Laboratorio:</strong> {{ med.laboratorio ?? 'No especificado' }}
                </div>
              </v-card-text>
              <v-card-actions>
                <v-btn color="warning" @click="abrirDialogoEditar(med)">Editar</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-slide-y-transition>

      <div v-if="cargado && filteredMedicamentos.length === 0" class="text-center my-10">
        <span>No se encontraron medicamentos.</span>
      </div>

      <!-- Botón flotante para agregar medicamento -->
      <v-btn
        icon
        color="primary"
        class="ma-4"
        style="position: fixed; bottom: 24px; right: 24px;"
        @click="dialog = true"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>

      <!-- Diálogo para agregar -->
      <v-dialog v-model="dialog" max-width="600px">
        <v-card>
          <v-card-title class="text-h5">Agregar Nuevo Medicamento</v-card-title>
          <v-card-text>
            <AgregarMedicamento @cerrar="dialog = false" @agregado="refrescarMedicamentos" />
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Diálogo para editar -->
      <v-dialog v-model="dialogEditar" max-width="600px">
        <v-card>
          <v-card-title class="text-h5">Editar Medicamento</v-card-title>
          <v-card-text>
            <EditarMedicamento
              v-if="medicamentoSeleccionado"
              :medicamento="medicamentoSeleccionado"
              @cerrar="dialogEditar = false"
              @actualizado="refrescarMedicamentos"
            />
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AgregarMedicamento from '@/components/Medicamentos/AgregarMedicamentos.vue'
import EditarMedicamento from '@/components/Medicamentos/EditarMedicamento.vue'

const search = ref('')
const cargado = ref(false)
const medicamentos = ref([])
const dialog = ref(false)
const dialogEditar = ref(false)
const medicamentoSeleccionado = ref(null)

const router = useRouter()
const accesoPermitido = ref(false)

onMounted(() => {
  const rolUsuario = localStorage.getItem('rol')
  if (rolUsuario === 'quimico_farmaceutico') {
    accesoPermitido.value = true
  } else {
    alert('No tienes permiso para acceder a esta página.')
    router.push('/')
  }
})

async function cargarMedicamentos() {
  try {
    const response = await fetch('http://localhost:8080/api/medicamento/getMedicamentos')
    if (!response.ok) throw new Error(`Error: ${response.status}`)
    medicamentos.value = await response.json()
  } catch (error) {
    console.error('Error al cargar medicamentos:', error.message)
  } finally {
    cargado.value = true
  }
}

function refrescarMedicamentos() {
  cargarMedicamentos()
  dialog.value = false
  dialogEditar.value = false
}

function abrirDialogoEditar(medicamento) {
  medicamentoSeleccionado.value = medicamento
  dialogEditar.value = true
}

onMounted(cargarMedicamentos)

const filteredMedicamentos = computed(() =>
  medicamentos.value.filter(med =>
    med?.nombreComercial?.toLowerCase().includes(search.value.toLowerCase())
  )
)
</script>
