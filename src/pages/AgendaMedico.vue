<template>
    <v-app>
        <HeaderPatient v-if="rol === 'paciente'" />
        <HeaderMedico v-if="rol === 'medico'" />
        <HeaderUnlogged v-if="!rol" />
        <HeaderQuimico v-if="rol === 'quimico'" />

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
                        <v-card-title>
                        Paciente: {{ cita.paciente?.nombre || 'Desconocido' }}
                        </v-card-title>
                        <v-card-text>
                        Fecha: {{ cita.fechaCita }}<br>
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
import HeaderPatient from '@/components/header/HeaderPatient.vue'
import HeaderMedico from '@/components/header/HeaderMedico.vue'
import HeaderUnlogged from '@/components/header/HeaderUnlogged.vue'
import HeaderQuimico from '@/components/header/HeaderQuimico.vue'
import axios from 'axios'

const rol = ref(null)
const idMedico = ref(null)
const citas = ref([])


onMounted(async () => {
    rol.value = localStorage.getItem('rol')
    idMedico.value =  Number(localStorage.getItem('idMedico'))
    try {
        const res = await axios.get('http://localhost:8080/api/cita/getCitas')
        citas.value = res.data
        console.log('Citas recibidas:', citas.value)
        } catch (e) {
        console.error('Error al cargar citas:', e)
    }
})

// Filtro citas por médico
const citasFiltradas = computed(() =>
    citas.value.filter(cita => {
        return cita.medico && cita.medico.id === idMedico.value
    })
)
</script>   