<template>
  <div>
    <div class="text-h6 q-mb-md">📦 Historial de Pedidos</div>
    
    <!-- FILTROS -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="busqueda"
          placeholder="🔍 Buscar pedidos..."
          outlined
          dense
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-6 col-md-4">
        <q-select
          v-model="filtroProveedor"
          :options="proveedoresUnicos"
          label="Filtrar por proveedor"
          outlined
          dense
          clearable
          emit-value
          map-options
        />
      </div>
      <div class="col-6 col-md-4">
        <q-select
          v-model="filtroEstado"
          :options="opcionesEstado"
          label="Estado"
          outlined
          dense
          clearable
          emit-value
          map-options
        />
      </div>
    </div>
    
    <!-- GRAFICO ESTADOS -->
    <div v-if="pedidosFiltrados.length > 0" class="q-mb-md">
      <div class="text-subtitle2 q-mb-sm">📊 Distribución por Estado</div>
      <div class="row q-col-gutter-sm">
        <div v-for="estado in distribucionEstados" :key="estado.nombre" 
             class="col-6 col-md-3">
          <q-card flat :style="{borderLeft: `4px solid ${estado.color}`}">
            <q-card-section class="q-pa-sm">
              <div class="row items-center">
                <div class="col">
                  <div class="text-caption">{{ estado.nombre }}</div>
                  <div class="text-weight-bold">{{ estado.cantidad }}</div>
                </div>
                <div class="col-auto">
                  <q-badge :color="estado.color">
                    {{ estado.porcentaje }}%
                  </q-badge>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
    
    <!-- TABLA -->
    <div v-if="pedidosFiltrados.length === 0" class="text-center q-pa-lg text-grey">
      <q-icon name="inventory_2" size="xl" />
      <div class="q-mt-md">No hay pedidos en el historial</div>
    </div>
    
    <q-table
      v-else
      :rows="pedidosFiltrados"
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
      <template v-slot:body-cell-fechaPedido="props">
        <q-td :props="props">
          <div>{{ formatFecha(props.row.fechaPedido) }}</div>
          <div v-if="props.row.fechaEntrega" class="text-caption">
            Entrega: {{ formatFecha(props.row.fechaEntrega) }}
          </div>
        </q-td>
      </template>
      
      <!-- COLUMNA ESTADO -->
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-badge :color="getColorEstado(props.row.estado)" class="q-px-sm">
            {{ props.row.estado || 'pendiente' }}
          </q-badge>
        </q-td>
      </template>
      
      <!-- COLUMNA TOTAL -->
      <template v-slot:body-cell-total="props">
        <q-td :props="props" class="text-right">
          <div class="text-weight-bold text-orange">
            ${{ formatPrecio(props.row.total) }}
          </div>
          <div v-if="props.row.cantidad" class="text-caption">
            ${{ formatPrecio((props.row.total || 0) / (props.row.cantidad || 1)) }} c/u
          </div>
        </q-td>
      </template>
      
      <!-- COLUMNA DIAS -->
      <template v-slot:body-cell-dias="props">
        <q-td :props="props" class="text-center">
          <div :class="getClaseDias(props.row)">
            {{ calcularDias(props.row.fechaPedido || props.row.fecha) }}
          </div>
        </q-td>
      </template>
    </q-table>
    
    <!-- RESUMEN -->
    <div v-if="pedidosFiltrados.length > 0" class="q-mt-md">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-card flat class="bg-orange-1">
            <q-card-section class="text-center">
              <div class="text-h5 text-weight-bold">{{ pedidosFiltrados.length }}</div>
              <div class="text-caption">Total pedidos</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card flat class="bg-blue-1">
            <q-card-section class="text-center">
              <div class="text-h5 text-weight-bold">${{ formatPrecio(totalValor) }}</div>
              <div class="text-caption">Valor total</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card flat class="bg-green-1">
            <q-card-section class="text-center">
              <div class="text-h5 text-weight-bold">{{ pedidosRecibidos }}</div>
              <div class="text-caption">Pedidos recibidos</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  pedidos: {
    type: Array,
    default: () => []
  }
})

