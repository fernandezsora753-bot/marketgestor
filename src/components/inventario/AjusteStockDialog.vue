<template>
  <q-dialog v-model="dialogo" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">📊 Ajustar Stock</div>
        <div class="text-caption">
          {{ producto?.nombre || 'Producto' }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-md">
        <!-- Información actual -->
        <div class="q-pa-sm bg-grey-2 rounded-borders q-mb-md">
          <div class="row items-center">
            <div class="col">
              <div class="text-caption">Stock actual</div>
              <div class="text-h5" :class="getStockClass(producto?.stock)">
                {{ producto?.stock || 0 }} unidades
              </div>
            </div>
            <div class="col-auto" v-if="producto?.stockMinimo">
              <q-badge color="orange">
                Mínimo: {{ producto.stockMinimo }}
              </q-badge>
            </div>
          </div>
        </div>

        <!-- Tipo de movimiento -->
        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-xs">Tipo de movimiento *</div>
          <div class="row q-gutter-sm">
            <q-btn 
              :outline="form.tipo !== 'entrada'"
              color="green" 
              icon="add" 
              label="Entrada (+)"
              @click="form.tipo = 'entrada'"
              class="col"
            />
            <q-btn 
              :outline="form.tipo !== 'salida'"
              color="red" 
              icon="remove" 
              label="Salida (-)"
              @click="form.tipo = 'salida'"
              class="col"
            />
            <q-btn 
              :outline="form.tipo !== 'ajuste'"
              color="blue" 
              icon="edit" 
              label="Ajuste"
              @click="form.tipo = 'ajuste'"
              class="col"
            />
          </div>
        </div>

        <!-- Cantidad -->
        <q-input
          v-model.number="form.cantidad"
          label="Cantidad *"
          outlined
          dense
          type="number"
          min="1"
          :rules="[val => val > 0 || 'Debe ser mayor a 0']"
          class="q-mb-md"
        >
          <template v-slot:hint>
            <div class="text-caption">
              Cantidad a {{ form.tipo === 'entrada' ? 'agregar' : 'quitar' }}
            </div>
          </template>
        </q-input>

        <!-- Motivo -->
        <q-select
          v-model="form.motivo"
          :options="opcionesMotivo"
          label="Motivo *"
          outlined
          dense
          :rules="[val => !!val || 'Selecciona un motivo']"
          class="q-mb-md"
        />

        <!-- Observaciones -->
        <q-input
          v-model="form.observaciones"
          label="Observaciones (opcional)"
          outlined
          dense
          type="textarea"
          rows="2"
        />

        <!-- Vista previa -->
        <div v-if="form.cantidad > 0" class="q-pa-md bg-blue-1 rounded-borders q-mt-md">
          <div class="text-subtitle2">📈 Vista previa del cambio:</div>
          <div class="q-mt-xs">
            <div>• Stock actual: <strong>{{ producto?.stock || 0 }}</strong></div>
            <div>
              • Cantidad: 
              <strong :class="form.tipo === 'entrada' ? 'text-green' : 'text-red'">
                {{ form.tipo === 'entrada' ? '+' : '-' }}{{ form.cantidad }}
              </strong>
            </div>
            <div>
              • Nuevo stock: 
              <strong :class="getStockClass(nuevoStockCalculado)">
                {{ nuevoStockCalculado }}
              </strong>
            </div>
            <div v-if="producto?.stockMinimo && nuevoStockCalculado <= producto.stockMinimo" class="text-orange">
              ⚠️ El nuevo stock estará por debajo del mínimo
            </div>
            <div v-if="nuevoStockCalculado < 0" class="text-red">
              ❌ El stock no puede ser negativo
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="grey" @click="cerrar" />
        <q-btn 
          label="Aplicar Ajuste" 
          color="primary"
          @click="aplicarAjuste"
          :loading="guardando"
          :disable="!formValido || nuevoStockCalculado < 0"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useInventario } from 'src/composables/useInventario'

export default {
  name: 'AjusteStockDialog',
  
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    producto: {
      type: Object,
      default: null
    }
  },
  
  emits: ['update:modelValue', 'ajuste-completado'],
  
  setup(props, { emit }) {
    const $q = useQuasar()
    const { registrarMovimiento } = useInventario()
    
    const dialogo = ref(props.modelValue)
    const guardando = ref(false)
    
    const form = ref({
      tipo: 'entrada',
      cantidad: 1,
      motivo: 'compra',
      observaciones: ''
    })
    
    const opcionesMotivo = [
      { label: 'Compra a proveedor', value: 'compra' },
      { label: 'Devolución de cliente', value: 'devolucion' },
      { label: 'Ajuste por inventario', value: 'inventario' },
      { label: 'Daño o pérdida', value: 'danio' },
      { label: 'Muestra o demostración', value: 'muestra' },
      { label: 'Transferencia entre almacenes', value: 'transferencia' },
      { label: 'Otro', value: 'otro' }
    ]
    
    // Computadas
    const nuevoStockCalculado = computed(() => {
      if (!props.producto) return 0
      
      const stockActual = props.producto.stock || 0
      const cantidad = form.value.cantidad || 0
      
      if (form.value.tipo === 'entrada') {
        return stockActual + cantidad
      } else {
        return stockActual - cantidad
      }
    })
    
    const formValido = computed(() => {
      return form.value.tipo && 
             form.value.cantidad > 0 && 
             form.value.motivo
    })
    
    // Métodos
    const getStockClass = (stock) => {
      if (stock === 0) return 'text-red'
      if (props.producto?.stockMinimo && stock <= props.producto.stockMinimo) {
        return 'text-orange'
      }
      return 'text-green'
    }
    
    const aplicarAjuste = async () => {
      if (nuevoStockCalculado.value < 0) {
        $q.notify({
          type: 'negative',
          message: '❌ El stock no puede ser negativo'
        })
        return
      }
      
      guardando.value = true
      
      try {
        await registrarMovimiento(props.producto.id, {
          tipo: form.value.tipo,
          cantidad: form.value.cantidad,
          motivo: form.value.motivo,
          observaciones: form.value.observaciones
        })
        
        $q.notify({
          type: 'positive',
          message: '✅ Stock ajustado correctamente'
        })
        
        emit('ajuste-completado')
        cerrar()
        
      } catch (error) {
        console.error('Error ajustando stock:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al ajustar stock',
          caption: error.message
        })
      } finally {
        guardando.value = false
      }
    }
    
    const cerrar = () => {
      // Resetear formulario
      form.value = {
        tipo: 'entrada',
        cantidad: 1,
        motivo: 'compra',
        observaciones: ''
      }
      
      emit('update:modelValue', false)
    }
    
    // Watchers
    watch(() => props.modelValue, (val) => {
      dialogo.value = val
    })
    
    watch(dialogo, (val) => {
      emit('update:modelValue', val)
    })
    
    return {
      // Estado
      dialogo,
      guardando,
      form,
      opcionesMotivo,
      
      // Computadas
      nuevoStockCalculado,
      formValido,
      
      // Métodos
      getStockClass,
      aplicarAjuste,
      cerrar
    }
  }
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}

.text-red {
  color: #f44336;
}

.text-orange {
  color: #ff9800;
}

.text-green {
  color: #4caf50;
}
</style>