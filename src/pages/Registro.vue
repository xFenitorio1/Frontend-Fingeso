<template>
    <v-app style="background-color: #fffdfc;">
        <v-container style="margin-top: 64px;">
            <v-row justify="center" align="center" style="min-height: 80vh;">
                <v-col cols="12" md="8">
                    <v-card>
                        <v-card-title class="text-h5">Registro de Cuenta</v-card-title>
                        <v-card-text>
                            <v-form ref="form" @submit.prevent="registrar">
                                <v-text-field
                                    v-model="nombre"
                                    label="Nombre Completo"
                                    :rules="[v => !!v || 'El nombre es obligatorio']"
                                    required
                                ></v-text-field>
                                <v-text-field
                                    v-model="correo"
                                    label="Correo Electrónico"
                                    type="email"
                                    :rules="[v => !!v || 'El correo es obligatorio']"
                                    required
                                ></v-text-field>
                                <v-text-field
                                    v-model="rut"
                                    label="RUT Chileno"
                                    :rules="[v => !!v || 'El RUT es obligatorio']"
                                    required
                                ></v-text-field>
                                <v-text-field
                                    v-model="password"
                                    label="Contraseña"
                                    type="password"
                                    :rules="[v => !!v || 'La contraseña es obligatoria']"
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
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'


const rol = ref(null)

onMounted(() => {
  rol.value = localStorage.getItem('rol')
})

const router = useRouter()
const form = ref(null)
const nombre = ref('')
const correo = ref('')
const rut = ref('')
const password = ref('')
const mensaje = ref('')

async function registrar() {

  const valido = await form.value.validate();
  if (!valido) return;  

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
    
    setTimeout(() => {
      router.push('/')
    }, 1000)

  } catch (e) {
    mensaje.value = `Error al registrar: ${e.message}`
  }
}

function formatearRut(valor) {
  valor = valor.replace(/[^\dkK]/g, '');
  let cuerpo = valor.slice(0, -1);
  let dv = valor.slice(-1);
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return cuerpo ? `${cuerpo}-${dv}` : dv;
}

watch(rut, (nuevo) => {
  const limpio = nuevo.replace(/[^\dkK]/g, '');
  if (nuevo && nuevo !== formatearRut(limpio)) {
    rut.value = formatearRut(limpio);
  }
});
</script>