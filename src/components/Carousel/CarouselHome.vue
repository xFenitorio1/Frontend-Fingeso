<template>
  <v-carousel
    v-model="slideActual"
    hide-delimiters
    cycle
    interval="8000"
    :show-arrows="false"
    height="650px"
  >
    <!-- Slide 0: Video -->
    <v-carousel-item>
      <v-responsive class="fill-height">
        <video
          ref="videoRef"
          autoplay
          muted
          loop
          playsinline
          class="w-100 h-100"
          style="object-fit: cover;"
        >
          <source src="/images/doctor3.mp4" type="video/mp4" />
          Tu navegador no soporta el elemento de video.
        </video>
      </v-responsive>
    </v-carousel-item>

    <!-- Slide 1 -->
    <v-carousel-item>
      <v-img
        src="/images/doctor1.jpg"
        class="fill-height"
        cover
      />
    </v-carousel-item>

    <!-- Slide 2 -->
    <v-carousel-item>
      <v-img
        src="/images/doctor2.jpg"
        class="fill-height"
        cover
      />
    </v-carousel-item>
  </v-carousel>
</template>

<script setup>
import { ref, watch } from 'vue'

const slideActual = ref(0)
const videoRef = ref(null)

// Cada vez que cambia el slide, revisamos si estamos en el video
watch(slideActual, (nuevoValor) => {
  if (nuevoValor === 0 && videoRef.value) {
    videoRef.value.currentTime = 0
    videoRef.value.play()
  }
})
</script>
