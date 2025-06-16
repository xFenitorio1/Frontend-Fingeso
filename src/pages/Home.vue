<template>
  <v-app>
    <v-main>
      <Carousel />
      <v-container>
        <v-row>
          <v-col cols="6" class="d-flex flex-column align-start">
            <v-btn color="primary" class="ma-5" width="300" height="50">
              Nuestras sucursales
            </v-btn>
          </v-col>
          <v-col cols="6" class="d-flex flex-column align-end">
            <v-btn color="primary" class="ma-5" width="300" height="50">
              Reserva tu hora
            </v-btn>
          </v-col>
        </v-row>

        <v-container>
          <v-row justify="center" class="mt-10" dense>
            <v-col
              cols="12"
              sm="6"
              md="4"
              lg="3"
              v-for="(item, i) in especialidades"
              :key="i"
              class="text-center"
            >
              <v-icon size="80" color="primary" class="mb-2">
                {{ item.icono }}
              </v-icon>
              <div style="font-weight: bold;">{{ item.nombre }}</div>
            </v-col>
          </v-row>
          <v-row justify="center" class="mt-10">
            <v-col cols="12" class="text-center">
              <h2>¿Por qué elegirnos?</h2>
              <p>
                En nuestra clínica, nos comprometemos a brindar atención médica de alta calidad con un enfoque centrado en el paciente. Nuestro equipo de profesionales está aquí para cuidar de tu salud y bienestar.
              </p>
            </v-col>
          </v-row> 
          <v-row justify="center" class="mt-10">
            <v-col cols="12" class="text-center">
              <h2 class="text-primary">Atención sin pausas. Registro sin errores. Umbrella, a tu lado.</h2>
            </v-col>
          </v-row> 
        </v-container>
      </v-container>
      
    </v-main>
    <Footer />
  </v-app>
</template>
  
<script setup>
import { ref, onMounted } from 'vue'
import Footer from '@/components/Footer/Footer.vue'
import Carousel from '@/components/Carousel/CarouselHome.vue'

const rol = ref(null)

const especialidades = [
  {
    nombre: 'Cardiología', icono: 'mdi-heart-pulse'
  },
  {
    nombre: 'Dermatología', icono: 'mdi-lotion-outline'
  },
  {
    nombre: 'Pediatría', icono: 'mdi-baby-face-outline'
  },
  {
    nombre: 'Traumatología', icono: 'mdi-bone'
  },
  {
    nombre: 'Ginecología', icono: 'mdi-face-woman-outline'
  },
  {
    nombre: 'Odontología', icono: 'mdi-tooth-outline'
  },
  {
    nombre: 'Oftalmología', icono: 'mdi-eye-outline'
  },
  {
    nombre: 'Medicina General', icono: 'mdi-stethoscope'
  },
]

onMounted(() => {
  rol.value = localStorage.getItem('rol')
})
</script>