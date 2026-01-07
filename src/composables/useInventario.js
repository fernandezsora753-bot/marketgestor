import { ref } from 'vue'

export function useInventario() {
  const productos = ref([])
  const cargando = ref(false)
  
  const cargarProductos = async () => {
    console.log('Cargando productos...')
    productos.value = []
    cargando.value = false
  }
  
  const crearProducto = async () => {
    console.log('Creando producto...')
    return 'test-id'
  }
  
  const actualizarProducto = async () => {
    console.log('Actualizando producto...')
  }
  
  const toggleActivoProducto = async () => {
    console.log('Cambiando estado...')
  }
  
  const registrarMovimiento = async () => {
    console.log('Registrando movimiento...')
  }
  
  return {
    productos,
    cargando,
    cargarProductos,
    crearProducto,
    actualizarProducto,
    toggleActivoProducto,
    registrarMovimiento
  }
}