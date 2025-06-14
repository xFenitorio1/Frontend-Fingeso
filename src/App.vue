<template>
  <v-app>
      <HeaderPatient v-if="rol === 'paciente'" />
  <HeaderMedico v-else-if="rol === 'medico'" />
  <HeaderQuimico v-else-if="rol === 'quimico'" />
  <HeaderUnlogged v-else />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>





<script setup>
import { ref, onMounted } from 'vue'
import HeaderPatient from '@/components/header/HeaderPatient.vue'
import HeaderMedico from '@/components/header/HeaderMedico.vue'
import HeaderUnlogged from '@/components/header/HeaderUnlogged.vue'
import Footer from '@/components/Footer/Footer.vue'
import HeaderQuimico from '@/components/header/HeaderQuimico.vue'

const rol = ref(null)
onMounted(() => {
  rol.value = localStorage.getItem('rol')
})
</script>