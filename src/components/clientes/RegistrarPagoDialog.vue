<template>
  <q-card style="min-width: 500px; max-width: 600px">
    <q-card-section class="bg-blue text-white">
      <div class="text-h6">
        <q-icon name="payments" class="q-mr-sm" />
        Registrar Pago de Cliente
      </div>
      <div class="text-caption" v-if="cliente">
        {{ cliente.nombre }} • Deuda: ${{ formatPrecio(saldoPendiente) }}
      </div>
    </q-card-section>
    
    <q-card-section class="q-pt-md">
      <q-form @submit="registrarPago" class="q-gutter-md">
        <!-- MONTO -->
        <q-input
          v-model.number="formPago.monto"
          label="Monto recibido *"
          type="number"
          min="0.01"
          :max="saldoPendiente"
          step="0.01"
          prefix="$"
          outlined
          dense
          autofocus
          :rules="[
            val => !!val || 'El monto es obligatorio',
            val => val > 0 || 'El monto debe ser mayor a 0',
            val => val <= saldoPendiente || `No puede exceder la deuda de $${formatPrecio(saldoPendiente)}`
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
        
        <!-- FACTURA ASOCIADA (opcional) -->
        <q-select
          v-model="formPago.facturaId"
          :options="facturasPendientes"
          label="Aplicar a factura"
          outlined
          dense
          clearable
          hint="Selecciona una factura específica (opcional)"
        >
          <template v-slot:prepend>
            <q-icon name="receipt" />
          </template>
        </q-select>
        
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
        
        <!-- RESUMEN -->
        <q-card flat class="bg-grey-2 q-pa-sm">
          <div class="row items-center">
            <div class="col">
              <div class="text-caption">Deuda anterior:</div>
              <div class="text-h6 text-red">${{ formatPrecio(saldoPendiente) }}</div>
            </div>
            <div class="col-auto text-center">
              <q-icon name="arrow_forward" size="lg" color="grey" />
            </div>
            <div class="col">
              <div class="text-caption">Nueva deuda:</div>
              <div class="text-h6" :class="nuevoSaldo > 0 ? 'text-orange' : 'text-green'">
                ${{ formatPrecio(nuevoSaldo) }}
              </div>
              <div v-if="nuevoSaldo === 0" class="text-caption text-green">
                🎉 ¡Cliente al día!
              </div>
            </div>
          </div>
        </q-card>
        
        <!-- BOTONES -->
        <div class="row q-mt-lg">
          <q-space />
          <q-btn flat label="Cancelar" color="grey" @click="$emit('cancelar')" />
          <q-btn 
            label="Registrar Pago" 
            color="primary" 
            type="submit"
            :loading="guardando"
            :disable="!formPago.monto || !formPago.metodo"
            icon="check_circle"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'boot/firebase'
import { 
  addDoc, 
  collection, 
  serverTimestamp, 
  updateDoc, 
  doc,
  query,
  where,
  getDocs 
} from 'firebase/firestore'

const $q = useQuasar()
const emit = defineEmits(['pago-registrado', 'cancelar'])

const props = defineProps({
  cliente: {
    type: Object,
    default: null
  }
})

const guardando = ref(false)
const facturas = ref([])

const metodosPago = [
  { label: '💰 Efectivo', value: 'efectivo' },
  { label: '🏦 Transferencia Bancaria', value: 'transferencia' },
  { label: '📄 Cheque', value: 'cheque' },
  { label: '💳 Tarjeta de Crédito/Débito', value: 'tarjeta' },
  { label: '📱 Pago Móvil', value: 'movil' },
  { label: '💎 Otro', value: 'otro' }
]

const formPago = ref({
  monto: 0,
  metodo: 'efectivo',
  referencia: '',
  facturaId: null,
  fecha: new Date().toISOString().split('T')[0],
  observaciones: ''
})

// Computadas
const saldoPendiente = computed(() => {
  return props.cliente?.saldoPendiente || 
         props.cliente?.deuda || 
         props.cliente?.estadoCuenta?.saldo || 0
})

