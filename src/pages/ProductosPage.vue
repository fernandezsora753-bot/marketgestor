<template>
  <q-page class="q-pa-md">
    <!-- ENCABEZADO -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <h4 class="q-my-none">📦 Gestión de Productos</h4>
        <p class="text-caption text-grey">Administra tu catálogo de productos</p>
      </div>
      <div class="col-auto">
        <q-btn 
          color="primary" 
          icon="add" 
          label="Nuevo Producto"
          @click="abrirDialogoNuevo"
        />
      </div>
    </div>

    <!-- FILTROS Y BÚSQUEDA -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Búsqueda -->
          <div class="col-12 col-md-6">
            <q-input 
              v-model="busqueda" 
              placeholder="🔍 Buscar por nombre, SKU, descripción..."
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- Filtro Categoría -->
          <div class="col-6 col-md-3">
            <q-select
              v-model="filtroCategoria"
              :options="categoriasOptions"
              label="Categoría"
              outlined
              dense
              clearable
              emit-value
              map-options
            />
          </div>

          <!-- Filtro Estado -->
          <div class="col-6 col-md-3">
            <q-select
              v-model="filtroActivo"
              :options="estadoOptions"
              label="Estado"
              outlined
              dense
              clearable
              emit-value
              map-options
            />
          </div>
        </div>

        <!-- Botón limpiar filtros -->
        <div class="row q-mt-sm" v-if="busqueda || filtroCategoria || filtroActivo !== null">
          <q-btn
            flat
            dense
            color="grey"
            icon="clear"
            label="Limpiar filtros"
            @click="limpiarFiltros"
            size="sm"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- LISTA DE PRODUCTOS -->
    <ListaProductos
      :productos="productosFiltrados"
      :cargando="cargando"
      @editar="editarProducto"
      @eliminar="eliminarProducto"
      @toggle-activo="toggleActivo"
    />

    <!-- DIÁLOGO FORMULARIO -->
    <DialogoFormProducto
      v-model="dialogo"
      :producto="productoActual"
      :categorias="categorias"
      :modo-edicion="modoEdicion"
      :guardando="guardando"
      @guardar="guardarProducto"
      @cerrar="cerrarDialogo"
    />
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useProductos } from 'src/composables/useProductos'
import ListaProductos from 'src/components/productos/ListaProductos.vue'
import DialogoFormProducto from 'src/components/productos/DialogoFormProducto.vue'

export default {
  name: 'ProductosPage',
  
  components: {
    ListaProductos,
    DialogoFormProducto
  },
  
  setup() {
    const {
      productos,
      categorias,
      busqueda,
      filtroCategoria,
      filtroActivo,
      cargando,
      productosFiltrados,
      cargarProductos,
      cargarCategorias,
      crearProducto,
      actualizarProducto,
      eliminarProducto,
      toggleActivo,
      limpiarFiltros
    } = useProductos()

    // Estado local del diálogo
    const dialogo = ref(false)
    const modoEdicion = ref(false)
    const productoActual = ref(null)
    const guardando = ref(false)

    // Opciones para selects
    const categoriasOptions = computed(() => 
      categorias.value.map(cat => ({ label: cat, value: cat }))
    )

    const estadoOptions = [
      { label: 'Activos', value: true },
      { label: 'Inactivos', value: false }
    ]

    /**
     * Abrir diálogo para nuevo producto
     */
    const abrirDialogoNuevo = () => {
      modoEdicion.value = false
      productoActual.value = null
      dialogo.value = true
    }

    /**
     * Abrir diálogo para editar producto
     */
    const editarProducto = (producto) => {
      modoEdicion.value = true
      productoActual.value = { ...producto }
      dialogo.value = true
    }

    /**
     * Guardar producto (crear o actualizar)
     */
    const guardarProducto = async (formData) => {
      guardando.value = true
      
      try {
        if (modoEdicion.value && productoActual.value) {
          await actualizarProducto(productoActual.value.id, formData)
        } else {
          await crearProducto(formData)
        }
        
        cerrarDialogo()
      } catch (error) {
        console.error('Error guardando producto:', error)
      } finally {
        guardando.value = false
      }
    }

    /**
     * Cerrar diálogo
     */
    const cerrarDialogo = () => {
      dialogo.value = false
      productoActual.value = null
      modoEdicion.value = false
    }

    // Cargar datos al iniciar
    onMounted(async () => {
      await cargarProductos()
      await cargarCategorias()
    })

    return {
      // Estado
      productos,
      categorias,
      busqueda,
      filtroCategoria,
      filtroActivo,
      cargando,
      productosFiltrados,
      dialogo,
      modoEdicion,
      productoActual,
      guardando,
      categoriasOptions,
      estadoOptions,
      
      // Métodos
      abrirDialogoNuevo,
      editarProducto,
      guardarProducto,
      cerrarDialogo,
      eliminarProducto,
      toggleActivo,
      limpiarFiltros
    }
  }
}
</script>

<style scoped>
.q-card {
  border-radius: 8px;
}
</style>