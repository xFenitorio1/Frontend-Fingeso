<template>
  <v-app>
    <Header />
    <v-main>
      <Carousel />

      <v-row>
        <v-col cols="6">
          <v-btn color="primary" class="ma-5"
            width="300"
            height="50">
            Nuestras Sucursales
          </v-btn>
        </v-col>

        <v-col cols="6" class="d-flex flex-column align-end justify-end">
          <v-btn color="primary" class="ma-5" width="300" height="50">
            Reserva tu hora
          </v-btn>
          <div style="width:300px; margin-left: 20px;">
            <div>
              <span style="font-size:2rem;">Formas de pago</span><br>
              <span style="color:#bdb0ad; font-size:1.2rem;">
                Colocar formas de pago
              </span>
            </div>
            <div style="margin-top:24px;">
              <span style="font-size:2rem;">Bono electronico</span><br>
              <span style="color:#bdb0ad; font-size:1.2rem;">
                Insertar información sobre eso
              </span>
            </div>
          </div>
        </v-col>
      </v-row>
>
      <div class="text-center my-10">
        <span style="font-size:2.5rem;">
          Nuestras especialidades
        </span>
      </div>
      <v-row justify="center" align="center">
        <v-col cols="auto" v-for="n in 4" :key="n">
          <div style="width:140px; height:140px; background:#dbdbdb; border-radius:4px;"></div>
        </v-col>
      </v-row>
      
    </v-main>
    <Footer />
  </v-app>
</template>
  
<script setup>
import Header from '@/components/header/Header.vue'
import Footer from '@/components/Footer/Footer.vue'
import Carousel from '@/components/Carousel/CarouselHome.vue'
</script>