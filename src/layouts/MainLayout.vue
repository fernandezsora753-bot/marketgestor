<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          🛒 MarketGestor
        </q-toolbar-title>
        <q-space />
        <!-- BOTONES DE NAVEGACIÓN -->
        <q-btn flat label="🏠 Inicio" to="/" exact />
        <q-btn flat label="⚡ Ventas Rápidas" to="/ventas-rapidas" exact />
        <q-btn flat label="📦 Productos" to="/productos" exact />
        <q-btn flat label="💰 Ventas" to="/ventas" exact />
        <q-btn flat label="👥 Clientes" to="/clientes" exact />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title class="text-center">
          <div class="text-caption">© 2025 MarketGestor - v1.0 | Modo Desarrollo</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
// Layout principal
</script>

<style scoped>
.q-btn[aria-current="page"] {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>