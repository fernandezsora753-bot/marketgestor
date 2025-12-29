// ============================================
// COMPOSABLE DE AUTENTICACIÓN
// ============================================
// Maneja login, logout, registro y estado del usuario

import { ref, onMounted } from 'vue'
import { auth } from '../services/firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { useRouter } from 'vue-router'

export function useAuth() {
  const router = useRouter()
  
  // Estado reactivo del usuario actual
  const user = ref(null)
  const loading = ref(true)

  // ========== LOGIN ==========
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      return { success: true }
    } catch (error) {
      console.error('Error en login:', error)
      return { 
        success: false, 
        error: translateError(error.code) 
      }
    }
  }

  // ========== REGISTRO ==========
  const register = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      return { success: true }
    } catch (error) {
      console.error('Error en registro:', error)
      return { 
        success: false, 
        error: translateError(error.code) 
      }
    }
  }

  // ========== LOGOUT ==========
  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null
      router.push('/login')
      return { success: true }
    } catch (error) {
      console.error('Error en logout:', error)
      return { success: false, error: error.message }
    }
  }

  // ========== OBSERVAR CAMBIOS DE AUTENTICACIÓN ==========
  // Esto se ejecuta cada vez que el usuario inicia/cierra sesión
  const initAuth = () => {
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser
      loading.value = false
    })
  }

  // ========== TRADUCIR ERRORES DE FIREBASE ==========
  const translateError = (errorCode) => {
    const errors = {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'Este correo ya está registrado',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/invalid-email': 'Correo electrónico inválido'
    }
    return errors[errorCode] || 'Error desconocido'
  }

  // Inicializar al montar el composable
  onMounted(() => {
    initAuth()
  })

  return {
    user,
    loading,
    login,
    register,
    logout,
    initAuth
  }
}