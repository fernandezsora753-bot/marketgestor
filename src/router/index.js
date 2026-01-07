import { route } from 'quasar/wrappers'
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: '', 
        name: 'home',
        component: () => import('pages/IndexPage.vue') 
      },
      {
        path: 'ventas-rapidas',
        name: 'VentasRapidas',
        component: () => import('pages/VentasRapidas.vue')
      },
      {
        path: 'productos',
        name: 'Productos',
        component: () => import('pages/ProductosPage.vue')
      },
      {
        path: 'ventas',
        name: 'Ventas',
        component: () => import('pages/VentasPage.vue')
      },
      {
        path: 'clientes',
        name: 'Clientes',
        component: () => import('pages/ClientesPage.vue')
      },
      {
        path: 'pagos',
        name: 'Pagos',
        component: () => import('pages/PagosPage.vue')
      },
      // ========================================
      // AÑADE ESTA RUTA AQUÍ:
      // ========================================
      {
        path: 'inventario',
        name: 'Inventario',
        component: () => import('pages/InventarioPage.vue')
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default route(function () {
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createWebHashHistory(process.env.VUE_ROUTER_BASE)
  })

  return Router
})