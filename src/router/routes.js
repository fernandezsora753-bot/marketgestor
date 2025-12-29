const routes = [
  // ========== RUTAS CON LAYOUT (usuario autenticado) ==========
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    // Meta para proteger rutas (requiere autenticación)
    meta: { requiresAuth: true },
    children: [
      { 
        path: '', 
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue') 
      },
      // Aquí agregarás más rutas (clientes, ventas, etc.)
    ]
  },

  // ========== RUTAS DE AUTENTICACIÓN (sin layout) ==========
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/auth/LoginPage.vue'),
    meta: { requiresGuest: true } // Solo usuarios no autenticados
  },

  // ========== PÁGINA 404 ==========
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { auth } from '@/services/firebase'

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // ========== GUARDIA DE NAVEGACIÓN ==========
  // Protege rutas que requieren autenticación
  Router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
    const isAuthenticated = auth.currentUser

    if (requiresAuth && !isAuthenticated) {
      // Ruta protegida pero usuario no autenticado → Login
      next('/login')
    } else if (requiresGuest && isAuthenticated) {
      // Ruta de invitado pero usuario autenticado → Dashboard
      next('/')
    } else {
      // Todo bien, continuar
      next()
    }
  })

  return Router
})