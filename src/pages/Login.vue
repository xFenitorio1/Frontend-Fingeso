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
        const params = new URLSearchParams();
        params.append("correo", this.email);
        params.append("password", this.password);

        fetch("http://localhost:8080/api/paciente/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params,
        })
        .then(res => res.json())
        .then(success => {
            if (success) {
                localStorage.setItem('rol', 'paciente');
                this.$router.push({ path: '/' });
            } else {
                alert("Correo o contraseña incorrectos");
            }
        })
        .catch(err => console.error(err));
        }
    }
};
</script>