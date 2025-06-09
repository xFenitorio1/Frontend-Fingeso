<template>
    <v-app-bar color="#C73636" app fixed>
        <v-btn to="/" icon class="ml-4 md-0">
            <v-img src="/images/clinica_umbrella.png"
                class="justify-center"
                width="50"
                height="50"
                cover
            ></v-img>
        </v-btn>

        <v-app-bar-title style="font-family:'Comic Sans'">
            Clínica Umbrella
        </v-app-bar-title>

        <v-btn to="/Medicamentos">Medicamentos</v-btn>
        <v-btn>Especialidades</v-btn>
        <v-btn>Contacto</v-btn>
        
        <!-- Solo para médicos -->
        <v-btn v-if="rol === 'medico'" color="white" variant="flat" class="text-primary" to="/Agenda">Agenda</v-btn>
        <!-- Solo para pacientes -->
        <v-btn v-if="rol === 'paciente'" color="white" variant="flat" class="text-primary" to="/Reservas">
            Reserva tu Hora
        </v-btn>
    </v-app-bar>
</template>

<script setup>
import { ref } from 'vue'
// Simula el rol actual
const rol = ref('medico') // Cambia a 'medico' para probar
</script>