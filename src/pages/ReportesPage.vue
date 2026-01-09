<template>
  <q-page class="q-pa-md">
    <!-- ENCABEZADO -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <h4 class="q-my-none">📊 Dashboard de Reportes</h4>
        <p class="text-caption text-grey">Visualiza estadísticas y descarga reportes</p>
      </div>
      <div class="col-auto">
        <q-btn-dropdown color="primary" label="Exportar Reportes" icon="download">
          <q-list>
            <q-item clickable v-close-popup @click="exportarTodo('excel')">
              <q-item-section avatar>
                <q-icon name="description" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Todo a Excel</q-item-label>
                <q-item-label caption>Datos completos</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item clickable v-close-popup @click="exportarTodo('pdf')">
              <q-item-section avatar>
                <q-icon name="picture_as_pdf" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Reporte PDF</q-item-label>
                <q-item-label caption>Resumen ejecutivo</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-separator />
            
            <q-item clickable v-close-popup @click="exportarModulo('ventas')">
              <q-item-section avatar>
                <q-icon name="shopping_cart" />
              </q-item-section>
              <q-item-section>Reporte de Ventas</q-item-section>
            </q-item>
            
            <q-item clickable v-close-popup @click="exportarModulo('clientes')">
              <q-item-section avatar>
                <q-icon name="people" />
              </q-item-section>
              <q-item-section>Reporte de Clientes</q-item-section>
            </q-item>
            
            <q-item clickable v-close-popup @click="exportarModulo('pagos')">
              <q-item-section avatar>
                <q-icon name="payments" />
              </q-item-section>
              <q-item-section>Reporte de Pagos</q-item-section>
            </q-item>
            
            <q-item clickable v-close-popup @click="exportarModulo('productos')">
              <q-item-section avatar>
                <q-icon name="inventory_2" />
              </q-item-section>
              <q-item-section>Reporte de Productos</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <!-- FILTROS -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-input
              v-model="filtros.fechaDesde"
              label="Desde"
              type="date"
              outlined
              dense
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="filtros.fechaHasta"
              label="Hasta"
              type="date"
              outlined
              dense
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.modulo"
              :options="opcionesModulos"
              label="Módulo"
              outlined
              dense
              clearable
            />
          </div>
          <div class="col-12 col-md-3">
            <q-btn 
              color="primary" 
              label="Aplicar Filtros"
              @click="cargarDatos"
              class="full-width"
              :loading="cargando"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- KPI's PRINCIPALES -->
    <div class="row q-col-gutter-md q-mb-md">
      <!-- KPI 1 -->
      <div class="col-12 col-md-3">
        <q-card class="bg-blue-1">
          <q-card-section class="text-center">
            <q-icon name="trending_up" size="lg" color="primary" />
            <div class="text-h5 text-weight-bold q-mt-sm">
              ${{ formatPrecio(estadisticas.ventasTotales) }}
            </div>
            <div class="text-caption">Ventas Totales</div>
            <q-linear-progress 
              :value="0.85" 
              color="primary" 
              class="q-mt-sm"
            />
          </q-card-section>
        </q-card>
      </div>
      
      <!-- KPI 2 -->
      <div class="col-12 col-md-3">
        <q-card class="bg-green-1">
          <q-card-section class="text-center">
            <q-icon name="payments" size="lg" color="positive" />
            <div class="text-h5 text-weight-bold q-mt-sm">
              ${{ formatPrecio(estadisticas.pagosTotales) }}
            </div>
            <div class="text-caption">Ingresos por Pagos</div>
            <q-linear-progress 
              :value="0.65" 
              color="positive" 
              class="q-mt-sm"
            />
          </q-card-section>
        </q-card>
      </div>
      
      <!-- KPI 3 -->
      <div class="col-12 col-md-3">
        <q-card class="bg-orange-1">
          <q-card-section class="text-center">
            <q-icon name="money_off" size="lg" color="orange" />
            <div class="text-h5 text-weight-bold q-mt-sm">
              ${{ formatPrecio(estadisticas.deudasPendientes) }}
            </div>
            <div class="text-caption">Deudas Pendientes</div>
            <q-linear-progress 
              :value="estadisticas.ratioDeudas" 
              color="orange" 
              class="q-mt-sm"
            />
          </q-card-section>
        </q-card>
      </div>
      
      <!-- KPI 4 -->
      <div class="col-12 col-md-3">
        <q-card class="bg-purple-1">
          <q-card-section class="text-center">
            <q-icon name="people" size="lg" color="purple" />
            <div class="text-h5 text-weight-bold q-mt-sm">
              {{ estadisticas.clientesActivos }}
            </div>
            <div class="text-caption">Clientes Activos</div>
            <q-linear-progress 
              :value="0.92" 
              color="purple" 
              class="q-mt-sm"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- GRÁFICOS -->
    <div class="row q-col-gutter-md q-mb-md">
      <!-- GRÁFICO 1: VENTAS MENSUALES -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-h6">📈 Ventas Mensuales</div>
            <div ref="chartVentas" style="height: 300px;"></div>
          </q-card-section>
        </q-card>
      </div>
      
      <!-- GRÁFICO 2: MÉTODOS DE PAGO -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">💳 Métodos de Pago</div>
            <div ref="chartMetodosPago" style="height: 300px;"></div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- TABLAS DE DATOS -->
    <div class="row q-col-gutter-md">
      <!-- TABLA 1: TOP CLIENTES -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-h6">🏆 Top 5 Clientes</div>
              </div>
              <div class="col-auto">
                <q-btn flat dense icon="download" @click="exportarTopClientes">
                  <q-tooltip>Descargar</q-tooltip>
                </q-btn>
              </div>
            </div>
            
            <q-table
              :rows="topClientes"
              :columns="columnsTopClientes"
              row-key="id"
              flat
              dense
            >
              <template v-slot:body-cell-deuda="props">
                <q-td :props="props" class="text-right">
                  <div :class="props.row.deuda > 0 ? 'text-negative' : 'text-positive'">
                    ${{ formatPrecio(props.row.deuda) }}
                  </div>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
      
      <!-- TABLA 2: PRODUCTOS MÁS VENDIDOS -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-h6">📦 Productos Más Vendidos</div>
              </div>
              <div class="col-auto">
                <q-btn flat dense icon="download" @click="exportarTopProductos">
                  <q-tooltip>Descargar</q-tooltip>
                </q-btn>
              </div>
            </div>
            
            <q-table
              :rows="topProductos"
              :columns="columnsTopProductos"
              row-key="id"
              flat
              dense
            >
              <template v-slot:body-cell-stock="props">
                <q-td :props="props">
                  <q-badge :color="props.row.stock < 10 ? 'negative' : 'positive'">
                    {{ props.row.stock }} unidades
                  </q-badge>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- REPORTES DETALLADOS -->
    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">📋 Reportes Detallados por Módulo</div>
        
        <q-tabs
          v-model="tabReportes"
          dense
          class="bg-grey-2"
          active-color="primary"
          indicator-color="primary"
        >
          <q-tab name="ventas" icon="shopping_cart" label="Ventas" />
          <q-tab name="pagos" icon="payments" label="Pagos" />
          <q-tab name="clientes" icon="people" label="Clientes" />
          <q-tab name="productos" icon="inventory_2" label="Productos" />
        </q-tabs>

        <q-tab-panels v-model="tabReportes" class="q-mt-md">
          <!-- VENTAS -->
          <q-tab-panel name="ventas">
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-subtitle1">Historial de Ventas</div>
              </div>
              <div class="col-auto">
                <q-btn 
                  color="primary" 
                  icon="download" 
                  label="Exportar CSV"
                  @click="exportarCSV('ventas')"
                />
              </div>
            </div>
            
            <q-table
              :rows="reporteVentas"
              :columns="columnsVentas"
              row-key="id"
              flat
              bordered
              :loading="cargando"
              :pagination="pagination"
            />
          </q-tab-panel>

          <!-- PAGOS -->
          <q-tab-panel name="pagos">
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-subtitle1">Historial de Pagos</div>
              </div>
              <div class="col-auto">
                <q-btn 
                  color="primary" 
                  icon="download" 
                  label="Exportar CSV"
                  @click="exportarCSV('pagos')"
                />
              </div>
            </div>
            
            <q-table
              :rows="reportePagos"
              :columns="columnsPagos"
              row-key="id"
              flat
              bordered
              :loading="cargando"
            />
          </q-tab-panel>

          <!-- CLIENTES -->
          <q-tab-panel name="clientes">
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-subtitle1">Estado de Clientes</div>
              </div>
              <div class="col-auto">
                <q-btn 
                  color="primary" 
                  icon="download" 
                  label="Exportar CSV"
                  @click="exportarCSV('clientes')"
                />
              </div>
            </div>
            
            <q-table
              :rows="reporteClientes"
              :columns="columnsClientes"
              row-key="id"
              flat
              bordered
              :loading="cargando"
            />
          </q-tab-panel>

          <!-- PRODUCTOS -->
          <q-tab-panel name="productos">
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-subtitle1">Inventario de Productos</div>
              </div>
              <div class="col-auto">
                <q-btn 
                  color="primary" 
                  icon="download" 
                  label="Exportar CSV"
                  @click="exportarCSV('productos')"
                />
              </div>
            </div>
            
            <q-table
              :rows="reporteProductos"
              :columns="columnsProductos"
              row-key="id"
              flat
              bordered
              :loading="cargando"
            />
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'boot/firebase'
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore'
import * as echarts from 'echarts'

