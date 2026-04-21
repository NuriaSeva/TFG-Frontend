<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <div class="topbar">
          <div>
            <h1 class="topbar-title">Hola, {{ nombreUsuarioCabecera }}</h1>
            <p class="topbar-date">{{ fechaCabeceraFormateada }}</p>
          </div>

          <button
            class="profile-button"
            type="button"
            aria-label="Notificaciones"
            @click="abrirCentroAlertas"
          >
            <ion-icon :icon="notificationsOutline" />
            <span v-if="totalAlertasNoLeidas > 0" class="notifications-badge">
              {{ badgeNotificaciones }}
            </span>
          </button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="home-content">
      <div class="page-shell">
        <div class="home-wrapper">
          <div v-if="cargandoInicio" class="home-loading-state finmind-card">
            <ion-spinner name="crescent" />
            <h2>Cargando tu información financiera...</h2>
            <p>Estamos consultando tu banco y actualizando ingresos, gastos y avisos.</p>
          </div>

          <template v-else>
          <section class="account-card finmind-card">
            <template v-if="!cuentaGuardada">
              <div class="section-top">
                <div>
                  <p class="section-eyebrow">Banco</p>
                  <h2 class="section-title">Conecta tu banco</h2>
                </div>
              </div>

              <div class="empty-bank-card">
                <div class="empty-bank-icon">
                  <ion-icon :icon="cardOutline" />
                </div>

                <div class="empty-bank-text">
                  <p>
                    Vincula tu cuenta bancaria para importar tus movimientos y empezar
                    a gestionar tus gastos.
                  </p>
                </div>
              </div>

              <ion-button
                expand="block"
                class="connect-button"
                @click="conectarBanco"
                :disabled="loading || sincronizando || desvinculando"
              >
                <ion-spinner v-if="loading" name="crescent" />
                <span v-else>Conectar banco</span>
              </ion-button>
            </template>

            <template v-else>
              <div class="bank-card-header">
                <div class="bank-card-header-left">
                  <div class="bank-summary-icon">
                    <ion-icon :icon="cardOutline" />
                  </div>

                  <div class="bank-card-header-text">
                    <p class="bank-summary-label">Cuenta conectada</p>
                    <h2>{{ cuentaGuardada.nombre || 'Cuenta principal' }}</h2>
                  </div>
                </div>

                <ion-button
                  size="small"
                  fill="outline"
                  class="sync-mini-button"
                  @click="confirmarSincronizacion"
                  :disabled="loading || sincronizando || desvinculando"
                >
                  <ion-spinner v-if="sincronizando" name="crescent" />
                  <span v-else>Sincronizar</span>
                </ion-button>
              </div>

              <div class="bank-card-body">
                <p class="bank-summary-bank">
                  {{ cuentaGuardada.banco || 'Banco no disponible' }}
                </p>

                <p class="bank-summary-iban">
                  {{ ibanOculto }}
                </p>
              </div>

              <div class="sync-line compact">
                <span class="sync-line-label">Última sincronización</span>
                <span class="sync-line-value">{{ fechaSincronizacionFormateada }}</span>
              </div>

              <div class="account-actions compact">
                <button
                  type="button"
                  class="unlink-button"
                  @click="confirmarDesvinculacion"
                  :disabled="loading || sincronizando || desvinculando"
                >
                  {{ desvinculando ? 'Desvinculando...' : 'Desvincular cuenta' }}
                </button>
              </div>
            </template>
          </section>

          <section class="summary-grid">
            <article class="summary-card gastos finmind-card compact-card">
              <div class="summary-accent"></div>
              <p class="summary-label">Gastos del mes</p>
              <h3 class="summary-amount">{{ formatearImporte(resumenMes.gastosMes) }}</h3>
              <p class="summary-meta">
                {{ resumenMes.numeroGastosMes }} movimiento<span v-if="resumenMes.numeroGastosMes !== 1">s</span> este mes
              </p>
            </article>

            <article class="summary-card ingresos finmind-card compact-card">
              <div class="summary-accent"></div>
              <p class="summary-label">Ingresos del mes</p>
              <h3 class="summary-amount">{{ formatearImporte(resumenMes.ingresosMes) }}</h3>
              <p class="summary-meta">
                {{ resumenMes.numeroIngresosMes }} movimiento<span v-if="resumenMes.numeroIngresosMes !== 1">s</span> este mes
              </p>
            </article>

            <article class="summary-card balance full-width finmind-card">
              <div class="summary-accent"></div>
              <div class="balance-top">
                <div>
                  <p class="summary-label">Balance</p>
                  <h3
                    class="summary-amount"
                    :class="balanceMes >= 0 ? 'balance-positivo' : 'balance-negativo'"
                  >
                    {{ formatearImporte(balanceMes) }}
                  </h3>
                </div>

                <div class="balance-badge" :class="balanceMes >= 0 ? 'positivo' : 'negativo'">
                  {{ balanceMes >= 0 ? 'Positivo' : 'Negativo' }}
                </div>
              </div>

              <p class="summary-meta balance-meta">
                {{ balanceMes >= 0 ? 'Tus ingresos superan a tus gastos este mes.' : 'Tus gastos superan a tus ingresos este mes.' }}
              </p>
            </article>
          </section>

          <section class="alerts-card finmind-card">
            <div class="alerts-header">
              <div>
                <p class="section-eyebrow">Avisos</p>
                <h2 class="section-title">Avisos del mes</h2>
              </div>
            </div>

            <div v-if="alertasProactivasInicio.length === 0" class="alerts-empty">
              <ion-icon :icon="alertCircleOutline" />
              <p>No hay alertas destacables para este mes.</p>
            </div>

            <div v-else class="alerts-list">
              <article
                v-for="(alerta, index) in alertasProactivasInicio"
                :key="`${alerta.tipo}-${index}`"
                class="alert-item"
                :class="`alert-${alerta.severidad}`"
              >
                <ion-icon :icon="alertCircleOutline" />
                <div>
                  <h3>{{ alerta.titulo }}</h3>
                  <p>{{ alerta.mensaje }}</p>
                </div>
              </article>
            </div>
          </section>
          </template>
        </div>
      </div>

      <ion-modal :is-open="mostrandoCentroAlertas" @didDismiss="cerrarCentroAlertas">
        <ion-header class="ion-no-border">
          <ion-toolbar class="alerts-modal-toolbar">
            <div class="alerts-modal-header">
              <div class="alerts-modal-title-block">
                <h2>Histórico de avisos</h2>
                <p>Últimos avisos detectados en tu cuenta</p>
              </div>
              <div class="alerts-modal-actions">
                <button type="button" class="alerts-text-button" @click="marcarHistoricoComoLeido">
                  Marcar leídas
                </button>
                <button type="button" class="alerts-text-button" @click="cerrarCentroAlertas">
                  Cerrar
                </button>
              </div>
            </div>
          </ion-toolbar>
        </ion-header>

        <ion-content class="alerts-modal-content">
          <div v-if="cargandoCentroAlertas" class="alerts-modal-loading">
            <ion-spinner name="crescent" />
          </div>

          <div v-else-if="historialAlertas.length === 0" class="alerts-modal-empty">
            No hay avisos en el histórico.
          </div>

          <ion-list v-else lines="none" class="alerts-modal-list">
            <ion-item
              v-for="alerta in historialAlertas"
              :key="alerta.id"
              class="alerts-modal-item"
              :class="[claseAlertaHistorico(alerta), { 'is-unread': !alerta.leida }]"
            >
              <ion-label>
                <div class="alerts-modal-item-top">
                  <div class="alerts-modal-title-wrap">
                    <span class="alerts-type-chip">{{ etiquetaTipoAlerta(alerta) }}</span>
                    <h3>{{ alerta.titulo }}</h3>
                  </div>
                  <span class="alerts-modal-date">{{ formatearFechaAlerta(alerta.fechaCreacion) }}</span>
                </div>
                <p class="alerts-modal-message">{{ alerta.mensaje }}</p>
                <span v-if="!alerta.leida" class="alerts-unread-pill">No leída</span>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSpinner,
  alertController,
  toastController,
  onIonViewWillEnter
} from '@ionic/vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { alertCircleOutline, cardOutline, notificationsOutline } from 'ionicons/icons'
import {
  getLoginUrl,
  getTransactionsLoginUrl,
  abrirTink,
  cerrarTink,
  limpiarEventosTink,
  desvincularCuentaBancaria
} from '@/services/tinkService'
import { sincronizarMovimientosBancarios } from '@/services/transaccionService'
import { getCuentaPrincipalPorUsuario } from '@/services/cuentaBancariaService'
import {
  getResumenMesActual,
  getVisualizaciones,
  type DashboardAlertaProactivaResponse
} from '@/services/dashboardService'
import {
  getAlertas,
  getAlertasNoLeidasTotal,
  marcarTodasAlertasLeidas,
  type AlertaResponse
} from '@/services/alertaService'
import { obtenerUsuarioSesion } from '@/services/autenticacionService'

