<template>
  <v-form @submit.prevent="guardarMedicamento" v-model="formValido">
    <v-text-field
      v-model="medicamento.nombreComercial"
      label="Nombre Comercial"
      :rules="[v => !!v || 'Este campo es requerido']"
      required
    ></v-text-field>

    <v-text-field
      v-model="medicamento.principioActivo"
      label="Principio Activo"
      :rules="[v => !!v || 'Este campo es requerido']"
      required
    ></v-text-field>

    <v-textarea
      v-model="medicamento.descripcion"
      label="Descripción"
      :rules="[v => !!v || 'Este campo es requerido']"
      required
    ></v-textarea>

    <v-text-field
      v-model="medicamento.tipoMedicamento"
      label="Tipo de Medicamento"
      :rules="[v => !!v || 'Este campo es requerido']"
      required
    ></v-text-field>

    <v-text-field
      v-model.number="medicamento.stockReal"
      label="Stock Real"
      type="number"
      min="0"
      :rules="[v => v >= 0 || 'Debe ser 0 o mayor']"
      required
    ></v-text-field>

    <v-row justify="end" class="mt-4">
      <v-btn color="secondary" @click="$emit('cerrar')">Cancelar</v-btn>
      <v-btn color="primary" type="submit" :disabled="!formValido" class="ml-2">Guardar</v-btn>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['cerrar', 'agregado'])
const formValido = ref(false)

const medicamento = ref({
  nombreComercial: '',
  principioActivo: '',
  descripcion: '',
  tipoMedicamento: '',
  stockReal: 0,
})

async function guardarMedicamento() {
    
  try {
    const nuevoMedicamento = {
        nombreComercial: medicamento.value.nombreComercial,
        principioActivo: medicamento.value.principioActivo,
        descripcion: medicamento.value.descripcion,
        tipoMedicamento: medicamento.value.tipoMedicamento,
        stockReal: medicamento.value.stockReal,
    }
    const response = await fetch('http://localhost:8080/api/medicamento/crearMedicamento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(medicamento.value)
    })

    if (!response.ok) {
      throw new Error('Error al guardar el medicamento')
    }

    emit('agregado') // Para recargar la lista
  } catch (error) {
    console.error(error)
    alert('No se pudo guardar el medicamento')
  }
}
</script>