const $q = useQuasar()

// Datos reactivos
const cargando = ref(false)
const tabReportes = ref('ventas')
const chartVentas = ref(null)
const chartMetodosPago = ref(null)
const chartInstances = []

// Filtros
const filtros = ref({
  fechaDesde: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
  fechaHasta: new Date().toISOString().split('T')[0],
  modulo: null
})

const opcionesModulos = [
  { label: 'Ventas', value: 'ventas' },
  { label: 'Pagos', value: 'pagos' },
  { label: 'Clientes', value: 'clientes' },
  { label: 'Productos', value: 'productos' },
  { label: 'Inventario', value: 'inventario' }
]

// Estadísticas
const estadisticas = ref({
  ventasTotales: 0,
  pagosTotales: 0,
  deudasPendientes: 0,
  clientesActivos: 0,
  ratioDeudas: 0
})

// Datos para gráficos
const datosVentasMensuales = ref([])
const datosMetodosPago = ref([])

// Top listas
const topClientes = ref([])
const topProductos = ref([])

// Reportes detallados
const reporteVentas = ref([])
const reportePagos = ref([])
const reporteClientes = ref([])
const reporteProductos = ref([])

// Paginación
const pagination = ref({
  page: 1,
  rowsPerPage: 10
})

// Columnas de tablas
const columnsTopClientes = [
  { name: 'nombre', label: 'Cliente', field: 'nombre', align: 'left' },
  { name: 'compras', label: 'Compras Totales', field: 'comprasTotales', align: 'right' },
  { name: 'deuda', label: 'Deuda Actual', field: 'deuda', align: 'right' },
  { name: 'ultimaCompra', label: 'Última Compra', field: 'ultimaCompra', align: 'center' }
]