interface CuentaGuardada {
  id: string
  idCuentaExterna: string
  nombre: string
  banco: string
  iban: string
  moneda: string
  tipo: string
  saldoActual: number | null
  fechaUltimaSincronizacion?: string | null
}

interface ResumenMes {
  gastosMes: number
  ingresosMes: number
  numeroGastosMes: number
  numeroIngresosMes: number
}

const loading = ref(false)
const sincronizando = ref(false)
const desvinculando = ref(false)
const cargandoInicio = ref(true)

const cuentaGuardada = ref<CuentaGuardada | null>(null)

const resumenMes = ref<ResumenMes>({
  gastosMes: 0,
  ingresosMes: 0,
  numeroGastosMes: 0,
  numeroIngresosMes: 0
})
const alertasProactivas = ref<DashboardAlertaProactivaResponse[]>([])
const historialAlertas = ref<AlertaResponse[]>([])
const mostrandoCentroAlertas = ref(false)
const cargandoCentroAlertas = ref(false)
const totalAlertasNoLeidas = ref(0)
let peticionesInicioActivas = 0
const primeraCargaInicioCompletada = ref(false)

const route = useRoute()
const router = useRouter()

const nombreUsuarioCabecera = computed(() => {
  const nombreCompleto = obtenerUsuarioSesion()?.nombre?.trim()
  if (!nombreCompleto) return 'Nuria'

  return nombreCompleto.split(' ')[0]
})

