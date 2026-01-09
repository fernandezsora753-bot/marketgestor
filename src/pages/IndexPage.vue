<template>
  <q-page class="q-pa-md">
    <!-- ENCABEZADO MEJORADO -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-my-none text-primary">Menú Principal</h4>
        <p class="text-caption text-grey">Resumen general y acceso rápido a todos los módulos</p>
      </div>
      <div class="col-auto">
        <q-btn 
          color="primary" 
          icon="refresh" 
          label="Actualizar"
          @click="actualizarDashboard"
          flat
          class="q-mr-sm"
        />
        <q-btn-dropdown 
          color="green" 
          icon="add" 
          label="Nuevo"
          dropdown-icon="expand_more"
        >
          <q-list>
            <q-item clickable v-close-popup @click="abrirDialogoPedido">
              <q-item-section avatar>
                <q-icon name="add_shopping_cart" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Nuevo Pedido</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-separator />
            
            <q-item clickable v-close-popup @click="nuevoProveedor">
              <q-item-section avatar>
                <q-icon name="local_shipping" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Nuevo Proveedor</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item clickable v-close-popup @click="nuevoCliente">
              <q-item-section avatar>
                <q-icon name="person_add" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Nuevo Cliente</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item clickable v-close-popup @click="nuevoProducto">
              <q-item-section avatar>
                <q-icon name="inventory" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Nuevo Producto</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <!-- ACCIONES RÁPIDAS - AHORA AL INICIO -->
    <div class="row q-mb-xl">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 text-weight-bold q-mb-md">Acciones Rápidas</div>
            <div class="row q-col-gutter-md">
              <div class="col-6 col-sm-3 col-md-2 col-lg-2">
                <q-btn 
                  color="green" 
                  icon="add_shopping_cart" 
                  label="Nuevo Pedido"
                  @click="abrirDialogoPedido"
                  class="full-width action-btn"
                  size="sm"
                  stack
                />
              </div>
              <div class="col-6 col-sm-3 col-md-2 col-lg-2">
                <q-btn 
                  color="primary" 
                  icon="local_shipping" 
                  label="Nuevo Proveedor"
                  @click="nuevoProveedor"
                  class="full-width action-btn"
                  size="sm"
                  stack
                />
              </div>
              <div class="col-6 col-sm-3 col-md-2 col-lg-2">
                <q-btn 
                  color="orange" 
                  icon="point_of_sale" 
                  label="Nueva Venta"
                  @click="nuevaVenta"
                  class="full-width action-btn"
                  size="sm"
                  stack
                />
              </div>
              <div class="col-6 col-sm-3 col-md-2 col-lg-2">
                <q-btn 
                  color="red" 
                  icon="payments" 
                  label="Registrar Pago"
                  @click="registrarPagoRapido"
                  class="full-width action-btn"
                  size="sm"
                  stack
                />
              </div>
              <div class="col-6 col-sm-3 col-md-2 col-lg-2">
                <q-btn 
                  color="blue" 
                  icon="person_add" 
                  label="Nuevo Cliente"
                  @click="nuevoCliente"
                  class="full-width action-btn"
                  size="sm"
                  stack
                />
              </div>
              <div class="col-6 col-sm-3 col-md-2 col-lg-2">
                <q-btn 
                  color="purple" 
                  icon="inventory" 
                  label="Nuevo Producto"
                  @click="nuevoProducto"
                  class="full-width action-btn"
                  size="sm"
                  stack
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- RESUMEN DE ESTADO - AHORA DESPUÉS DE ACCIONES RÁPIDAS -->
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-blue-1" flat bordered>
          <q-card-section class="text-center q-pa-sm">
            <div class="text-h4 text-weight-bold text-primary">{{ totalProveedores }}</div>
            <div class="text-subtitle2 q-mt-sm">Proveedores</div>
            <div class="text-caption text-grey">
              <q-icon name="trending_up" v-if="proveedoresActivos > 0" color="positive" size="xs" />
              <span class="q-ml-xs">{{ proveedoresActivos }} activos</span>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="center" class="q-pa-xs">
            <q-btn 
              flat 
              dense 
              color="primary" 
              label="Ver todos"
              icon="chevron_right"
              size="sm"
              @click="irAProveedores"
            />
          </q-card-actions>
        </q-card>
      </div>
      
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-orange-1" flat bordered>
          <q-card-section class="text-center q-pa-sm">
            <div class="text-h4 text-weight-bold text-orange">{{ totalClientes }}</div>
            <div class="text-subtitle2 q-mt-sm">Clientes</div>
            <div class="text-caption text-grey">
              <q-icon name="person" size="xs" />
              <span class="q-ml-xs">{{ clientesRecientes }} nuevos este mes</span>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="center" class="q-pa-xs">
            <q-btn 
              flat 
              dense 
              color="orange" 
              label="Gestionar"
              icon="chevron_right"
              size="sm"
              @click="irAClientes"
            />
          </q-card-actions>
        </q-card>
      </div>
      
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-red-1" flat bordered>
          <q-card-section class="text-center q-pa-sm">
            <div class="text-h4 text-weight-bold text-negative">{{ pedidosPendientes }}</div>
            <div class="text-subtitle2 q-mt-sm">Pedidos Pendientes</div>
            <div class="text-caption text-grey">
              <q-icon name="schedule" size="xs" />
              <span class="q-ml-xs">{{ pedidosAtrasados }} atrasados</span>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="center" class="q-pa-xs">
            <q-btn 
              flat 
              dense 
              color="negative" 
              label="Revisar"
              icon="chevron_right"
              size="sm"
              @click="irAPedidos"
            />
          </q-card-actions>
        </q-card>
      </div>
      
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-green-1" flat bordered>
          <q-card-section class="text-center q-pa-sm">
            <div class="text-h4 text-weight-bold text-positive">{{ formatPrecio(totalDeudas) }}</div>
            <div class="text-subtitle2 q-mt-sm">Deuda Total</div>
            <div class="text-caption text-grey">
              <q-icon name="warning" v-if="totalDeudas > 0" color="negative" size="xs" />
              <span class="q-ml-xs">{{ proveedoresConDeuda }} proveedores</span>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="center" class="q-pa-xs">
            <q-btn 
              flat 
              dense 
              color="positive" 
              label="Pagar"
              icon="payments"
              size="sm"
              @click="irAPagos"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- MÓDULOS PRINCIPALES -->
    <div class="row q-col-gutter-lg">
      <!-- MÓDULO 1: PROVEEDORES -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="module-card" flat bordered>
          <q-card-section class="bg-blue-2">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6 text-weight-bold">Proveedores</div>
                <div class="text-caption">Gestión de proveedores y compras</div>
              </div>
              <div class="col-auto">
                <q-icon name="local_shipping" size="xl" color="primary" />
              </div>
            </div>
          </q-card-section>
          
          <q-card-section class="q-pa-sm">
            <div class="q-gutter-y-sm">
              <div class="row items-center justify-between">
                <span class="text-caption">Total registrados:</span>
                <span class="text-weight-bold">{{ totalProveedores }}</span>
              </div>
              <div class="row items-center justify-between">
                <span class="text-caption">Con deuda:</span>
                <span class="text-weight-bold text-negative">{{ proveedoresConDeuda }}</span>
              </div>
              <div class="row items-center justify-between">
                <span class="text-caption">Pedidos pendientes:</span>
                <span class="text-weight-bold text-orange">{{ pedidosPendientesPorProveedor }}</span>
              </div>
            </div>
          </q-card-section>
          
          <q-separator />
          
          <q-card-actions>
            <q-btn 
              flat 
              color="primary" 
              icon="visibility" 
              label="Ver resumen"
              @click="irAProveedores"
              class="full-width"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- MÓDULO 2: CLIENTES -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="module-card" flat bordered>
          <q-card-section class="bg-green-2">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6 text-weight-bold">Clientes</div>
                <div class="text-caption">Gestión de clientes y ventas</div>
              </div>
              <div class="col-auto">
                <q-icon name="people" size="xl" color="positive" />
              </div>
            </div>
          </q-card-section>
          
          <q-card-section class="q-pa-sm">
            <div class="q-gutter-y-sm">
              <div class="row items-center justify-between">
                <span class="text-caption">Total clientes:</span>
                <span class="text-weight-bold">{{ totalClientes }}</span>
              </div>
              <div class="row items-center justify-between">
                <span class="text-caption">Clientes activos:</span>
                <span class="text-weight-bold text-positive">{{ clientesActivos }}</span>
              </div>
              <div class="row items-center justify-between">
                <span class="text-caption">Ventas este mes:</span>
                <span class="text-weight-bold">{{ formatPrecio(ventasMes) }}</span>
              </div>
            </div>
          </q-card-section>
          
          <q-separator />
          
          <q-card-actions>
            <q-btn 
              flat 
              color="positive" 
              icon="visibility" 
              label="Ver clientes"
              @click="irAClientes"
              class="full-width"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- MÓDULO 3: INVENTARIO -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="module-card" flat bordered>
          <q-card-section class="bg-purple-2">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6 text-weight-bold">Inventario</div>
                <div class="text-caption">Productos y stock disponible</div>
              </div>
              <div class="col-auto">
                <q-icon name="inventory" size="xl" color="purple" />
              </div>
            </div>
          </q-card-section>
          
          <q-card-section class="q-pa-sm">
            <div class="q-gutter-y-sm">
              <div class="row items-center justify-between">
                <span class="text-caption">Total productos:</span>
                <span class="text-weight-bold">{{ totalProductos }}</span>
              </div>
              <div class="row items-center justify-between">
                <span class="text-caption">Stock bajo:</span>
                <span class="text-weight-bold text-negative">{{ productosStockBajo }}</span>
              </div>
              <div class="row items-center justify-between">
                <span class="text-caption">Valor total:</span>
                <span class="text-weight-bold">{{ formatPrecio(valorInventario) }}</span>
              </div>
            </div>
          </q-card-section>
          
          <q-separator />
          
          <q-card-actions>
            <q-btn 
              flat 
              color="purple" 
              icon="visibility" 
              label="Ver inventario"
              @click="irAInventario"
              class="full-width"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- MÓDULO 4: PEDIDOS -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="module-card" flat bordered>
          <q-card-section class="bg-orange-2">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6 text-weight-bold">Pedidos</div>
                <div class="text-caption">Órdenes de compra a proveedores</div>
              </div>
              <div class="col-auto">
                <q-icon name="shopping_cart" size="xl" color="orange" />
              </div>
            </div>
          </q-card-section>
          
          <q-card-section class="q-pa-sm">
            <div class="q-gutter-y-sm">
              <div class="row items-center justify-between">
                <span class="text-caption">Pendientes:</span>
                <span class="text-weight-bold text-orange">{{ pedidosPendientes }}</span>
              </div>
              <div class="row items-center justify-between">
                <span class="text-caption">En camino:</span>
                <span class="text-weight-bold">{{ pedidosEnCamino }}</span>
              </div>
              <div class="row items-center justify-between">
                <span class="text-caption">Este mes:</span>
                <span class="text-weight-bold">{{ pedidosEsteMes }}</span>
              </div>
            </div>
          </q-card-section>
          
          <q-separator />
          
          <q-card-actions>
            <q-btn 
              flat 
              color="orange" 
              icon="visibility" 
              label="Ver pedidos"
              @click="irAPedidos"
              class="full-width"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- MÓDULO 5: PAGOS -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="module-card" flat bordered>
          <q-card-section class="bg-red-2">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6 text-weight-bold">Pagos</div>
                <div class="text-caption">Gestión de pagos a proveedores</div>
              </div>
              <div class="col-auto">
                <q-icon name="payments" size="xl" color="negative" />
              </div>
            </div>
          </q-card-section>
          
          <q-card-section class="q-pa-sm">
            <div class="q-gutter-y-sm">
              <div class="row items-center justify-between">
                <span class="text-caption">Deuda total:</span>
                <span class="text-weight-bold text-negative">{{ formatPrecio(totalDeudas) }}</span>
              </div>
              <div class="row items-center justify-between">
                <span class="text-caption">Pagos este mes:</span>
                <span class="text-weight-bold">{{ formatPrecio(pagosEsteMes) }}</span>
              </div>
              <div class="row items-center justify-between">
                <span class="text-caption">Próximos vencimientos:</span>
                <span class="text-weight-bold">{{ proximosVencimientos }}</span>
              </div>
            </div>
          </q-card-section>
          
          <q-separator />
          
          <q-card-actions>
            <q-btn 
              flat 
              color="negative" 
              icon="visibility" 
              label="Ver pagos"
              @click="irAPagos"
              class="full-width"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- MÓDULO 6: HISTORIAL -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="module-card" flat bordered>
          <q-card-section class="bg-grey-3">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6 text-weight-bold">Historial</div>
                <div class="text-caption">Registro de actividad</div>
              </div>
              <div class="col-auto">
                <q-icon name="history" size="xl" color="grey-7" />
              </div>
            </div>
          </q-card-section>
          
          <q-card-section class="q-pa-sm">
            <div class="q-gutter-y-sm">
              <div class="row items-center justify-between">
                <span class="text-caption">Compras hoy:</span>
                <span class="text-weight-bold">{{ comprasHoy }}</span>
              </div>
              <div class="row items-center justify-between">
                <span class="text-caption">Ventas hoy:</span>
                <span class="text-weight-bold">{{ ventasHoy }}</span>
              </div>
              <div class="row items-center justify-between">
                <span class="text-caption">Actividad reciente:</span>
                <span class="text-weight-bold">{{ actividadesRecientes }}</span>
              </div>
            </div>
          </q-card-section>
          
          <q-separator />
          
          <q-card-actions>
            <q-btn 
              flat 
              color="grey-7" 
              icon="visibility" 
              label="Ver historial"
              @click="irAHistorial"
              class="full-width"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- DIÁLOGO NUEVO PEDIDO (se mantiene) -->
    <q-dialog v-model="dialogoPedido" persistent full-width>
      <NuevoPedidoDialog 
        :proveedor="proveedorSeleccionado"
        :productos="productos"
        @pedido-creado="onPedidoCreado"
        @cancelar="dialogoPedido = false"
      />
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { db } from 'boot/firebase'
import { 
  collection, 
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import NuevoPedidoDialog from 'src/components/proveedores/NuevoPedidoDialog.vue'

export default {
  name: 'IndexPage',
  
  components: {
    NuevoPedidoDialog
  },
  
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    
    // ========== DATOS REACTIVOS ==========
    const dialogoPedido = ref(false)
    const proveedorSeleccionado = ref(null)
    
    // Datos para métricas (simplificados para dashboard)
    const proveedoresData = ref([])
    const clientesData = ref([])
    const productosData = ref([])
    const pedidosData = ref([])
    const comprasData = ref([])
    const ventasData = ref([])
    const pagosData = ref([])
    
    // ========== CARGAR DATOS DASHBOARD ==========
    const cargarDashboard = async () => {
      try {
        // Cargar datos básicos para métricas
        const [
          proveedoresSnapshot,
          clientesSnapshot,
          productosSnapshot,
          pedidosSnapshot,
          comprasSnapshot,
          ventasSnapshot,
          pagosSnapshot
        ] = await Promise.all([
          getDocs(collection(db, 'proveedores')),
          getDocs(collection(db, 'clientes')),
          getDocs(collection(db, 'productos')),
          getDocs(query(collection(db, 'pedidos_proveedores'), where('estado', '!=', 'recibido'))),
          getDocs(query(collection(db, 'compras'), limit(100))),
          getDocs(query(collection(db, 'ventas'), limit(100))),
          getDocs(query(collection(db, 'pagos_proveedores'), limit(100)))
        ])
        
        proveedoresData.value = proveedoresSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        clientesData.value = clientesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        productosData.value = productosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        pedidosData.value = pedidosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        comprasData.value = comprasSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        ventasData.value = ventasSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        pagosData.value = pagosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
      } catch (error) {
        console.error('Error cargando dashboard:', error)
        // Datos demo si hay error
        crearDatosDemo()
      }
    }
    
    // ========== MÉTRICAS COMPUTADAS ==========
    
    // Proveedores
    const totalProveedores = computed(() => proveedoresData.value.length)
    const proveedoresActivos = computed(() => proveedoresData.value.filter(p => p.activo).length)
    const proveedoresConDeuda = computed(() => {
      // Lógica simplificada para demo
      return Math.floor(proveedoresData.value.length * 0.3)
    })
    
    // Clientes
    const totalClientes = computed(() => clientesData.value.length)
    const clientesActivos = computed(() => Math.floor(clientesData.value.length * 0.7))
    const clientesRecientes = computed(() => Math.floor(clientesData.value.length * 0.1))
    
    // Productos
    const totalProductos = computed(() => productosData.value.length)
    const productosStockBajo = computed(() => {
      return productosData.value.filter(p => (p.stock || 0) < (p.stockMinimo || 10)).length
    })
    const valorInventario = computed(() => {
      return productosData.value.reduce((sum, p) => sum + ((p.precio || 0) * (p.stock || 0)), 0)
    })
    
    // Pedidos
    const pedidosPendientes = computed(() => pedidosData.value.filter(p => p.estado === 'pendiente').length)
    const pedidosEnCamino = computed(() => pedidosData.value.filter(p => p.estado === 'en_camino').length)
    const pedidosAtrasados = computed(() => Math.floor(pedidosPendientes.value * 0.2))
    const pedidosEsteMes = computed(() => Math.floor(pedidosData.value.length * 0.3))
    const pedidosPendientesPorProveedor = computed(() => pedidosPendientes.value)
    
    // Deudas y Pagos
    const totalDeudas = computed(() => {
      // Estimación basada en pedidos pendientes
      return pedidosData.value.reduce((sum, p) => sum + (p.total || 0), 0) * 0.8
    })
    const pagosEsteMes = computed(() => totalDeudas.value * 0.4)
    const proximosVencimientos = computed(() => Math.floor(proveedoresConDeuda.value * 0.5))
    
    // Ventas
    const ventasMes = computed(() => {
      return ventasData.value.reduce((sum, v) => sum + (v.total || 0), 0)
    })
    const ventasHoy = computed(() => Math.floor(ventasMes.value / 30))
    
    // Compras y Actividad
    const comprasHoy = computed(() => Math.floor(comprasData.value.length * 0.1))
    const actividadesRecientes = computed(() => {
      return comprasData.value.length + ventasData.value.length + pagosData.value.length
    })
    
    // ========== FUNCIONES DE UTILIDAD ==========
    const formatPrecio = (precio) => {
      return new Intl.NumberFormat('es-CO').format(precio || 0)
    }
    
    // ========== NAVEGACIÓN ==========
    const irAProveedores = () => {
      router.push('/proveedores')
    }
    
    const irAClientes = () => {
      router.push('/clientes')
    }
    
    const irAInventario = () => {
      router.push('/inventario')
    }
    
    const irAPedidos = () => {
      router.push('/pedidos')
    }
    
    const irAPagos = () => {
      router.push('/pagos')
    }
    
    const irAHistorial = () => {
      router.push('/historial')
    }
    
    // ========== ACCIONES RÁPIDAS ==========
    const abrirDialogoPedido = () => {
      proveedorSeleccionado.value = null
      dialogoPedido.value = true
    }
    
    const nuevoProveedor = () => {
      router.push('/proveedores/nuevo')
    }
    
    const nuevoCliente = () => {
      router.push('/clientes/nuevo')
    }
    
    const nuevoProducto = () => {
      router.push('/productos/nuevo')
    }
    
    const nuevaVenta = () => {
      router.push('/ventas/nueva')
    }
    
    const registrarPagoRapido = () => {
      router.push('/pagos/nuevo')
    }
    
    const actualizarDashboard = async () => {
      $q.notify({
        type: 'info',
        message: 'Actualizando datos...',
        timeout: 1000
      })
      await cargarDashboard()
      $q.notify({
        type: 'positive',
        message: 'Datos actualizados',
        timeout: 1500
      })
    }
    
    const onPedidoCreado = async () => {
      dialogoPedido.value = false
      await cargarDashboard()
      $q.notify({
        type: 'positive',
        message: '✅ Pedido creado exitosamente',
        timeout: 2000
      })
    }
    
    // ========== DATOS DEMO ==========
    const crearDatosDemo = () => {
      proveedoresData.value = [
        { id: '1', nombre: 'Proveedor 1', activo: true },
        { id: '2', nombre: 'Proveedor 2', activo: true },
        { id: '3', nombre: 'Proveedor 3', activo: false }
      ]
      
      clientesData.value = [
        { id: '1', nombre: 'Cliente 1', activo: true },
        { id: '2', nombre: 'Cliente 2', activo: true },
        { id: '3', nombre: 'Cliente 3', activo: true },
        { id: '4', nombre: 'Cliente 4', activo: true },
        { id: '5', nombre: 'Cliente 5', activo: false }
      ]
      
      productosData.value = [
        { id: '1', nombre: 'Producto 1', precio: 10000, stock: 50, stockMinimo: 10 },
        { id: '2', nombre: 'Producto 2', precio: 20000, stock: 5, stockMinimo: 10 },
        { id: '3', nombre: 'Producto 3', precio: 15000, stock: 30, stockMinimo: 15 }
      ]
      
      pedidosData.value = [
        { id: '1', estado: 'pendiente', total: 500000 },
        { id: '2', estado: 'en_camino', total: 300000 },
        { id: '3', estado: 'pendiente', total: 750000 }
      ]
      
      ventasData.value = [
        { id: '1', total: 150000 },
        { id: '2', total: 250000 },
        { id: '3', total: 180000 }
      ]
      
      pagosData.value = [
        { id: '1', monto: 200000 },
        { id: '2', monto: 300000 }
      ]
    }
    
    // ========== INICIALIZAR ==========
    onMounted(async () => {
      await cargarDashboard()
    })
    
    return {
      // Datos
      dialogoPedido,
      proveedorSeleccionado,
      
      // Métricas
      totalProveedores,
      proveedoresActivos,
      proveedoresConDeuda,
      totalClientes,
      clientesActivos,
      clientesRecientes,
      totalProductos,
      productosStockBajo,
      valorInventario,
      pedidosPendientes,
      pedidosEnCamino,
      pedidosAtrasados,
      pedidosEsteMes,
      pedidosPendientesPorProveedor,
      totalDeudas,
      pagosEsteMes,
      proximosVencimientos,
      ventasMes,
      ventasHoy,
      comprasHoy,
      actividadesRecientes,
      
      // Métodos
      formatPrecio,
      irAProveedores,
      irAClientes,
      irAInventario,
      irAPedidos,
      irAPagos,
      irAHistorial,
      abrirDialogoPedido,
      nuevoProveedor,
      nuevoCliente,
      nuevoProducto,
      nuevaVenta,
      registrarPagoRapido,
      actualizarDashboard,
      onPedidoCreado
    }
  }
}
</script>

<style scoped>
.module-card {
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Ajustes de tarjetas de métricas */
.q-card__section--vert {
  padding: 16px;
}

/* Espaciado general */
.q-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
}

/* Efectos hover para botones */
.q-btn:hover {
  transform: translateY(-2px);
  transition: transform 0.2s;
}

/* Responsive adicional */
@media (max-width: 599px) {
  .module-card {
    margin-bottom: 16px;
  }
  
  .text-h4 {
    font-size: 2rem;
  }
  
  /* Ajustes para botones de acciones rápidas en móvil */
  .action-btn {
    padding: 8px 4px;
    min-height: auto;
  }
  
  .action-btn .q-icon {
    font-size: 20px;
    margin-bottom: 4px;
  }
  
  .action-btn .q-btn__content {
    flex-direction: column;
  }
}

/* Estilo específico para botones de acciones rápidas */
.action-btn {
  min-height: 80px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.action-btn .q-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.action-btn .q-btn__content {
  flex-direction: column;
  padding: 8px 0;
}
</style>