<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10">
        <!-- Banner de bienvenida -->
        <q-card class="my-card q-mb-md bg-gradient-primary text-white">
          <q-card-section>
            <div class="text-h4">¡Bienvenido a MarketGestor! 🛒</div>
            <div class="text-subtitle1">Tu sistema de gestión de negocio integral</div>
            <div class="text-caption q-mt-sm" v-if="!cargando">
              {{ formatearFecha(new Date()) }}
            </div>
          </q-card-section>
        </q-card>

        <!-- ESTADÍSTICAS PRINCIPALES -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card bg-blue-1">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h4">{{ estadisticas.totalClientes }}</div>
                    <div class="text-caption text-grey-7">Total Clientes</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="people" size="xl" color="blue" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card bg-green-1">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h4">{{ estadisticas.totalVentas }}</div>
                    <div class="text-caption text-grey-7">Total Ventas</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="shopping_cart" size="xl" color="green" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card bg-orange-1">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6">{{ formatearMoneda(estadisticas.ingresoTotal) }}</div>
                    <div class="text-caption text-grey-7">Ingresos Totales</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="attach_money" size="xl" color="orange" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card bg-purple-1">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h4">{{ estadisticas.ventasPendientes }}</div>
                    <div class="text-caption text-grey-7">Ventas Pendientes</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="schedule" size="xl" color="purple" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- PRODUCTOS MÁS VENDIDOS -->
        <q-card class="my-card q-mb-md" v-if="productosMasVendidos.length > 0">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="whatshot" color="orange" /> 
              Top 5 Productos Más Vendidos
            </div>
            <q-list bordered>
              <q-item 
                v-for="(producto, index) in productosMasVendidos" 
                :key="producto.nombre"
              >
                <q-item-section avatar>
                  <q-avatar :color="getColorRanking(index)" text-color="white">
                    {{ index + 1 }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ producto.nombre }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ producto.cantidad }} ventas • {{ formatearMoneda(producto.ingresoTotal) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-linear-progress 
                    :value="producto.cantidad / productosMasVendidos[0].cantidad" 
                    color="primary" 
                    style="width: 100px"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Tarjetas de funcionalidades -->
        <div class="row q-col-gutter-md q-mb-md">
  <!-- CLIENTES -->
  <div class="col-12 col-md-4">
    <q-card class="my-card feature-card">
      <q-card-section>
        <div class="text-center q-mb-md">
          <q-icon name="people" size="xl" color="primary" />
        </div>
        <div class="text-h6 text-primary text-center">👥 Clientes</div>
        <p class="text-center">Gestiona tu base de datos de clientes</p>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn flat color="primary" label="Gestionar" to="/clientes" />
      </q-card-actions>
    </q-card>
  </div>

  <!-- VENTAS -->
  <div class="col-12 col-md-4">
    <q-card class="my-card feature-card">
      <q-card-section>
        <div class="text-center q-mb-md">
          <q-icon name="shopping_cart" size="xl" color="green" />
        </div>
        <div class="text-h6 text-green text-center">💰 Ventas</div>
        <p class="text-center">Registra ventas y seguimiento completo</p>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn flat color="green" label="Ver Ventas" to="/ventas" />
      </q-card-actions>
    </q-card>
  </div>
  
  <!-- PRODUCTOS -->
  <div class="col-12 col-md-4">
    <q-card class="my-card feature-card">
      <q-card-section>
        <div class="text-center q-mb-md">
          <q-icon name="inventory" size="xl" color="orange" />
        </div>
        <div class="text-h6 text-orange text-center">📦 Productos</div>
        <p class="text-center">Gestiona tu inventario y precios</p>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn flat color="orange" label="Explorar" to="/productos" />
      </q-card-actions>
    </q-card>
  </div>

  <!-- INVENTARIO (NUEVA TARJETA) -->
  <div class="col-12 col-md-4 q-mt-md">
    <q-card class="my-card feature-card">
      <q-card-section>
        <div class="text-center q-mb-md">
          <q-icon name="inventory_2" size="xl" color="blue" />
        </div>
        <div class="text-h6 text-blue text-center">📊 Inventario</div>
        <p class="text-center">Control de stock y valor del inventario</p>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn flat color="blue" label="Ver Inventario" to="/inventario" />
      </q-card-actions>
    </q-card>
  </div>

  <!-- VENTAS RÁPIDAS -->
  <div class="col-12 col-md-4 q-mt-md">
    <q-card class="my-card feature-card">
      <q-card-section>
        <div class="text-center q-mb-md">
          <q-icon name="flash_on" size="xl" color="purple" />
        </div>
        <div class="text-h6 text-purple text-center">⚡ Ventas Rápidas</div>
        <p class="text-center">Venta rápida con carrito y stock en tiempo real</p>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn flat color="purple" label="Ir a Venta Rápida" to="/ventas/rapidas" />
      </q-card-actions>
    </q-card>
  </div>
</div>


        <!-- SECCIÓN DE DIAGNÓSTICO (OCULTA) -->
        <!-- ⚠️ NO BORRAR - Código comentado para pruebas técnicas -->
        <div v-if="false">
          <!-- Estado del Sistema -->
          <q-card class="my-card q-mt-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">🔧 Estado del Sistema</div>
              <q-list bordered>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="check_circle" color="green" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Quasar Framework</q-item-label>
                    <q-item-label caption>Versión 2.x - ✅ Funcionando</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="check_circle" color="green" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Firebase</q-item-label>
                    <q-item-label caption>✅ Conectado - Base de datos activa</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="check_circle" color="green" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Vite Dev Server</q-item-label>
                    <q-item-label caption>✅ Servidor de desarrollo activo</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
          
          <!-- Componente de prueba Firebase -->
          <!-- <TestFirebase /> -->
        </div>
        <!-- FIN SECCIÓN DE DIAGNÓSTICO -->
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'boot/firebase'
import { collection, getDocs } from 'firebase/firestore'

// DATOS REACTIVOS
const cargando = ref(false)
const estadisticas = ref({
  totalClientes: 0,
  totalVentas: 0,
  ingresoTotal: 0,
  ventasPendientes: 0
})
const productosMasVendidos = ref([])

// CARGAR ESTADÍSTICAS
const cargarEstadisticas = async () => {
  cargando.value = true
  try {
    // Cargar clientes
    const clientesSnapshot = await getDocs(collection(db, 'clientes'))
    estadisticas.value.totalClientes = clientesSnapshot.size
    
    // Cargar ventas
    const ventasSnapshot = await getDocs(collection(db, 'ventas'))
    const ventas = ventasSnapshot.docs.map(doc => doc.data())
    
    estadisticas.value.totalVentas = ventas.length
    estadisticas.value.ingresoTotal = ventas.reduce((sum, v) => sum + (v.precio || 0), 0)
    estadisticas.value.ventasPendientes = ventas.filter(v => v.estado === 'pendiente').length
    
    // Calcular productos más vendidos
    const conteoProductos = {}
    ventas.forEach(venta => {
      const producto = venta.producto
      if (producto) {
        const productoNormalizado = producto
          .replace(/\d+x?\s*/gi, '')
          .trim()
          .toLowerCase()
        
        if (productoNormalizado) {
          if (!conteoProductos[productoNormalizado]) {
            conteoProductos[productoNormalizado] = {
              nombre: productoNormalizado.charAt(0).toUpperCase() + productoNormalizado.slice(1),
              cantidad: 0,
              ingresoTotal: 0
            }
          }
          conteoProductos[productoNormalizado].cantidad++
          conteoProductos[productoNormalizado].ingresoTotal += venta.precio || 0
        }
      }
    })
    
    productosMasVendidos.value = Object.values(conteoProductos)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)
      
  } catch (error) {
    console.error('Error cargando estadísticas:', error)
  } finally {
    cargando.value = false
  }
}

// FORMATEAR MONEDA
const formatearMoneda = (valor) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor || 0)
}

// FORMATEAR FECHA
const formatearFecha = (fecha) => {
  return fecha.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// COLOR PARA RANKING
const getColorRanking = (index) => {
  const colores = ['yellow-9', 'grey-6', 'orange-8', 'blue-6', 'purple-6']
  return colores[index] || 'grey'
}

// INICIALIZAR
onMounted(() => {
  cargarEstadisticas()
})
</script>

<style scoped>
.my-card {
  border-radius: 12px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.my-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stat-card {
  border-radius: 12px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: scale(1.02);
}

.feature-card {
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.q-btn {
  text-transform: none;
}
</style>