const fechaCabeceraFormateada = computed(() => {
  return new Date()
    .toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    })
    .replace(/^./, (c) => c.toUpperCase())
})

const fechaSincronizacionFormateada = computed(() => {
  const fecha = cuentaGuardada.value?.fechaUltimaSincronizacion
  if (!fecha) return 'Sin sincronización reciente'

  const parsed = new Date(fecha)
  if (Number.isNaN(parsed.getTime())) return 'Sin sincronización reciente'

  return parsed.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const ibanOculto = computed(() => {
  const iban = cuentaGuardada.value?.iban?.replace(/\s+/g, '') ?? ''

  if (!iban) return 'No disponible'
  if (iban.length <= 8) return iban

  const primeros = iban.slice(0, 4)
  const ultimos = iban.slice(-4)

  return `${primeros} **** **** **** ${ultimos}`
})

const balanceMes = computed(() => {
  return (resumenMes.value.ingresosMes || 0) - (resumenMes.value.gastosMes || 0)
})

const extraerMensajePlano = (valor: unknown, mensajePorDefecto: string): string => {
  const textoOriginal =
    valor instanceof Error
      ? valor.message
      : typeof valor === 'string'
        ? valor
        : ''

  if (!textoOriginal || textoOriginal.trim() === '') {
    return mensajePorDefecto
  }

  const intentarJson = (texto: string): string | null => {
    try {
      const parsed = JSON.parse(texto)
      if (typeof parsed === 'string') return parsed

      return parsed?.mensaje || parsed?.message || parsed?.detalle || null
    } catch {
      return null
    }
  }

  const mensajeJsonDirecto = intentarJson(textoOriginal)
  if (mensajeJsonDirecto) return mensajeJsonDirecto

  const inicioJson = textoOriginal.indexOf('{')
  const finJson = textoOriginal.lastIndexOf('}')
  if (inicioJson !== -1 && finJson > inicioJson) {
    const posibleJson = textoOriginal.slice(inicioJson, finJson + 1)
    const mensajeJsonEmbebido = intentarJson(posibleJson)
    if (mensajeJsonEmbebido) return mensajeJsonEmbebido
  }

  return textoOriginal
}

const normalizarMensajeUsuario = (valor: unknown, mensajePorDefecto: string): string => {
  const mensaje = extraerMensajePlano(valor, mensajePorDefecto).trim()

  if (mensaje === '') return mensajePorDefecto

  const texto = mensaje.toLowerCase()

  if (
    texto.includes('error interno en el servidor') ||
    texto.includes('internal server error')
  ) {
    return mensajePorDefecto
  }

  return mensaje
}

const mostrarToast = async (
  mensaje: string,
  color: 'success' | 'danger' | 'warning' | 'primary' = 'primary'
) => {
  const toast = await toastController.create({
    message: mensaje,
    duration: 2500,
    position: 'top',
    color
  })

  await toast.present()
}

const formatearImporte = (importe: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(importe || 0)
}

const cargarCuentaConectada = async () => {
  try {
    const cuenta = await getCuentaPrincipalPorUsuario()
    cuentaGuardada.value = cuenta
  } catch {
    cuentaGuardada.value = null
  }
}

const cargarResumenMes = async () => {
  try {
    const resumen = await getResumenMesActual()
    resumenMes.value = resumen
  } catch {
    resumenMes.value = {
      gastosMes: 0,
      ingresosMes: 0,
      numeroGastosMes: 0,
      numeroIngresosMes: 0
    }
  }
}

const cargarAlertasProactivas = async () => {
  try {
    await getVisualizaciones()
    const response = await getAlertas(1, 12)
    alertasProactivas.value = (response.items ?? []).map(a => ({
      tipo: String(a.tipo),
      severidad: a.tipo === 3 ? 'alta' : a.tipo === 1 ? 'media' : 'baja',
      titulo: a.titulo,
      mensaje: a.mensaje
    }))
  } catch {
    alertasProactivas.value = []
  }
}

const alertasProactivasInicio = computed(() => {
  return alertasProactivas.value.slice(0, 2)
})

const badgeNotificaciones = computed(() => {
  return totalAlertasNoLeidas.value > 9 ? '9+' : String(totalAlertasNoLeidas.value)
})

const cargarNoLeidas = async () => {
  try {
    totalAlertasNoLeidas.value = await getAlertasNoLeidasTotal()
  } catch {
    totalAlertasNoLeidas.value = 0
  }
}

const abrirCentroAlertas = async () => {
  mostrandoCentroAlertas.value = true
  cargandoCentroAlertas.value = true

  try {
    const response = await getAlertas(1, 40)
    historialAlertas.value = response.items ?? []
  } catch {
    historialAlertas.value = []
  } finally {
    cargandoCentroAlertas.value = false
  }
}

const cerrarCentroAlertas = () => {
  mostrandoCentroAlertas.value = false
}

const marcarHistoricoComoLeido = async () => {
  try {
    await marcarTodasAlertasLeidas()
    historialAlertas.value = historialAlertas.value.map(a => ({ ...a, leida: true }))
    totalAlertasNoLeidas.value = 0
  } catch {
    await mostrarToast('No se pudieron marcar como leídas.', 'warning')
  }
}

const formatearFechaAlerta = (fechaIso: string) => {
  const fecha = new Date(fechaIso)
  if (Number.isNaN(fecha.getTime())) return ''
  return fecha.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const etiquetaTipoAlerta = (alerta: AlertaResponse) => {
  switch (alerta.tipo) {
    case 3:
      return 'Predicción'
    case 1:
      return 'Gasto inusual'
    default:
      return 'Aviso'
  }
}

const claseAlertaHistorico = (alerta: AlertaResponse) => {
  switch (alerta.tipo) {
    case 3:
      return 'alerta-prediccion'
    case 1:
      return 'alerta-gasto'
    default:
      return 'alerta-info'
  }
}

const recargarInicio = async () => {
  const mostrarLoaderPantalla = !primeraCargaInicioCompletada.value
  peticionesInicioActivas += 1
  if (mostrarLoaderPantalla) {
    cargandoInicio.value = true
  }

  try {
    await Promise.all([
      cargarCuentaConectada(),
      cargarResumenMes(),
      cargarAlertasProactivas(),
      cargarNoLeidas()
    ])
  } finally {
    peticionesInicioActivas = Math.max(0, peticionesInicioActivas - 1)
    if (peticionesInicioActivas === 0) {
      if (mostrarLoaderPantalla) {
        primeraCargaInicioCompletada.value = true
        cargandoInicio.value = false
      }
    }
  }
}

const procesarRetornoBanco = async () => {
  const status = route.query.status
  const message = route.query.message

  if (!status) return

  await cerrarTink().catch(() => {})
  loading.value = false
  sincronizando.value = false
  desvinculando.value = false

  if (status === 'connected') {
    try {
      await recargarInicio()
      await mostrarToast('Cuenta conectada correctamente.', 'success')
    } catch {
      await mostrarToast(
        'La cuenta se conectó, pero no se pudo refrescar la información.',
        'warning'
      )
    } finally {
      await router.replace('/inicio')
    }
    return
  }

  if (status === 'transactions-connected') {
    try {
      await recargarInicio()
      await mostrarToast('Autorización de transacciones completada correctamente.', 'success')
    } catch {
      await mostrarToast(
        'La autorización terminó, pero no se pudo refrescar la información.',
        'warning'
      )
    } finally {
      await router.replace('/inicio')
    }
    return
  }

  if (status === 'transactions-error') {
    const mensajeError = normalizarMensajeUsuario(
      typeof message === 'string' ? message : '',
      'No se pudo completar la autorización de transacciones.'
    )

    await mostrarToast(mensajeError, 'danger')
    await router.replace('/inicio')
    return
  }

  if (status === 'error') {
    const mensajeError = normalizarMensajeUsuario(
      typeof message === 'string' ? message : '',
      'No se pudo completar la conexión bancaria.'
    )

    await mostrarToast(mensajeError, 'danger')
    await router.replace('/inicio')
  }
}

const conectarBanco = async () => {
  try {
    loading.value = true

    await limpiarEventosTink()
    const loginData = await getLoginUrl()
    await abrirTink(loginData.loginUrl)
  } catch (error) {
    await mostrarToast(
      normalizarMensajeUsuario(error, 'No se pudo iniciar la conexión bancaria.'),
      'danger'
    )
    loading.value = false
  }
}

const conectarBancoTransacciones = async () => {
  try {
    loading.value = true

    const loginData = await getTransactionsLoginUrl()
    await abrirTink(loginData.loginUrl)
  } catch (error) {
    await mostrarToast(
      normalizarMensajeUsuario(error, 'No se pudo iniciar la autorización de transacciones.'),
      'danger'
    )
  } finally {
    loading.value = false
  }
}

const esErrorDeAutorizacionCaducada = (mensaje: string) => {
  const texto = mensaje.toLowerCase()

  return (
    texto.includes('autorización bancaria ha caducado') ||
    texto.includes('volver a conectar la cuenta') ||
    texto.includes('no hay refresh token') ||
    texto.includes('necesario volver a autorizar')
  )
}

const mostrarDialogoReconectar = async () => {
  const alert = await alertController.create({
    header: 'Reconectar banco',
    message:
      'La autorización bancaria ha caducado. Necesitas volver a conectar tu banco para seguir sincronizando movimientos.',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Reconectar',
        handler: async () => {
          await conectarBancoTransacciones()
        }
      }
    ]
  })

  await alert.present()
}

const sincronizarMovimientos = async () => {
  try {
    sincronizando.value = true

    const resultado = await sincronizarMovimientosBancarios()
    await recargarInicio()

    const mensaje =
      resultado?.mensaje ||
      (resultado?.nuevas > 0
        ? `Se han importado ${resultado.nuevas} movimientos nuevos.`
        : 'Sincronización completada. No había movimientos nuevos.')

    await mostrarToast(mensaje, 'success')
  } catch (error) {
    const mensaje = normalizarMensajeUsuario(error, 'No se pudo sincronizar la cuenta bancaria.')

    if (esErrorDeAutorizacionCaducada(mensaje)) {
      await mostrarDialogoReconectar()
      return
    }

    await mostrarToast(mensaje, 'danger')
  } finally {
    sincronizando.value = false
  }
}

const desvincularCuenta = async () => {
  try {
    desvinculando.value = true

    await desvincularCuentaBancaria()
    cuentaGuardada.value = null
    await mostrarToast('Cuenta desvinculada correctamente.', 'success')
  } catch (error) {
    await mostrarToast(
      normalizarMensajeUsuario(error, 'No se pudo desvincular la cuenta bancaria.'),
      'danger'
    )
  } finally {
    desvinculando.value = false
  }
}

const confirmarSincronizacion = async () => {
  const alert = await alertController.create({
    header: 'Sincronizar movimientos',
    message:
      'Se van a buscar nuevos movimientos bancarios. Este proceso puede tardar unos segundos. ¿Quieres continuar?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Sincronizar',
        handler: async () => {
          await sincronizarMovimientos()
        }
      }
    ]
  })

  await alert.present()
}

