<template>
  <v-carousel
    hide-delimiters
    cycle
    interval="9000"
    :show-arrows="false"
    height="500px"
  >
    <!-- Slide con video -->
    <v-carousel-item>
      <v-responsive>
        <video autoplay muted loop width="100%">
          <source src="/images/doctor3.mp4" type="video/mp4" />
          Tu navegador no soporta el elemento de video.
        </video>
      </v-responsive>
    </v-carousel-item>

    <!-- Slide con imagen 1 -->
    <v-carousel-item>
      <v-img
        src="/images/doctor1.jpg"
        class="h-100"
        cover
        style="object-fit: contain;"
      >
        <template #default>
          <v-sheet
            color="rgba(236,236,236,0.6)"
            class="d-flex pa-4 justify-center align-center"
            height="80"
            position="absolute"
            style="bottom: 0; width: 100%;"
            elevation="0"
          >
            <span style="font-size:1.5rem; font-family: 'Arial', cursive;">
              Reserva. Revisa. Evoluciona. Bienvenido a Umbrella.
            </span>
          </v-sheet>
        </template>
      </v-img>
    </v-carousel-item>

    <!-- Slide con imagen 2 -->
    <v-carousel-item>
      <v-img
        src="/images/doctor2.jpg"
        class="h-100"
        cover
        style="object-fit: contain;"
      >
        <template #default>
          <v-sheet
            color="rgba(236,236,236,0.6)"
            class="d-flex pa-4 justify-center align-center"
            height="80"
            position="absolute"
            style="bottom: 0; width: 100%;"
            elevation="0"
          >
            <span style="font-size:1.5rem; font-family: 'Arial', cursive;">
              Reserva. Revisa. Evoluciona. Bienvenido a Umbrella.
            </span>
          </v-sheet>
        </template>
      </v-img>
    </v-carousel-item>
  </v-carousel>
</template>



<script setup>
import { ref } from 'vue'

const items = ref([
    { src: '/images/doctor1.jpg'},
    { src: '/images/doctor2.jpg'},
    { src: '/images/doctor3.jpg'},
])
</script>