const columnsTopProductos = [
  { name: 'nombre', label: 'Producto', field: 'nombre', align: 'left' },
  { name: 'vendidos', label: 'Unid. Vendidas', field: 'vendidos', align: 'center' },
  { name: 'ingresos', label: 'Ingresos Totales', field: 'ingresos', align: 'right' },
  { name: 'stock', label: 'Stock Actual', field: 'stock', align: 'center' }
]

const columnsVentas = [
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'cliente', label: 'Cliente', field: 'clienteNombre', align: 'left' },
  { name: 'total', label: 'Total', field: 'total', align: 'right' },
  { name: 'pagado', label: 'Pagado', field: 'pagado', align: 'right' },
  { name: 'saldo', label: 'Saldo', field: 'saldoPendiente', align: 'right' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' }
]

const columnsPagos = [
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'cliente', label: 'Cliente', field: 'clienteNombre', align: 'left' },
  { name: 'monto', label: 'Monto', field: 'monto', align: 'right' },
  { name: 'metodo', label: 'Método', field: 'metodoPago', align: 'center' },
  { name: 'venta', label: 'Venta', field: 'ventaId', align: 'left' }
]

const columnsClientes = [
  { name: 'nombre', label: 'Cliente', field: 'nombre', align: 'left' },
  { name: 'contacto', label: 'Contacto', field: 'telefono', align: 'left' },
  { name: 'credito', label: 'Crédito', field: 'limiteCredito', align: 'right' },
  { name: 'deuda', label: 'Deuda Actual', field: 'deudaActual', align: 'right' },
  { name: 'estado', label: 'Estado', field: 'estadoCredito', align: 'center' }
]

