<template>
  <q-page class="q-pa-md">
    <!-- ENCABEZADO -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <h4 class="q-my-none">⚡ Venta Rápida</h4>
        <p class="text-caption text-grey">Selecciona cliente y productos del inventario</p>
      </div>
      <div class="col-auto">
        <!-- BOTÓN PARA AGREGAR PRODUCTO RÁPIDO -->
        <q-btn 
          color="positive" 
          icon="add" 
          label="Agregar Producto" 
          @click="mostrarDialogoProducto = true"
          class="q-mr-sm"
        />
        <q-btn 
          flat
          color="grey" 
          icon="arrow_back" 
          label="Volver"
          to="/"
        />
      </div>
    </div>

    <!-- PANEL PRINCIPAL: CLIENTE + PRODUCTOS -->
    <div class="row">
      <!-- COLUMNA IZQUIERDA: CLIENTE Y PRODUCTOS -->
      <div class="col-12 col-md-8 q-pr-md">
        <!-- SELECCIÓN DE CLIENTE -->
        <q-card class="q-mb-md">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">👤 Seleccionar Cliente</div>
          </q-card-section>
          <q-card-section>
            <q-select
              v-model="clienteSeleccionado"
              :options="clientesFiltrados"
              label="🔍 Buscar cliente"
              outlined
              use-input
              input-debounce="300"
              @filter="filtrarClientes"
              :loading="cargandoClientes"
              clearable
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white">
                      <q-icon name="person" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption v-if="scope.opt.whatsapp">
                      📱 {{ scope.opt.whatsapp }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- INFO DEL CLIENTE SELECCIONADO -->
            <div v-if="clienteSeleccionado" class="q-mt-md">
              <q-chip color="primary" text-color="white" icon="person">
                {{ clienteSeleccionado.label }}
                <q-tooltip>Cliente seleccionado</q-tooltip>
              </q-chip>
              <q-btn 
                v-if="clienteSeleccionado.whatsapp"
                flat
                dense
                color="green"
                icon="chat"
                label="WhatsApp"
                class="q-ml-sm"
                @click="abrirWhatsApp(clienteSeleccionado.whatsapp)"
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- BUSCAR PRODUCTOS -->
        <q-card class="q-mb-md">
          <q-card-section>
            <q-input 
              v-model="busquedaProductos" 
              placeholder="🔍 Buscar producto por nombre o código..."
              outlined
              clearable
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <!-- PRODUCTOS DISPONIBLES -->
            <div class="text-h6 q-mb-sm">Productos Disponibles</div>
            
            <div v-if="productosFiltrados.length === 0" class="text-center q-pa-lg">
              <q-icon name="inventory_2" size="xl" color="grey-5" />
              <div class="q-mt-md">No hay productos disponibles</div>
              <q-btn 
                color="primary" 
                icon="add" 
                label="Agregar Primer Producto" 
                @click="mostrarDialogoProducto = true"
                class="q-mt-md"
              />
            </div>
            
            <div class="row q-col-gutter-sm">
              <div 
                v-for="producto in productosFiltrados" 
                :key="producto.id"
                class="col-12 col-sm-6 col-md-4"
              >
                <q-card 
                  class="cursor-pointer"
                  :class="{ 'stock-bajo': producto.stock <= 2 }"
                  @click="agregarAlCarrito(producto)"
                >
                  <q-card-section>
                    <div class="text-weight-bold">{{ producto.nombre }}</div>
                    <div class="text-h6 text-primary">${{ formatPrecio(producto.precioVenta) }}</div>
                    <div class="text-caption">
                      <q-badge :color="getStockColor(producto.stock)">
                        Stock: {{ producto.stock }}
                      </q-badge>
                      <span v-if="producto.codigo" class="q-ml-sm">Cód: {{ producto.codigo }}</span>
                    </div>
                  </q-card-section>
                  <q-card-actions>
                    <q-btn 
                      flat 
                      color="primary" 
                      icon="add_shopping_cart" 
                      label="Agregar"
                      @click.stop="agregarAlCarrito(producto)"
                    />
                  </q-card-actions>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <!-- COLUMNA DERECHA: CARRITO Y RESUMEN -->
      <div class="col-12 col-md-4">
        <!-- CARRITO -->
        <q-card class="sticky-card shadow-3 q-mb-md">
          <q-card-section class="bg-primary text-white">
            <div class="text-h5">🛒 Carrito</div>
            <div class="text-caption">
              {{ carrito.length }} producto{{ carrito.length !== 1 ? 's' : '' }}
            </div>
          </q-card-section>
          
          <q-card-section>
            <!-- CARRITO VACÍO -->
            <div v-if="carrito.length === 0" class="text-center q-pa-lg">
              <q-icon name="shopping_cart" size="xl" color="grey-4" />
              <div class="q-mt-md text-grey">Carrito vacío</div>
              <div class="text-caption">Selecciona productos de la izquierda</div>
            </div>
            
            <!-- ITEMS EN CARRITO -->
            <div v-else>
              <q-list dense>
                <q-item 
                  v-for="(item, index) in carrito" 
                  :key="index"
                  class="q-py-sm"
                >
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ item.nombre }}</q-item-label>
                    <q-item-label caption>
                      ${{ formatPrecio(item.precioVenta) }} x {{ item.cantidad }}
                    </q-item-label>
                  </q-item-section>
                  
                  <q-item-section side>
                    <div class="text-h6">${{ formatPrecio(item.subtotal) }}</div>
                  </q-item-section>
                  
                  <q-item-section side>
                    <q-btn 
                      icon="remove" 
                      size="sm" 
                      flat 
                      dense 
                      @click="removerDelCarrito(item.id)"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
              
              <q-separator class="q-my-md" />
              
              <!-- RESUMEN -->
              <div class="row q-mb-xs">
                <div class="col">Subtotal:</div>
                <div class="col-auto">${{ formatPrecio(totalVenta) }}</div>
              </div>
              
              <div class="row q-mb-sm">
                <div class="col">Productos:</div>
                <div class="col-auto">{{ totalItems }} items</div>
              </div>
              
              <q-separator class="q-my-md" />
              
              <div class="row text-h5 text-weight-bold">
                <div class="col">TOTAL:</div>
                <div class="col-auto text-primary">${{ formatPrecio(totalVenta) }}</div>
              </div>
            </div>
          </q-card-section>
          
          <!-- BOTÓN FINALIZAR VENTA -->
          <q-card-actions>
            <q-btn 
              color="positive" 
              class="full-width"
              :disabled="carrito.length === 0 || !clienteSeleccionado"
              :loading="guardando"
              @click="finalizarVenta"
              icon="check"
            >
              <template v-if="clienteSeleccionado">
                FINALIZAR VENTA (${{ formatPrecio(totalVenta) }})
              </template>
              <template v-else>
                SELECCIONA UN CLIENTE
              </template>
            </q-btn>
          </q-card-actions>
        </q-card>

        <!-- OBSERVACIONES -->
        <q-card>
          <q-card-section>
            <div class="text-h6">📝 Observaciones</div>
            <q-input
              v-model="observaciones"
              placeholder="Notas adicionales..."
              type="textarea"
              outlined
              rows="3"
              dense
            />
            
            <!-- MÉTODO DE PAGO -->
            <div class="q-mt-md">
              <div class="text-subtitle2 q-mb-xs">Método de Pago</div>
              <div class="row q-gutter-sm">
                <q-btn 
                  :outline="metodoPago !== 'efectivo'"
                  color="green" 
                  label="Efectivo" 
                  @click="metodoPago = 'efectivo'"
                />
                <q-btn 
                  :outline="metodoPago !== 'transferencia'"
                  color="blue" 
                  label="Transferencia" 
                  @click="metodoPago = 'transferencia'"
                />
                <q-btn 
                  :outline="metodoPago !== 'tarjeta'"
                  color="purple" 
                  label="Tarjeta" 
                  @click="metodoPago = 'tarjeta'"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- =========================================== -->
    <!-- DIÁLOGO PARA AGREGAR PRODUCTO RÁPIDO -->
    <!-- =========================================== -->
    <q-dialog v-model="mostrarDialogoProducto">
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">➕ Agregar Producto Rápido</div>
        </q-card-section>
        
        <q-card-section>
          <q-form @submit="agregarProductoRapido" class="q-gutter-md">
            <q-input 
              v-model="nuevoProducto.nombre"
              label="Nombre del producto *"
              :rules="[val => !!val || 'Obligatorio']"
              outlined
              dense
            />
            
            <q-input 
              v-model.number="nuevoProducto.precioVenta"
              label="Precio de venta *"
              type="number"
              :rules="[val => val > 0 || 'Mayor a 0']"
              outlined
              dense
              prefix="$"
            />
            
            <q-input 
              v-model.number="nuevoProducto.stock"
              label="Stock inicial"
              type="number"
              outlined
              dense
            />
            
            <div class="row">
              <q-space />
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn color="primary" label="Guardar" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { db } from 'boot/firebase'
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  writeBatch 
} from 'firebase/firestore'
import { useQuasar } from 'quasar'

