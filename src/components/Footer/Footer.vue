<template>
  <v-footer color="#fff" app id="footer">
    <v-container>
        <v-divider class="mb-8"></v-divider>
      <v-row>
        <!-- Ubicaciones -->
        <v-col cols="12" md="4">
          <h3 class="font-weight-bold">Ubicaciones</h3>
          <div class="mt-2">Sucursal Norte<br><span>912 West Birkin Boulevard, Raccoon City, RC 50214</span></div>
          <div class="mt-2">Sucursal Centro<br><span>300 Spencer Lane, Medical District, Raccoon City, RC 50211</span></div>
          <div class="mt-2">Sucursal Sur<br><span>77 Cain Street, Central District, Raccoon City, RC 50209</span></div>
        </v-col>

        <!-- Divider -->
        <v-divider vertical class="mx-4 d-none d-md-flex"></v-divider>

        <!-- Proveedores -->
        <v-col cols="12" md="3">
          <h3 class="font-weight-bold">Proveedores</h3>
          <div>Acceso a profesionales</div>
          <div>Trabaja con nosotros</div>
        </v-col>

        <!-- Divider -->
        <v-divider vertical class="mx-4 d-none d-md-flex"></v-divider>

        <!-- Otros enlaces -->
        <v-col cols="12" md="4">
          <h3 class="font-weight-bold">Reclamos</h3>
          <div>Felicitaciones</div>
          <div>Sugerencias</div>
          <div>Aranceles</div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" class="text-center mt-6" style="color:#C73636;">
          &copy; 2025 Clínica Umbrella. Todos los derechos reservados.
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>