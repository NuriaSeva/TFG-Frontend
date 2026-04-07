import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import TabsPage from '../views/TabsPage.vue'
import { estaAutenticado } from '@/services/autenticacionService'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: () => (estaAutenticado() ? '/inicio' : '/inicio-sesion')
  },
  {
    path: '/inicio-sesion',
    component: () => import('@/views/InicioSesionPage.vue'),
    meta: { requiereAutenticacion: false }
  },
  {
    path: '/registro',
    component: () => import('@/views/RegistroPage.vue'),
    meta: { requiereAutenticacion: false }
  },
  {
    path: '/',
    component: TabsPage,
    meta: { requiereAutenticacion: true },
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

router.beforeEach((to, _from, next) => {
  const autenticado = estaAutenticado()
  const requiereAutenticacion = to.matched.some(
    route => route.meta?.requiereAutenticacion === true
  )

  const esRutaPublica = to.matched.some(
    route => route.meta?.requiereAutenticacion === false
  )

  if (requiereAutenticacion && !autenticado) {
    next('/inicio-sesion')
    return
  }

  if (esRutaPublica && autenticado) {
    next('/inicio')
    return
  }

  next()
})

export default router