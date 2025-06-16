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
        <v-btn @click="cerrarSesion">Cerrar Sesión</v-btn>
        <v-btn >Generar reporte</v-btn>
        
        <!-- Solo para médicos -->
        <v-btn color="white" variant="flat" class="text-primary" to="/Agenda">
            Agendar horas medicos</v-btn>
    </v-app-bar>
</template>

<script setup>
import { ref } from 'vue'

function cerrarSesion() {
  // Elimina los datos del localStorage
    localStorage.clear()

  // Redirige a la pagina de inicio
    window.location.href = '/'
}
</script>