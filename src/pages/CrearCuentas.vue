<template>
  <v-app>
    <v-container max-width="500px" class="mt-16">
      <v-card>
        <v-card-title class="text-h5">Crear Cuenta de Clinica</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="formValido" @submit.prevent="crearCuenta">
            <v-text-field
              v-model="correoNombre"
              label="Correo"
              append-inner="@umbrella.cl"
              required
            ></v-text-field>
            <!-- Vista previa del correo -->
            <div v-if="correoNombre" style="color: #888; margin-bottom: 10px;">
              <strong>Correo completo:</strong> {{ correoPreview }}
            </div>
            <v-text-field
              v-model="nombre"
              label="Nombre de Usuario"
              :rules="[v => !!v || 'El nombre de usuario es obligatorio']"
              required
            ></v-text-field>
            <v-text-field
              v-model="rut"
              label="RUT"
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
            <v-select
            v-model="rol"
            :items="roles"
            item-title="label"
            item-value="value"
            label="Rol"
            :rules="[v => !!v || 'El rol es obligatorio']"
            required
            ></v-select>
            <v-btn color="primary" class="mt-4" block type="submit">
              Crear Cuenta
            </v-btn>
          </v-form>
          <v-alert v-if="mensaje" :type="mensajeTipo" class="mt-4">
            {{ mensaje }}
          </v-alert>
        </v-card-text>
      </v-card>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const form = ref(null)
const formValido = ref(false)
const correoNombre = ref('')
const nombre = ref('')
const rut = ref('')
const password = ref('')
const rol = ref('')
const mensaje = ref('')
const mensajeTipo = ref('success')

const roles = [
  { label: 'Medico', value: 'medico' },
  { label: 'Quimico Farmaceutico', value: 'quimico' },
  { label: 'Soporte Tecnico', value: 'soporteTecnico' },
  { label: 'Gerente', value: 'gerente' },
  { label: 'Secretario', value: 'secretario' },
  { label: 'Enfermero', value: 'enfermero' },
]

const correoPreview = computed(() => correoNombre.value ? `${correoNombre.value}@umbrella.cl` : '')

async function crearCuenta() {
    const valido = await form.value.validate()
    if (!valido) return

    mensaje.value = ''
    const datosAEnviar = {
        correo: correoPreview.value,
        nombre: nombre.value,
        rut: rut.value,
        password: password.value,
        rol: rol.value
    }
    console.log('Datos enviados al backend:', datosAEnviar)

    let url = ''
    if (rol.value === 'medico') {
        url = 'http://localhost:8080/api/medico/crearMedico'
    } 
    else if (rol.value === 'quimico') {
        url = 'http://localhost:8080/api/quimicoFarmaceutico/crearQuimicoFarmaceutico'
    } 
    else if (rol.value === 'soporteTecnico') {
        url = 'http://localhost:8080/api/soporteTecnico/crearSoporteTecnico'
    } 
    else if (rol.value === 'gerente') {
        url = 'http://localhost:8080/api/gerente/crearGerente'
    } 
    else if (rol.value === 'secretario') {
        url = 'http://localhost:8080/api/secretario/crearSecretario'
    } 
    else if (rol.value === 'enfermero') {
        url = 'http://localhost:8080/api/enfermero/crearEnfermero'
    }
    else {
        mensaje.value = 'Rol no soportado'
        mensajeTipo.value = 'error'
        return
    }

    try {
        const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosAEnviar)
        })
        if (!res.ok) {
        throw new Error(`Error HTTP ${res.status}`)
        }
        mensaje.value = '¡Cuenta creada exitosamente!'
        mensajeTipo.value = 'success'
        correoNombre.value = ''
        rut.value = ''
        password.value = ''
        rol.value = ''
        form.value.resetValidation()
    } catch (e) {
        mensaje.value = 'Error al crear la cuenta: ' + e.message
        mensajeTipo.value = 'error'
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