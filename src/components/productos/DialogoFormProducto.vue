<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
  >
    <q-card style="min-width: 450px">
      <q-card-section>
        <div class="text-h6">
          {{ modoEdicion ? 'Editar Producto' : 'Nuevo Producto' }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit.prevent="handleGuardar">
          
          <!-- Nombre -->
          <q-input
            v-model="form.nombre"
            label="Nombre del producto *"
            outlined
            dense
            autofocus
            :rules="[val => !!val || 'El nombre es obligatorio']"
          >
            <template v-slot:prepend>
              <q-icon name="label" />
            </template>
          </q-input>

          <!-- SKU -->
          <q-input
            v-model="form.sku"
            label="SKU (Código único) *"
            outlined
            dense
            class="q-mt-md"
            hint="Ejemplo: PROD-001"
            :rules="[
              val => !!val || 'El SKU es obligatorio',
              val => val.length >= 2 || 'Mínimo 2 caracteres'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="tag" />
            </template>
          </q-input>

          <!-- Categoría -->
          <q-select
            v-model="form.categoria"
            :options="categoriasDisponibles"
            label="Categoría *"
            outlined
            dense
            class="q-mt-md"
            use-input
            new-value-mode="add-unique"
            hint="Selecciona o escribe una nueva"
            :rules="[val => !!val || 'La categoría es obligatoria']"
          >
            <template v-slot:prepend>
              <q-icon name="category" />
            </template>
          </q-select>

          <!-- Precio -->
          <q-input
            v-model.number="form.precio"
            label="Precio *"
            outlined
            dense
            type="number"
            min="0"
            step="1000"
            prefix="$"
            class="q-mt-md"
            :rules="[
              val => val !== null && val !== '' || 'El precio es obligatorio',
              val => val >= 0 || 'El precio debe ser mayor o igual a 0'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="attach_money" color="green" />
            </template>
            <template v-slot:hint>
              {{ formatearMoneda(form.precio) }}
            </template>
          </q-input>

          <!-- Descripción -->
          <q-input
            v-model="form.descripcion"
            label="Descripción (opcional)"
            outlined
            dense
            type="textarea"
            rows="3"
            class="q-mt-md"
            hint="Información adicional del producto"
          >
            <template v-slot:prepend>
              <q-icon name="description" />
            </template>
          </q-input>

          <!-- Estado Activo -->
          <q-toggle
            v-model="form.activo"
            label="Producto activo"
            color="positive"
            class="q-mt-md"
          />

          <!-- 🔗 BANNER INFORMATIVO SOBRE INVENTARIO -->
          <q-banner
            v-if="!modoEdicion"
            class="bg-blue-1 text-blue-9 q-mt-md"
            dense
          >
            <template v-slot:avatar>
              <q-icon name="info" color="blue" />
            </template>
            El inventario inicial se gestionará en el módulo de Inventario.
          </q-banner>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn 
          flat 
          label="Cancelar" 
          color="grey" 
          v-close-popup
          @click="$emit('cerrar')"
          :disable="guardando"
        />
        <q-btn 
          label="Guardar" 
          color="primary" 
          :loading="guardando"
          @click="handleGuardar"
          :disable="!formValido"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'DialogoFormProducto',
  
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    producto: {
      type: Object,
      default: null
    },
    categorias: {
      type: Array,
      default: () => []
    },
    modoEdicion: {
      type: Boolean,
      default: false
    },
    guardando: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['update:modelValue', 'guardar', 'cerrar'],
  
  setup(props, { emit }) {
    
    // Formulario inicial
    const formInicial = {
      nombre: '',
      sku: '',
      categoria: null,
      precio: 0,
      descripcion: '',
      activo: true
    }
    
    const form = ref({ ...formInicial })

    /**
     * Categorías disponibles para el select
     */
    const categoriasDisponibles = computed(() => {
      return props.categorias.length > 0 ? props.categorias : []
    })

    /**
     * Validación del formulario
     */
    const formValido = computed(() => {
      return form.value.nombre.trim() && 
             form.value.sku.trim() && 
             form.value.categoria &&
             form.value.precio >= 0
    })

    /**
     * Formatear moneda
     */
    const formatearMoneda = (valor) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(valor || 0)
    }

    /**
     * Cargar datos del producto en modo edición
     */
    watch(() => props.producto, (producto) => {
      if (producto) {
        form.value = {
          nombre: producto.nombre || '',
          sku: producto.sku || '',
          categoria: producto.categoria || null,
          precio: producto.precio || 0,
          descripcion: producto.descripcion || '',
          activo: producto.activo !== undefined ? producto.activo : true
        }
      } else {
        form.value = { ...formInicial }
      }
    }, { immediate: true })

    /**
     * Manejar guardado
     */
    const handleGuardar = () => {
      if (!formValido.value) return
      
      emit('guardar', {
        nombre: form.value.nombre.trim(),
        sku: form.value.sku.trim(),
        categoria: form.value.categoria,
        precio: Number(form.value.precio),
        descripcion: form.value.descripcion.trim(),
        activo: form.value.activo
      })
    }

    return {
      form,
      categoriasDisponibles,
      formValido,
      formatearMoneda,
      handleGuardar
    }
  }
}
</script>