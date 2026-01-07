<template>
  <q-dialog v-model="dialogoVisible" persistent>
    <q-card style="min-width: 500px; max-width: 700px">
      <q-card-section class="bg-positive text-white">
        <div class="text-h6">
          <q-icon name="payments" class="q-mr-sm" />
          {{ tituloDialogo }}
        </div>
        <div class="text-caption">
          {{ subtituloDialogo }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-md">
        <q-form @submit="registrarPago" class="q-gutter-md">
          <!-- INFORMACIÓN DEL CLIENTE -->
          <div v-if="clienteInfo" class="q-pa-sm bg-grey-2 rounded-borders">
            <div class="row items-center">
              <div class="col">
                <div class="text-subtitle1 text-weight-bold">{{ clienteInfo.nombre }}</div>
                <div v-if="clienteInfo.telefono || clienteInfo.whatsapp" class="text-caption">
                  📞 {{ clienteInfo.telefono || clienteInfo.whatsapp }}
                </div>
              </div>
              <div class="col-auto">
                <q-chip v-if="clienteInfo.credito" color="orange" text-color="white" icon="credit_card">
                  Límite: ${{ formatPrecio(clienteInfo.limiteCredito || 0) }}
                </q-chip>
              </div>
            </div>
          </div>

          <!-- INFORMACIÓN DE LA VENTA (si aplica) -->
          <div v-if="ventaSeleccionada" class="q-pa-sm bg-blue-1 rounded-borders">
            <div class="text-subtitle2 text-weight-medium">📋 Venta asociada</div>
            <div class="row items-center q-mt-xs">
              <div class="col">
                <div class="text-caption">
                  <strong>Total:</strong> ${{ formatPrecio(ventaSeleccionada.total) }}
                </div>
                <div class="text-caption">
                  <strong>Saldo pendiente:</strong> 
                  <span class="text-negative text-weight-bold">
                    ${{ formatPrecio(ventaSeleccionada.saldoPendiente) }}
                  </span>
                </div>
              </div>
              <div class="col-auto">
                <q-badge :color="getColorEstado(ventaSeleccionada)" class="q-pa-xs">
                  {{ ventaSeleccionada.estado }}
                </q-badge>
              </div>
            </div>
          </div>

          <!-- TIPO DE PAGO -->
          <div class="text-subtitle1 text-weight-medium q-pt-md">💳 Tipo de Pago</div>
          
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="formPago.metodoPago"
                :options="metodosPago"
                label="Método de pago *"
                outlined
                dense
                emit-value
                map-options
                :rules="[val => !!val || 'Selecciona un método de pago']"
              >
                <template v-slot:prepend>
                  <q-icon name="account_balance_wallet" />
                </template>
              </q-select>
            </div>
          </div>

          <!-- MONTO A PAGAR -->
          <div class="text-subtitle1 text-weight-medium q-pt-md">💰 Monto</div>
          
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model.number="formPago.monto"
                label="Monto a pagar *"
                outlined
                dense
                type="number"
                prefix="$"
                hint="Monto que el cliente está pagando"
                :rules="[
                  val => !!val || 'Ingresa el monto',
                  val => val > 0 || 'El monto debe ser mayor a 0',
                  val => val <= montoMaximo || `Máximo: $${formatPrecio(montoMaximo)}`
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_money" />
                </template>
                <template v-slot:append>
                  <q-btn 
                    flat 
                    dense 
                    label="Pagar todo"
                    color="primary"
                    @click="pagarTodo"
                    v-if="montoPendiente > 0"
                  />
                </template>
              </q-input>
              
              <!-- BARRA DE PROGRESO -->
              <div v-if="montoPendiente > 0" class="q-mt-sm">
                <div class="row items-center">
                  <div class="col">
                    <q-linear-progress 
                      :value="porcentajePagado"
                      :color="getColorProgreso(porcentajePagado)"
                      class="q-mt-sm"
                    />
                  </div>
                  <div class="col-auto text-caption">
                    {{ Math.round(porcentajePagado * 100) }}% pagado
                  </div>
                </div>
                <div class="text-caption text-center q-mt-xs">
                  <span class="text-grey">Pendiente:</span>
                  <span class="text-weight-bold"> ${{ formatPrecio(montoPendiente) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- REFERENCIA/COMPROBANTE -->
          <div v-if="necesitaReferencia" class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="formPago.referencia"
                :label="`Referencia ${formPago.metodoPago}`"
                outlined
                dense
                :hint="getHintReferencia()"
                :rules="[val => val && val.trim() ? true : 'Ingresa la referencia']"
              >
                <template v-slot:prepend>
                  <q-icon name="receipt" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- FECHA DEL PAGO -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="formPago.fechaPago"
                label="Fecha del pago"
                outlined
                dense
                type="date"
                :rules="[val => !!val || 'Selecciona la fecha']"
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_month" />
                </template>
              </q-input>
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="formPago.horaPago"
                label="Hora del pago"
                outlined
                dense
                type="time"
              >
                <template v-slot:prepend>
                  <q-icon name="schedule" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- OBSERVACIONES -->
          <div class="text-subtitle1 text-weight-medium q-pt-md">📝 Observaciones</div>
          
          <q-input
            v-model="formPago.observaciones"
            label="Notas adicionales"
            outlined
            dense
            type="textarea"
            rows="3"
            hint="Ej: Pago parcial, anticipo, etc."
            autogrow
          >
            <template v-slot:prepend>
              <q-icon name="note" />
            </template>
          </q-input>

          <!-- RESUMEN DEL PAGO -->
          <q-card class="bg-grey-1 q-mt-md">
            <q-card-section>
              <div class="text-subtitle2 text-weight-medium">📊 Resumen del Pago</div>
              <div class="row q-mt-sm">
                <div class="col text-caption">Monto a pagar:</div>
                <div class="col-auto text-weight-bold">${{ formatPrecio(formPago.monto || 0) }}</div>
              </div>
              <div class="row q-mt-xs" v-if="montoPendiente > 0">
                <div class="col text-caption">Saldo después del pago:</div>
                <div class="col-auto" :class="saldoDespuesPago > 0 ? 'text-orange text-weight-bold' : 'text-positive text-weight-bold'">
                  ${{ formatPrecio(saldoDespuesPago) }}
                </div>
              </div>
              <div v-if="saldoDespuesPago === 0" class="text-center q-mt-sm">
                <q-badge color="positive" class="q-pa-xs">
                  ✅ ¡La venta quedará totalmente pagada!
                </q-badge>
              </div>
            </q-card-section>
          </q-card>

          <!-- BOTONES -->
          <div class="row q-mt-lg">
            <q-space />
            <q-btn flat label="Cancelar" color="grey" @click="cerrarDialogo" />
            <q-btn 
              label="Registrar Pago" 
              color="positive" 
              type="submit"
              :loading="registrando"
              :disable="!formPago.metodoPago || !formPago.monto || formPago.monto <= 0"
              icon="check_circle"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'boot/firebase'
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore'

const $q = useQuasar()

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  ventaSeleccionada: {
    type: Object,
    default: null
  },
  clienteSeleccionado: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'pago-registrado'])

// Datos reactivos
const dialogoVisible = ref(false)
const registrando = ref(false)
const clienteInfo = ref(null)
const ventaInfo = ref(null)

// Formulario
const formPago = ref({
  metodoPago: 'efectivo',
  monto: 0,
  referencia: '',
  fechaPago: new Date().toISOString().split('T')[0],
  horaPago: new Date().toTimeString().slice(0, 5),
  observaciones: ''
})

// Métodos de pago disponibles
const metodosPago = [
  { label: '💵 Efectivo', value: 'efectivo' },
  { label: '🏦 Transferencia', value: 'transferencia' },
  { label: '💳 Tarjeta Débito/Crédito', value: 'tarjeta' },
  { label: '📱 Nequi', value: 'nequi' },
  { label: '📱 DaviPlata', value: 'daviplata' },
  { label: '📱 Bancolombia a la Mano', value: 'bancolombia' },
  { label: '✏️ Cheque', value: 'cheque' },
  { label: '🔄 Otro', value: 'otro' }
]

// Computadas
const tituloDialogo = computed(() => {
  if (props.ventaSeleccionada) {
    return 'Registrar Pago de Venta'
  } else if (props.clienteSeleccionado) {
    return 'Registrar Pago de Cliente'
  }
  return 'Registrar Nuevo Pago'
})

const subtituloDialogo = computed(() => {
  if (props.ventaSeleccionada) {
    return 'Registra un pago para esta venta específica'
  } else if (props.clienteSeleccionado) {
    return 'Registra un pago general para este cliente'
  }
  return 'Selecciona un cliente o venta para registrar el pago'
})

const necesitaReferencia = computed(() => {
  return ['transferencia', 'nequi', 'daviplata', 'bancolombia', 'cheque'].includes(formPago.value.metodoPago)
})

const montoPendiente = computed(() => {
  if (props.ventaSeleccionada) {
    return props.ventaSeleccionada.saldoPendiente || 0
  }
  
  // Si es pago por cliente, obtener deudas totales
  if (clienteInfo.value && clienteInfo.value.saldoActual) {
    return clienteInfo.value.saldoActual
  }
  
  return 0
})

const montoMaximo = computed(() => {
  // No permitir pagar más de lo que se debe
  return montoPendiente.value
})

const porcentajePagado = computed(() => {
  if (montoPendiente.value <= 0) return 1
  const pagado = props.ventaSeleccionada ? 
    (props.ventaSeleccionada.total - props.ventaSeleccionada.saldoPendiente) : 0
  return (pagado + (formPago.value.monto || 0)) / (pagado + montoPendiente.value)
})

const saldoDespuesPago = computed(() => {
  return montoPendiente.value - (formPago.value.monto || 0)
})

// Watchers
watch(() => props.modelValue, (val) => {
  dialogoVisible.value = val
  if (val) {
    inicializarDialogo()
  }
})

watch(dialogoVisible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    resetForm()
  }
})

