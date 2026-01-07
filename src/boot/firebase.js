import { boot } from 'quasar/wrappers'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCrbPlt0FdekVjMwLrqB9tJG-wiPP9UNxM",
  authDomain: "market-gestor.firebaseapp.com",
  databaseURL: "https://market-gestor-default-rtdb.firebaseio.com",
  projectId: "market-gestor",
  storageBucket: "market-gestor.firebasestorage.app",
  messagingSenderId: "742746406726",
  appId: "1:742746406726:web:6d46f03a7c3103e03c2f47"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

console.log('✅ Firebase MarketGestor CONECTADO')

export default boot(() => {
  // Firebase ya está inicializado
})

export { app, auth, db }