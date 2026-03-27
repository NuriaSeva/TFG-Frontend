import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/inicio'
  },
  {
    path: '/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/inicio'
      },
      {
        path: 'inicio',
        component: () => import('@/views/InicioPage.vue')
      },
      {
        path: 'movimientos',
        component: () => import('@/views/MovimientosPage.vue')
      },
      {
        path: 'ajustes',
        component: () => import('@/views/AjustesPage.vue')
      },
      {
        path: 'ajustes/categorias',
        component: () => import('@/views/CategoriasPage.vue')
      }

    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
