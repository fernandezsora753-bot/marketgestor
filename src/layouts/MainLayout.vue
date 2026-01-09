<template>
  <q-layout view="hHh Lpr fFf">
    <!-- HEADER / ENCABEZADO -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <!-- Botón menú móvil -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <!-- Logo / Título -->
        <q-toolbar-title>
          <div class="row items-center">
            <q-icon name="store" size="md" class="q-mr-sm" />
            Mi negocio
            <q-badge v-if="esMovil" color="orange" class="q-ml-sm">
              v1.0
            </q-badge>
          </div>
        </q-toolbar-title>

        <!-- Espacio entre logo y botones derecha -->
        <q-space />

        <!-- Botones del lado derecho -->
        <div class="row items-center q-gutter-sm">
          <!-- Modo oscuro/claro -->
          <q-btn
            flat
            round
            :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
            @click="toggleDarkMode"
          >
            <q-tooltip>Cambiar tema</q-tooltip>
          </q-btn>

          <!-- Notificaciones -->
          <q-btn flat round icon="notifications">
            <q-badge v-if="notificacionesPendientes > 0" color="red" floating>
              {{ notificacionesPendientes }}
            </q-badge>
            <q-tooltip>Notificaciones</q-tooltip>
            
            <q-menu>
              <q-list style="min-width: 300px">
                <q-item>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">Notificaciones</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn flat dense label="Limpiar" size="sm" @click="limpiarNotificaciones" />
                  </q-item-section>
                </q-item>
                <q-separator />
                
                <template v-if="notificaciones.length > 0">
                  <q-item v-for="notif in notificaciones" :key="notif.id" clickable>
                    <q-item-section avatar>
                      <q-icon :name="notif.icon" :color="notif.color" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ notif.titulo }}</q-item-label>
                      <q-item-label caption>{{ notif.mensaje }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon name="circle" size="8px" :color="notif.leida ? 'grey' : 'primary'" />
                    </q-item-section>
                  </q-item>
                </template>
                <template v-else>
                  <q-item>
                    <q-item-section class="text-center text-grey q-py-md">
                      <q-icon name="notifications_off" size="lg" />
                      <div class="q-mt-sm">No hay notificaciones</div>
                    </q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Perfil de usuario -->
          <q-btn flat round>
            <q-avatar size="32px">
              <q-icon name="person" />
            </q-avatar>
            
            <q-menu>
              <q-list style="min-width: 200px">
                <q-item>
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white">
                      <q-icon name="person" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Usuario</q-item-label>
                    <q-item-label caption>Administrador</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                
                <q-item clickable v-close-popup>
                  <q-item-section avatar>
                    <q-icon name="account_circle" />
                  </q-item-section>
                  <q-item-section>Mi Perfil</q-item-section>
                </q-item>
                
                <q-item clickable v-close-popup>
                  <q-item-section avatar>
                    <q-icon name="settings" />
                  </q-item-section>
                  <q-item-section>Configuración</q-item-section>
                </q-item>
                
                <q-separator />
                
                <q-item clickable v-close-popup @click="cerrarSesion">
                  <q-item-section avatar>
                    <q-icon name="logout" color="red" />
                  </q-item-section>
                  <q-item-section>
                    <span class="text-red">Cerrar Sesión</span>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- MENÚ LATERAL IZQUIERDO -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="250"
      :breakpoint="768"
      class="bg-grey-1"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <!-- Sección Principal -->
          <q-item-label header class="text-weight-bold text-grey-7">
            <q-icon name="dashboard" class="q-mr-sm" />
            Principal
          </q-item-label>
          
          <q-item clickable v-ripple exact to="/">
            <q-item-section avatar>
              <q-icon name="home" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Inicio</q-item-label>
              <q-item-label caption>Panel principal</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Sección Ventas -->
          <q-item-label header class="text-weight-bold text-grey-7 q-mt-md">
            <q-icon name="point_of_sale" class="q-mr-sm" />
            Ventas
          </q-item-label>
          
          <q-item clickable v-ripple to="/ventas">
            <q-item-section avatar>
              <q-icon name="receipt" color="blue" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Ventas</q-item-label>
              <q-item-label caption>Todas las ventas</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item clickable v-ripple to="/pagos">
            <q-item-section avatar>
              <q-icon name="payments" color="purple" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Pagos</q-item-label>
              <q-item-label caption>Gestión de pagos</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Sección Productos -->
          <q-item-label header class="text-weight-bold text-grey-7 q-mt-md">
            <q-icon name="inventory_2" class="q-mr-sm" />
            Productos
          </q-item-label>
          
          <q-item clickable v-ripple to="/productos">
            <q-item-section avatar>
              <q-icon name="shopping_bag" color="orange" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Productos</q-item-label>
              <q-item-label caption>Lista de productos</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item clickable v-ripple to="/proveedores">
            <q-item-section avatar>
              <q-icon name="local_shipping" color="indigo" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Proveedores</q-item-label>
              <q-item-label caption>Gestión de proveedores</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item clickable v-ripple to="/inventario">
            <q-item-section avatar>
              <q-icon name="inventory" color="deep-orange" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Inventario</q-item-label>
              <q-item-label caption>Gestión de stock</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge v-if="stockBajo > 0" color="orange">
                {{ stockBajo }}
              </q-badge>
            </q-item-section>
          </q-item>

          <!-- Sección Clientes -->
          <q-item-label header class="text-weight-bold text-grey-7 q-mt-md">
            <q-icon name="people" class="q-mr-sm" />
            Clientes
          </q-item-label>
          
          <q-item clickable v-ripple to="/clientes">
            <q-item-section avatar>
              <q-icon name="group" color="teal" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Clientes</q-item-label>
              <q-item-label caption>Base de datos</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Sección Reportes -->
          <q-item-label header class="text-weight-bold text-grey-7 q-mt-md">
            <q-icon name="analytics" class="q-mr-sm" />
            Reportes & Estadísticas
          </q-item-label>
          
          <q-item clickable v-ripple to="/reportes">
            <q-item-section avatar>
              <q-icon name="analytics" color="red" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Reportes</q-item-label>
              <q-item-label caption>Estadísticas y gráficos</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item clickable v-ripple @click="exportarReporteRapido">
            <q-item-section avatar>
              <q-icon name="trending_up" color="cyan" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Ventas</q-item-label>
              <q-item-label caption>Análisis de ventas</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item clickable v-ripple @click="exportarInventarioRapido">
            <q-item-section avatar>
              <q-icon name="show_chart" color="amber" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Inventario</q-item-label>
              <q-item-label caption>Análisis de stock</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Sección Configuración -->
          <q-item-label header class="text-weight-bold text-grey-7 q-mt-md">
            <q-icon name="settings" class="q-mr-sm" />
            Sistema
          </q-item-label>
          
          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="tune" color="grey" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Configuración</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="help" color="indigo" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Ayuda</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Pie del menú -->
        <div class="absolute-bottom q-pa-md bg-grey-2">
          <div class="text-center">
            <q-chip dense color="primary" text-color="white">
              <q-avatar icon="store" />
              MarketGestor
            </q-chip>
            <div class="text-caption text-grey-6 q-mt-xs">
              v1.0 • © 2024
            </div>
            <div class="text-caption text-grey-5 q-mt-xs">
              Sistema de gestión comercial
            </div>
          </div>
        </div>
      </q-scroll-area>
    </q-drawer>

    <!-- CONTENIDO PRINCIPAL (donde se renderizan las páginas) -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- FOOTER (opcional) -->
    <q-footer v-if="!esMovil" class="bg-grey-1 text-grey-7">
      <q-toolbar>
        <q-toolbar-title class="text-center text-caption">
          <q-icon name="copyright" size="xs" /> 2024 MarketGestor • 
          Sistema de gestión comercial • 
          <span class="text-primary">{{ fechaActual }}</span>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

// Estado reactivo
const leftDrawerOpen = ref(false)
const notificaciones = ref([
  {
    id: 1,
    titulo: 'Stock bajo',
    mensaje: '5 productos con stock bajo',
    icon: 'warning',
    color: 'orange',
    leida: false
  },
  {
    id: 2,
    titulo: 'Nueva venta',
    mensaje: 'Venta registrada exitosamente',
    icon: 'check_circle',
    color: 'green',
    leida: true
  }
])

// Computadas
const esMovil = computed(() => $q.screen.lt.md)
const notificacionesPendientes = computed(() => 
  notificaciones.value.filter(n => !n.leida).length
)
const fechaActual = computed(() => {
  const ahora = new Date()
  const opciones = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return ahora.toLocaleDateString('es-ES', opciones)
})
const stockBajo = computed(() => {
  // Esto debería venir de Firebase o del estado global
  // Por ahora retornamos un valor de ejemplo
  return 3
})

// Métodos
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const toggleDarkMode = () => {
  $q.dark.toggle()
  // Guardar preferencia
  localStorage.setItem('darkMode', $q.dark.isActive)
}

const limpiarNotificaciones = () => {
  notificaciones.value = []
}

const cerrarSesion = () => {
  $q.dialog({
    title: 'Cerrar sesión',
    message: '¿Estás seguro de que quieres salir?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    $q.notify({
      type: 'info',
      message: 'Sesión cerrada',
      icon: 'logout'
    })
    // Aquí iría la lógica real de logout con Firebase Auth
    router.push('/login') // Si tienes página de login
  })
}

