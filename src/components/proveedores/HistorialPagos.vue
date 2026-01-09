<template>
  <div>
    <div class="text-h6 q-mb-md">💳 Historial de Pagos</div>
    
    <!-- FILTROS -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-input
          v-model="busqueda"
          placeholder="🔍 Buscar pagos..."
          outlined
          dense
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-6 col-md-3">
        <q-select
          v-model="filtroMetodo"
          :options="metodosPago"
          label="Método de pago"
          outlined
          dense
          clearable
          emit-value
          map-options
        />
      </div>
      <div class="col-6 col-md-3">
        <q-select
          v-model="orden"
          :options="opcionesOrden"
          label="Ordenar por"
          outlined
          dense
          emit-value
          map-options
        />
      </div>
    </div>
    
    <!-- TABLA -->
    <div v-if="pagosFiltrados.length === 0" class="text-center q-pa-lg text-grey">
      <q-icon name="receipt_off" size="xl" />
      <div class="q-mt-md">No hay pagos en el historial</div>
    </div>
    
    <q-table
      v-else
      :rows="pagosFiltrados"
      :columns="columns"
      row-key="id"
      dense
      flat
      bordered
      separator="cell"
      :pagination="pagination"
    >
      <!-- COLUMNA MÉTODO -->
      <template v-slot:body-cell-metodo="props">
        <q-td :props="props">
          <div class="row items-center no-wrap">
            <q-icon :name="getIconMetodo(props.row.metodo)" 
                    :color="getColorMetodo(props.row.metodo)"
                    class="q-mr-sm" />
            <span>{{ getNombreMetodo(props.row.metodo) }}</span>
          </div>
          <div v-if="props.row.referencia" class="text-caption">
            Ref: {{ props.row.referencia }}
          </div>
        </q-td>
      </template>
      
      <!-- COLUMNA FECHA -->
      <template v-slot:body-cell-fecha="props">
        <q-td :props="props">
          {{ formatFecha(props.row.fecha) }}
        </q-td>
      </template>
      
      <!-- COLUMNA MONTO -->
      <template v-slot:body-cell-monto="props">
        <q-td :props="props" class="text-right">
          <div class="text-weight-bold text-green">
            ${{ formatPrecio(props.row.monto) }}
          </div>
        </q-td>
      </template>
      
      <!-- COLUMNA PROVEEDOR -->
      <template v-slot:body-cell-proveedor="props">
        <q-td :props="props">
          <div class="text-weight-medium">{{ props.row.proveedorNombre }}</div>
          <div v-if="props.row.observaciones" class="text-caption">
            {{ props.row.observaciones }}
          </div>
        </q-td>
      </template>
    </q-table>
    
    <!-- RESUMEN -->
    <div v-if="pagosFiltrados.length > 0" class="q-mt-md">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-3">
          <q-card flat class="bg-green-1">
            <q-card-section class="text-center">
              <div class="text-h5 text-weight-bold">${{ formatPrecio(totalPagos) }}</div>
              <div class="text-caption">Total pagado</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card flat class="bg-blue-1">
            <q-card-section class="text-center">
              <div class="text-h5 text-weight-bold">{{ pagosFiltrados.length }}</div>
              <div class="text-caption">Pagos realizados</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card flat class="bg-orange-1">
            <q-card-section class="text-center">
              <div class="text-h5 text-weight-bold">{{ metodosUsados.length }}</div>
              <div class="text-caption">Métodos usados</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card flat class="bg-purple-1">
            <q-card-section class="text-center">
              <div class="text-h5 text-weight-bold">${{ formatPrecio(promedioPago) }}</div>
              <div class="text-caption">Promedio por pago</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      
      <!-- DISTRIBUCIÓN POR MÉTODO -->
      <div class="q-mt-md">
        <div class="text-subtitle2 q-mb-sm">📊 Distribución por método de pago</div>
        <div class="row q-col-gutter-sm">
          <div v-for="metodo in distribucionMetodos" :key="metodo.nombre" 
               class="col-12 col-md-3">
            <q-card flat :style="{borderLeft: `4px solid ${metodo.color}`}">
              <q-card-section class="q-pa-sm">
                <div class="row items-center">
                  <div class="col">
                    <div class="text-caption">{{ metodo.nombre }}</div>
                    <div class="text-weight-bold">${{ formatPrecio(metodo.total) }}</div>
                  </div>
                  <div class="col-auto">
                    <q-badge :color="metodo.color">
                      {{ metodo.porcentaje }}%
                    </q-badge>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  pagos: {
    type: Array,
    default: () => []
  }
})

// Reactivos
const busqueda = ref('')
const filtroMetodo = ref(null)
const orden = ref('fecha-desc')

