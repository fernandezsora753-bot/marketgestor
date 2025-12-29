<template>
  <!-- ============================================ -->
  <!-- DASHBOARD PRINCIPAL -->
  <!-- ============================================ -->
  <q-page padding>
    
    <!-- Encabezado -->
    <div class="q-mb-lg">
      <div class="text-h5 text-weight-bold">Dashboard</div>
      <div class="text-grey-7">Resumen de tu negocio</div>
    </div>

    <!-- ========== TARJETAS DE ESTADÍSTICAS ========== -->
    <div class="row q-col-gutter-md q-mb-lg">
      
      <!-- Ventas del día -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-grey-7 text-caption">Ventas Hoy</div>
                <div class="text-h5 text-weight-bold text-primary">
                  $0
                </div>
              </div>
              <div>
                <q-icon name="trending_up" size="48px" color="primary" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Pagos pendientes -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-grey-7 text-caption">Pagos Pendientes</div>
                <div class="text-h5 text-weight-bold text-warning">
                  $0
                </div>
              </div>
              <div>
                <q-icon name="schedule" size="48px" color="warning" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Total clientes -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-grey-7 text-caption">Clientes</div>
                <div class="text-h5 text-weight-bold text-info">
                  0
                </div>
              </div>
              <div>
                <q-icon name="people" size="48px" color="info" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Productos en inventario -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-grey-7 text-caption">Productos</div>
                <div class="text-h5 text-weight-bold text-positive">
                  0
                </div>
              </div>
              <div>
                <q-icon name="inventory" size="48px" color="positive" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

    </div>

    <!-- ========== SECCIÓN DE ACCIONES RÁPIDAS ========== -->
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="text-h6 q-mb-md">Acciones Rápidas</div>
        
        <div class="row q-col-gutter-sm">
          <!-- Botón: Nueva Venta -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-btn
              label="Nueva Venta"
              icon="add_shopping_cart"
              color="primary"
              class="full-width"
              size="md"
              @click="navigateTo('/sales/new')"
            />
          </div>

          <!-- Botón: Nuevo Cliente -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-btn
              label="Nuevo Cliente"
              icon="person_add"
              color="info"
              class="full-width"
              size="md"
              @click="navigateTo('/clients/new')"
            />
          </div>

          <!-- Botón: Registrar Pago -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-btn
              label="Registrar Pago"
              icon="payment"
              color="positive"
              class="full-width"
              size="md"
              @click="navigateTo('/payments')"
            />
          </div>

          <!-- Botón: Ver Inventario -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-btn
              label="Ver Inventario"
              icon="inventory_2"
              color="warning"
              class="full-width"
              size="md"
              @click="navigateTo('/inventory')"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- ========== VENTAS RECIENTES (Placeholder) ========== -->
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">Ventas Recientes</div>
        
        <!-- Estado vacío -->
        <div class="text-center q-pa-lg text-grey-6">
          <q-icon name="receipt_long" size="64px" />
          <div class="text-subtitle1 q-mt-md">
            No hay ventas registradas aún
          </div>
          <div class="text-caption">
            Comienza registrando tu primera venta
          </div>
        </div>
      </q-card-section>
    </q-card>

  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

// ========== INSTANCIAS ==========
const router = useRouter()

// ========== MÉTODOS ==========
const navigateTo = (path) => {
  router.push(path)
}

// TODO: Aquí conectarás los composables para obtener datos reales:
// - useSales() para obtener ventas del día
// - useClients() para contar clientes
// - useInventory() para contar productos
// - usePayments() para calcular pagos pendientes
</script>

<style scoped>
.stat-card {
  border-left: 4px solid currentColor;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}
</style>