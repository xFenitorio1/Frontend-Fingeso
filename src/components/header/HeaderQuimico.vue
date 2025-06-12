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
        
        <v-btn color="white" variant="flat" class="text-primary" to="/EntregarReceta">
            Entregar Receta
        </v-btn>
    </v-app-bar>
</template>

<script setup>
import { ref } from 'vue'
</script>