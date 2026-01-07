'EOF'
<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Prueba de Firebase</div>
        <div v-if="firebaseReady" class="text-positive">
          ✅ Firebase conectado correctamente
        </div>
        <div v-else class="text-negative">
          ❌ Error en conexión Firebase
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { auth, db } from 'boot/firebase'

const firebaseReady = ref(false)

onMounted(async () => {
  try {
    // Intenta acceder a Firebase
    console.log('Probando Firebase...')
    console.log('Auth:', auth)
    console.log('Firestore:', db)
    
    firebaseReady.value = true
    console.log('✅ Firebase funciona perfectamente')
  } catch (error) {
    console.error('❌ Error en Firebase:', error)
  }
})
</script>
EOF