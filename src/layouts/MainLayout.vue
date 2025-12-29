<template>
  <!-- ============================================ -->
  <!-- LAYOUT PRINCIPAL CON HEADER Y MENÚ LATERAL -->
  <!-- ============================================ -->
  <q-layout view="hHh lpR fFf">
    
    <!-- ========== HEADER ========== -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <!-- Botón para abrir/cerrar menú -->
        <q-btn
          dense
          flat
          round
          icon="menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Mi Negocio
        </q-toolbar-title>

        <!-- Botón de usuario con menú desplegable -->
        <q-btn flat round dense icon="account_circle">
          <q-menu>
            <q-list style="min-width: 150px">
              <!-- Nombre del usuario -->
              <q-item>
                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ userEmail }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <!-- Opción de cerrar sesión -->
              <q-item clickable v-close-popup @click="handleLogout">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section>Cerrar Sesión</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- ========== MENÚ LATERAL ========== -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="250"
    >
      <q-scroll-area class="fit">
        <!-- Logo o nombre del negocio -->
        <div class="q-pa-md text-center bg-grey-2">
          <q-icon name="store" size="48px" color="primary" />
          <div class="text-h6 q-mt-sm">Mi Negocio</div>
        </div>

        <!-- Lista de opciones del menú -->
        <q-list padding>
          <!-- Dashboard -->
          <q-item
            clickable
            :active="$route.name === 'dashboard'"
            active-class="bg-primary text-white"
            @click="navigateTo('/')"
          >
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Dashboard</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <!-- Clientes -->
          <q-item
            clickable
            :active="$route.path.includes('clients')"
            active-class="bg-primary text-white"
            @click="navigateTo('/clients')"
          >
            <q-item-section avatar>
              <q-icon name="people" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Clientes</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Ventas -->
          <q-item
            clickable
            :active="$route.path.includes('sales')"
            active-class="bg-primary text-white"
            @click="navigateTo('/sales')"
          >
            <q-item-section avatar>
              <q-icon name="shopping_cart" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Ventas</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Pagos -->
          <q-item
            clickable
            :active="$route.path.includes('payments')"
            active-class="bg-primary text-white"
            @click="navigateTo('/payments')"
          >
            <q-item-section avatar>
              <q-icon name="payment" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Pagos</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Inventario -->
          <q-item
            clickable
            :active="$route.path.includes('inventory')"
            active-class="bg-primary text-white"
            @click="navigateTo('/inventory')"
          >
            <q-item-section avatar>
              <q-icon name="inventory" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Inventario</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Proveedores -->
          <q-item
            clickable
            :active="$route.path.includes('suppliers')"
            active-class="bg-primary text-white"
            @click="navigateTo('/suppliers')"
          >
            <q-item-section avatar>
              <q-icon name="local_shipping" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Proveedores</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- ========== CONTENIDO PRINCIPAL ========== -->
    <!-- Aquí se renderiza cada página -->
    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useQuasar } from 'quasar'

// ========== INSTANCIAS ==========
const router = useRouter()
const $q = useQuasar()
const { user, logout } = useAuth()

// ========== ESTADO DEL MENÚ ==========
const leftDrawerOpen = ref(false)

// ========== COMPUTADAS ==========
// Mostrar email del usuario (o "Usuario" si no hay)
const userEmail = computed(() => {
  return user.value?.email || 'Usuario'
})

// ========== MÉTODOS ==========
// Alternar apertura del menú lateral
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// Navegar a una ruta
const navigateTo = (path) => {
  router.push(path)
  // En móvil, cerrar el menú después de navegar
  if ($q.screen.lt.md) {
    leftDrawerOpen.value = false
  }
}

// Cerrar sesión
const handleLogout = async () => {
  $q.loading.show({ message: 'Cerrando sesión...' })
  
  const result = await logout()
  
  $q.loading.hide()
  
  if (result.success) {
    $q.notify({
      message: 'Sesión cerrada correctamente',
      color: 'positive',
      icon: 'check_circle'
    })
  } else {
    $q.notify({
      message: 'Error al cerrar sesión',
      color: 'negative',
      icon: 'error'
    })
  }
}
</script>

<style scoped>
/* Personalización opcional */
.q-item {
  border-radius: 8px;
  margin: 4px 8px;
}
</style>