<template>
  <div>
    <div class="text-h6 q-mb-md">🛒 Compras Realizadas</div>
    
    <!-- BUSQUEDA -->
    <q-input
      v-model="busqueda"
      placeholder="🔍 Buscar por producto..."
      outlined
      dense
      clearable
      class="q-mb-md"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>
    
    <!-- LISTA -->
    <div v-if="comprasFiltradas.length === 0" class="text-center q-pa-lg text-grey">
      <q-icon name="shopping_cart_off" size="xl" />
      <div class="q-mt-md">No hay compras registradas</div>
    </div>
    
    <q-list bordered separator v-else>
      <q-item v-for="compra in comprasFiltradas" :key="compra.id" class="q-my-xs">
        <q-item-section avatar>
          <q-avatar color="blue" text-color="white">
            <q-icon name="shopping_cart" />
          </q-avatar>
        </q-item-section>
        
        <q-item-section>
          <q-item-label class="text-weight-bold">
            {{ compra.producto || 'Compra sin nombre' }}
          </q-item-label>
          <q-item-label caption>
            {{ formatFecha(compra.fecha) }}
            <q-badge v-if="compra.cantidad" color="blue" class="q-ml-xs">
              {{ compra.cantidad }} unidades
            </q-badge>
          </q-item-label>
          <q-item-label v-if="compra.observaciones" caption class="q-mt-xs">
            <q-icon name="note" size="xs" /> {{ compra.observaciones }}
          </q-item-label>
        </q-item-section>
        
        <q-item-section side>
          <div class="text-right">
            <div class="text-h6 text-blue">${{ formatPrecio(compra.total || compra.monto) }}</div>
            <div class="text-caption">
              {{ compra.estado || 'completada' }}
            </div>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
    
    <!-- RESUMEN -->
    <div v-if="comprasFiltradas.length > 0" class="q-mt-md">
      <q-chip color="blue" text-color="white" icon="shopping_cart">
        {{ comprasFiltradas.length }} compras
      </q-chip>
      <q-chip color="green" text-color="white" icon="attach_money">
        Total: ${{ formatPrecio(totalCompras) }}
      </q-chip>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  compras: {
    type: Array,
    default: () => []
  }
})

const busqueda = ref('')

const comprasFiltradas = computed(() => {
  if (!busqueda.value.trim()) {
    return props.compras.sort((a, b) => {
      const fechaA = a.fecha?.toDate?.() || new Date(a.fecha)
      const fechaB = b.fecha?.toDate?.() || new Date(b.fecha)
      return fechaB - fechaA
    })
  }
  
  const termino = busqueda.value.toLowerCase()
  return props.compras.filter(c =>
    (c.producto && c.producto.toLowerCase().includes(termino)) ||
    (c.observaciones && c.observaciones.toLowerCase().includes(termino))
  )
})

const totalCompras = computed(() => {
  return comprasFiltradas.value.reduce((sum, c) => sum + (c.total || c.monto || 0), 0)
})

const formatPrecio = (precio) => {
  return new Intl.NumberFormat('es-CO').format(precio || 0)
}

const formatFecha = (fecha) => {
  if (!fecha) return 'Sin fecha'
  const fechaObj = fecha.toDate ? fecha.toDate() : new Date(fecha)
  return fechaObj.toLocaleDateString('es-CO')
}
</script>