<template>
  <q-card style="min-width: 800px; max-width: 1000px">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">
        <q-icon name="history" class="q-mr-sm" />
        Historial Completo - {{ proveedor?.nombre }}
      </div>
      <div class="text-caption">
        {{ proveedor?.contacto }} • {{ proveedor?.telefono }}
      </div>
    </q-card-section>
    
    <q-tabs
      v-model="tab"
      dense
      class="bg-grey-3"
      active-color="primary"
      indicator-color="primary"
      align="justify"
    >
      <q-tab name="resumen" icon="dashboard" label="Resumen" />
      <q-tab name="compras" icon="shopping_cart" label="Compras" />
      <q-tab name="pagos" icon="payments" label="Pagos" />
      <q-tab name="pedidos" icon="local_shipping" label="Pedidos" />
    </q-tabs>
    
    <q-tab-panels v-model="tab" class="q-mt-md">
      <!-- RESUMEN -->
      <q-tab-panel name="resumen">
        <ResumenProveedor 
          :proveedor="proveedor"
          :compras="compras"
          :pagos="pagos"
        />
      </q-tab-panel>
      
      <!-- COMPRAS -->
      <q-tab-panel name="compras">
        <ListaCompras 
          :compras="compras"
        />
      </q-tab-panel>
      
      <!-- PAGOS -->
      <q-tab-panel name="pagos">
        <ListaPagos 
          :pagos="pagos"
        />
      </q-tab-panel>
      
      <!-- PEDIDOS -->
      <q-tab-panel name="pedidos">
        <ListaPedidos 
          :pedidos="todosLosPedidos"
        />
      </q-tab-panel>
    </q-tab-panels>
    
    <q-card-actions align="right">
      <q-btn flat label="Cerrar" color="grey" @click="$emit('cerrar')" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import ResumenProveedor from './ResumenProveedor.vue'
import ListaCompras from './ListaCompras.vue'
import ListaPagos from './ListaPagos.vue'
import ListaPedidos from './ListaPedidos.vue'

const props = defineProps({
  proveedor: {
    type: Object,
    default: null
  },
  compras: {
    type: Array,
    default: () => []
  },
  pagos: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['cerrar'])

const tab = ref('resumen')

// Para este ejemplo, asumimos que los pedidos vienen del proveedor
const todosLosPedidos = computed(() => {
  if (!props.proveedor?.pedidosPendientes) return []
  return props.proveedor.pedidosPendientes
})
</script>