const metodosPago = [
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'Transferencia', value: 'transferencia' },
  { label: 'Cheque', value: 'cheque' },
  { label: 'Tarjeta', value: 'tarjeta' }
]

const opcionesOrden = [
  { label: 'Fecha (reciente)', value: 'fecha-desc' },
  { label: 'Fecha (antiguo)', value: 'fecha-asc' },
  { label: 'Monto (mayor)', value: 'monto-desc' },
  { label: 'Monto (menor)', value: 'monto-asc' }
]

// Columnas
const columns = [
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'metodo', label: 'Método', field: 'metodo', align: 'left' },
  { name: 'proveedor', label: 'Proveedor', field: 'proveedorNombre', align: 'left' },
  { name: 'monto', label: 'Monto', field: 'monto', align: 'right', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' }
]

// Paginación
const pagination = {
  sortBy: 'fecha',
  descending: true,
  rowsPerPage: 10
}

// Computadas
const pagosFiltrados = computed(() => {
  let resultado = [...props.pagos]
  
  // Filtrar por búsqueda
  if (busqueda.value.trim()) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter(p =>
      (p.proveedorNombre && p.proveedorNombre.toLowerCase().includes(termino)) ||
      (p.referencia && p.referencia.toLowerCase().includes(termino)) ||
      (p.observaciones && p.observaciones.toLowerCase().includes(termino))
    )
  }
  
  // Filtrar por método
  if (filtroMetodo.value) {
    resultado = resultado.filter(p => p.metodo === filtroMetodo.value)
  }
  
  // Ordenar
  switch (orden.value) {
    case 'fecha-desc':
      resultado.sort((a, b) => {
        const fechaA = a.fecha?.toDate?.() || new Date(a.fecha)
        const fechaB = b.fecha?.toDate?.() || new Date(b.fecha)
        return fechaB - fechaA
      })
      break
    case 'fecha-asc':
      resultado.sort((a, b) => {
        const fechaA = a.fecha?.toDate?.() || new Date(a.fecha)
        const fechaB = b.fecha?.toDate?.() || new Date(b.fecha)
        return fechaA - fechaB
      })
      break
    case 'monto-desc':
      resultado.sort((a, b) => (b.monto || 0) - (a.monto || 0))
      break
    case 'monto-asc':
      resultado.sort((a, b) => (a.monto || 0) - (b.monto || 0))
      break
  }
  
  return resultado
})

const totalPagos = computed(() => {
  return pagosFiltrados.value.reduce((sum, p) => sum + (p.monto || 0), 0)
})

const promedioPago = computed(() => {
  if (pagosFiltrados.value.length === 0) return 0
  return totalPagos.value / pagosFiltrados.value.length
})

const metodosUsados = computed(() => {
  const metodos = new Set(pagosFiltrados.value.map(p => p.metodo).filter(Boolean))
  return Array.from(metodos)
})

const distribucionMetodos = computed(() => {
  const distribucion = {}
  
  pagosFiltrados.value.forEach(pago => {
    const metodo = pago.metodo || 'desconocido'
    if (!distribucion[metodo]) {
      distribucion[metodo] = 0
    }
    distribucion[metodo] += pago.monto || 0
  })
  
  return Object.entries(distribucion).map(([metodo, total]) => {
    const porcentaje = totalPagos.value > 0 
      ? Math.round((total / totalPagos.value) * 100) 
      : 0
    
    return {
      nombre: getNombreMetodo(metodo),
      total,
      porcentaje,
      color: getColorMetodo(metodo)
    }
  })
})

// Métodos auxiliares
const getColorMetodo = (metodo) => {
  const colores = {
    efectivo: 'green',
    transferencia: 'blue',
    cheque: 'orange',
    tarjeta: 'purple',
    desconocido: 'grey'
  }
  return colores[metodo] || 'grey'
}

const getIconMetodo = (metodo) => {
  const iconos = {
    efectivo: 'payments',
    transferencia: 'account_balance',
    cheque: 'receipt',
    tarjeta: 'credit_card',
    desconocido: 'help'
  }
  return iconos[metodo] || 'payments'
}

const getNombreMetodo = (metodo) => {
  const nombres = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
    cheque: 'Cheque',
    tarjeta: 'Tarjeta',
    desconocido: 'Desconocido'
  }
  return nombres[metodo] || metodo || 'Sin método'
}

const formatPrecio = (precio) => {
  return new Intl.NumberFormat('es-CO').format(precio || 0)
}

const formatFecha = (fecha) => {
  if (!fecha) return 'Sin fecha'
  const fechaObj = fecha.toDate ? fecha.toDate() : new Date(fecha)
  return fechaObj.toLocaleDateString('es-CO', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
}
</script>