const exportarReporteRapido = () => {
  $q.notify({
    type: 'info',
    message: '📊 Exportando reporte de ventas...',
    icon: 'description',
    timeout: 2000
  })
  // Navegar a la página de reportes
  router.push('/reportes')
}

const exportarInventarioRapido = () => {
  $q.notify({
    type: 'info',
    message: '📦 Exportando reporte de inventario...',
    icon: 'inventory',
    timeout: 2000
  })
  // Navegar a la página de reportes
  router.push('/reportes?tab=productos')
}

// Inicialización
onMounted(() => {
  // Cargar preferencia de tema
  const darkModePreference = localStorage.getItem('darkMode')
  if (darkModePreference === 'true') {
    $q.dark.set(true)
  }
  
  // Ajustar drawer en móvil
  if (esMovil.value) {
    leftDrawerOpen.value = false
  }
})
</script>

<style scoped>
/* Estilos personalizados */
.q-drawer {
  border-right: 1px solid #e0e0e0;
}

.q-item {
  border-radius: 8px;
  margin: 2px 8px;
}

.q-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.q-item--active {
  background-color: #e3f2fd;
  color: #1976d2;
  border-left: 4px solid #1976d2;
}

.q-item--active .q-icon {
  color: #1976d2 !important;
}

.q-footer {
  border-top: 1px solid #e0e0e0;
}

/* Animaciones suaves */
.q-page-container {
  transition: all 0.3s ease;
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .q-toolbar-title {
    font-size: 1.1rem;
  }
  
  .q-drawer {
    width: 280px !important;
  }
}
</style>