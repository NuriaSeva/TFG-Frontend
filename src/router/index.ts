import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import TabsPage from '../views/TabsPage.vue'
import { esUsuarioAdmin, estaAutenticado, requiereCambioPassword } from '@/services/autenticacionService'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: () => {
      if (!estaAutenticado()) return '/inicio-sesion'
      if (requiereCambioPassword()) return '/cambiar-password-obligatorio'
      return esUsuarioAdmin() ? '/admin' : '/inicio'
    }
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
    path: '/cambiar-password-obligatorio',
    component: () => import('@/views/CambioPasswordObligatorioPage.vue'),
    meta: { requiereAutenticacion: true }
  },
  {
    path: '/',
    component: TabsPage,
    meta: { requiereAutenticacion: true },
    children: [
      {
        path: '',
        redirect: () => (esUsuarioAdmin() ? '/admin' : '/inicio')
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
        path: 'visualizaciones',
        component: () => import('@/views/VisualizacionesPage.vue')
      },
      {
        path: 'informes',
        component: () => import('@/views/InformesPage.vue')
      },
      {
        path: 'ajustes',
        component: () => import('@/views/AjustesPage.vue')
      },
      {
        path: 'ajustes/categorias',
        component: () => import('@/views/CategoriasPage.vue')
      },
      {
        path: 'admin',
        component: () => import('@/views/AdminPage.vue'),
        meta: { requiereAdmin: true }
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
  const requiereAdmin = to.matched.some(
    route => route.meta?.requiereAdmin === true
  )

  const esRutaPublica = to.matched.some(
    route => route.meta?.requiereAutenticacion === false
  )

  if (requiereAutenticacion && !autenticado) {
    next('/inicio-sesion')
    return
  }

  if (autenticado && requiereCambioPassword() && to.path !== '/cambiar-password-obligatorio') {
    next('/cambiar-password-obligatorio')
    return
  }

  if (esRutaPublica && autenticado) {
    next(esUsuarioAdmin() ? '/admin' : '/inicio')
    return
  }

  const admin = esUsuarioAdmin()

  if (admin && !requiereAdmin && !esRutaPublica) {
    next('/admin')
    return
  }

  if (requiereAdmin && !admin) {
    next('/inicio')
    return
  }

  next()
})

export default router
