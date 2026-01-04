<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          🛒 MarketGestor
        </q-toolbar-title>
        <q-space />
        <q-btn flat label="Inicio" to="/" />
        <q-btn flat label="Productos" />
        <q-btn flat label="Ventas" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title class="text-center">
          <div class="text-caption">© 2025 MarketGestor - v1.0</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
// Layout principal
</script>
EOF