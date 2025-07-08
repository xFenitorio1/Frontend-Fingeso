<template>
  <v-form @submit.prevent="guardarStock" v-model="formValido">
    <v-text-field
      v-model="stock"
      label="Nuevo Stock a agregar"
      type="number"
      min="1"
      :rules="[v => v > 0 || 'Debe ser mayor que 0']"
      required
    />

    <v-row justify="end" class="mt-4">
      <v-btn color="secondary" @click="$emit('cerrar')">Cancelar</v-btn>
      <v-btn color="primary" type="submit" :disabled="!formValido" class="ml-2">Actualizar</v-btn>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const props = defineProps({
  medicamento: Object
})

const emit = defineEmits(['cerrar', 'actualizado'])
const formValido = ref(false)
const stock = ref(1)

async function guardarStock() {
  try {
    const nombre = encodeURIComponent(props.medicamento.nombreComercial);
    const cantidad = stock.value;

    await axios.put(`http://localhost:8080/api/medicamento/reabastecerMedicamentos/${nombre}/${cantidad}`);

    emit('actualizado') // Refresca el listado
    emit('cerrar')      // Cierra el diálogo
  } catch (error) {
    console.error(error)
    alert('Error al actualizar el stock del medicamento')
  }
}
</script>

