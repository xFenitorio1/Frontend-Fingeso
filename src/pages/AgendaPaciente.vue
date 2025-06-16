<template>
    <v-app>
        <v-container class="mt-16">
        <v-row justify="center">
            <v-col cols="12" md="8">
            <v-card>
                <v-card-title class="text-h5">Agenda de Citas</v-card-title>
                <v-card-text>
                <v-alert v-if="citasFiltradas.length === 0" type="info">
                    No hay citas para mostrar.
                </v-alert>
                <v-row v-else>
                <v-col
                    v-for="cita in citasFiltradas"
                    :key="cita.id"
                    cols="12"
                    class="mb-4"
                >
                    <v-card>
                    <v-card-title class="d-flex justify-space-between align-center">
                        <span>Médico: {{ cita.medico?.nombre || 'Desconocido' }}</span>
                        <v-btn color="error" size="small" @click="cancelarCita(cita)">
                        Cancelar Cita
                        </v-btn>
                    </v-card-title>
                    <v-card-text>
                        Fecha: {{ formatearFecha(cita.fechaCita) }}<br>
                        Hora: {{ cita.horaCita }}
                    </v-card-text>
                    </v-card>
                </v-col>
                </v-row>
                </v-card-text>
            </v-card>
            </v-col>
        </v-row>
        </v-container>
    </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const rol = ref(null)
const idPaciente = ref(null)
const citas = ref([])



const cargarCitas = async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/cita/getCitas');
    citas.value = res.data;
    console.log('Citas recibidas:', citas.value);
  } catch (e) {
    console.error('Error al cargar citas:', e);
  }
};


onMounted(async () => {
  rol.value = localStorage.getItem('rol');
  idPaciente.value = Number(localStorage.getItem('idPaciente'));
  await cargarCitas();
});

async function cancelarCita(cita) {
  try {
    const res = await fetch(`http://localhost:8080/api/cita/eliminarCita/${cita.idCita}`, {
      method: 'PUT'
    });
    if (!res.ok) {
      throw new Error('No se pudo cancelar la cita');
    }
    // cita.eliminada = true;
     await cargarCitas();
  } catch (e) {
    alert('Error al cancelar la cita');
    console.error(e);
  }
}


function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

// Filtro citas por médico
const citasFiltradas = computed(() =>
    citas.value.filter(cita => {
        return cita.paciente && cita.paciente.id === idPaciente.value &&
        cita.eliminada === false
    })
)
</script>   