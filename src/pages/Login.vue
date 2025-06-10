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

<script>
export default {
    name: 'Login',
    data() {
        return {
            email: '',
            password: ''
        };
    },
methods: {
    login() {
        if (this.email === 'admin@umbrella.cl' && this.password === '123') {
            localStorage.setItem('rol', 'admin');
            this.$router.push({path: '/'});
        }
        else if (this.email === 'quimico@umbrella.cl' && this.password === '123') {
            localStorage.setItem('rol', 'quimico');
            this.$router.push({path: '/'});
        }
        else if (this.email === 'medico@umbrella.cl' && this.password === '123') {
            localStorage.setItem('rol', 'medico');
            this.$router.push({path: '/'});
        } 
        else if (this.email === 'paciente@gmail.cl' && this.password === '123') {
            localStorage.setItem('rol', 'paciente');
            this.$router.push({path: '/'});
        } 
        else {
            alert('Correo o contraseña incorrectos');
        }
    }
}
};
</script>