watch(() => props.ventaSeleccionada, (val) => {
  if (val) {
    cargarDatosVenta(val)
    if (val.saldoPendiente > 0) {
      formPago.value.monto = Math.min(100000, val.saldoPendiente)
    }
  }
})

watch(() => props.clienteSeleccionado, (val) => {
  if (val) {
    clienteInfo.value = { ...val }
    // Aquí podrías cargar las deudas totales del cliente
  }
})

// Métodos
const inicializarDialogo = async () => {
  if (props.ventaSeleccionada) {
    await cargarDatosVenta(props.ventaSeleccionada)
  } else if (props.clienteSeleccionado) {
    clienteInfo.value = { ...props.clienteSeleccionado }
  }
}

const cargarDatosVenta = async (venta) => {
  ventaInfo.value = { ...venta }
  
  // Si la venta tiene clienteId, cargar info del cliente
  if (venta.clienteId) {
    try {
      const clienteRef = doc(db, 'clientes', venta.clienteId)
      const clienteSnap = await getDoc(clienteRef)
      if (clienteSnap.exists()) {
        clienteInfo.value = { id: clienteSnap.id, ...clienteSnap.data() }
      }
    } catch (error) {
      console.log('⚠️ No se pudo cargar info del cliente:', error)
    }
  }
}

