<template>
  <q-page class="q-pa-md">
    <!-- ENCABEZADO -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <h4 class="q-my-none">📦 Gestión de Inventario</h4>
        <p class="text-caption text-grey">
          Control de stock, valor del inventario y movimientos
        </p>
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

    <!-- RESUMEN / ESTADÍSTICAS -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-blue-1">
          <q-card-section>
            <div class="text-h5">{{ formatearMoneda(estadisticas.valorTotal) }}</div>
            <div class="text-caption text-grey-7">Valor del Inventario</div>
            <div class="text-caption text-green" v-if="estadisticas.gananciaPotencial > 0">
              +{{ formatearMoneda(estadisticas.gananciaPotencial) }} ganancia
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-green-1">
          <q-card-section>
            <div class="text-h5">{{ estadisticas.totalProductos }}</div>
            <div class="text-caption text-grey-7">Total Productos</div>
            <div class="text-caption">
              {{ estadisticas.productosActivos }} activos
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-orange-1">
          <q-card-section>
            <div class="text-h5">{{ estadisticas.stockBajo }}</div>
            <div class="text-caption text-grey-7">Productos con Stock Bajo</div>
            <q-icon 
              v-if="estadisticas.stockBajo > 0" 
              name="warning" 
              color="orange" 
              class="q-ml-xs"
            />
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-purple-1">
          <q-card-section>
            <div class="text-h5">{{ estadisticas.totalUnidades }}</div>
            <div class="text-caption text-grey-7">Unidades en Inventario</div>
          </q-card-section>
        </q-card>
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
              placeholder="🔍 Buscar por nombre o código..."
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- Filtro por categoría -->
          <div class="col-6 col-md-3">
            <q-select
              v-model="filtroCategoria"
              :options="categoriasDisponibles"
              label="Categoría"
              outlined
              dense
              clearable
            />
          </div>

          <!-- Filtro por stock -->
          <div class="col-6 col-md-3">
            <q-select
              v-model="filtroStock"
              :options="['Todos', 'Stock Bajo', 'Sin Stock', 'Con Stock']"
              label="Estado Stock"
              outlined
              dense
            />
          </div>
        </div>

        <div class="row q-mt-sm" v-if="busqueda || filtroCategoria || filtroStock !== 'Todos'">
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
    <q-card>
      <q-card-section>
        <!-- Cargando -->
        <div v-if="cargando" class="text-center q-pa-lg">
          <q-spinner color="primary" size="xl" />
          <div class="q-mt-md">Cargando inventario...</div>
        </div>

        <!-- Sin productos -->
        <div v-else-if="productosFiltrados.length === 0" class="text-center q-pa-lg">
          <q-icon name="inventory_2" size="xl" color="grey-5" />
          <div class="q-mt-md text-grey">
            {{ busqueda ? 'No se encontraron productos' : 'Aún no hay productos en inventario' }}
          </div>
          <q-btn 
            v-if="!busqueda"
            color="primary" 
            icon="add" 
            label="Registrar Primer Producto" 
            class="q-mt-md"
            @click="abrirDialogoNuevo"
          />
        </div>

        <!-- Lista de productos -->
        <q-list v-else bordered separator>
          <q-item 
            v-for="producto in productosFiltrados" 
            :key="producto.id"
          >
            <q-item-section avatar>
              <q-avatar :color="getStockColor(producto)" text-color="white">
                <q-icon name="inventory" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold">
                {{ producto.nombre }}
              </q-item-label>
              <q-item-label caption>
                Código: {{ producto.codigo }} • Categoría: {{ producto.categoria }}
              </q-item-label>
              <q-item-label caption>
                <q-badge :color="getStockColor(producto)">
                  Stock: {{ producto.stock }}
                </q-badge>
                <span v-if="producto.stockMinimo" class="q-ml-sm">
                  Mín: {{ producto.stockMinimo }}
                </span>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="column items-end">
                <div class="text-caption text-grey-7">Precio Venta</div>
                <div class="text-h6 text-primary">
                  {{ formatearMoneda(producto.precioVenta) }}
                </div>
                <div class="text-caption">
                  Valor: {{ formatearMoneda(producto.precioVenta * producto.stock) }}
                </div>
              </div>
            </q-item-section>

            <q-item-section side>
              <div class="row q-gutter-xs">
                <q-btn 
                  round 
                  dense 
                  flat 
                  color="blue" 
                  icon="edit"
                  size="sm"
                  @click="editarProducto(producto)"
                >
                  <q-tooltip>Ajustar stock</q-tooltip>
                </q-btn>

                <q-btn 
                  round 
                  dense 
                  flat 
                  color="orange" 
                  icon="settings"
                  size="sm"
                  @click="editarProducto(producto)"
                >
                  <q-tooltip>Editar producto</q-tooltip>
                </q-btn>

                <q-btn 
                  round 
                  dense 
                  flat 
                  :color="producto.activo !== false ? 'grey' : 'green'"
                  :icon="producto.activo !== false ? 'toggle_off' : 'toggle_on'"
                  size="sm"
                  @click="toggleActivo(producto)"
                >
                  <q-tooltip>
                    {{ producto.activo !== false ? 'Desactivar' : 'Activar' }}
                  </q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-if="!cargando && productos.length > 0" class="q-mt-md text-center text-caption text-grey">
          Mostrando {{ productosFiltrados.length }} de {{ productos.length }} productos
        </div>
      </q-card-section>
    </q-card>

    <!-- DIÁLOGO SIMPLE PARA NUEVO PRODUCTO -->
    <q-dialog v-model="dialogoNuevo" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ modoEdicion ? '✏️ Editar Producto' : '➕ Nuevo Producto' }}</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="formProducto.nombre"
            label="Nombre del producto *"
            outlined
            dense
            class="q-mb-md"
          />

          <q-input
            v-model="formProducto.codigo"
            label="Código/SKU *"
            outlined
            dense
            class="q-mb-md"
          />

          <q-input
            v-model="formProducto.categoria"
            label="Categoría *"
            outlined
            dense
            class="q-mb-md"
          />

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <q-input
                v-model.number="formProducto.precioCompra"
                label="Precio Compra"
                outlined
                dense
                type="number"
                prefix="$"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="formProducto.precioVenta"
                label="Precio Venta *"
                outlined
                dense
                type="number"
                prefix="$"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model.number="formProducto.stock"
                label="Stock Inicial *"
                outlined
                dense
                type="number"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="formProducto.stockMinimo"
                label="Stock Mínimo"
                outlined
                dense
                type="number"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" @click="cerrarDialogo" />
          <q-btn 
            label="Guardar"
            color="primary"
            @click="guardarProducto"
            :loading="guardando"
            :disable="!formValido"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'boot/firebase'
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore'

export default {
  name: 'InventarioPage',
  
  setup() {
    const $q = useQuasar()
    
    // Estado
    const productos = ref([])
    const cargando = ref(false)
    const guardando = ref(false)
    const busqueda = ref('')
    const filtroCategoria = ref(null)
    const filtroStock = ref('Todos')
    const dialogoNuevo = ref(false)
    const modoEdicion = ref(false)
    const productoActual = ref(null)
    
    const formProducto = ref({
      nombre: '',
      codigo: '',
      categoria: '',
      precioCompra: 0,
      precioVenta: 0,
      stock: 0,
      stockMinimo: null
    })

    // Cargar productos
    const cargarProductos = async () => {
      cargando.value = true
      try {
        const querySnapshot = await getDocs(collection(db, 'productos'))
        productos.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error cargando productos:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al cargar productos'
        })
      } finally {
        cargando.value = false
      }
    }

    // Categorías disponibles
    const categoriasDisponibles = computed(() => {
      const cats = [...new Set(productos.value
        .filter(p => p.categoria)
        .map(p => p.categoria))]
      return ['Todas', ...cats]
    })

    // Productos filtrados
    const productosFiltrados = computed(() => {
      let resultado = productos.value

      // Filtrar por búsqueda
      if (busqueda.value.trim()) {
        const termino = busqueda.value.toLowerCase()
        resultado = resultado.filter(p => 
          (p.nombre && p.nombre.toLowerCase().includes(termino)) ||
          (p.codigo && p.codigo.toLowerCase().includes(termino))
        )
      }

      // Filtrar por categoría
      if (filtroCategoria.value && filtroCategoria.value !== 'Todas') {
        resultado = resultado.filter(p => p.categoria === filtroCategoria.value)
      }

      // Filtrar por stock
      if (filtroStock.value === 'Stock Bajo') {
        resultado = resultado.filter(p => 
          p.stockMinimo && p.stock <= p.stockMinimo
        )
      } else if (filtroStock.value === 'Sin Stock') {
        resultado = resultado.filter(p => p.stock === 0)
      } else if (filtroStock.value === 'Con Stock') {
        resultado = resultado.filter(p => p.stock > 0)
      }

      return resultado
    })

    // Estadísticas
    const estadisticas = computed(() => {
      const activos = productos.value.filter(p => p.activo !== false)
      const valorTotal = activos.reduce((sum, p) => 
        sum + ((p.precioVenta || 0) * (p.stock || 0)), 0)
      const inversionTotal = activos.reduce((sum, p) => 
        sum + ((p.precioCompra || 0) * (p.stock || 0)), 0)
      const stockBajo = activos.filter(p => 
        p.stockMinimo && p.stock <= p.stockMinimo
      ).length

      return {
        valorTotal,
        gananciaPotencial: valorTotal - inversionTotal,
        totalProductos: activos.length,
        productosActivos: activos.length,
        stockBajo,
        totalUnidades: activos.reduce((sum, p) => sum + (p.stock || 0), 0)
      }
    })

    // Validación del formulario
    const formValido = computed(() => {
      return formProducto.value.nombre &&
             formProducto.value.codigo &&
             formProducto.value.categoria &&
             formProducto.value.precioVenta > 0 &&
             formProducto.value.stock >= 0
    })

    // Métodos
    const formatearMoneda = (valor) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(valor || 0)
    }

    const getStockColor = (producto) => {
      if (producto.stock === 0) return 'red'
      if (producto.stockMinimo && producto.stock <= producto.stockMinimo) {
        return 'orange'
      }
      return 'green'
    }

    const abrirDialogoNuevo = () => {
      modoEdicion.value = false
      productoActual.value = null
      formProducto.value = {
        nombre: '',
        codigo: '',
        categoria: '',
        precioCompra: 0,
        precioVenta: 0,
        stock: 0,
        stockMinimo: null
      }
      dialogoNuevo.value = true
    }

    const editarProducto = (producto) => {
      modoEdicion.value = true
      productoActual.value = producto
      formProducto.value = { ...producto }
      dialogoNuevo.value = true
    }

    const guardarProducto = async () => {
      if (!formValido.value) return

      guardando.value = true
      
      try {
        const productoData = {
          ...formProducto.value,
          fechaActualizacion: serverTimestamp()
        }

        if (modoEdicion.value && productoActual.value) {
          // Actualizar
          await updateDoc(doc(db, 'productos', productoActual.value.id), productoData)
          $q.notify({
            type: 'positive',
            message: '✅ Producto actualizado correctamente'
          })
        } else {
          // Crear
          productoData.fechaCreacion = serverTimestamp()
          productoData.activo = true
          await addDoc(collection(db, 'productos'), productoData)
          $q.notify({
            type: 'positive',
            message: '✅ Producto registrado correctamente'
          })
        }

        cerrarDialogo()
        await cargarProductos()
      } catch (error) {
        console.error('Error guardando producto:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al guardar producto'
        })
      } finally {
        guardando.value = false
      }
    }

    const toggleActivo = async (producto) => {
      try {
        const nuevoEstado = producto.activo === false ? true : false
        await updateDoc(doc(db, 'productos', producto.id), {
          activo: nuevoEstado
        })
        $q.notify({
          type: 'positive',
          message: `Producto ${nuevoEstado ? 'activado' : 'desactivado'}`
        })
        await cargarProductos()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Error al cambiar estado'
        })
      }
    }

    const limpiarFiltros = () => {
      busqueda.value = ''
      filtroCategoria.value = null
      filtroStock.value = 'Todos'
    }

    const cerrarDialogo = () => {
      dialogoNuevo.value = false
      formProducto.value = {
        nombre: '',
        codigo: '',
        categoria: '',
        precioCompra: 0,
        precioVenta: 0,
        stock: 0,
        stockMinimo: null
      }
      modoEdicion.value = false
      productoActual.value = null
    }

    // Inicializar
    onMounted(() => {
      cargarProductos()
    })

    return {
      productos,
      cargando,
      guardando,
      busqueda,
      filtroCategoria,
      filtroStock,
      dialogoNuevo,
      modoEdicion,
      formProducto,
      categoriasDisponibles,
      productosFiltrados,
      estadisticas,
      formValido,
      formatearMoneda,
      getStockColor,
      abrirDialogoNuevo,
      editarProducto,
      guardarProducto,
      toggleActivo,
      limpiarFiltros,
      cerrarDialogo
    }
  }
}
</script>

<style scoped>
.q-card {
  border-radius: 10px;
}

.q-item {
  border-radius: 8px;
  margin-bottom: 4px;
}

.q-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>