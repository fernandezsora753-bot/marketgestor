<template>
  <q-page class="q-pa-md">
    <!-- ENCABEZADO -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <h4 class="q-my-none">💰 Gestión de Pagos</h4>
        <p class="text-caption text-grey">Registra y consulta pagos de clientes</p>
      </div>
      <div class="col-auto">
        <q-btn 
          color="positive" 
          icon="payments" 
          label="Nuevo Pago"
          @click="abrirDialogoPago"
        />
      </div>
    </div>

    <!-- RESUMEN DE DEUDAS -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">📊 Resumen Financiero</div>
        <div class="row q-col-gutter-md q-mt-sm">
          <div class="col-12 col-md-3">
            <q-card class="bg-blue-1">
              <q-card-section class="text-center">
                <div class="text-h5 text-weight-bold">{{ formatPrecio(totalDeudas) }}</div>
                <div class="text-caption">Deuda Total</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card class="bg-orange-1">
              <q-card-section class="text-center">
                <div class="text-h5 text-weight-bold">{{ clientesConDeuda }}</div>
                <div class="text-caption">Clientes con Deuda</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card class="bg-green-1">
              <q-card-section class="text-center">
                <div class="text-h5 text-weight-bold">{{ formatPrecio(totalPagadoHoy) }}</div>
                <div class="text-caption">Pagado Hoy</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card class="bg-red-1">
              <q-card-section class="text-center">
                <div class="text-h5 text-weight-bold">{{ formatPrecio(totalPagadoMes) }}</div>
                <div class="text-caption">Pagado este Mes</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- PESTAÑAS -->
    <q-tabs
      v-model="tab"
      dense
      class="bg-grey-2 text-grey-7"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="deudas" icon="money_off" label="Deudas Pendientes" />
      <q-tab name="pagos" icon="payments" label="Historial de Pagos" />
      <q-tab name="clientes" icon="people" label="Estado por Cliente" />
    </q-tabs>

    <!-- CONTENIDO DE PESTAÑAS -->
    <q-tab-panels v-model="tab" animated class="q-mt-md">
      <!-- PESTAÑA 1: DEUDAS PENDIENTES -->
      <q-tab-panel name="deudas">
        <q-card>
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-h6">📋 Ventas con Saldo Pendiente</div>
              </div>
              <div class="col-auto">
                <q-input
                  v-model="busquedaVentas"
                  placeholder="Buscar por cliente..."
                  outlined
                  dense
                  clearable
                  style="min-width: 250px;"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- TABLA DE VENTAS PENDIENTES -->
            <q-table
              :rows="ventasPendientesFiltradas"
              :columns="columnsVentas"
              row-key="id"
              flat
              bordered
              :loading="cargandoVentas"
            >
              <!-- COLUMNA ESTADO -->
              <template v-slot:body-cell-estado="props">
                <q-td :props="props">
                  <q-badge :color="getColorEstado(props.row)" class="q-pa-xs">
                    {{ props.row.estado }}
                  </q-badge>
                  <div v-if="props.row.diasAtraso > 0" class="text-caption text-red">
                    {{ props.row.diasAtraso }} días de atraso
                  </div>
                </q-td>
              </template>

              <!-- COLUMNA SALDO -->
              <template v-slot:body-cell-saldoPendiente="props">
                <q-td :props="props" class="text-right">
                  <div class="text-weight-bold text-negative">
                    ${{ formatPrecio(props.row.saldoPendiente) }}
                  </div>
                  <div class="text-caption text-grey">
                    Total: ${{ formatPrecio(props.row.total) }}
                  </div>
                </q-td>
              </template>

              <!-- COLUMNA ACCIONES -->
              <template v-slot:body-cell-acciones="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    dense
                    color="positive"
                    icon="payments"
                    @click="registrarPagoVenta(props.row)"
                  >
                    <q-tooltip>Registrar Pago</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    color="primary"
                    icon="visibility"
                    @click="verDetalleVenta(props.row.id)"
                  >
                    <q-tooltip>Ver Detalle</q-tooltip>
                  </q-btn>
                </q-td>
              </template>

              <!-- VACÍO -->
              <template v-slot:no-data>
                <div class="full-width row flex-center text-grey q-gutter-sm">
                  <q-icon name="check_circle" size="2em" color="positive" />
                  <span class="text-h6">¡Excelente! No hay deudas pendientes</span>
                </div>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- PESTAÑA 2: HISTORIAL DE PAGOS -->
      <q-tab-panel name="pagos">
        <q-card>
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-h6">🕐 Historial de Pagos</div>
              </div>
              <div class="col-auto">
                <q-input
                  v-model="busquedaPagos"
                  placeholder="Buscar pago..."
                  outlined
                  dense
                  clearable
                  style="min-width: 250px;"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- LISTA DE PAGOS -->
            <q-list bordered separator v-if="pagosFiltrados.length > 0">
              <q-item v-for="pago in pagosFiltrados" :key="pago.id" class="q-my-xs">
                <q-item-section avatar>
                  <q-avatar :color="getColorMetodoPago(pago.metodoPago)" text-color="white">
                    <q-icon :name="getIconoMetodoPago(pago.metodoPago)" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ pago.clienteNombre }}</q-item-label>
                  <q-item-label caption>
                    {{ formatFecha(pago.fecha) }} • {{ pago.metodoPago }}
                    <span v-if="pago.observaciones">• {{ pago.observaciones }}</span>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-positive text-weight-bold">
                    ${{ formatPrecio(pago.monto) }}
                  </q-item-label>
                  <q-item-label caption>
                    Venta: {{ pago.ventaId?.substring(0, 8) }}...
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat dense round icon="more_vert">
                    <q-menu>
                      <q-list style="min-width: 100px">
                        <q-item clickable @click="verDetallePago(pago)">
                          <q-item-section avatar>
                            <q-icon name="visibility" />
                          </q-item-section>
                          <q-item-section>Ver Detalle</q-item-section>
                        </q-item>
                        <q-item clickable @click="editarPago(pago)">
                          <q-item-section avatar>
                            <q-icon name="edit" />
                          </q-item-section>
                          <q-item-section>Editar</q-item-section>
                        </q-item>
                        <q-separator />
                        <q-item clickable @click="eliminarPago(pago)" class="text-negative">
                          <q-item-section avatar>
                            <q-icon name="delete" color="negative" />
                          </q-item-section>
                          <q-item-section>Eliminar</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>

            <div v-else class="text-center q-pa-lg">
              <q-icon name="payments" size="xl" color="grey-5" />
              <div class="q-mt-md text-grey">
                No hay pagos registrados
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- PESTAÑA 3: ESTADO POR CLIENTE -->
      <q-tab-panel name="clientes">
        <q-card>
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-h6">👥 Estado de Crédito por Cliente</div>
              </div>
              <div class="col-auto">
                <q-input
                  v-model="busquedaClientes"
                  placeholder="Buscar cliente..."
                  outlined
                  dense
                  clearable
                  style="min-width: 250px;"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- TABLA DE CLIENTES -->
            <q-table
              :rows="clientesConDeudaFiltrados"
              :columns="columnsClientes"
              row-key="id"
              flat
              bordered
            >
              <!-- COLUMNA ESTADO -->
              <template v-slot:body-cell-estado="props">
                <q-td :props="props">
                  <q-chip 
                    :color="props.row.estado.color"
                    text-color="white"
                    :icon="props.row.estado.icono"
                    size="sm"
                  >
                    {{ props.row.estado.texto }}
                  </q-chip>
                </q-td>
              </template>

              <!-- COLUMNA SALDO -->
              <template v-slot:body-cell-saldoTotal="props">
                <q-td :props="props" class="text-right">
                  <div class="text-weight-bold" :class="props.row.saldoTotal > 0 ? 'text-negative' : 'text-positive'">
                    ${{ formatPrecio(props.row.saldoTotal) }}
                  </div>
                  <div class="text-caption text-grey">
                    Límite: ${{ formatPrecio(props.row.limiteCredito) }}
                  </div>
                </q-td>
              </template>

              <!-- COLUMNA ACCIONES -->
              <template v-slot:body-cell-acciones="props">
                <q-td :props="props">
                  <q-btn
                    v-if="props.row.saldoTotal > 0"
                    flat
                    dense
                    color="positive"
                    icon="payments"
                    @click="registrarPagoCliente(props.row)"
                  >
                    <q-tooltip>Registrar Pago</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    color="primary"
                    icon="history"
                    @click="verHistorialCliente(props.row.id)"
                  >
                    <q-tooltip>Ver Historial</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>

    <!-- DIÁLOGO PARA REGISTRAR PAGO -->
    <RealizarPagoDialog
      v-model="dialogoPago"
      :venta-seleccionada="ventaParaPago"
      :cliente-seleccionado="clienteParaPago"
      @pago-registrado="cargarDatos"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'boot/firebase'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import RealizarPagoDialog from 'src/components/clientes/RealizarPagoDialog.vue'  

