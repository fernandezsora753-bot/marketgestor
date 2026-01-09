<template>
  <div>
    <div class="text-h6 q-mb-md">🛒 Historial de Compras</div>
    
    <!-- FILTROS -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-input
          v-model="busqueda"
          placeholder="🔍 Buscar compras..."
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
        <q-input
          v-model="fechaInicio"
          label="Desde"
          type="date"
          outlined
          dense
        />
      </div>
      <div class="col-6 col-md-3">
        <q-input
          v-model="fechaFin"
          label="Hasta"
          type="date"
          outlined
          dense
        />
      </div>
    </div>
    
    <!-- TABLA -->
    <div v-if="comprasFiltradas.length === 0" class="text-center q-pa-lg text-grey">
      <q-icon name="history_off" size="xl" />
      <div class="q-mt-md">No hay compras en el historial</div>
    </div>
    
    <q-table
      v-else
      :rows="comprasFiltradas"
      :columns="columns"
      row-key="id"
      dense
      flat
      bordered
      separator="cell"
      :pagination="pagination"
    >
      <!-- COLUMNA PRODUCTO -->
      <template v-slot:body-cell-producto="props">
        <q-td :props="props">
          <div class="text-weight-bold">{{ props.row.producto || 'N/A' }}</div>
          <div class="text-caption">
            {{ props.row.proveedorNombre || 'Sin proveedor' }}
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
          <div class="text-weight-bold text-blue">
            ${{ formatPrecio(props.row.total || props.row.monto) }}
          </div>
        </q-td>
      </template>
      
      <!-- COLUMNA ACCIONES -->
      <template v-slot:body-cell-acciones="props">
        <q-td :props="props" class="text-center">
          <q-btn
            flat
            dense
            round
            icon="visibility"
            color="primary"
            size="sm"
            @click="verDetalle(props.row)"
          >
            <q-tooltip>Ver detalle</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    
    <!-- RESUMEN -->
    <div v-if="comprasFiltradas.length > 0" class="q-mt-md">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-card flat class="bg-blue-1">
            <q-card-section class="text-center">
              <div class="text-h5 text-weight-bold">${{ formatPrecio(totalCompras) }}</div>
              <div class="text-caption">Total comprado</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card flat class="bg-green-1">
            <q-card-section class="text-center">
              <div class="text-h5 text-weight-bold">{{ comprasFiltradas.length }}</div>
              <div class="text-caption">Compras realizadas</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card flat class="bg-orange-1">
            <q-card-section class="text-center">
              <div class="text-h5 text-weight-bold">${{ formatPrecio(promedioCompra) }}</div>
              <div class="text-caption">Promedio por compra</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const emit = defineEmits(['ver-detalle'])

const props = defineProps({
  compras: {
    type: Array,
    default: () => []
  }
})

// Reactivos
const busqueda = ref('')
const fechaInicio = ref('')
const fechaFin = ref('')

// Columnas de la tabla
const columns = [
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'producto', label: 'Producto / Proveedor', field: 'producto', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'center' },
  { name: 'monto', label: 'Monto', field: 'total', align: 'right', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

// Paginación
const pagination = {
  sortBy: 'fecha',
  descending: true,
  rowsPerPage: 10
}

// Computadas
const comprasFiltradas = computed(() => {
  let resultado = [...props.compras]
  
  // Filtrar por búsqueda
  if (busqueda.value.trim()) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter(c =>
      (c.producto && c.producto.toLowerCase().includes(termino)) ||
      (c.proveedorNombre && c.proveedorNombre.toLowerCase().includes(termino)) ||
      (c.observaciones && c.observaciones.toLowerCase().includes(termino))
    )
  }
  
  // Filtrar por fecha
  if (fechaInicio.value) {
    const fechaInicioObj = new Date(fechaInicio.value)
    resultado = resultado.filter(c => {
      const fechaCompra = c.fecha?.toDate?.() || new Date(c.fecha)
      return fechaCompra >= fechaInicioObj
    })
  }
  
  if (fechaFin.value) {
    const fechaFinObj = new Date(fechaFin.value)
    fechaFinObj.setHours(23, 59, 59, 999)
    resultado = resultado.filter(c => {
      const fechaCompra = c.fecha?.toDate?.() || new Date(c.fecha)
      return fechaCompra <= fechaFinObj
    })
  }
  
  // Ordenar por fecha descendente
  return resultado.sort((a, b) => {
    const fechaA = a.fecha?.toDate?.() || new Date(a.fecha)
    const fechaB = b.fecha?.toDate?.() || new Date(b.fecha)
    return fechaB - fechaA
  })
})

const totalCompras = computed(() => {
  return comprasFiltradas.value.reduce((sum, c) => sum + (c.total || c.monto || 0), 0)
})

const promedioCompra = computed(() => {
  if (comprasFiltradas.value.length === 0) return 0
  return totalCompras.value / comprasFiltradas.value.length
})

// Métodos
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

const verDetalle = (compra) => {
  emit('ver-detalle', compra)
}
</script>