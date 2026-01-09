<template>
  <div>
    <!-- RESUMEN FINANCIERO -->
    <div class="text-h6 q-mb-md">📊 Resumen Financiero</div>
    
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- TOTAL COMPRADO -->
      <div class="col-12 col-md-4">
        <q-card class="bg-blue-1">
          <q-card-section>
            <div class="text-center">
              <q-icon name="shopping_cart" color="blue" size="lg" />
              <div class="text-h5 text-weight-bold q-mt-sm">
                ${{ formatPrecio(totalCompras) }}
              </div>
              <div class="text-caption text-grey">Total Compras</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <!-- TOTAL PAGADO -->
      <div class="col-12 col-md-4">
        <q-card class="bg-green-1">
          <q-card-section>
            <div class="text-center">
              <q-icon name="payments" color="green" size="lg" />
              <div class="text-h5 text-weight-bold q-mt-sm">
                ${{ formatPrecio(totalPagado) }}
              </div>
              <div class="text-caption text-grey">Total Pagado</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <!-- SALDO PENDIENTE -->
      <div class="col-12 col-md-4">
        <q-card :class="saldoPendiente > 0 ? 'bg-red-1' : 'bg-grey-1'">
          <q-card-section>
            <div class="text-center">
              <q-icon 
                :name="saldoPendiente > 0 ? 'money_off' : 'check_circle'" 
                :color="saldoPendiente > 0 ? 'red' : 'green'" 
                size="lg" 
              />
              <div class="text-h5 text-weight-bold q-mt-sm" :class="saldoPendiente > 0 ? 'text-red' : 'text-green'">
                ${{ formatPrecio(saldoPendiente) }}
              </div>
              <div class="text-caption text-grey">Saldo Pendiente</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
    
    <!-- ESTADÍSTICAS -->
    <div class="row q-col-gutter-md">
      <!-- COMPRAS POR MES -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium">📅 Compras por Mes</div>
            <div class="q-mt-md">
              <div v-if="comprasPorMes.length === 0" class="text-center q-pa-md text-grey">
                No hay datos de compras
              </div>
              <q-list dense bordered v-else>
                <q-item v-for="mes in comprasPorMes.slice(0, 6)" :key="mes.mes">
                  <q-item-section>
                    <div class="text-caption">{{ mes.mes }}</div>
                  </q-item-section>
                  <q-item-section side>
                    <div class="text-weight-medium">${{ formatPrecio(mes.total) }}</div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <!-- INFORMACIÓN PROVEEDOR -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium">ℹ️ Información</div>
            <div class="q-mt-md q-gutter-y-sm">
              <div class="row items-center">
                <q-icon name="person" size="sm" class="q-mr-sm" />
                <span>{{ proveedor.contacto || 'Sin contacto' }}</span>
              </div>
              <div class="row items-center">
                <q-icon name="phone" size="sm" class="q-mr-sm" />
                <span>{{ proveedor.telefono || 'Sin teléfono' }}</span>
              </div>
              <div class="row items-center" v-if="proveedor.email">
                <q-icon name="email" size="sm" class="q-mr-sm" />
                <span>{{ proveedor.email }}</span>
              </div>
              <div class="row items-start q-mt-xs" v-if="proveedor.observaciones">
                <q-icon name="note" size="sm" class="q-mr-sm q-mt-xs" />
                <span class="text-caption">{{ proveedor.observaciones }}</span>
              </div>
              <div class="row items-center q-mt-xs">
                <q-icon name="history" size="sm" class="q-mr-sm" />
                <span class="text-caption">
                  {{ compras.length }} compras • {{ pagos.length }} pagos
                </span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  proveedor: {
    type: Object,
    required: true
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

// Totales
const totalCompras = computed(() => {
  return props.compras.reduce((sum, compra) => sum + (compra.total || compra.monto || 0), 0)
})

const totalPagado = computed(() => {
  return props.pagos.reduce((sum, pago) => sum + (pago.monto || 0), 0)
})

const saldoPendiente = computed(() => {
  return totalCompras.value - totalPagado.value
})

// Compras por mes
const comprasPorMes = computed(() => {
  const meses = {}
  
  props.compras.forEach(compra => {
    const fecha = compra.fecha?.toDate?.() || new Date(compra.fecha)
    const mes = fecha.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
    const capitalizado = mes.charAt(0).toUpperCase() + mes.slice(1)
    
    if (!meses[capitalizado]) {
      meses[capitalizado] = 0
    }
    meses[capitalizado] += compra.total || compra.monto || 0
  })
  
  return Object.entries(meses)
    .map(([mes, total]) => ({ mes, total }))
    .sort((a, b) => {
      const fechaA = new Date(`1 ${a.mes}`)
      const fechaB = new Date(`1 ${b.mes}`)
      return fechaB - fechaA
    })
})

// Formato precio
const formatPrecio = (precio) => {
  return new Intl.NumberFormat('es-CO').format(precio || 0)
}
</script>