const $q = useQuasar()

// Datos reactivos
const tab = ref('deudas')
const ventas = ref([])
const pagos = ref([])
const clientes = ref([])
const cargandoVentas = ref(false)
const dialogoPago = ref(false)
const ventaParaPago = ref(null)
const clienteParaPago = ref(null)
const busquedaVentas = ref('')
const busquedaPagos = ref('')
const busquedaClientes = ref('')

// Columnas de la tabla de ventas
const columnsVentas = [
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'cliente', label: 'Cliente', field: 'clienteNombre', align: 'left', sortable: true },
  { name: 'total', label: 'Total Venta', field: 'total', align: 'right', sortable: true },
  { name: 'saldoPendiente', label: 'Saldo Pendiente', field: 'saldoPendiente', align: 'right', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// Columnas de la tabla de clientes
const columnsClientes = [
  { name: 'cliente', label: 'Cliente', field: 'nombre', align: 'left', sortable: true },
  { name: 'telefono', label: 'Contacto', field: 'telefono', align: 'left' },
  { name: 'ventasPendientes', label: 'Ventas Pend.', field: 'ventasPendientes', align: 'center' },
  { name: 'saldoTotal', label: 'Saldo Total', field: 'saldoTotal', align: 'right', sortable: true },
  { name: 'estado', label: 'Estado Crédito', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// Cargar datos
const cargarDatos = async () => {
  cargandoVentas.value = true
  try {
    // Cargar ventas a crédito con saldo pendiente
    const ventasRef = collection(db, 'ventas')
    const qVentas = query(
      ventasRef, 
      where('estado', 'in', ['pendiente', 'parcial']),
      orderBy('fecha', 'desc')
    )
    const ventasSnapshot = await getDocs(qVentas)
    
    ventas.value = ventasSnapshot.docs.map(doc => {
      const data = doc.data()
      const fechaVenta = data.fecha?.toDate ? data.fecha.toDate() : new Date(data.fecha)
      const hoy = new Date()
      const diasTranscurridos = Math.floor((hoy - fechaVenta) / (1000 * 60 * 60 * 24))
      
      return {
        id: doc.id,
        ...data,
        diasAtraso: Math.max(0, diasTranscurridos - 30) // Asumimos 30 días de plazo
      }
    })

    // Cargar pagos
    const pagosRef = collection(db, 'pagos')
    const qPagos = query(pagosRef, orderBy('fecha', 'desc'))
    const pagosSnapshot = await getDocs(qPagos)
    
    pagos.value = pagosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Cargar clientes
    const clientesRef = collection(db, 'clientes')
    const clientesSnapshot = await getDocs(clientesRef)
    
    clientes.value = clientesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

  } catch (error) {
    console.error('Error cargando datos:', error)
    
    // Datos de demostración
    if (error.message.includes('index') || error.message.includes('query')) {
      console.log('📋 Usando datos de demostración...')
      
      // Ventas de demostración
      ventas.value = [
        {
          id: 'venta-demo-1',
          clienteId: 'demo-1',
          clienteNombre: 'Juan Pérez',
          fecha: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 días atrás
          total: 250000,
          saldoPendiente: 150000,
          estado: 'parcial',
          diasAtraso: 0
        },
        {
          id: 'venta-demo-2',
          clienteId: 'demo-3',
          clienteNombre: 'Carlos Rodríguez',
          fecha: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 días atrás
          total: 180000,
          saldoPendiente: 180000,
          estado: 'pendiente',
          diasAtraso: 15
        }
      ]
      
      // Pagos de demostración
      pagos.value = [
        {
          id: 'pago-demo-1',
          ventaId: 'venta-demo-1',
          clienteId: 'demo-1',
          clienteNombre: 'Juan Pérez',
          fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          monto: 100000,
          metodoPago: 'efectivo',
          observaciones: 'Pago parcial'
        }
      ]
      
      // Clientes de demostración (ya cargados desde ClientesPage)
    }
    
    $q.notify({
      type: 'info',
      message: 'Modo demostración activado',
      caption: 'Los datos reales se cargarán cuando configures Firestore',
      timeout: 5000
    })
  } finally {
    cargandoVentas.value = false
  }
}

// VENTAS PENDIENTES
const ventasPendientes = computed(() => {
  return ventas.value.filter(v => v.saldoPendiente > 0)
})

const ventasPendientesFiltradas = computed(() => {
  if (!busquedaVentas.value) return ventasPendientes.value
  
  const termino = busquedaVentas.value.toLowerCase()
  return ventasPendientes.value.filter(v =>
    v.clienteNombre.toLowerCase().includes(termino) ||
    v.id.toLowerCase().includes(termino)
  )
})

// PAGOS
const pagosFiltrados = computed(() => {
  if (!busquedaPagos.value) return pagos.value
  
  const termino = busquedaPagos.value.toLowerCase()
  return pagos.value.filter(p =>
    p.clienteNombre.toLowerCase().includes(termino) ||
    p.metodoPago.toLowerCase().includes(termino) ||
    (p.observaciones && p.observaciones.toLowerCase().includes(termino))
  )
})

// CLIENTES CON DEUDA
const clientesConDeuda = computed(() => {
  return clientes.value
    .filter(cliente => cliente.credito)
    .map(cliente => {
      const ventasCliente = ventas.value.filter(v => 
        v.clienteId === cliente.id && v.saldoPendiente > 0
      )
      
      const saldoTotal = ventasCliente.reduce((total, venta) => total + venta.saldoPendiente, 0)
      
      // Calcular estado (simplificado para esta vista)
      let estado
      if (saldoTotal === 0) {
        estado = { color: 'green', icono: 'check_circle', texto: 'Al día' }
      } else if (saldoTotal > 0 && saldoTotal <= cliente.limiteCredito * 0.5) {
        estado = { color: 'orange', icono: 'warning', texto: 'Deuda moderada' }
      } else if (saldoTotal > cliente.limiteCredito * 0.5) {
        estado = { color: 'red', icono: 'error', texto: 'Deuda alta' }
      } else {
        estado = { color: 'grey', icono: 'block', texto: 'Sin crédito' }
      }
      
      return {
        ...cliente,
        ventasPendientes: ventasCliente.length,
        saldoTotal,
        estado
      }
    })
    .filter(cliente => cliente.saldoTotal > 0 || cliente.credito)
})

const clientesConDeudaFiltrados = computed(() => {
  if (!busquedaClientes.value) return clientesConDeuda.value
  
  const termino = busquedaClientes.value.toLowerCase()
  return clientesConDeuda.value.filter(c =>
    c.nombre.toLowerCase().includes(termino) ||
    (c.telefono && c.telefono.includes(termino)) ||
    (c.whatsapp && c.whatsapp.includes(termino))
  )
})

// ESTADÍSTICAS
const totalDeudas = computed(() => {
  return ventasPendientes.value.reduce((total, venta) => total + venta.saldoPendiente, 0)
})

const clientesConDeudaCount = computed(() => {
  const clienteIds = new Set(ventasPendientes.value.map(v => v.clienteId))
  return clienteIds.size
})

const totalPagadoHoy = computed(() => {
  const hoy = new Date().toDateString()
  return pagos.value
    .filter(pago => {
      const fechaPago = pago.fecha?.toDate ? pago.fecha.toDate() : new Date(pago.fecha)
      return fechaPago.toDateString() === hoy
    })
    .reduce((total, pago) => total + pago.monto, 0)
})

const totalPagadoMes = computed(() => {
  const hoy = new Date()
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  
  return pagos.value
    .filter(pago => {
      const fechaPago = pago.fecha?.toDate ? pago.fecha.toDate() : new Date(pago.fecha)
      return fechaPago >= inicioMes
    })
    .reduce((total, pago) => total + pago.monto, 0)
})

// FUNCIONES DE COLORES
const getColorEstado = (venta) => {
  if (venta.saldoPendiente === 0) return 'positive'
  if (venta.diasAtraso > 30) return 'negative'
  if (venta.diasAtraso > 15) return 'orange'
  if (venta.diasAtraso > 0) return 'warning'
  return 'info'
}

const getColorMetodoPago = (metodo) => {
  const colores = {
    efectivo: 'green',
    transferencia: 'blue',
    tarjeta: 'purple',
    cheque: 'orange',
    nequi: 'teal',
    daviplata: 'indigo'
  }
  return colores[metodo] || 'grey'
}

const getIconoMetodoPago = (metodo) => {
  const iconos = {
    efectivo: 'payments',
    transferencia: 'account_balance',
    tarjeta: 'credit_card',
    cheque: 'receipt',
    nequi: 'smartphone',
    daviplata: 'phone_android'
  }
  return iconos[metodo] || 'payments'
}

// FUNCIONES DE ACCIÓN
const abrirDialogoPago = () => {
  ventaParaPago.value = null
  clienteParaPago.value = null
  dialogoPago.value = true
}

const registrarPagoVenta = (venta) => {
  ventaParaPago.value = venta
  clienteParaPago.value = null
  dialogoPago.value = true
}

const registrarPagoCliente = (cliente) => {
  clienteParaPago.value = cliente
  ventaParaPago.value = null
  dialogoPago.value = true
}

const verDetalleVenta = (ventaId) => {
  $q.notify({
    message: 'Detalle de venta',
    caption: `ID: ${ventaId}`,
    color: 'info'
  })
}

const verDetallePago = (pago) => {
  $q.notify({
    message: 'Detalle de pago',
    caption: `Monto: $${formatPrecio(pago.monto)}`,
    color: 'info'
  })
}

const editarPago = (pago) => {
  $q.notify({
    message: 'Editar pago',
    caption: 'Funcionalidad en desarrollo',
    color: 'warning'
  })
}

const eliminarPago = (pago) => {
  $q.dialog({
    title: '⚠️ Eliminar Pago',
    message: `¿Estás seguro de eliminar este pago de <strong>${pago.clienteNombre}</strong>?<br>
              <strong>Monto: $${formatPrecio(pago.monto)}</strong><br><br>
              <span class="text-negative">Esta acción no se puede deshacer.</span>`,
    html: true,
    cancel: true,
    persistent: true
  }).onOk(() => {
    $q.notify({
      type: 'positive',
      message: 'Pago eliminado (modo demostración)',
      caption: 'En producción, se eliminaría de Firestore'
    })
  })
}

const verHistorialCliente = (clienteId) => {
  $q.notify({
    message: 'Historial del cliente',
    caption: 'Funcionalidad en desarrollo',
    color: 'info'
  })
}

// FUNCIONES DE FORMATO
const formatPrecio = (precio) => {
  return new Intl.NumberFormat('es-CO').format(precio || 0)
}

const formatFecha = (timestamp) => {
  if (!timestamp) return 'Sin fecha'
  
  try {
    const fecha = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
    return fecha.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Fecha inválida'
  }
}

// Cargar al iniciar
onMounted(() => {
  cargarDatos()
})
</script>

<style scoped>
/* Estilos adicionales */
.q-tab-panel {
  padding: 0;
}

.q-item {
  border-radius: 8px;
  margin: 4px 0;
}

.q-item:hover {
  background-color: #f5f5f5;
}
</style>