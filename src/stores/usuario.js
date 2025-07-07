import { defineStore } from 'pinia'

export const useUsuarioStore = defineStore('usuario', {
  state: () => ({
    rol: null,
    id: null,
  }),
  getters: {
    getRol: (state) => state.rol,
    isMedico: (state) => state.rol === 'medico',
    isPaciente: (state) => state.rol === 'paciente',
    isEnfermero: (state) => state.rol === 'enfermero',
  },
  actions: {
    login({ rol, id }) {
      this.rol = rol
      this.id = id
      localStorage.setItem('rol', rol)
      localStorage.setItem('idUsuario', id)
    },
    logout() {
      this.rol = null
      this.id = null
      localStorage.clear()
    },
    cargarDesdeLocalStorage() {
      this.rol = localStorage.getItem('rol')
      this.id = localStorage.getItem('idUsuario')
    }
  }
})