const getHintReferencia = () => {
  const hints = {
    transferencia: 'Número de transacción o referencia bancaria',
    nequi: 'Número de teléfono o referencia',
    daviplata: 'Número de teléfono o referencia',
    bancolombia: 'Referencia de pago',
    cheque: 'Número de cheque',
    tarjeta: 'Últimos 4 dígitos de la tarjeta'
  }
  return hints[formPago.value.metodoPago] || 'Número de referencia o comprobante'
}

const getColorEstado = (venta) => {
  if (venta.saldoPendiente === 0) return 'positive'
  if (venta.estado === 'pendiente') return 'negative'
  if (venta.estado === 'parcial') return 'orange'
  return 'info'
}

const getColorProgreso = (porcentaje) => {
  if (porcentaje >= 1) return 'positive'
  if (porcentaje >= 0.7) return 'light-green'
  if (porcentaje >= 0.4) return 'orange'
  return 'red'
}

const pagarTodo = () => {
  formPago.value.monto = montoPendiente.value
}

const registrarPago = async () => {
  if (!formPago.value.metodoPago || !formPago.value.monto || formPago.value.monto <= 0) {
    $q.notify({
      type: 'warning',
      message: 'Completa todos los campos requeridos'
    })
    return
  }

  if (formPago.value.monto > montoMaximo.value) {
    $q.notify({
      type: 'negative',
      message: `El monto no puede ser mayor a $${formatPrecio(montoMaximo.value)}`
    })
    return
  }

  registrando.value = true

  try {
    // Crear objeto de pago
    const fechaHora = new Date(`${formPago.value.fechaPago}T${formPago.value.horaPago}`)
    
    const pagoData = {
      clienteId: clienteInfo.value?.id || props.clienteSeleccionado?.id,
      clienteNombre: clienteInfo.value?.nombre || props.clienteSeleccionado?.nombre,
      ventaId: props.ventaSeleccionada?.id || null,
      monto: Number(formPago.value.monto),
      metodoPago: formPago.value.metodoPago,
      referencia: formPago.value.referencia.trim() || null,
      observaciones: formPago.value.observaciones.trim() || null,
      fecha: fechaHora,
      fechaRegistro: serverTimestamp(),
      saldoAnterior: montoPendiente.value,
      saldoNuevo: saldoDespuesPago.value,
      registradoPor: 'admin' // En producción: usuario actual
    }

    // En modo demostración
    if (!db) {
      console.log('📋 Modo demostración: Simulando registro de pago', pagoData)
      
      $q.notify({
        type: 'positive',
        message: '✅ Pago registrado (modo demostración)',
        caption: 'En producción se guardaría en Firestore',
        icon: 'check_circle',
        timeout: 3000
      })
      
      emit('pago-registrado')
      cerrarDialogo()
      return
    }

    // 1. Guardar el pago en Firestore
    const pagosRef = collection(db, 'pagos')
    await addDoc(pagosRef, pagoData)

    // 2. Actualizar la venta (si aplica)
    if (props.ventaSeleccionada) {
      const ventaRef = doc(db, 'ventas', props.ventaSeleccionada.id)
      const nuevoSaldo = props.ventaSeleccionada.saldoPendiente - formPago.value.monto
      
      await updateDoc(ventaRef, {
        saldoPendiente: nuevoSaldo,
        pagado: (props.ventaSeleccionada.pagado || 0) + formPago.value.monto,
        estado: nuevoSaldo > 0 ? 'parcial' : 'pagada',
        ultimoPago: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }

    // 3. Actualizar el cliente (si aplica)
    if (clienteInfo.value?.id) {
      const clienteRef = doc(db, 'clientes', clienteInfo.value.id)
      // Aquí podrías actualizar el saldo actual del cliente
      await updateDoc(clienteRef, {
        ultimoPago: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }

    $q.notify({
      type: 'positive',
      message: '✅ Pago registrado exitosamente',
      caption: `Monto: $${formatPrecio(formPago.value.monto)}`,
      icon: 'check_circle',
      timeout: 3000
    })

    emit('pago-registrado')
    cerrarDialogo()

  } catch (error) {
    console.error('❌ Error registrando pago:', error)
    
    $q.notify({
      type: 'negative',
      message: '❌ Error al registrar el pago',
      caption: error.message || 'Intenta de nuevo',
      icon: 'error'
    })
  } finally {
    registrando.value = false
  }
}

const cerrarDialogo = () => {
  dialogoVisible.value = false
  resetForm()
}

const resetForm = () => {
  formPago.value = {
    metodoPago: 'efectivo',
    monto: 0,
    referencia: '',
    fechaPago: new Date().toISOString().split('T')[0],
    horaPago: new Date().toTimeString().slice(0, 5),
    observaciones: ''
  }
  clienteInfo.value = null
  ventaInfo.value = null
}

const formatPrecio = (precio) => {
  return new Intl.NumberFormat('es-CO').format(precio || 0)
}

// Inicialización
onMounted(() => {
  dialogoVisible.value = props.modelValue
})
</script>

<style scoped>
/* Estilos adicionales */
.rounded-borders {
  border-radius: 8px;
}

.q-linear-progress {
  height: 10px;
  border-radius: 5px;
}
</style>