<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-8">
        <!-- Banner de bienvenida -->
        <q-card class="my-card q-mb-md bg-primary text-white">
          <q-card-section>
            <div class="text-h4">¡Bienvenido a MarketGestor! 🛒</div>
            <div class="text-subtitle1">Tu sistema de gestión de negocio integral</div>
          </q-card-section>
        </q-card>

        <!-- Tarjetas de funcionalidades -->
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-card class="my-card">
              <q-card-section>
                <div class="text-h6 text-primary">📦 Productos</div>
                <p>Gestiona tu inventario, precios y categorías</p>
              </q-card-section>
              <q-card-actions>
                <q-btn flat color="primary" label="Explorar" />
              </q-card-actions>
            </q-card>
          </div>
          
          <div class="col-12 col-md-4">
            <q-card class="my-card">
              <q-card-section>
                <div class="text-h6 text-primary">💰 Ventas</div>
                <p>Registra ventas, facturación y clientes</p>
              </q-card-section>
              <q-card-actions>
                <q-btn flat color="primary" label="Comenzar" />
              </q-card-actions>
            </q-card>
          </div>
          
          <div class="col-12 col-md-4">
            <q-card class="my-card">
              <q-card-section>
                <div class="text-h6 text-primary">📊 Reportes</div>
                <p>Analiza tu negocio con reportes en tiempo real</p>
              </q-card-section>
              <q-card-actions>
                <q-btn flat color="primary" label="Ver" />
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <!-- Estado del sistema -->
        <q-card class="my-card q-mt-md">
          <q-card-section>
            <div class="text-h6">Estado del Sistema</div>
            <q-list bordered>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="green" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Quasar Framework</q-item-label>
                  <q-item-label caption>Versión 2.18.6 - ✅ Funcionando</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="green" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Vite Dev Server</q-item-label>
                  <q-item-label caption>Puerto 9000 - ✅ Activo</q-item-label>
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
            </q-list>
          </q-card-section>
        </q-card>
        <TestFirebase class="q-mt-md" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import TestFirebase from 'components/TestFirebase.vue'
const features = ref([
  { title: 'Gestión de Inventario', desc: 'Control total de productos', icon: 'inventory' },
  { title: 'Ventas y Facturación', desc: 'Procesa ventas fácilmente', icon: 'point_of_sale' },
  { title: 'Clientes', desc: 'Base de datos de clientes', icon: 'people' },
  { title: 'Reportes', desc: 'Análisis en tiempo real', icon: 'analytics' }
])
</script>

<style scoped>
.my-card {
  border-radius: 12px;
  transition: transform 0.3s;
}
.my-card:hover {
  transform: translateY(-5px);
}
</style>
EOF
