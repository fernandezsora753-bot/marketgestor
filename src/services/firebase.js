import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// 🔥 REEMPLAZA ESTOS VALORES CON LOS TUOS DE FIREBASE CONSOLE 🔥
const firebaseConfig = {
  apiKey: "AIzaSyCrbPlt0FdekVjMwLrqB9tJG-wiPP9UNxM",
  authDomain: "market-gestor.firebaseapp.com",
  databaseURL: "https://market-gestor-default-rtdb.firebaseio.com",
  projectId: "market-gestor",
  storageBucket: "market-gestor.firebasestorage.app",
  messagingSenderId: "742746406726",
  appId: "1:742746406726:web:6d46f03a7c3103e03c2f47"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Exportar servicios
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app

console.log('✅ Firebase MarketGestor CONECTADO')