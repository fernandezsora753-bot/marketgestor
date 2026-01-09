<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon name="inventory" color="orange" class="q-mr-sm" />
        Pedidos Pendientes de Recepción
      </div>
      
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
      
      <!-- LISTA DE PEDIDOS -->
      <div v-if="pedidosFiltrados.length > 0">
        <q-list bordered separator>
          <q-item 
            v-for="pedido in pedidosFiltrados" 
            :key="pedido.id"
            class="q-my-xs"
          >
            <q-item-section avatar>
              <q-avatar :color="getColorEstado(pedido.estado)" text-color="white">
                <q-icon name="inventory" />
              </q-avatar>
            </q-item-section>
            
            <q-item-section>
              <q-item-label class="text-weight-bold">
                {{ pedido.producto || 'Producto sin nombre' }}
              </q-item-label>
              <q-item-label caption>
                <q-icon name="local_shipping" size="xs" /> {{ pedido.proveedorNombre }}
                <q-icon name="calendar_month" size="xs" class="q-ml-sm" /> {{ formatFecha(pedido.fecha) }}
              </q-item-label>
              <q-item-label caption>
                <q-badge color="blue" class="q-mr-xs">
                  Cantidad: {{ pedido.cantidad }}
                </q-badge>
                <q-badge color="orange" class="q-mr-xs">
                  Total: ${{ formatPrecio(pedido.total || pedido.precio) }}
                </q-badge>
                <q-badge :color="getColorBadgeEstado(pedido.estado)">
                  {{ pedido.estado || 'pendiente' }}
                </q-badge>
              </q-item-label>
              <q-item-label v-if="pedido.observaciones" caption class="q-mt-xs">
                <q-icon name="note" size="xs" /> {{ pedido.observaciones }}
              </q-item-label>
            </q-item-section>
            
            <q-item-section side top>
              <div class="text-right">
                <div class="text-h6 text-orange">
                  ${{ formatPrecio(pedido.total || pedido.precio) }}
                </div>
                <div class="text-caption">
                  {{ calcularDias(pedido.fecha) }} días
                </div>
              </div>
            </q-item-section>
            
            <q-item-section side>
              <div class="column q-gutter-xs">
                <!-- RECIBIR PEDIDO -->
                <q-btn 
                  flat 
                  dense 
                  color="green" 
                  icon="check_circle"
                  @click="$emit('recibir-pedido', pedido)"
                  size="sm"
                >
                  <q-tooltip>Marcar como recibido</q-tooltip>
                </q-btn>
                
                <!-- CONTACTAR PROVEEDOR -->
                <q-btn 
                  flat 
                  dense 
                  color="blue" 
                  icon="phone"
                  @click="$emit('contactar-proveedor', pedido)"
                  v-if="pedido.proveedorTelefono"
                  size="sm"
                >
                  <q-tooltip>Contactar proveedor</q-tooltip>
                </q-btn>
                
                <!-- VER DETALLE -->
                <q-btn 
                  flat 
                  dense 
                  color="primary" 
                  icon="visibility"
                  @click="verDetalle(pedido)"
                  size="sm"
                >
                  <q-tooltip>Ver detalle</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
        
        <!-- RESUMEN -->
        <div class="q-mt-md">
          <q-chip color="orange" text-color="white" icon="inventory">
            {{ pedidosFiltrados.length }} pedidos pendientes
          </q-chip>
          <q-chip color="blue" text-color="white" icon="attach_money">
            Valor total: ${{ formatPrecio(totalValor) }}
          </q-chip>
        </div>
      </div>
      
      <!-- SIN PEDIDOS -->
      <div v-else class="text-center q-pa-lg">
        <q-icon name="check_circle" size="xl" color="green" />
        <div class="q-mt-md text-grey">✅ Todos los pedidos han sido recibidos</div>
        <div class="text-caption">No hay pedidos pendientes de recepción</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const props = defineProps({
  pedidos: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['recibir-pedido', 'contactar-proveedor'])

const busqueda = ref('')
const filtroProveedor = ref(null)
const orden = ref('fecha-desc')

const opcionesOrden = [
  { label: 'Fecha (más antiguo)', value: 'fecha-asc' },
  { label: 'Fecha (más reciente)', value: 'fecha-desc' },
  { label: 'Valor (mayor)', value: 'valor-desc' },
  { label: 'Valor (menor)', value: 'valor-asc' },
  { label: 'Proveedor (A-Z)', value: 'proveedor-asc' }
]

// Computadas
const proveedoresUnicos = computed(() => {
  const proveedores = [...new Set(props.pedidos.map(p => p.proveedorNombre))]
  return proveedores.map(p => ({ label: p, value: p }))
})

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
  
  // Filtrar por proveedor
  if (filtroProveedor.value) {
    resultado = resultado.filter(p => p.proveedorNombre === filtroProveedor.value)
  }
  
  // Ordenar
  switch (orden.value) {
    case 'fecha-asc':
      resultado.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      break
    case 'fecha-desc':
      resultado.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      break
    case 'valor-desc':
      resultado.sort((a, b) => (b.total || b.precio || 0) - (a.total || a.precio || 0))
      break
    case 'valor-asc':
      resultado.sort((a, b) => (a.total || a.precio || 0) - (b.total || b.precio || 0))
      break
    case 'proveedor-asc':
      resultado.sort((a, b) => (a.proveedorNombre || '').localeCompare(b.proveedorNombre || ''))
      break
  }
  
  return resultado
})

const totalValor = computed(() => {
  return pedidosFiltrados.value.reduce((sum, p) => sum + (p.total || p.precio || 0), 0)
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

const verDetalle = (pedido) => {
  $q.dialog({
    title: '📦 Detalle del Pedido',
    message: `
      <div class="q-gutter-y-sm">
        <div><strong>Producto:</strong> ${pedido.producto || 'N/A'}</div>
        <div><strong>Proveedor:</strong> ${pedido.proveedorNombre || 'N/A'}</div>
        <div><strong>Cantidad:</strong> ${pedido.cantidad}</div>
        <div><strong>Valor unitario:</strong> $${formatPrecio((pedido.total || pedido.precio) / (pedido.cantidad || 1))}</div>
        <div><strong>Valor total:</strong> $${formatPrecio(pedido.total || pedido.precio)}</div>
        <div><strong>Estado:</strong> ${pedido.estado || 'pendiente'}</div>
        <div><strong>Fecha pedido:</strong> ${formatFecha(pedido.fecha)}</div>
        <div><strong>Días pendiente:</strong> ${calcularDias(pedido.fecha)} días</div>
        ${pedido.observaciones ? `<div><strong>Observaciones:</strong> ${pedido.observaciones}</div>` : ''}
      </div>
    `,
    html: true,
    persistent: true
  })
}
</script>