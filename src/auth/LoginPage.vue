<template>
  <!-- ============================================ -->
  <!-- PÁGINA DE LOGIN / REGISTRO -->
  <!-- ============================================ -->
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="login-card q-pa-md" style="width: 100%; max-width: 400px;">
      
      <!-- Logo / Icono -->
      <q-card-section class="text-center">
        <q-icon name="store" size="64px" color="primary" />
        <div class="text-h5 q-mt-sm text-weight-bold">Mi Negocio</div>
        <div class="text-caption text-grey-7">
          Gestiona tu negocio fácilmente
        </div>
      </q-card-section>

      <!-- Pestañas: Login / Registro -->
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-tab name="login" label="Iniciar Sesión" />
        <q-tab name="register" label="Registrarse" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        
        <!-- ========== PANEL DE LOGIN ========== -->
        <q-tab-panel name="login">
          <q-form @submit="handleLogin" class="q-gutter-md">
            <!-- Email -->
            <q-input
              v-model="loginForm.email"
              label="Correo electrónico"
              type="email"
              outlined
              :rules="[val => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <!-- Password -->
            <q-input
              v-model="loginForm.password"
              label="Contraseña"
              :type="showPassword ? 'text' : 'password'"
              outlined
              :rules="[val => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <!-- Botón de Login -->
            <q-btn
              type="submit"
              label="Iniciar Sesión"
              color="primary"
              class="full-width"
              size="md"
              :loading="loading"
            />
          </q-form>
        </q-tab-panel>

        <!-- ========== PANEL DE REGISTRO ========== -->
        <q-tab-panel name="register">
          <q-form @submit="handleRegister" class="q-gutter-md">
            <!-- Email -->
            <q-input
              v-model="registerForm.email"
              label="Correo electrónico"
              type="email"
              outlined
              :rules="[val => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <!-- Password -->
            <q-input
              v-model="registerForm.password"
              label="Contraseña"
              :type="showPassword ? 'text' : 'password'"
              outlined
              :rules="[
                val => !!val || 'Campo requerido',
                val => val.length >= 6 || 'Mínimo 6 caracteres'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <!-- Confirmar Password -->
            <q-input
              v-model="registerForm.confirmPassword"
              label="Confirmar contraseña"
              :type="showPassword ? 'text' : 'password'"
              outlined
              :rules="[
                val => !!val || 'Campo requerido',
                val => val === registerForm.password || 'Las contraseñas no coinciden'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
            </q-input>

            <!-- Botón de Registro -->
            <q-btn
              type="submit"
              label="Registrarse"
              color="primary"
              class="full-width"
              size="md"
              :loading="loading"
            />
          </q-form>
        </q-tab-panel>

      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useQuasar } from 'quasar'

// ========== INSTANCIAS ==========
const router = useRouter()
const $q = useQuasar()
const { login, register } = useAuth()

// ========== ESTADO ==========
const tab = ref('login') // Pestaña activa: 'login' o 'register'
const showPassword = ref(false) // Mostrar/ocultar contraseña
const loading = ref(false)

// Formulario de login
const loginForm = ref({
  email: '',
  password: ''
})

// Formulario de registro
const registerForm = ref({
  email: '',
  password: '',
  confirmPassword: ''
})

// ========== MÉTODOS ==========

// Manejar login
const handleLogin = async () => {
  loading.value = true
  
  const result = await login(loginForm.value.email, loginForm.value.password)
  
  loading.value = false
  
  if (result.success) {
    $q.notify({
      message: '¡Bienvenido de nuevo!',
      color: 'positive',
      icon: 'check_circle',
      position: 'top'
    })
    router.push('/')
  } else {
    $q.notify({
      message: result.error,
      color: 'negative',
      icon: 'error',
      position: 'top'
    })
  }
}

// Manejar registro
const handleRegister = async () => {
  loading.value = true
  
  const result = await register(registerForm.value.email, registerForm.value.password)
  
  loading.value = false
  
  if (result.success) {
    $q.notify({
      message: '¡Cuenta creada exitosamente!',
      color: 'positive',
      icon: 'check_circle',
      position: 'top'
    })
    router.push('/')
  } else {
    $q.notify({
      message: result.error,
      color: 'negative',
      icon: 'error',
      position: 'top'
    })
  }
}
</script>

<style scoped>
.login-card {
  border-radius: 16px;
}
</style>