const columnsProductos = [
  { name: 'nombre', label: 'Producto', field: 'nombre', align: 'left' },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left' },
  { name: 'precio', label: 'Precio', field: 'precio', align: 'right' },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'center' },
  { name: 'vendidos', label: 'Vendidos', field: 'vendidos', align: 'center' },
  { name: 'ingresos', label: 'Ingresos', field: 'ingresos', align: 'right' }
]

// Métodos
const cargarDatos = async () => {
  cargando.value = true
  try {
    // Cargar datos de Firestore
    await Promise.all([
      cargarEstadisticas(),
      cargarVentasMensuales(),
      cargarMetodosPago(),
      cargarTopClientes(),
      cargarTopProductos(),
      cargarReporteVentas(),
      cargarReportePagos(),
      cargarReporteClientes(),
      cargarReporteProductos()
    ])
    
    // Inicializar gráficos después de cargar datos
    setTimeout(() => {
      inicializarGraficos()
    }, 100)
    
  } catch (error) {
    console.error('Error cargando datos:', error)
    cargarDatosDemo()
  } finally {
    cargando.value = false
  }
}

const cargarEstadisticas = async () => {
  try {
    // Cargar ventas totales
    const ventasRef = collection(db, 'ventas')
    const ventasSnapshot = await getDocs(ventasRef)
    const ventas = ventasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    estadisticas.value.ventasTotales = ventas.reduce((total, venta) => total + (venta.total || 0), 0)
    estadisticas.value.deudasPendientes = ventas.reduce((total, venta) => total + (venta.saldoPendiente || 0), 0)
    estadisticas.value.ratioDeudas = estadisticas.value.ventasTotales > 0 ? estadisticas.value.deudasPendientes / estadisticas.value.ventasTotales : 0
    
    // Cargar pagos totales
    const pagosRef = collection(db, 'pagos')
    const pagosSnapshot = await getDocs(pagosRef)
    const pagos = pagosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    estadisticas.value.pagosTotales = pagos.reduce((total, pago) => total + (pago.monto || 0), 0)
    
    // Cargar clientes activos
    const clientesRef = collection(db, 'clientes')
    const clientesSnapshot = await getDocs(clientesRef)
    estadisticas.value.clientesActivos = clientesSnapshot.size
    
  } catch (error) {
    console.log('Usando datos de demostración para estadísticas')
    // Datos demo
    estadisticas.value = {
      ventasTotales: 12500000,
      pagosTotales: 9800000,
      deudasPendientes: 2700000,
      clientesActivos: 45,
      ratioDeudas: 0.216
    }
  }
}

const cargarVentasMensuales = async () => {
  // Datos demo para gráfico de ventas mensuales
  datosVentasMensuales.value = [
    { mes: 'Ene', ventas: 1200000 },
    { mes: 'Feb', ventas: 1800000 },
    { mes: 'Mar', ventas: 1500000 },
    { mes: 'Abr', ventas: 2200000 },
    { mes: 'May', ventas: 1900000 },
    { mes: 'Jun', ventas: 2500000 },
    { mes: 'Jul', ventas: 2800000 }
  ]
}

const cargarMetodosPago = async () => {
  // Datos demo para gráfico de métodos de pago
  datosMetodosPago.value = [
    { name: 'Efectivo', value: 45 },
    { name: 'Transferencia', value: 25 },
    { name: 'Tarjeta', value: 15 },
    { name: 'Nequi', value: 10 },
    { name: 'DaviPlata', value: 5 }
  ]
}

const cargarTopClientes = async () => {
  // Datos demo para top clientes
  topClientes.value = [
    { id: 1, nombre: 'Juan Pérez', comprasTotales: 3200000, deuda: 500000, ultimaCompra: '2024-01-15' },
    { id: 2, nombre: 'María González', comprasTotales: 2800000, deuda: 0, ultimaCompra: '2024-01-10' },
    { id: 3, nombre: 'Carlos Rodríguez', comprasTotales: 2500000, deuda: 1200000, ultimaCompra: '2024-01-05' },
    { id: 4, nombre: 'Ana Martínez', comprasTotales: 2100000, deuda: 300000, ultimaCompra: '2023-12-28' },
    { id: 5, nombre: 'Pedro López', comprasTotales: 1900000, deuda: 0, ultimaCompra: '2023-12-20' }
  ]
}

