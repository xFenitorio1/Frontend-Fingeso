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
    const payload = {
        correo: this.email,
        password: this.password
    };

fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        correo: this.email,
        password: this.password
    }),
})
.then(res => {
    console.log("Status de respuesta:", res.status);
    if (!res.ok) {
        return res.text().then(text => {
            console.error("Respuesta del servidor:", res.status, text);
            throw new Error("Error en el login");
        });
    }
    return res.json();
})
.then(data => {
        console.log("Respuesta JSON recibida:", data);
    if (data && data.userType) {
        const rol = data.userType.toLowerCase();
        localStorage.setItem('rol', rol);
        this.$router.push({ path: '/' });
    } else {
        alert("Correo o contraseña incorrectos");
    }
})
.catch(err => {
    console.error("Detalles del error:", err);
    alert("Error al iniciar sesión");
});

}
    }
};
</script>