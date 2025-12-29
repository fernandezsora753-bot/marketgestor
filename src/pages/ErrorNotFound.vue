<template>
  <div class="fullscreen bg-grey-2 text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">
        404
      </div>

      <div class="text-h4 q-mb-md">
        Página no encontrada
      </div>
      
      <q-btn
        label="Ir al inicio"
        color="primary"
        size="lg"
        @click="$router.push('/')"
      />
    </div>
  </div>
</template>