export default {
  name: 'VentasRapidas',
  
  setup() {
    const $q = useQuasar()
    
    // ========== DATOS REACTIVOS ==========
    const clientes = ref([])
    const clientesFiltrados = ref([])
    const productos = ref([])
    const carrito = ref([])
    const busquedaProductos = ref('')
    const cargandoClientes = ref(false)
    const cargandoProductos = ref(false)
    const guardando = ref(false)
    
    // Cliente seleccionado
    const clienteSeleccionado = ref(null)
    
    // Observaciones y pago
    const observaciones = ref('')
    const metodoPago = ref('efectivo')
    
    // Para diálogo de nuevo producto
    const mostrarDialogoProducto = ref(false)
    const nuevoProducto = ref({
      nombre: '',
      precioVenta: 0,
      stock: 0,
      codigo: '',
      categoria: 'Tenis'
    })
    
    // ========== CARGAR DATOS ==========
    const cargarClientes = async () => {
      cargandoClientes.value = true
      try {
        const querySnapshot = await getDocs(collection(db, 'clientes'))
        clientes.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        // Preparar opciones para el select
        clientesFiltrados.value = clientes.value.map(c => ({
          label: c.nombre,
          value: c.id,
          whatsapp: c.whatsapp || null
        }))
      } catch (error) {
        console.error('Error cargando clientes:', error)
        $q.notify({
          type: 'negative',
          message: 'Error cargando clientes'
        })
      } finally {
        cargandoClientes.value = false
      }
    }
    
    const cargarProductos = async () => {
      cargandoProductos.value = true
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
          message: 'Error cargando productos'
        })
      } finally {
        cargandoProductos.value = false
      }
    }
    
    // ========== FILTRAR CLIENTES ==========
    const filtrarClientes = (val, update) => {
      update(() => {
        if (val === '') {
          clientesFiltrados.value = clientes.value.map(c => ({
            label: c.nombre,
            value: c.id,
            whatsapp: c.whatsapp
          }))
        } else {
          const needle = val.toLowerCase()
          clientesFiltrados.value = clientes.value
            .filter(c => 
              c.nombre.toLowerCase().includes(needle) ||
              (c.whatsapp && c.whatsapp.includes(needle))
            )
            .map(c => ({
              label: c.nombre,
              value: c.id,
              whatsapp: c.whatsapp
            }))
        }
      })
    }
    
    // ========== FILTRAR PRODUCTOS ==========
    const productosFiltrados = computed(() => {
      if (!busquedaProductos.value.trim()) return productos.value
      
      const termino = busquedaProductos.value.toLowerCase()
      return productos.value.filter(p => 
        (p.nombre && p.nombre.toLowerCase().includes(termino)) ||
        (p.codigo && p.codigo.toLowerCase().includes(termino))
      )
    })
    
    // ========== FUNCIONES DEL CARRITO ==========
    const agregarAlCarrito = (producto) => {
      if (producto.stock <= 0) {
        $q.notify({
          type: 'warning',
          message: `⚠️ ${producto.nombre} sin stock disponible`
        })
        return
      }
      
      const existe = carrito.value.find(item => item.id === producto.id)
      
      if (existe) {
        if (existe.cantidad >= producto.stock) {
          $q.notify({
            type: 'warning',
            message: `Stock máximo alcanzado para ${producto.nombre}`
          })
          return
        }
        existe.cantidad++
        existe.subtotal = existe.cantidad * existe.precioVenta
      } else {
        carrito.value.push({
          id: producto.id,
          nombre: producto.nombre,
          precioVenta: producto.precioVenta,
          cantidad: 1,
          subtotal: producto.precioVenta
        })
      }
      
      // Actualizar stock localmente
      const productoIndex = productos.value.findIndex(p => p.id === producto.id)
      if (productoIndex !== -1) {
        productos.value[productoIndex].stock--
      }
    }
    
    const removerDelCarrito = (productoId) => {
      const itemIndex = carrito.value.findIndex(item => item.id === productoId)
      
      if (itemIndex !== -1) {
        const item = carrito.value[itemIndex]
        
        // Devolver stock a la lista local
        const productoIndex = productos.value.findIndex(p => p.id === productoId)
        if (productoIndex !== -1) {
          productos.value[productoIndex].stock += item.cantidad
        }
        
        // Eliminar del carrito
        carrito.value.splice(itemIndex, 1)
      }
    }
    
    const totalVenta = computed(() => {
      return carrito.value.reduce((sum, item) => sum + item.subtotal, 0)
    })
    
    const totalItems = computed(() => {
      return carrito.value.reduce((sum, item) => sum + item.cantidad, 0)
    })
    
    // ========== FUNCIÓN PARA AGREGAR PRODUCTO RÁPIDO ==========
    const agregarProductoRapido = async () => {
      try {
        // Calcular precio de compra (80% del precio venta)
        const precioCompra = Math.round(nuevoProducto.value.precioVenta * 0.8)
        
        // Generar código automático
        const iniciales = nuevoProducto.value.nombre.substring(0, 3).toUpperCase()
        const random = Math.floor(Math.random() * 1000)
        const codigo = `${iniciales}-${random}`
        
        const productoData = {
          nombre: nuevoProducto.value.nombre.trim(),
          precioVenta: Number(nuevoProducto.value.precioVenta),
          precioCompra: precioCompra,
          stock: Number(nuevoProducto.value.stock) || 0,
          codigo: codigo,
          categoria: nuevoProducto.value.categoria || 'Tenis',
          fechaCreacion: new Date().toISOString()
        }
        
        // Guardar en Firebase
        const docRef = await addDoc(collection(db, 'productos'), productoData)
        
        // Agregar a la lista local
        const productoConId = {
          id: docRef.id,
          ...productoData
        }
        
        productos.value.push(productoConId)
        
        $q.notify({
          type: 'positive',
          message: `✅ "${productoData.nombre}" agregado al inventario`,
          timeout: 3000
        })
        
        // Cerrar diálogo y limpiar
        mostrarDialogoProducto.value = false
        nuevoProducto.value = {
          nombre: '',
          precioVenta: 0,
          stock: 0,
          codigo: '',
          categoria: 'Tenis'
        }
        
      } catch (error) {
        console.error('Error:', error)
        $q.notify({
          type: 'negative',
          message: '❌ Error al guardar producto'
        })
      }
    }
    
    // ========== FINALIZAR VENTA ==========
    const finalizarVenta = async () => {
      if (carrito.value.length === 0 || !clienteSeleccionado.value) {
        $q.notify({
          type: 'warning',
          message: 'Selecciona un cliente y productos'
        })
        return
      }
      
      guardando.value = true
      
      try {
        const batch = writeBatch(db)
        
        // 1. Actualizar stock de cada producto
        for (const item of carrito.value) {
          const productoRef = doc(db, 'productos', item.id)
          const producto = productos.value.find(p => p.id === item.id)
          
          if (producto) {
            batch.update(productoRef, {
              stock: producto.stock
            })
          }
        }
        
        // 2. Crear registro de venta
        const ventaRef = doc(collection(db, 'ventas'))
        const ventaData = {
          id: ventaRef.id,
          fecha: new Date().toISOString(),
          timestamp: new Date(),
          total: totalVenta.value,
          items: carrito.value.map(item => ({
            id: item.id,
            nombre: item.nombre,
            precioVenta: item.precioVenta,
            cantidad: item.cantidad,
            subtotal: item.subtotal
          })),
          cliente: {
            id: clienteSeleccionado.value.value,
            nombre: clienteSeleccionado.value.label
          },
          estado: 'completada',
          metodoPago: metodoPago.value,
          observaciones: observaciones.value,
          vendedor: 'admin'
        }
        
        batch.set(ventaRef, ventaData)
        
        // 3. Ejecutar todas las operaciones
        await batch.commit()
        
        // 4. Mostrar éxito
        $q.dialog({
          title: '✅ Venta Completada',
          message: `
            <div class="text-h6">Resumen de Venta</div>
            <div class="q-my-sm"><strong>Cliente:</strong> ${clienteSeleccionado.value.label}</div>
            <div class="q-my-sm"><strong>Total:</strong> $${formatPrecio(totalVenta.value)}</div>
            <div class="q-my-sm"><strong>Productos:</strong> ${totalItems.value}</div>
            <div class="q-my-sm"><strong>Método pago:</strong> ${metodoPago.value}</div>
            <div class="q-my-sm"><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</div>
          `,
          html: true,
          cancel: false
        })
        
        // 5. Limpiar todo
        carrito.value = []
        clienteSeleccionado.value = null
        observaciones.value = ''
        metodoPago.value = 'efectivo'
        
        // Recargar productos para stock actualizado
        await cargarProductos()
        
      } catch (error) {
        console.error('Error en venta:', error)
        $q.notify({
          type: 'negative',
          message: '❌ Error al registrar venta',
          caption: error.message
        })
      } finally {
        guardando.value = false
      }
    }
    
    // ========== FUNCIONES DE UTILIDAD ==========
    const formatPrecio = (precio) => {
      return new Intl.NumberFormat('es-CO').format(precio || 0)
    }
    
    const getStockColor = (stock) => {
      if (stock === 0) return 'red'
      if (stock <= 2) return 'orange'
      return 'green'
    }
    
    const abrirWhatsApp = (numero) => {
      const numeroLimpio = numero.replace(/\D/g, '')
      window.open(`https://wa.me/${numeroLimpio}`, '_blank')
    }
    
    // ========== INICIALIZAR ==========
    onMounted(async () => {
      await cargarClientes()
      await cargarProductos()
    })
    
    return {
      // Datos
      clientes,
      clientesFiltrados,
      productos,
      carrito,
      busquedaProductos,
      cargandoClientes,
      cargandoProductos,
      guardando,
      clienteSeleccionado,
      observaciones,
      metodoPago,
      
      // Para diálogo
      mostrarDialogoProducto,
      nuevoProducto,
      
      // Computadas
      productosFiltrados,
      totalVenta,
      totalItems,
      
      // Métodos
      filtrarClientes,
      agregarAlCarrito,
      removerDelCarrito,
      agregarProductoRapido,
      finalizarVenta,
      formatPrecio,
      getStockColor,
      abrirWhatsApp
    }
  }
}
</script>

<style scoped>
.sticky-card {
  position: sticky;
  top: 20px;
}

.q-card {
  border-radius: 12px;
  transition: transform 0.2s;
}

.q-card:hover {
  transform: translateY(-2px);
}

.cursor-pointer {
  cursor: pointer;
}

.stock-bajo {
  border-left: 4px solid #ff9800;
}

@media (max-width: 768px) {
  .sticky-card {
    position: relative;
    top: 0;
    margin-top: 20px;
  }
}
</style>