<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon name="history" color="primary" class="q-mr-sm" />
        Historial de Transacciones
      </div>
      
      <!-- PESTAÑAS INTERNAS -->
      <q-tabs
        v-model="tab"
        dense
        class="bg-grey-3"
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-tab name="compras" icon="shopping_cart" label="Compras" />
        <q-tab name="pagos" icon="payments" label="Pagos" />
        <q-tab name="pedidos" icon="local_shipping" label="Todos los Pedidos" />
      </q-tabs>
      
      <q-tab-panels v-model="tab" class="q-mt-md">
        <!-- PESTAÑA COMPRAS -->
        <q-tab-panel name="compras">
          <HistorialCompras 
            :compras="compras"
            @ver-detalle="$emit('ver-detalle', $event)"
          />
        </q-tab-panel>
        
        <!-- PESTAÑA PAGOS -->
        <q-tab-panel name="pagos">
          <HistorialPagos 
            :pagos="pagos"
          />
        </q-tab-panel>
        
        <!-- PESTAÑA PEDIDOS -->
        <q-tab-panel name="pedidos">
          <HistorialPedidos 
            :pedidos="todosLosPedidos"
          />
        </q-tab-panel>
      </q-tab-panels>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import HistorialCompras from './HistorialCompras.vue'
import HistorialPagos from './HistorialPagos.vue'
import HistorialPedidos from './HistorialPedidos.vue'

const props = defineProps({
  compras: {
    type: Array,
    default: () => []
  },
  pagos: {
    type: Array,
    default: () => []
  },
  pedidos: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['ver-detalle'])

const tab = ref('compras')

// Combinar todos los pedidos (pendientes y recibidos)
const todosLosPedidos = ref([...props.pedidos])
</script>