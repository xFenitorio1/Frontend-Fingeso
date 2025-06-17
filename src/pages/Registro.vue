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
                                    :rules="[
                                      v => !!v || 'El correo es requerido',
                                      v => /.+@.+\..+/.test(v) || 'Correo inválido'
                                    ]"
                                    required
                                ></v-text-field>
                                <v-text-field
                                    v-model="rut"
                                    label="RUT Chileno"
                                    :rules="[validarRut]"
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

  // Intentamos obtener el ID del paciente por su RUT
  let pacienteId = null;
  try {
    const respuesta = await fetch(`http://localhost:8080/api/paciente/getIdByRut/${rut.value}`);
    if (respuesta.ok) {
      pacienteId = await respuesta.json(); // Paciente existe
    }
  } catch (e) {
    // Si falla el fetch, asumimos que no existe
    pacienteId = null;
  }

  if (pacienteId !== null && pacienteId !== '') {
    // Si el paciente ya existe, actualizamos su nombre y contraseña
    try {
      const url = `http://localhost:8080/api/paciente/updatePaciente/${pacienteId}?nombre=${encodeURIComponent(nombre.value)}&contraseña=${encodeURIComponent(password.value)}`
      const respuestaUpdate = await fetch(url, {
        method: 'PUT'
      });

      if (!respuestaUpdate.ok) {
        throw new Error(`Error HTTP al actualizar: ${respuestaUpdate.status}`);
      }

    } catch (e) {
      mensaje.value = `Error al actualizar cuenta existente: ${e.message}`;
      return;
    }
  } else {
    // Si no existe, se crea un nuevo paciente
    const nuevoPaciente = {
      nombre: nombre.value,
      correo: correo.value,
      rut: rut.value,
      rol: 'paciente',
      fechaNacimiento: "2000-01-01T00:00:02.000Z",
      password: password.value
    };

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

      mensaje.value = `¡Registro exitoso para ${nombre.value}!`;
    } catch (e) {
      mensaje.value = `Error al registrar: ${e.message}`;
      return;
    }
  }

  // Redirigir luego de 1 segundo
  setTimeout(() => {
    router.push('/')
  }, 1000)
}


function formatearRut(valor) {
  valor = valor.replace(/[^\dkK]/g, '');
  let cuerpo = valor.slice(0, -1);
  let dv = valor.slice(-1);
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return cuerpo ? `${cuerpo}-${dv}` : dv;
}

function validarRut(rut) {
  const limpio = rut.replace(/[^\dkK]/g, '')
  return (limpio.length >= 8 && limpio.length <= 9) || 'El RUT debe tener entre 8 y 9 dígitos'
}

watch(rut, (nuevo) => {
  const limpio = nuevo.replace(/[^\dkK]/g, '');
  if (nuevo && nuevo !== formatearRut(limpio)) {
    rut.value = formatearRut(limpio);
  }
});
</script>