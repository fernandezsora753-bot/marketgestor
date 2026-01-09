<template>
  <q-dialog v-model="mostrarDialogo" persistent>
    <q-card style="min-width: 500px; max-width: 600px">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">
          <q-icon name="payments" class="q-mr-sm" />
          Realizar Pago
        </div>
        <div v-if="cliente" class="text-caption">
          Cliente: {{ cliente.nombre }} • Saldo: ${{ formatPrecio(cliente.saldo || 0) }}
        </div>
      </q-card-section>
      
      <q-card-section class="q-pt-md">
        <q-form @submit="procesarPago" class="q-gutter-md">
          <!-- MONTO -->
          <q-input
            v-model.number="formPago.monto"
            label="Monto *"
            type="number"
            min="0.01"
            prefix="$"
            outlined
            dense
            autofocus
            :rules="[
              val => !!val || 'El monto es obligatorio',
              val => val > 0 || 'El monto debe ser mayor a 0'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="attach_money" />
            </template>
          </q-input>
          
          <!-- MÉTODO DE PAGO -->
          <q-select
            v-model="formPago.metodo"
            :options="metodosPago"
            label="Método de pago *"
            outlined
            dense
            :rules="[val => !!val || 'Selecciona un método de pago']"
          >
            <template v-slot:prepend>
              <q-icon name="payment" />
            </template>
          </q-select>
          
          <!-- REFERENCIA -->
          <q-input
            v-model="formPago.referencia"
            label="Referencia/Número"
            outlined
            dense
            hint="N° de transacción, cheque, comprobante, etc."
            v-if="formPago.metodo !== 'efectivo'"
          >
            <template v-slot:prepend>
              <q-icon name="badge" />
            </template>
          </q-input>
          
          <!-- FECHA -->
          <q-input
            v-model="formPago.fecha"
            label="Fecha del pago"
            type="date"
            outlined
            dense
          >
            <template v-slot:prepend>
              <q-icon name="calendar_month" />
            </template>
          </q-input>
          
          <!-- OBSERVACIONES -->
          <q-input
            v-model="formPago.observaciones"
            label="Observaciones"
            type="textarea"
            rows="2"
            outlined
            dense
            hint="Detalles adicionales del pago"
          >
            <template v-slot:prepend>
              <q-icon name="note" />
            </template>
          </q-input>
          
          <!-- BOTONES -->
          <div class="row q-mt-lg">
            <q-space />
            <q-btn flat label="Cancelar" color="grey" @click="cerrar" />
            <q-btn 
              label="Registrar Pago" 
              color="primary" 
              type="submit"
              :loading="procesando"
              :disable="!formPago.monto || !formPago.metodo"
              icon="check_circle"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const emit = defineEmits(['cerrar', 'pago-registrado'])

const props = defineProps({
  cliente: {
    type: Object,
    default: null
  },
  mostrar: {
    type: Boolean,
    default: false
  }
})

const procesando = ref(false)
const mostrarDialogo = ref(props.mostrar)

const metodosPago = [
  { label: '💰 Efectivo', value: 'efectivo' },
  { label: '🏦 Transferencia Bancaria', value: 'transferencia' },
  { label: '💳 Tarjeta de Crédito/Débito', value: 'tarjeta' },
  { label: '📄 Cheque', value: 'cheque' },
  { label: '📱 Pago Móvil', value: 'movil' }
]

const formPago = ref({
  monto: 0,
  metodo: 'efectivo',
  referencia: '',
  fecha: new Date().toISOString().split('T')[0],
  observaciones: ''
})

// Métodos
const procesarPago = async () => {
  procesando.value = true
  
  try {
    const pagoData = {
      ...formPago.value,
      clienteId: props.cliente?.id,
      clienteNombre: props.cliente?.nombre,
      monto: Number(formPago.value.monto),
      fechaRegistro: new Date().toISOString()
    }
    
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    $q.notify({
      type: 'positive',
      message: '✅ Pago registrado exitosamente',
      icon: 'check_circle',
      timeout: 3000
    })
    
    emit('pago-registrado', pagoData)
    cerrar()
    
  } catch (error) {
    console.error('Error registrando pago:', error)
    $q.notify({
      type: 'negative',
      message: '❌ Error al registrar el pago',
      caption: error.message || 'Intenta de nuevo'
    })
  } finally {
    procesando.value = false
  }
}

const cerrar = () => {
  mostrarDialogo.value = false
  emit('cerrar')
}

const formatPrecio = (precio) => {
  return new Intl.NumberFormat('es-CO').format(precio || 0)
}

// Inicializar
onMounted(() => {
  if (props.cliente?.saldo) {
    formPago.value.monto = props.cliente.saldo
  }
})

// Watch para prop mostrar
import { watch } from 'vue'
watch(() => props.mostrar, (val) => {
  mostrarDialogo.value = val
})
</script>
