<template>
  <q-card>
    <q-card-section>
      <!-- LOADING -->
      <div v-if="cargando" class="text-center q-pa-lg">
        <q-spinner color="primary" size="xl" />
        <div class="q-mt-md">Cargando productos...</div>
      </div>

      <!-- SIN PRODUCTOS -->
      <div v-else-if="productos.length === 0" class="text-center q-pa-lg">
        <q-icon name="inventory" size="xl" color="grey-5" />
        <div class="q-mt-md text-grey">
          Aún no hay productos registrados
        </div>
      </div>

      <!-- LISTA DE PRODUCTOS -->
      <q-list v-else bordered separator>
        <q-item 
          v-for="producto in productos" 
          :key="producto.id"
          clickable
          v-ripple
        >
          <q-item-section avatar>
            <q-avatar 
              :color="producto.activo ? 'primary' : 'grey'" 
              text-color="white" 
              icon="inventory_2" 
            />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-bold">
              {{ producto.nombre }}
            </q-item-label>
            
            <q-item-label caption>
              <q-badge color="grey-7" outline class="q-mr-xs">
                {{ producto.sku }}
              </q-badge>
              <q-chip 
                size="sm" 
                color="primary" 
                text-color="white" 
                dense
              >
                {{ producto.categoria }}
              </q-chip>
            </q-item-label>
            
            <q-item-label caption v-if="producto.descripcion">
              📝 {{ producto.descripcion }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="column items-end">
              <div class="text-h6 text-primary">
                {{ formatearMoneda(producto.precio) }}
              </div>
              
              <q-toggle
                :model-value="producto.activo"
                @update:model-value="$emit('toggle-activo', producto)"
                color="positive"
                size="sm"
                :label="producto.activo ? 'Activo' : 'Inactivo'"
              />
            </div>
          </q-item-section>

          <q-item-section side>
            <div class="row q-gutter-xs">
              <!-- Botón Editar -->
              <q-btn 
                round 
                dense 
                flat 
                color="blue" 
                icon="edit"
                @click.stop="$emit('editar', producto)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>

              <!-- Botón Eliminar -->
              <q-btn 
                round 
                dense 
                flat 
                color="red" 
                icon="delete"
                @click.stop="$emit('eliminar', producto)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>

              <!-- 🔗 BOTÓN INVENTARIO (Futuro) -->
              <q-btn 
                round 
                dense 
                flat 
                color="grey" 
                icon="warehouse"
                disable
              >
                <q-tooltip>Ver inventario (próximamente)</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- CONTADOR -->
      <div v-if="!cargando && productos.length > 0" class="q-mt-md text-center text-caption text-grey">
        Total: {{ productos.length }} productos
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ListaProductos',
  
  props: {
    productos: {
      type: Array,
      required: true
    },
    cargando: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['editar', 'eliminar', 'toggle-activo'],
  
  setup() {
    /**
     * Formatear moneda en pesos colombianos
     */
    const formatearMoneda = (valor) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(valor || 0)
    }
    
    return {
      formatearMoneda
    }
  }
})
</script>

<style scoped>
.q-item {
  border-radius: 8px;
  margin-bottom: 4px;
}

.q-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>