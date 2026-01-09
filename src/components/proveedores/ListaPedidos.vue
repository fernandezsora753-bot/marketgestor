<template>
  <div>
    <div class="text-h6 q-mb-md">📦 Todos los Pedidos</div>
    
    <!-- FILTROS -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-input
          v-model="busqueda"
          placeholder="🔍 Buscar por producto o proveedor..."
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
    
    <!-- LISTA -->
    <div v-if="pedidosFiltrados.length === 0" class="text-center q-pa-lg text-grey">
      <q-icon name="inventory_2" size="xl" />
      <div class="q-mt-md">No hay pedidos registrados</div>
    </div>
    
    <q-list bordered separator v-else>
      <q-item v-for="pedido in pedidosFiltrados" :key="pedido.id" class="q-my-xs">
        <q-item-section avatar>
          <q-avatar :color="getColorEstado(pedido.estado)" text-color="white">
            <q-icon name="inventory" />
          </q-avatar>
        </q-item-section>
        
        <q-item-section>
          <q-item-label class="text-weight-bold">
            {{ pedido.producto || 'Pedido sin nombre' }}
          </q-item-label>
          <q-item-label caption>
            <q-icon name="local_shipping" size="xs" /> {{ pedido.proveedorNombre }}
            <q-icon name="calendar_month" size="xs" class="q-ml-sm" /> 
            {{ formatFecha(pedido.fechaPedido || pedido.fecha) }}
            <q-badge :color="getColorBadgeEstado(pedido.estado)" class="q-ml-xs">
              {{ pedido.estado || 'pendiente' }}
            </q-badge>
          </q-item-label>
          <q-item-label caption>
            <q-badge color="blue" class="q-mr-xs">Cant: {{ pedido.cantidad }}</q-badge>
            <q-badge color="orange">Total: ${{ formatPrecio(pedido.total) }}</q-badge>
          </q-item-label>
          <q-item-label v-if="pedido.observaciones" caption class="q-mt-xs">
            <q-icon name="note" size="xs" /> {{ pedido.observaciones }}
          </q-item-label>
        </q-item-section>
        
        <q-item-section side>
          <div class="text-right">
            <div class="text-h6 text-orange">${{ formatPrecio(pedido.total) }}</div>
            <div class="text-caption">
              {{ calcularDias(pedido.fechaPedido || pedido.fecha) }} días
            </div>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
    
    <!-- RESUMEN -->
    <div v-if="pedidosFiltrados.length > 0" class="q-mt-md">
      <q-chip color="orange" text-color="white" icon="inventory">
        {{ pedidosFiltrados.length }} pedidos
      </q-chip>
      <q-chip color="blue" text-color="white" icon="attach_money">
        Total valor: ${{ formatPrecio(totalValor) }}
      </q-chip>
      <q-chip v-if="pendientesCount > 0" color="red" text-color="white" icon="schedule">
        {{ pendientesCount }} pendientes
      </q-chip>
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

const busqueda = ref('')
const filtroEstado = ref(null)
const orden = ref('fecha-desc')

const opcionesEstado = [
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Enviado', value: 'enviado' },
  { label: 'Recibido', value: 'recibido' },
  { label: 'Cancelado', value: 'cancelado' },
  { label: 'Parcial', value: 'parcial' }
]

const opcionesOrden = [
  { label: 'Fecha (reciente)', value: 'fecha-desc' },
  { label: 'Fecha (antiguo)', value: 'fecha-asc' },
  { label: 'Valor (mayor)', value: 'valor-desc' },
  { label: 'Valor (menor)', value: 'valor-asc' },
  { label: 'Estado', value: 'estado' }
]

// Computadas
const pedidosFiltrados = computed(() => {
  let resultado = [...props.pedidos]
  
  // Filtrar por búsqueda
  if (busqueda.value.trim()) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter(p => 
      (p.producto && p.producto.toLowerCase().includes(termino)) ||
      (p.proveedorNombre && p.proveedorNombre.toLowerCase().includes(termino))
    )
  }
  
  // Filtrar por estado
  if (filtroEstado.value) {
    resultado = resultado.filter(p => p.estado === filtroEstado.value)
  }
  
  // Ordenar
  switch (orden.value) {
    case 'fecha-desc':
      resultado.sort((a, b) => {
        const fechaA = a.fechaPedido?.toDate?.() || new Date(a.fechaPedido || a.fecha)
        const fechaB = b.fechaPedido?.toDate?.() || new Date(b.fechaPedido || b.fecha)
        return fechaB - fechaA
      })
      break
    case 'fecha-asc':
      resultado.sort((a, b) => {
        const fechaA = a.fechaPedido?.toDate?.() || new Date(a.fechaPedido || a.fecha)
        const fechaB = b.fechaPedido?.toDate?.() || new Date(b.fechaPedido || b.fecha)
        return fechaA - fechaB
      })
      break
    case 'valor-desc':
      resultado.sort((a, b) => (b.total || 0) - (a.total || 0))
      break
    case 'valor-asc':
      resultado.sort((a, b) => (a.total || 0) - (b.total || 0))
      break
    case 'estado':
      const ordenEstados = ['pendiente', 'parcial', 'enviado', 'recibido', 'cancelado']
      resultado.sort((a, b) => {
        const indexA = ordenEstados.indexOf(a.estado || 'pendiente')
        const indexB = ordenEstados.indexOf(b.estado || 'pendiente')
        return indexA - indexB
      })
      break
  }
  
  return resultado
})

const totalValor = computed(() => {
  return pedidosFiltrados.value.reduce((sum, p) => sum + (p.total || 0), 0)
})

const pendientesCount = computed(() => {
  return pedidosFiltrados.value.filter(p => p.estado === 'pendiente').length
})

// Métodos
const formatPrecio = (precio) => {
  return new Intl.NumberFormat('es-CO').format(precio || 0)
}

const formatFecha = (fecha) => {
  if (!fecha) return 'Sin fecha'
  const fechaObj = fecha.toDate ? fecha.toDate() : new Date(fecha)
  return fechaObj.toLocaleDateString('es-CO')
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

const getColorBadgeEstado = (estado) => {
  const colores = {
    pendiente: 'orange',
    parcial: 'yellow',
    enviado: 'blue',
    recibido: 'green',
    cancelado: 'red'
  }
  return colores[estado] || 'grey'
}
</script>