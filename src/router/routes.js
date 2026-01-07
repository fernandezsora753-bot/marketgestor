const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'clientes', component: () => import('pages/ClientesPage.vue') },
      { path: 'ventas', component: () => import('pages/VentasPage.vue') },
      { 
        path: 'ventas/rapidas',
        component: () => import('pages/VentasRapidas.vue') 
      },
      { path: 'productos', component: () => import('pages/ProductosPage.vue') },
      { path: 'inventario', component: () => import('pages/InventarioPage.vue') }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes