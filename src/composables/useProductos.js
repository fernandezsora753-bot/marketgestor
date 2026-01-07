import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { productosService } from 'src/services/productosService'

/**
 * 🎯 Composable para gestión de productos
 * Sigue el mismo patrón que tus páginas actuales
 */
export function useProductos() {
  const $q = useQuasar()
  
  // Estado reactivo
  const productos = ref([])
  const categorias = ref([])
  const busqueda = ref('')
  const filtroCategoria = ref(null)
  const filtroActivo = ref(null)
  const cargando = ref(false)

  /**
   * Productos filtrados (búsqueda local)
   */
  const productosFiltrados = computed(() => {
    let resultado = [...productos.value]
    
    // Filtrar por búsqueda
    if (busqueda.value.trim()) {
      const termino = busqueda.value.toLowerCase()
      resultado = resultado.filter(p => 
        (p.nombre && p.nombre.toLowerCase().includes(termino)) ||
        (p.sku && p.sku.toLowerCase().includes(termino)) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(termino)) ||
        (p.categoria && p.categoria.toLowerCase().includes(termino))
      )
    }
    
    // Filtrar por categoría
    if (filtroCategoria.value) {
      resultado = resultado.filter(p => p.categoria === filtroCategoria.value)
    }
    
    // Filtrar por activo
    if (filtroActivo.value !== null) {
      resultado = resultado.filter(p => p.activo === filtroActivo.value)
    }
    
    // Ordenar alfabéticamente
    resultado.sort((a, b) => a.nombre.localeCompare(b.nombre))
    
    return resultado
  })

  /**
   * Cargar todos los productos
   */
  const cargarProductos = async () => {
    cargando.value = true
    try {
      productos.value = await productosService.getAll()
      
      // Ordenar alfabéticamente
      productos.value.sort((a, b) => a.nombre.localeCompare(b.nombre))
      
      return productos.value
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al cargar productos',
        caption: error.message
      })
      return []
    } finally {
      cargando.value = false
    }
  }

  /**
   * Cargar categorías disponibles
   */
  const cargarCategorias = async () => {
    try {
      categorias.value = await productosService.getCategorias()
      return categorias.value
    } catch (error) {
      console.error('Error cargando categorías:', error)
      return []
    }
  }

  /**
   * Crear producto
   */
  const crearProducto = async (data) => {
    cargando.value = true
    try {
      const id = await productosService.create(data)
      
      $q.notify({
        type: 'positive',
        message: '✅ Producto creado correctamente'
      })
      
      await cargarProductos()
      await cargarCategorias()
      return id
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al crear producto',
        caption: error.message
      })
      throw error
    } finally {
      cargando.value = false
    }
  }

  /**
   * Actualizar producto
   */
  const actualizarProducto = async (id, data) => {
    cargando.value = true
    try {
      await productosService.update(id, data)
      
      $q.notify({
        type: 'positive',
        message: '✅ Producto actualizado correctamente'
      })
      
      await cargarProductos()
      await cargarCategorias()
      return true
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al actualizar producto',
        caption: error.message
      })
      throw error
    } finally {
      cargando.value = false
    }
  }

  /**
   * Eliminar producto con confirmación
   */
  const eliminarProducto = async (producto) => {
    return new Promise((resolve) => {
      $q.dialog({
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`,
        cancel: {
          label: 'Cancelar',
          flat: true,
          color: 'grey'
        },
        ok: {
          label: 'Eliminar',
          color: 'negative'
        },
        persistent: true
      }).onOk(async () => {
        cargando.value = true
        try {
          await productosService.delete(producto.id)
          
          $q.notify({
            type: 'positive',
            message: `✅ ${producto.nombre} eliminado correctamente`
          })
          
          await cargarProductos()
          await cargarCategorias()
          resolve(true)
        } catch (error) {
          $q.notify({
            type: 'negative',
            message: 'Error al eliminar producto',
            caption: error.message
          })
          resolve(false)
        } finally {
          cargando.value = false
        }
      }).onCancel(() => {
        resolve(false)
      })
    })
  }

  /**
   * Cambiar estado activo
   */
  const toggleActivo = async (producto) => {
    cargando.value = true
    try {
      await productosService.update(producto.id, { 
        activo: !producto.activo 
      })
      
      $q.notify({
        type: 'info',
        message: producto.activo 
          ? 'Producto desactivado' 
          : 'Producto activado'
      })
      
      await cargarProductos()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al cambiar estado',
        caption: error.message
      })
    } finally {
      cargando.value = false
    }
  }

  /**
   * Limpiar filtros
   */
  const limpiarFiltros = () => {
    busqueda.value = ''
    filtroCategoria.value = null
    filtroActivo.value = null
  }

  return {
    // Estado
    productos,
    categorias,
    busqueda,
    filtroCategoria,
    filtroActivo,
    cargando,
    productosFiltrados,
    
    // Métodos
    cargarProductos,
    cargarCategorias,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    toggleActivo,
    limpiarFiltros
  }
}