const nuevoSaldo = computed(() => {
  return Math.max(0, saldoPendiente.value - (formPago.value.monto || 0))
})

const facturasPendientes = computed(() => {
  return facturas.value
    .filter(factura => factura.saldoPendiente > 0)
    .map(factura => ({
      label: `Factura #${factura.numero || factura.id} - $${formatPrecio(factura.saldoPendiente)}`,
      value: factura.id,
      factura
    }))
})

// Métodos
const cargarFacturas = async () => {
  if (!props.cliente || !db) return
  
  try {
    const facturasRef = collection(db, 'facturas')
    const q = query(facturasRef, where('clienteId', '==', props.cliente.id))
    const querySnapshot = await getDocs(q)
    
    facturas.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error cargando facturas:', error)
  }
}

const registrarPago = async () => {
  if (!props.cliente) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona un cliente primero'
    })
    return
  }
  
  guardando.value = true
  
  try {
    const pagoData = {
      clienteId: props.cliente.id,
      clienteNombre: props.cliente.nombre,
      monto: Number(formPago.value.monto),
      metodo: formPago.value.metodo,
      referencia: formPago.value.referencia?.trim() || null,
      facturaId: formPago.value.facturaId || null,
      fecha: formPago.value.fecha || new Date().toISOString().split('T')[0],
      observaciones: formPago.value.observaciones?.trim() || null,
      estado: 'completado',
      fechaRegistro: serverTimestamp(),
      registradoPor: 'admin',
      saldoAnterior: saldoPendiente.value,
      nuevoSaldo: nuevoSaldo.value,
      tipo: 'abono_cliente'
    }
    
    // En modo demostración
    if (!db) {
      console.log('📋 Modo demostración: Registrando pago de cliente', pagoData)
      
      $q.notify({
        type: 'positive',
        message: '✅ Pago registrado (modo demostración)',
        caption: `Cliente: ${props.cliente.nombre}`,
        timeout: 3000
      })
      
      emit('pago-registrado')
      return
    }
    
    // Guardar en Firestore
    const pagosRef = collection(db, 'pagos_clientes')
    await addDoc(pagosRef, pagoData)
    
    // Actualizar saldo del cliente
    if (props.cliente.id) {
      const clienteRef = doc(db, 'clientes', props.cliente.id)
      await updateDoc(clienteRef, {
        saldoPendiente: nuevoSaldo.value,
        ultimoPago: serverTimestamp(),
        totalPagado: (props.cliente.totalPagado || 0) + pagoData.monto,
        updatedAt: serverTimestamp()
      })
    }
    
    // Si hay factura específica, actualizarla
    if (formPago.value.facturaId) {
      const facturaRef = doc(db, 'facturas', formPago.value.facturaId)
      const factura = facturas.value.find(f => f.id === formPago.value.facturaId)
      
      if (factura) {
        const nuevoSaldoFactura = Math.max(0, (factura.saldoPendiente || factura.total) - pagoData.monto)
        
        await updateDoc(facturaRef, {
          saldoPendiente: nuevoSaldoFactura,
          estado: nuevoSaldoFactura === 0 ? 'pagada' : 'parcial',
          ultimoPago: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }
    }
    
    $q.notify({
      type: 'positive',
      message: '✅ Pago registrado exitosamente',
      caption: `Se ha registrado pago de ${props.cliente.nombre}`,
      icon: 'check_circle',
      timeout: 3000
    })
    
    emit('pago-registrado')
    
  } catch (error) {
    console.error('❌ Error registrando pago:', error)
    $q.notify({
      type: 'negative',
      message: '❌ Error al registrar el pago',
      caption: error.message || 'Intenta de nuevo'
    })
  } finally {
    guardando.value = false
  }
}

const formatPrecio = (precio) => {
  return new Intl.NumberFormat('es-CO').format(precio || 0)
}

// Inicializar
onMounted(() => {
  if (props.cliente) {
    // Establecer monto sugerido como el saldo pendiente
    formPago.value.monto = saldoPendiente.value
    cargarFacturas()
  }
})
</script>

<style scoped>
.q-card {
  border-radius: 12px;
}
</style>