const cargarTopProductos = async () => {
  // Datos demo para top productos
  topProductos.value = [
    { id: 1, nombre: 'Arroz 5kg', vendidos: 450, ingresos: 4500000, stock: 25 },
    { id: 2, nombre: 'Aceite 1L', vendidos: 320, ingresos: 2560000, stock: 15 },
    { id: 3, nombre: 'Leche 1L', vendidos: 280, ingresos: 1400000, stock: 8 },
    { id: 4, nombre: 'Azúcar 2kg', vendidos: 250, ingresos: 1250000, stock: 12 },
    { id: 5, nombre: 'Café 500g', vendidos: 180, ingresos: 2160000, stock: 30 }
  ]
}

const cargarReporteVentas = async () => {
  // Datos demo para reporte de ventas
  reporteVentas.value = [
    { id: 'V001', fecha: '2024-01-15', clienteNombre: 'Juan Pérez', total: 250000, pagado: 150000, saldoPendiente: 100000, estado: 'parcial' },
    { id: 'V002', fecha: '2024-01-10', clienteNombre: 'María González', total: 180000, pagado: 180000, saldoPendiente: 0, estado: 'pagada' },
    { id: 'V003', fecha: '2024-01-05', clienteNombre: 'Carlos Rodríguez', total: 320000, pagado: 200000, saldoPendiente: 120000, estado: 'parcial' }
  ]
}

const cargarReportePagos = async () => {
  // Datos demo para reporte de pagos
  reportePagos.value = [
    { id: 'P001', fecha: '2024-01-15', clienteNombre: 'Juan Pérez', monto: 100000, metodoPago: 'efectivo', ventaId: 'V001' },
    { id: 'P002', fecha: '2024-01-10', clienteNombre: 'María González', monto: 180000, metodoPago: 'transferencia', ventaId: 'V002' },
    { id: 'P003', fecha: '2024-01-05', clienteNombre: 'Carlos Rodríguez', monto: 200000, metodoPago: 'nequi', ventaId: 'V003' }
  ]
}

const cargarReporteClientes = async () => {
  // Datos demo para reporte de clientes
  reporteClientes.value = [
    { id: 'C001', nombre: 'Juan Pérez', telefono: '3123456789', limiteCredito: 1000000, deudaActual: 500000, estadoCredito: 'activo' },
    { id: 'C002', nombre: 'María González', telefono: '3224567890', limiteCredito: 800000, deudaActual: 0, estadoCredito: 'al día' },
    { id: 'C003', nombre: 'Carlos Rodríguez', telefono: '3335678901', limiteCredito: 1500000, deudaActual: 1200000, estadoCredito: 'atrasado' }
  ]
}

const cargarReporteProductos = async () => {
  // Datos demo para reporte de productos
  reporteProductos.value = [
    { id: 'P001', nombre: 'Arroz 5kg', categoria: 'Granos', precio: 10000, stock: 25, vendidos: 450, ingresos: 4500000 },
    { id: 'P002', nombre: 'Aceite 1L', categoria: 'Aceites', precio: 8000, stock: 15, vendidos: 320, ingresos: 2560000 },
    { id: 'P003', nombre: 'Leche 1L', categoria: 'Lácteos', precio: 5000, stock: 8, vendidos: 280, ingresos: 1400000 }
  ]
}

const cargarDatosDemo = () => {
  // Cargar todos los datos demo
  cargarVentasMensuales()
  cargarMetodosPago()
  cargarTopClientes()
  cargarTopProductos()
  cargarReporteVentas()
  cargarReportePagos()
  cargarReporteClientes()
  cargarReporteProductos()
}

// Función para inicializar gráficos ECharts
const inicializarGraficos = () => {
  // Destruir gráficos anteriores
  chartInstances.forEach(instance => {
    if (instance) {
      instance.dispose()
    }
  })
  chartInstances.length = 0
  
  // Gráfico de ventas mensuales
  if (chartVentas.value) {
    const ventasChart = echarts.init(chartVentas.value)
    chartInstances.push(ventasChart)
    
    const ventasOption = {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: ${c}'
      },
      xAxis: {
        type: 'category',
        data: datosVentasMensuales.value.map(item => item.mes)
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '${value}'
        }
      },
      series: [{
        data: datosVentasMensuales.value.map(item => item.ventas),
        type: 'line',
        smooth: true,
        areaStyle: {
          opacity: 0.3
        },
        lineStyle: {
          width: 3
        },
        itemStyle: {
          color: '#1976D2'
        }
      }]
    }
    
    ventasChart.setOption(ventasOption)
  }
  
  // Gráfico de métodos de pago
  if (chartMetodosPago.value) {
    const metodosChart = echarts.init(chartMetodosPago.value)
    chartInstances.push(metodosChart)
    
    const metodosOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c}% ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'center'
      },
      series: [{
        name: 'Métodos de Pago',
        type: 'pie',
        radius: '70%',
        center: ['50%', '50%'],
        data: datosMetodosPago.value,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    }
    
    metodosChart.setOption(metodosOption)
  }
  
  // Redimensionar gráficos cuando cambie el tamaño de la ventana
  window.addEventListener('resize', () => {
    chartInstances.forEach(instance => {
      if (instance) {
        instance.resize()
      }
    })
  })
}

