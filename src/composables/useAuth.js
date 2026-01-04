'EOF'
import { ref, computed } from 'vue'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '../services/firebase'

// Estado global del usuario
const user = ref(null)
const loading = ref(true)

// Escuchar cambios en autenticación
onAuthStateChanged(auth, (currentUser) => {
  user.value = currentUser
  loading.value = false
  console.log('Usuario actual:', currentUser?.email)
})

export function useAuth() {
  // Login con email/password
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: userCredential.user }
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        code: error.code 
      }
    }
  }

  // Registrar nuevo usuario
  const register = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      return { success: true, user: userCredential.user }
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        code: error.code 
      }
    }
  }

  // Cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const currentUser = computed(() => user.value)

  return {
    // Estado
    user,
    loading,
    
    // Computed
    isAuthenticated,
    currentUser,
    
    // Métodos
    login,
    register,
    logout
  }
}
EOF