// Reactivos
const busqueda = ref('')
const filtroProveedor = ref(null)
const filtroEstado = ref(null)

const opcionesEstado = [
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Enviado', value: 'enviado' },
  { label: 'Recibido', value: 'recibido' },
  { label: 'Cancelado', value: 'cancelado' },
  { label: 'Parcial', value: 'parcial' }
]

// Columnas
const columns = [
  { name: 'fechaPedido', label: 'Fechas', field: 'fechaPedido', align: 'left', sortable: true },
  { name: 'producto', label: 'Producto / Proveedor', field: 'producto', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'center' },
  { name: 'total', label: 'Valor', field: 'total', align: 'right', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  { name: 'dias', label: 'Días', field: 'dias', align: 'center' }
]

// Paginación
const pagination = {
  sortBy: 'fechaPedido',
  descending: true,
  rowsPerPage: 10
}

// Computadas
const proveedoresUnicos = computed(() => {
  const proveedores = [...new Set(props.pedidos.map(p => p.proveedorNombre).filter(Boolean))]
  return proveedores.map(p => ({ label: p, value: p }))
})

const pedidosFiltrados = computed(() => {
  let resultado = [...props.pedidos]
  
  // Filtrar por búsqueda
  if (busqueda.value.trim()) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter(p => 
      (p.producto && p.producto.toLowerCase().includes(termino)) ||
      (p.proveedorNombre && p.proveedorNombre.toLowerCase().includes(termino)) ||
      (p.observaciones && p.observaciones.toLowerCase().includes(termino))
    )
  }
  
  // Filtrar por proveedor
  if (filtroProveedor.value) {
    resultado = resultado.filter(p => p.proveedorNombre === filtroProveedor.value)
  }
  
  // Filtrar por estado
  if (filtroEstado.value) {
    resultado = resultado.filter(p => p.estado === filtroEstado.value)
  }
  
  // Ordenar por fecha descendente
  return resultado.sort((a, b) => {
    const fechaA = a.fechaPedido?.toDate?.() || new Date(a.fechaPedido || a.fecha)
    const fechaB = b.fechaPedido?.toDate?.() || new Date(b.fechaPedido || b.fecha)
    return fechaB - fechaA
  })
})

const totalValor = computed(() => {
  return pedidosFiltrados.value.reduce((sum, p) => sum + (p.total || 0), 0)
})

const pedidosRecibidos = computed(() => {
  return pedidosFiltrados.value.filter(p => p.estado === 'recibido').length
})

const distribucionEstados = computed(() => {
  const estados = {}
  
  pedidosFiltrados.value.forEach(pedido => {
    const estado = pedido.estado || 'pendiente'
    if (!estados[estado]) {
      estados[estado] = 0
    }
    estados[estado]++
  })
  
  return Object.entries(estados).map(([estado, cantidad]) => {
    const porcentaje = Math.round((cantidad / pedidosFiltrados.value.length) * 100)
    
    return {
      nombre: estado.charAt(0).toUpperCase() + estado.slice(1),
      cantidad,
      porcentaje,
      color: getColorEstado(estado)
    }
  })
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
    month: '2-digit' 
  })
}

const calcularDias = (fecha) => {
  if (!fecha) return 0
  const fechaObj = fecha.toDate ? fecha.toDate() : new Date(fecha)
  const hoy = new Date()
  const diferencia = hoy - fechaObj
  return Math.floor(diferencia / (1000 * 60 * 60 * 24))
}

const getColorEstado = (estado) => {
  const colores = {
    pendiente: 'orange',
    parcial: 'yellow',
    enviado: 'blue',
    recibido: 'green',
    cancelado: 'red'
  }
  return colores[estado] || 'grey'
}

const getClaseDias = (pedido) => {
  const dias = calcularDias(pedido.fechaPedido || pedido.fecha)
  
  if (pedido.estado === 'recibido') return 'text-positive'
  if (pedido.estado === 'cancelado') return 'text-negative'
  
  if (dias > 30) return 'text-negative text-weight-bold'
  if (dias > 15) return 'text-warning text-weight-medium'
  
  return 'text-grey'
}
</script>