// Funciones de exportación
const exportarTodo = async (formato) => {
  $q.dialog({
    title: '📊 Exportar Todos los Datos',
    message: `¿Exportar todos los datos en formato ${formato.toUpperCase()}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    $q.notify({
      type: 'info',
      message: `Generando reporte ${formato.toUpperCase()}...`,
      timeout: 2000
    })
    
    // Simular generación de reporte
    setTimeout(() => {
      const enlace = document.createElement('a')
      enlace.href = '#'
      enlace.download = `reporte_completo_${new Date().toISOString().split('T')[0]}.${formato}`
      enlace.click()
      
      $q.notify({
        type: 'positive',
        message: '✅ Reporte generado exitosamente',
        caption: 'El archivo se está descargando',
        icon: 'cloud_download',
        timeout: 3000
      })
    }, 1500)
  })
}

const exportarModulo = (modulo) => {
  $q.notify({
    type: 'info',
    message: `Generando reporte de ${modulo}...`,
    icon: 'description',
    timeout: 2000
  })
  
  setTimeout(() => {
    $q.notify({
      type: 'positive',
      message: `✅ Reporte de ${modulo} listo`,
      caption: 'Consulta la pestaña correspondiente para descargar',
      timeout: 3000
    })
    
    // Cambiar a la pestaña correspondiente
    tabReportes.value = modulo
  }, 1000)
}

const exportarTopClientes = () => {
  descargarCSV(topClientes.value, 'top_clientes')
}

const exportarTopProductos = () => {
  descargarCSV(topProductos.value, 'top_productos')
}

const exportarCSV = (tipo) => {
  let datos = []
  let nombreArchivo = ''
  
  switch (tipo) {
    case 'ventas':
      datos = reporteVentas.value
      nombreArchivo = 'reporte_ventas'
      break
    case 'pagos':
      datos = reportePagos.value
      nombreArchivo = 'reporte_pagos'
      break
    case 'clientes':
      datos = reporteClientes.value
      nombreArchivo = 'reporte_clientes'
      break
    case 'productos':
      datos = reporteProductos.value
      nombreArchivo = 'reporte_productos'
      break
  }
  
  descargarCSV(datos, nombreArchivo)
}

const descargarCSV = (datos, nombreBase) => {
  if (!datos || datos.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No hay datos para exportar',
      timeout: 2000
    })
    return
  }
  
  // Convertir a CSV
  const cabeceras = Object.keys(datos[0])
  const filas = datos.map(fila => 
    cabeceras.map(header => {
      const valor = fila[header]
      // Escapar comillas
      return `"${String(valor || '').replace(/"/g, '""')}"`
    }).join(',')
  ).join('\n')
  
  const csvContent = cabeceras.join(',') + '\n' + filas
  
  // Crear y descargar archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, `${nombreBase}_${new Date().toISOString().split('T')[0]}.csv`)
  } else {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${nombreBase}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  $q.notify({
    type: 'positive',
    message: '✅ Archivo CSV generado',
    caption: 'El archivo se está descargando',
    icon: 'cloud_download',
    timeout: 3000
  })
}

// Funciones de formato
const formatPrecio = (precio) => {
  return new Intl.NumberFormat('es-CO').format(precio || 0)
}

const formatFecha = (fecha) => {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleDateString('es-CO')
}

// Cargar al iniciar
onMounted(() => {
  cargarDatos()
})

// Cleanup al desmontar
onMounted(() => {
  // Cargar datos iniciales
  cargarDatos()
  
  // Configurar limpieza al desmontar
  return () => {
    chartInstances.forEach(instance => {
      if (instance) {
        instance.dispose()
      }
    })
    window.removeEventListener('resize', () => {})
  }
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

.chart-container {
  min-height: 300px;
  width: 100%;
}
</style>