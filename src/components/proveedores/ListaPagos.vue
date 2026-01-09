<template>
  <div>
    <div class="text-h6 q-mb-md">💳 Pagos Realizados</div>
    
    <!-- LISTA SIMPLE -->
    <div v-if="pagos.length === 0" class="text-center q-pa-lg text-grey">
      <q-icon name="payments_off" size="xl" />
      <div class="q-mt-md">No hay pagos registrados</div>
    </div>
    
    <q-list bordered separator v-else>
      <q-item v-for="pago in pagosOrdenados" :key="pago.id" class="q-my-xs">
        <q-item-section avatar>
          <q-avatar :color="getColorMetodo(pago.metodo)" text-color="white">
            <q-icon :name="getIconMetodo(pago.metodo)" />
          </q-avatar>
        </q-item-section>
        
        <q-item-section>
          <q-item-label class="text-weight-bold">
            {{ getNombreMetodo(pago.metodo) }}
          </q-item-label>
          <q-item-label caption>
            {{ formatFecha(pago.fecha) }}
            <span v-if="pago.referencia" class="q-ml-xs">
              Ref: {{ pago.referencia }}
            </span>
          </q-item-label>
        </q-item-section>
        
        <q-item-section side>
          <div class="text-h6 text-green">${{ formatPrecio(pago.monto) }}</div>
        </q-item-section>
      </q-item>
    </q-list>
    
    <!-- CONTADOR SIMPLE -->
    <div v-if="pagos.length > 0" class="q-mt-md">
      <q-chip color="green" text-color="white" icon="payments">
        {{ pagos.length }} pagos • Total: ${{ formatPrecio(totalPagos) }}
      </q-chip>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  pagos: {
    type: Array,
    default: () => []
  }
})

// Ordenar por fecha descendente
const pagosOrdenados = computed(() => {
  return [...props.pagos].sort((a, b) => {
    const fechaA = a.fecha?.toDate?.() || new Date(a.fecha)
    const fechaB = b.fecha?.toDate?.() || new Date(b.fecha)
    return fechaB - fechaA
  })
})

// Total
const totalPagos = computed(() => {
  return props.pagos.reduce((sum, p) => sum + (p.monto || 0), 0)
})

// Métodos de pago (iguales a HistorialPagos.vue)
const getColorMetodo = (metodo) => {
  const colores = {
    efectivo: 'green',
    transferencia: 'blue',
    cheque: 'orange',
    tarjeta: 'purple'
  }
  return colores[metodo] || 'grey'
}

const getIconMetodo = (metodo) => {
  const iconos = {
    efectivo: 'payments',
    transferencia: 'account_balance',
    cheque: 'receipt',
    tarjeta: 'credit_card'
  }
  return iconos[metodo] || 'payments'
}

const getNombreMetodo = (metodo) => {
  const nombres = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
    cheque: 'Cheque',
    tarjeta: 'Tarjeta'
  }
  return nombres[metodo] || metodo || 'Sin método'
}

const formatPrecio = (precio) => {
  return new Intl.NumberFormat('es-CO').format(precio || 0)
}

const formatFecha = (fecha) => {
  if (!fecha) return 'Sin fecha'
  const fechaObj = fecha.toDate ? fecha.toDate() : new Date(fecha)
  return fechaObj.toLocaleDateString('es-CO')
}
</script>