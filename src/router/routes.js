const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'clientes', component: () => import('pages/ClientesPage.vue') },
      { path: 'ventas', component: () => import('pages/VentasPage.vue') },
      {
        path: 'proveedores',
        name: 'Proveedores',
        component: () => import('pages/ProveedoresPage.vue')
      },
      { path: 'productos', component: () => import('pages/ProductosPage.vue') },
      { path: 'inventario', component: () => import('pages/InventarioPage.vue') },
  
      {
        path: 'reportes',
        name: 'Reportes',
        component: () => import('pages/ReportesPage.vue')
      }, 
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes