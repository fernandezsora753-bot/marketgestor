'EOF'
<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="register-card q-pa-lg" style="width: 100%; max-width: 400px;">
      <q-card-section class="text-center">
        <div class="text-h4 text-primary q-mb-sm">
          🛒 MarketGestor
        </div>
        <div class="text-subtitle1 text-grey-7">
          Crea tu cuenta gratuita
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleRegister" class="q-gutter-y-md">
          <!-- Email -->
          <q-input
            v-model="form.email"
            label="Correo electrónico"
            type="email"
            outlined
            dense
            :rules="[
              val => !!val || 'El email es requerido',
              val => /.+@.+\..+/.test(val) || 'Email inválido'
            ]"
            lazy-rules
          />

          <!-- Password -->
          <q-input
            v-model="form.password"
            label="Contraseña"
            :type="showPassword ? 'text' : 'password'"
            outlined
            dense
            :rules="[
              val => !!val || 'La contraseña es requerida',
              val => val.length >= 6 || 'Mínimo 6 caracteres'
            ]"
          >
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <!-- Confirm Password -->
          <q-input
            v-model="form.confirmPassword"
            label="Confirmar Contraseña"
            :type="showConfirmPassword ? 'text' : 'password'"
            outlined
            dense
            :rules="[
              val => !!val || 'Confirma tu contraseña',
              val => val === form.password || 'Las contraseñas no coinciden'
            ]"
          >
            <template v-slot:append>
              <q-icon
                :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </q-input>

          <!-- Términos -->
          <q-checkbox
            v-model="form.acceptTerms"
            label="Acepto los términos y condiciones"
            :rules="[val => !!val || 'Debes aceptar los términos']"
          />

          <!-- Botón Registro -->
          <q-btn
            type="submit"
            label="Crear Cuenta"
            color="primary"
            class="full-width q-mt-md"
            :loading="loading"
          />

          <!-- Enlace a Login -->
          <div class="text-center q-mt-md">
            <router-link to="/login" class="text-primary text-weight-medium">
              ¿Ya tienes cuenta? Inicia sesión
            </router-link>
          </div>
        </q-form>
      </q-card-section>

      <!-- Info registro -->
      <q-card-section class="text-center q-pt-none">
        <q-separator class="q-mb-md" />
        <div class="text-caption text-grey-6">
          <strong>Nota:</strong> Tu cuenta será de prueba por 30 días
        </div>
      </q-card-section>
    </q-card>

    <!-- Notificaciones -->
    <q-dialog v-model="showError" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Error en registro</div>
        </q-card-section>
        <q-card-section>
          {{ errorMessage }}
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const $q = useQuasar()
const { register } = useAuth()

// Estado del formulario
const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const showError = ref(false)
const errorMessage = ref('')

// Manejar registro
const handleRegister = async () => {
  loading.value = true
  
  const result = await register(form.email, form.password)
  
  if (result.success) {
    $q.notify({
      type: 'positive',
      message: `¡Cuenta creada para ${result.user.email}!`,
      position: 'top'
    })
    router.push('/')
  } else {
    // Manejar errores comunes
    let message = 'Error al crear cuenta'
    if (result.code === 'auth/email-already-in-use') {
      message = 'Este email ya está registrado'
    } else if (result.code === 'auth/weak-password') {
      message = 'Contraseña muy débil (mínimo 6 caracteres)'
    } else if (result.code === 'auth/invalid-email') {
      message = 'Email inválido'
    } else {
      message = result.error
    }
    
    errorMessage.value = message
    showError.value = true
  }
  
  loading.value = false
}
</script>

<style scoped>
.register-card {
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}
</style>
EOF