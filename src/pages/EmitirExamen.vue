<template>
  <v-app>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="text-h5">Emitir Examen</v-card-title>
            <v-card-text>
              <v-form ref="form" @submit.prevent="emitirExamen">
                <v-text-field
                    v-model="rut"
                    label="RUT Chileno"
                    :rules="[v => !!v || 'El RUT es obligatorio']"
                    required
                ></v-text-field>

                <v-text-field
                  v-model="tipoExamen"
                  label="Tipo de Examen"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="fechaEmision"
                  label="Fecha de Emisión"
                  type="date"
                  required
                ></v-text-field>

                <v-btn color="#C73636" class="mt-4" type="submit">
                  Emitir Examen
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
import { ref, watch } from 'vue'

const rut = ref('')
const tipoExamen = ref('')
const fechaEmision = ref('')

function formatearRut(valor) {
  valor = valor.replace(/[^\dkK]/g, '')
  let cuerpo = valor.slice(0, -1)
  let dv = valor.slice(-1)
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return cuerpo ? `${cuerpo}-${dv}` : dv
}

watch(rut, (nuevo) => {
  const limpio = nuevo.replace(/[^\dkK]/g, '')
  if (nuevo && nuevo !== formatearRut(limpio)) {
    rut.value = formatearRut(limpio)
  }
})

async function emitirExamen() {
  try {
    // 1. Obtener ID del paciente por RUT
    const idPacienteRes = await fetch(`http://localhost:8080/api/paciente/getIdByRut/${rut.value}`)
    if (!idPacienteRes.ok) throw new Error('No se pudo obtener el ID del paciente')

    const idPaciente = await idPacienteRes.json()

    // 2. Obtener ID del enfermero desde localStorage
    const idEnfermero = localStorage.getItem('idEnfermero')
    if (!idEnfermero) throw new Error('ID del enfermero no encontrado en localStorage')

    // 3. Armar JSON del examen
    const examen = {
      tipo: tipoExamen.value,
      fechaExamen: new Date(fechaEmision.value).toISOString(), // ISO 8601 format
      paciente: { id: idPaciente },
      enfermero: { id: parseInt(idEnfermero) }
    }

    // 4. Hacer POST al backend
    const res = await fetch('http://localhost:8080/api/examen/crearExamen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(examen)
    })

    if (!res.ok) {
      throw new Error(`Error al emitir examen: ${res.status}`)
    }

    alert('Examen emitido correctamente')

    console.log('Examen emitido:', examen)
    rut.value = ''
    tipoExamen.value = ''
    fechaEmision.value = ''

  } catch (error) {
    console.error('Error al emitir examen:', error)
    alert('Error: ' + error.message)
  }
}
</script>