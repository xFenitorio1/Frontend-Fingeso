<template>
    <v-app style="background-color: #fffdfc;">
        <v-container>
            <v-row justify="center" align="center" style="height: 100vh;">
                <v-col cols="12" md="6">
                    <v-card>
                        <v-card-title class="text-h5">Iniciar Sesión</v-card-title>
                        <v-card-text>
                            <v-form @submit.prevent="login">
                                <v-text-field
                                    label="Correo Electrónico"
                                    type="email"
                                    v-model="email"
                                    required
                                ></v-text-field>
                                <v-text-field
                                    label="Contraseña"
                                    type="password"
                                    v-model="password"
                                    required
                                ></v-text-field>
                                <v-btn color="primary" class="mt-4" block type="submit">
                                    Ingresar
                                </v-btn>
                            </v-form>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'


const rol = ref(null)
const email = ref('')
const password = ref('')
const router = useRouter()

onMounted(() => {
  rol.value = localStorage.getItem('rol')
})

function login() {
  fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      correo: email.value,
      password: password.value
    }),
  })
    .then(res => {
      if (!res.ok) {
        return res.text().then(text => {
          throw new Error("Error en el login: " + text);
        });
      }
      return res.json();
    })
    .then(data => {
      console.log('Respuesta login:', data);
      if (data && data.userType) {
        const userRol = data.userType.toLowerCase();
        localStorage.setItem('rol', userRol);
        if (userRol === 'medico' && data.id) {
          localStorage.setItem('idMedico', data.id);
          const idMedico = Number(localStorage.getItem('idMedico'));
        }
        if (userRol === 'paciente' && data.id) {
          localStorage.setItem('idPaciente', data.id);
          const idPaciente = Number(localStorage.getItem('idPaciente'));
        }
        window.location.href = '/';
      } else {
        alert("Correo o contraseña incorrectos");
      }
    })
    .catch(err => {
      alert("Error al iniciar sesión");
      console.error(err);
    });
}
</script>