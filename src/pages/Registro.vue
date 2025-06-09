<template>
    <v-app style="background-color: #fffdfc;">
        <v-container>
            <v-row justify="center" align="center" style="min-height: 80vh;">
                <v-col cols="12" md="8">
                    <v-card>
                        <v-card-title class="text-h5">Registro de Cuenta</v-card-title>
                        <v-card-text>
                            <v-form @submit.prevent="registrar">
                                <v-text-field
                                    v-model="nombre"
                                    label="Nombre Completo"
                                    required
                                ></v-text-field>
                                <v-text-field
                                    v-model="correo"
                                    label="Correo Electrónico"
                                    type="email"
                                    required
                                ></v-text-field>
                                <v-text-field
                                    v-model="rut"
                                    label="RUT Chileno"
                                    required
                                ></v-text-field>
                                <v-text-field
                                    v-model="password"
                                    label="Contraseña"
                                    type="password"
                                    required
                                ></v-text-field>
                                <v-btn color="#C73636" class="mt-4" type="submit">Registrar</v-btn>
                            </v-form>
                            <v-alert
                                v-if="mensaje"
                                type="success"
                                class="mt-4"
                                border="start"
                                prominent
                            >
                                {{ mensaje }}
                            </v-alert>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </v-app>
</template>

<script setup>
import { ref } from 'vue'

const nombre = ref('')
const correo = ref('')
const rut = ref('')
const password = ref('')
const mensaje = ref('')

async function registrar() {
  mensaje.value = ''
  
  const nuevoPaciente = {
    nombre: nombre.value,
    correo: correo.value,
    rut: rut.value,
    rol: 'paciente',
    fechaNacimiento: "2000-01-01T00:00:02.000Z",
    password: password.value
  }

  try {
    const res = await fetch('http://localhost:8080/api/paciente/crearPaciente', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevoPaciente)
    });

    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status}`);
    }

    mensaje.value = `¡Registro exitoso para ${nombre.value}!`
    
    // Limpia los campos
    nombre.value = ''
    correo.value = ''
    rut.value = ''
    password.value = ''

  } catch (e) {
    mensaje.value = `Error al registrar: ${e.message}`
  }
}
</script>