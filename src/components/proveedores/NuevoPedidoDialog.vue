<template>
  <q-card style="min-width: 600px; max-width: 800px">
    <q-card-section class="bg-blue text-white">
      <div class="text-h6">
        <q-icon name="add_shopping_cart" class="q-mr-sm" />
        Nuevo Pedido a Proveedor
      </div>
      <div class="text-caption" v-if="proveedor">
        {{ proveedor.nombre }} • {{ proveedor.contacto || 'Sin contacto' }}
      </div>
    </q-card-section>
    
    <q-card-section class="q-pt-md">
      <q-form @submit="crearPedido" class="q-gutter-md">
        <!-- PRODUCTO -->
        <div class="text-subtitle1 text-weight-medium">📦 Producto</div>
        
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="formPedido.producto"
              label="Nombre del producto *"
              outlined
              dense
              :rules="[val => !!val || 'El producto es obligatorio']"
              autofocus
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model.number="formPedido.cantidad"
              label="Cantidad *"
              type="number"
              min="1"
              outlined
              dense
              :rules="[val => val > 0 || 'La cantidad debe ser mayor a 0']"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model.number="formPedido.precioUnitario"
              label="Precio unitario"
              type="number"
              min="0"
              prefix="$"
              outlined
              dense
            />
          </div>
        </div>
        
        <!-- CALCULO AUTOMÁTICO -->
        <div v-if="formPedido.cantidad && formPedido.precioUnitario" class="q-pa-sm bg-grey-2 rounded-borders">
          <div class="row items-center">
            <div class="col">
              <div class="text-caption">Total estimado:</div>
            </div>
            <div class="col-auto text-h6 text-primary">
              ${{ formatPrecio(totalEstimado) }}
            </div>
          </div>
        </div>
        
        <!-- FECHA ENTREGA -->
        <div class="text-subtitle1 text-weight-medium q-pt-md">📅 Fecha de Entrega</div>
        
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="formPedido.fechaPedido"
              label="Fecha del pedido"
              type="date"
              outlined
              dense
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="formPedido.fechaEntrega"
              label="Fecha esperada de entrega"
              type="date"
              outlined
              dense
              hint="Fecha en que esperas recibir el pedido"
            />
          </div>
        </div>
        
        <!-- OBSERVACIONES -->
        <div class="text-subtitle1 text-weight-medium q-pt-md">📝 Detalles Adicionales</div>
        
        <q-input
          v-model="formPedido.observaciones"
          label="Observaciones"
          type="textarea"
          rows="3"
          outlined
          dense
          hint="Especificaciones, tallas, colores, etc."
          autogrow
        />
        
        <!-- BOTONES -->
        <div class="row q-mt-lg">
          <q-space />
          <q-btn flat label="Cancelar" color="grey" @click="$emit('cancelar')" />
          <q-btn 
            label="Crear Pedido" 
            color="primary" 
            type="submit"
            :loading="guardando"
            :disable="!formPedido.producto || !formPedido.cantidad"
            icon="add_shopping_cart"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'boot/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

const $q = useQuasar()
const emit = defineEmits(['pedido-creado', 'cancelar'])

const props = defineProps({
  proveedor: {
    type: Object,
    default: null
  },
  productos: {
    type: Array,
    default: () => []
  }
})

const guardando = ref(false)

const formPedido = ref({
  producto: '',
  cantidad: 1,
  precioUnitario: 0,
  total: 0,
  fechaPedido: new Date().toISOString().split('T')[0],
  fechaEntrega: '',
  observaciones: ''
})

const totalEstimado = computed(() => {
  return (formPedido.value.cantidad || 0) * (formPedido.value.precioUnitario || 0)
})

// Cuando cambia cantidad o precio, actualizar total
watch([() => formPedido.value.cantidad, () => formPedido.value.precioUnitario], () => {
  formPedido.value.total = totalEstimado.value
})

const crearPedido = async () => {
  if (!props.proveedor) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona un proveedor primero'
    })
    return
  }
  
  guardando.value = true
  
  try {
    const pedidoData = {
      proveedorId: props.proveedor.id,
      proveedorNombre: props.proveedor.nombre,
      producto: formPedido.value.producto.trim(),
      cantidad: Number(formPedido.value.cantidad),
      precioUnitario: Number(formPedido.value.precioUnitario) || 0,
      total: Number(formPedido.value.total) || 0,
      fechaPedido: formPedido.value.fechaPedido || new Date().toISOString().split('T')[0],
      fechaEntrega: formPedido.value.fechaEntrega || null,
      observaciones: formPedido.value.observaciones.trim() || null,
      estado: 'pendiente',
      fechaRegistro: serverTimestamp(),
      creadoPor: 'admin'
    }
    
    // En modo demostración
    if (!db) {
      console.log('📋 Modo demostración: Creando pedido', pedidoData)
      
      $q.notify({
        type: 'positive',
        message: '✅ Pedido creado (modo demostración)',
        caption: `Proveedor: ${props.proveedor.nombre}`,
        timeout: 3000
      })
      
      emit('pedido-creado')
      return
    }
    
    // Guardar en Firestore
    const pedidosRef = collection(db, 'pedidos_proveedores')
    await addDoc(pedidosRef, pedidoData)
    
    $q.notify({
      type: 'positive',
      message: '✅ Pedido creado exitosamente',
      caption: `Se ha registrado el pedido a ${props.proveedor.nombre}`,
      icon: 'check_circle',
      timeout: 3000
    })
    
    emit('pedido-creado')
    
  } catch (error) {
    console.error('❌ Error creando pedido:', error)
    $q.notify({
      type: 'negative',
      message: '❌ Error al crear el pedido',
      caption: error.message || 'Intenta de nuevo'
    })
  } finally {
    guardando.value = false
  }
}

const formatPrecio = (precio) => {
  return new Intl.NumberFormat('es-CO').format(precio || 0)
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
</style>