const confirmarDesvinculacion = async () => {
  const alert = await alertController.create({
    header: 'Desvincular cuenta',
    message:
      'La cuenta dejará de estar conectada, pero los movimientos ya guardados seguirán disponibles. ¿Quieres continuar?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Desvincular',
        role: 'destructive',
        handler: async () => {
          await desvincularCuenta()
        }
      }
    ]
  })

  await alert.present()
}

onMounted(async () => {
  await procesarRetornoBanco()
  await recargarInicio()
})

onIonViewWillEnter(async () => {
  await procesarRetornoBanco()
  await recargarInicio()
})

watch(
  () => route.query.status,
  async () => {
    await procesarRetornoBanco()
  }
)
</script>

<style scoped>
.custom-toolbar {
  --background: #233f6b;
  --color: #ffffff;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 16px;
}

.topbar-title {
  margin: 0;
  font-size: 1.55rem;
  font-weight: 700;
  color: #ffffff;
}

.topbar-date {
  margin: 4px 0 0;
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.9);
}

.profile-button {
  position: relative;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
}

.notifications-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #b42318;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

.home-content {
  --background: #f2f0ef;
}

.page-shell {
  display: flex;
  justify-content: center;
  width: 100%;
}

.home-wrapper {
  width: 100%;
  max-width: 430px;
  padding: 16px 16px 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.home-loading-state {
  padding: 24px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
}

.home-loading-state h2 {
  margin: 0;
  color: #233f6b;
  font-size: 1.06rem;
  font-weight: 800;
}

.home-loading-state p {
  margin: 0;
  color: #6f7782;
  font-size: 0.9rem;
  line-height: 1.35;
}

.finmind-card {
  background: #ffffff;
  border-radius: 22px;
  box-shadow: 0 8px 22px rgba(35, 63, 107, 0.08);
}

.account-card {
  padding: 18px;
}

.section-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.section-eyebrow {
  margin: 0 0 4px;
  font-size: 0.8rem;
  color: #6f7782;
  font-weight: 700;
}

.section-title {
  margin: 0;
  font-size: 1.12rem;
  font-weight: 700;
  color: #17181c;
}

.empty-bank-card {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.empty-bank-icon,
.bank-summary-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: #edf2fa;
  color: #233f6b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  flex-shrink: 0;
}

.bank-card-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #17181c;
  font-weight: 700;
}

