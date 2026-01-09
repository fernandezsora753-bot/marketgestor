<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon name="money_off" color="orange" class="q-mr-sm" />
        Proveedores con Saldo Pendiente
      </div>
      
      <!-- BUSQUEDA -->
      <q-input
        v-model="busqueda"
        placeholder="🔍 Buscar proveedor..."
        outlined
        dense
        clearable
        class="q-mb-md"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      
      <q-list bordered separator v-if="proveedoresFiltrados.length > 0">
        <q-item 
          v-for="proveedor in proveedoresFiltrados" 
          :key="proveedor.id"
          class="q-my-xs"
        >
          <q-item-section avatar>
            <q-avatar color="red" text-color="white">
              <q-icon name="money_off" />
            </q-avatar>
          </q-item-section>
          
          <q-item-section>
            <q-item-label class="text-weight-bold">{{ proveedor.nombre }}</q-item-label>
            <q-item-label caption>
              <q-icon name="person" size="xs" /> {{ proveedor.contacto || 'Sin contacto' }}
              <q-icon name="phone" size="xs" class="q-ml-sm" /> {{ proveedor.telefono || 'Sin teléfono' }}
            </q-item-label>
            <q-item-label caption class="q-mt-xs">
              <q-badge color="blue" class="q-mr-xs">
                Compras: ${{ formatPrecio(proveedor.estadoCuenta.totalCompras) }}
              </q-badge>
              <q-badge color="green" class="q-mr-xs">
                Pagado: ${{ formatPrecio(proveedor.estadoCuenta.totalPagado) }}
              </q-badge>
              <q-badge color="red">
                Saldo: ${{ formatPrecio(proveedor.estadoCuenta.saldo) }}
              </q-badge>
            </q-item-label>
          </q-item-section>
          
          <q-item-section side>
            <div class="text-right">
              <div class="text-h6 text-red">${{ formatPrecio(proveedor.estadoCuenta.saldo) }}</div>
              <div class="text-caption text-grey">
                Último pago: {{ formatFecha(proveedor.estadoCuenta.ultimoPago) }}
              </div>
            </div>
          </q-item-section>
          
          <q-item-section side>
            <div class="column q-gutter-xs">
              <q-btn 
                flat 
                dense 
                color="green" 
                icon="payments"
                @click="$emit('registrar-pago', proveedor)"
                size="sm"
              >
                <q-tooltip>Registrar Pago</q-tooltip>
              </q-btn>
              <q-btn 
                flat 
                dense 
                color="primary" 
                icon="visibility"
                @click="$emit('ver-detalle', proveedor)"
                size="sm"
              >
                <q-tooltip>Ver Detalle</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
      
      <!-- SIN DATOS -->
      <div v-else class="text-center q-pa-lg">
        <q-icon name="check_circle" size="xl" color="green" />
        <div class="q-mt-md text-grey">🎉 No hay proveedores con deudas pendientes</div>
        <div class="text-caption">Todos los proveedores están al día con sus pagos</div>
      </div>
      
      <!-- RESUMEN -->
      <div v-if="proveedores.length > 0" class="q-mt-md">
        <q-chip color="red" text-color="white" icon="money_off">
          {{ proveedoresFiltrados.length }} proveedores con deuda
        </q-chip>
        <q-chip color="orange" text-color="white" icon="attach_money">
          Total adeudado: ${{ formatPrecio(totalDeudas) }}
        </q-chip>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  proveedores: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['registrar-pago', 'ver-detalle'])

const busqueda = ref('')

const proveedoresFiltrados = computed(() => {
  if (!busqueda.value.trim()) {
    return props.proveedores
  }
  
  const termino = busqueda.value.toLowerCase()
  return props.proveedores.filter(p => 
    p.nombre.toLowerCase().includes(termino) ||
    (p.contacto && p.contacto.toLowerCase().includes(termino)) ||
    (p.telefono && p.telefono.includes(termino))
  )
})

const totalDeudas = computed(() => {
  return props.proveedores.reduce((sum, p) => sum + (p.estadoCuenta?.saldo || 0), 0)
})

const formatPrecio = (precio) => {
  return new Intl.NumberFormat('es-CO').format(precio || 0)
}

const formatFecha = (fecha) => {
  if (!fecha) return 'Nunca'
  const fechaObj = fecha.toDate ? fecha.toDate() : new Date(fecha)
  return fechaObj.toLocaleDateString('es-CO')
}
</script>