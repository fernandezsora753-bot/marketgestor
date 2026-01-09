<!-- src/components/proveedores/RegistrarPagoProveedorDialog.vue -->
<template>
  <q-dialog v-model="dialogoVisible" persistent>
    <q-card style="min-width: 500px; max-width: 700px">
      <q-card-section class="bg-positive text-white">
        <div class="text-h6">
          <q-icon name="payments" class="q-mr-sm" />
          Registrar Pago a Proveedor
        </div>
        <div class="text-caption">
          Registra un pago realizado a {{ proveedorInfo?.nombre || 'el proveedor' }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-md">
        <q-form @submit="registrarPago" class="q-gutter-md">
          <!-- INFORMACIÓN DEL PROVEEDOR -->
          <div v-if="proveedorInfo" class="q-pa-sm bg-grey-2 rounded-borders">
            <div class="row items-center">
              <div class="col">
                <div class="text-subtitle1 text-weight-bold">{{ proveedorInfo.nombre }}</div>
                <div v-if="proveedorInfo.contacto" class="text-caption">
                  👤 Contacto: {{ proveedorInfo.contacto }}
                </div>
                <div v-if="proveedorInfo.telefono" class="text-caption">
                  📞 {{ proveedorInfo.telefono }}
                </div>
              </div>
              <div class="col-auto">
                <q-chip v-if="saldoPendiente > 0" color="orange" text-color="white" icon="money_off">
                  Saldo: ${{ formatPrecio(saldoPendiente) }}
                </q-chip>
                <q-chip v-else color="green" text-color="white" icon="check_circle">
                  Al día
                </q-chip>
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
                hint="Monto que estás pagando al proveedor"
                :rules="[
                  val => !!val || 'Ingresa el monto',
                  val => val > 0 || 'El monto debe ser mayor a 0'
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_money" />
                </template>
                <template v-slot:append>
                  <q-btn 
                    flat 
                    dense 
                    label="Pagar saldo completo"
                    color="primary"
                    @click="pagarTodo"
                    v-if="saldoPendiente > 0"
                  />
                </template>
              </q-input>
              
              <!-- RESUMEN DE DEUDA -->
              <div v-if="proveedorInfo?.estadoCuenta" class="q-mt-sm">
                <div class="row items-center justify-between text-caption">
                  <div class="col">
                    <div>Total compras:</div>
                    <div>Total pagado:</div>
                    <div>Saldo pendiente:</div>
                  </div>
                  <div class="col-auto text-right">
                    <div>${{ formatPrecio(proveedorInfo.estadoCuenta.totalCompras) }}</div>
                    <div class="text-green">${{ formatPrecio(proveedorInfo.estadoCuenta.totalPagado) }}</div>
                    <div class="text-weight-bold" :class="saldoPendiente > 0 ? 'text-red' : 'text-green'">
                      ${{ formatPrecio(saldoPendiente) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- COMPRA/ORDEN ASOCIADA (opcional) -->
          <div class="text-subtitle1 text-weight-medium q-pt-md">📋 Asociar a compra (opcional)</div>
          
          <q-select
            v-model="formPago.compraId"
            :options="comprasPendientes"
            label="Seleccionar compra pendiente"
            outlined
            dense
            clearable
            hint="Opcional: asociar este pago a una compra específica"
            emit-value
            map-options
          >
            <template v-slot:prepend>
              <q-icon name="receipt" />
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>
                    ${{ formatPrecio(scope.opt.total) }} • {{ formatFecha(scope.opt.fecha) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

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
            hint="Ej: Pago parcial, anticipo, por factura X, etc."
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
                <div class="col text-caption">Monto del pago:</div>
                <div class="col-auto text-weight-bold">${{ formatPrecio(formPago.monto || 0) }}</div>
              </div>
              <div class="row q-mt-xs" v-if="saldoPendiente > 0">
                <div class="col text-caption">Saldo después del pago:</div>
                <div class="col-auto" :class="saldoDespuesPago > 0 ? 'text-orange text-weight-bold' : 'text-positive text-weight-bold'">
                  ${{ formatPrecio(saldoDespuesPago) }}
                </div>
              </div>
              <div v-if="saldoDespuesPago === 0 && saldoPendiente > 0" class="text-center q-mt-sm">
                <q-badge color="positive" class="q-pa-xs">
                  ✅ ¡Proveedor quedará al día!
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
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs, query, where } from 'firebase/firestore'

const $q = useQuasar()

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  proveedor: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'pago-registrado'])

// Datos reactivos
const dialogoVisible = ref(false)
const registrando = ref(false)
const proveedorInfo = ref(null)
const comprasPendientes = ref([])

// Formulario
const formPago = ref({
  metodoPago: 'transferencia',
  monto: 0,
  compraId: null,
  referencia: '',
  fechaPago: new Date().toISOString().split('T')[0],
  horaPago: new Date().toTimeString().slice(0, 5),
  observaciones: ''
})

// Métodos de pago disponibles
const metodosPago = [
  { label: '💵 Efectivo', value: 'efectivo' },
  { label: '🏦 Transferencia Bancaria', value: 'transferencia' },
  { label: '💳 Tarjeta', value: 'tarjeta' },
  { label: '✏️ Cheque', value: 'cheque' },
  { label: '🔄 Otro', value: 'otro' }
]

// Computadas
const necesitaReferencia = computed(() => {
  return ['transferencia', 'cheque'].includes(formPago.value.metodoPago)
})

const saldoPendiente = computed(() => {
  return proveedorInfo.value?.estadoCuenta?.saldo || 0
})

const saldoDespuesPago = computed(() => {
  return saldoPendiente.value - (formPago.value.monto || 0)
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

watch(() => props.proveedor, (val) => {
  if (val) {
    proveedorInfo.value = { ...val }
    cargarComprasPendientes(val.id)
    // Establecer monto sugerido como el saldo pendiente
    if (val.estadoCuenta?.saldo > 0) {
      formPago.value.monto = val.estadoCuenta.saldo
    }
  }
})

// Métodos
const inicializarDialogo = async () => {
  if (props.proveedor) {
    proveedorInfo.value = { ...props.proveedor }
    await cargarComprasPendientes(props.proveedor.id)
  }
}

const cargarComprasPendientes = async (proveedorId) => {
  try {
    if (!db) return // Modo demostración
    
    const comprasRef = collection(db, 'compras')
    const q = query(
      comprasRef,
      where('proveedorId', '==', proveedorId),
      where('estado', 'in', ['pendiente', 'parcial'])
    )
    
    const querySnapshot = await getDocs(q)
    comprasPendientes.value = querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        label: `${data.producto || 'Compra'} - $${formatPrecio(data.total || data.precio)}`,
        value: doc.id,
        total: data.total || data.precio || 0,
        fecha: data.fecha
      }
    })
  } catch (error) {
    console.log('⚠️ No se pudieron cargar compras pendientes:', error)
  }
}

const getHintReferencia = () => {
  const hints = {
    transferencia: 'Número de transacción bancaria',
    cheque: 'Número de cheque',
    tarjeta: 'Últimos 4 dígitos de la tarjeta'
  }
  return hints[formPago.value.metodoPago] || 'Número de referencia o comprobante'
}

const pagarTodo = () => {
  formPago.value.monto = saldoPendiente.value
}

const registrarPago = async () => {
  if (!formPago.value.metodoPago || !formPago.value.monto || formPago.value.monto <= 0) {
    $q.notify({
      type: 'warning',
      message: 'Completa todos los campos requeridos'
    })
    return
  }

  registrando.value = true

  try {
    // Crear objeto de pago
    const fechaHora = new Date(`${formPago.value.fechaPago}T${formPago.value.horaPago}`)
    
    const pagoData = {
      proveedorId: proveedorInfo.value?.id,
      proveedorNombre: proveedorInfo.value?.nombre,
      compraId: formPago.value.compraId || null,
      monto: Number(formPago.value.monto),
      metodoPago: formPago.value.metodoPago,
      referencia: formPago.value.referencia.trim() || null,
      observaciones: formPago.value.observaciones.trim() || null,
      fecha: fechaHora,
      fechaRegistro: serverTimestamp(),
      saldoAnterior: saldoPendiente.value,
      saldoNuevo: saldoDespuesPago.value,
      registradoPor: 'admin'
    }

    // En modo demostración
    if (!db) {
      console.log('📋 Modo demostración: Simulando registro de pago a proveedor', pagoData)
      
      $q.notify({
        type: 'positive',
        message: '✅ Pago a proveedor registrado (modo demo)',
        caption: `Monto: $${formatPrecio(pagoData.monto)}`,
        icon: 'check_circle',
        timeout: 3000
      })
      
      emit('pago-registrado')
      cerrarDialogo()
      return
    }

    // 1. Guardar el pago en colección de pagos_proveedores
    const pagosRef = collection(db, 'pagos_proveedores')
    await addDoc(pagosRef, pagoData)

    // 2. Actualizar la compra asociada (si aplica)
    if (formPago.value.compraId) {
      const compraRef = doc(db, 'compras', formPago.value.compraId)
      // Obtener compra actual primero
      const compraSnap = await getDoc(compraRef)
      if (compraSnap.exists()) {
        const compraData = compraSnap.data()
        const saldoActual = compraData.saldoPendiente || compraData.total
        const nuevoSaldo = saldoActual - formPago.value.monto
        
        await updateDoc(compraRef, {
          saldoPendiente: nuevoSaldo,
          pagado: (compraData.pagado || 0) + formPago.value.monto,
          estado: nuevoSaldo > 0 ? 'parcial' : 'pagada',
          ultimoPago: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }
    }

    // 3. Actualizar el proveedor
    if (proveedorInfo.value?.id) {
      const proveedorRef = doc(db, 'proveedores', proveedorInfo.value.id)
      await updateDoc(proveedorRef, {
        ultimoPago: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }

    $q.notify({
      type: 'positive',
      message: '✅ Pago registrado exitosamente',
      caption: `Proveedor: ${proveedorInfo.value?.nombre} • Monto: $${formatPrecio(formPago.value.monto)}`,
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
    metodoPago: 'transferencia',
    monto: 0,
    compraId: null,
    referencia: '',
    fechaPago: new Date().toISOString().split('T')[0],
    horaPago: new Date().toTimeString().slice(0, 5),
    observaciones: ''
  }
  proveedorInfo.value = null
  comprasPendientes.value = []
}

const formatPrecio = (precio) => {
  return new Intl.NumberFormat('es-CO').format(precio || 0)
}

const formatFecha = (fecha) => {
  if (!fecha) return ''
  const fechaObj = fecha.toDate ? fecha.toDate() : new Date(fecha)
  return fechaObj.toLocaleDateString('es-CO')
}

// Inicialización
onMounted(() => {
  dialogoVisible.value = props.modelValue
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
</style>