// src/main.js o src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi', 
  },
theme: {
  defaultTheme: 'myTheme',
  themes: {
    myTheme: {
      dark: false,
      colors: {
        primary: '#C73636',
        // secondary: '#424242',
        // accent: '#82B1FF',
        // error: '#FF5252',
        // info: '#2196F3',
        // success: '#4CAF50',
        // warning: '#FFC107',
      },
    },
  },
},
})

const app = createApp(App)

app.use(router)
app.use(vuetify)

app.mount('#app')