.empty-bank-text p {
  margin: 0;
  color: #6f7782;
  line-height: 1.45;
  font-size: 0.95rem;
}

.connect-button {
  margin-top: 16px;
  --background: #f1b80f;
  --background-hover: #f1b80f;
  --background-activated: #f1b80f;
  --color: #17181c;
  --border-radius: 18px;
  font-weight: 700;
  min-height: 50px;
  box-shadow: 0 10px 18px rgba(241, 184, 15, 0.22);
}

.bank-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.bank-card-header-left {
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.bank-card-header-text {
  min-width: 0;
}

.bank-summary-label {
  margin: 0 0 4px;
  font-size: 0.8rem;
  color: #6f7782;
  font-weight: 600;
}

.sync-mini-button {
  --border-radius: 14px;
  --color: #233f6b;
  --border-color: #d7deea;
  font-weight: 700;
  min-height: 34px;
  flex-shrink: 0;
}

.bank-card-body {
  margin-top: 14px;
}

.bank-summary-bank {
  margin: 0;
  color: #233f6b;
  font-size: 0.95rem;
  font-weight: 700;
}

.bank-summary-iban {
  margin: 6px 0 0;
  color: #6f7782;
  font-size: 0.9rem;
  word-break: break-word;
}

.sync-line.compact {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #ece8e6;
}

.sync-line-label {
  font-size: 0.84rem;
  color: #6f7782;
  font-weight: 600;
}

.sync-line-value {
  font-size: 0.9rem;
  color: #17181c;
  font-weight: 600;
  text-align: right;
}

.account-actions.compact {
  margin-top: 8px;
  display: flex;
  justify-content: flex-start;
}

.unlink-button {
  border: none;
  background: transparent;
  color: #b42318;
  font-size: 0.92rem;
  font-weight: 700;
  padding: 6px 0 0;
}

.unlink-button:disabled {
  opacity: 0.6;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.summary-card {
  position: relative;
  padding: 16px;
  overflow: hidden;
}

.compact-card {
  min-height: 154px;
}

.summary-card.full-width {
  grid-column: 1 / -1;
}

.summary-accent {
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 5px;
  background: #233f6b;
}

.summary-card.ingresos .summary-accent {
  background: #f1b80f;
}

.summary-card.gastos .summary-accent {
  background: #233f6b;
}

.summary-card.balance .summary-accent {
  background: linear-gradient(90deg, #067647 0%, #12b76a 100%);
}

.summary-label {
  margin: 10px 0 10px;
  font-size: 0.92rem;
  font-weight: 700;
  color: #667085;
}

.summary-amount {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1.1;
  color: #17181c;
}

.summary-meta {
  margin: 10px 0 0;
  font-size: 0.83rem;
  color: #7a8088;
  line-height: 1.4;
}

.summary-card.gastos .summary-amount {
  color: #233f6b;
}

.summary-card.ingresos .summary-amount {
  color: #8a6500;
}

.balance-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.balance-badge {
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.balance-badge.positivo {
  background: rgba(6, 118, 71, 0.12);
  color: #067647;
}

.balance-badge.negativo {
  background: rgba(180, 35, 24, 0.12);
  color: #b42318;
}

.balance-positivo {
  color: #067647;
}

.balance-negativo {
  color: #b42318;
}

.balance-meta {
  margin-top: 12px;
}

.alerts-card {
  padding: 16px;
}

.alerts-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.alerts-empty {
  display: flex;
  gap: 10px;
  align-items: center;
  color: #6f7782;
  font-size: 0.9rem;
}

.alerts-empty p {
  margin: 0;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alert-item {
  border-radius: 14px;
  padding: 10px 12px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.alert-item ion-icon {
  font-size: 1rem;
  margin-top: 2px;
}

.alert-item h3 {
  margin: 0;
  font-size: 0.93rem;
  font-weight: 700;
}

.alert-item p {
  margin: 4px 0 0;
  font-size: 0.84rem;
  line-height: 1.35;
}

.alert-alta {
  background: #fef2f2;
  color: #991b1b;
}

.alert-media {
  background: #fff7ed;
  color: #9a3412;
}

.alert-baja {
  background: #eff6ff;
  color: #1d4ed8;
}

.alerts-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
}

.alerts-modal-toolbar {
  --background: #233f6b;
  --min-height: 86px;
}

.alerts-modal-title-block h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #ffffff;
}

.alerts-modal-title-block p {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.86);
}

.alerts-modal-header h2 {
  margin: 0;
}

.alerts-modal-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.alerts-text-button {
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.78rem;
  padding: 8px 10px;
  border-radius: 10px;
}

.alerts-modal-content {
  --background: #f2f0ef;
}

.alerts-modal-loading,
.alerts-modal-empty {
  padding: 28px 16px;
  text-align: center;
  color: #6f7782;
}

.alerts-modal-list {
  background: transparent;
  padding: 14px 14px 20px;
}

.alerts-modal-item {
  --background: #ffffff;
  --padding-start: 12px;
  --inner-padding-end: 12px;
  border-radius: 16px;
  margin-bottom: 12px;
  box-shadow: 0 10px 22px rgba(35, 63, 107, 0.08);
  border-left: 4px solid #98a2b3;
}

.alerts-modal-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.alerts-modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.alerts-modal-item-top h3 {
  margin: 0;
  font-size: 0.94rem;
  font-weight: 700;
  color: #17181c;
}

.alerts-type-chip {
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #475467;
  background: #eef2f7;
  white-space: nowrap;
}

.alerts-modal-date {
  font-size: 0.72rem;
  color: #667085;
  white-space: nowrap;
  flex-shrink: 0;
}

.alerts-modal-message {
  margin: 8px 0 0;
  color: #475467;
  line-height: 1.4;
  font-size: 0.85rem;
}

.alerts-unread-pill {
  display: inline-block;
  margin-top: 10px;
  border-radius: 999px;
  background: rgba(35, 63, 107, 0.12);
  color: #233f6b;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 9px;
}

.alerts-modal-item.is-unread {
  box-shadow: 0 12px 24px rgba(35, 63, 107, 0.12);
}

.alerts-modal-item.alerta-prediccion {
  border-left-color: #b42318;
}

.alerts-modal-item.alerta-prediccion .alerts-type-chip {
  background: #fef2f2;
  color: #b42318;
}

.alerts-modal-item.alerta-gasto {
  border-left-color: #d97706;
}

.alerts-modal-item.alerta-gasto .alerts-type-chip {
  background: #fff7ed;
  color: #b45309;
}

.alerts-modal-item.alerta-info {
  border-left-color: #2563eb;
}

.alerts-modal-item.alerta-info .alerts-type-chip {
  background: #eff6ff;
  color: #1d4ed8;
}

ion-spinner {
  width: 16px;
  height: 16px;
}

@media (max-width: 360px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .summary-card.full-width {
    grid-column: auto;
  }

  .balance-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .empty-bank-card {
    flex-direction: column;
  }
}
</style>
