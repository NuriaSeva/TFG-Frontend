<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <div class="topbar">
          <div>
            <h1 class="topbar-title">Hola, Nuria</h1>
            <p class="topbar-date">{{ fechaCabeceraFormateada }}</p>
          </div>

          <button class="profile-button" type="button">
            <ion-icon :icon="notificationsOutline" />
          </button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="home-content">
      <div class="page-shell">
        <div class="home-wrapper">
          <section class="account-card">
            <template v-if="!cuentaGuardada">
              <div class="empty-bank-card">
                <div class="empty-bank-icon">
                  <ion-icon :icon="cardOutline" />
                </div>

                <div class="empty-bank-text">
                  <h2>Conecta tu banco</h2>
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
            <article class="summary-card gastos">
              <p class="summary-label">Gastos</p>
              <h3 class="summary-amount">{{ formatearImporte(resumenMes.gastosMes) }}</h3>
              <p class="summary-meta">
                {{ resumenMes.numeroGastosMes }} movimiento<span v-if="resumenMes.numeroGastosMes !== 1">s</span> este mes
              </p>
            </article>

            <article class="summary-card ingresos">
              <p class="summary-label">Ingresos</p>
              <h3 class="summary-amount">{{ formatearImporte(resumenMes.ingresosMes) }}</h3>
              <p class="summary-meta">
                {{ resumenMes.numeroIngresosMes }} movimiento<span v-if="resumenMes.numeroIngresosMes !== 1">s</span> este mes
              </p>
            </article>
          </section>
        </div>
      </div>
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
  IonSpinner,
  alertController,
  toastController,
  onIonViewWillEnter
} from '@ionic/vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cardOutline, notificationsOutline } from 'ionicons/icons'
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
import { getResumenMesActual } from '@/services/dashboardService'

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

const cuentaGuardada = ref<CuentaGuardada | null>(null)

const resumenMes = ref<ResumenMes>({
  gastosMes: 0,
  ingresosMes: 0,
  numeroGastosMes: 0,
  numeroIngresosMes: 0
})

const route = useRoute()
const router = useRouter()

const usuarioId = 'e7178a9b-d998-4efd-a029-f4e24977166a'
const localUserId = usuarioId

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
    const cuenta = await getCuentaPrincipalPorUsuario(usuarioId)
    cuentaGuardada.value = cuenta
  } catch (error) {
    console.error(error)
    cuentaGuardada.value = null
  }
}

const cargarResumenMes = async () => {
  try {
    const resumen = await getResumenMesActual(usuarioId)
    resumenMes.value = resumen
  } catch (error) {
    console.error(error)
    resumenMes.value = {
      gastosMes: 0,
      ingresosMes: 0,
      numeroGastosMes: 0,
      numeroIngresosMes: 0
    }
  }
}

const recargarInicio = async () => {
  await Promise.all([
    cargarCuentaConectada(),
    cargarResumenMes()
  ])
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
    } catch (error) {
      console.error(error)
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
    } catch (error) {
      console.error(error)
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
    const mensajeError =
      typeof message === 'string' && message.trim() !== ''
        ? message
        : 'No se pudo completar la autorización de transacciones.'

    await mostrarToast(mensajeError, 'danger')
    await router.replace('/inicio')
    return
  }

  if (status === 'error') {
    const mensajeError =
      typeof message === 'string' && message.trim() !== ''
        ? message
        : 'No se pudo completar la conexión bancaria.'

    await mostrarToast(mensajeError, 'danger')
    await router.replace('/inicio')
  }
}

const conectarBanco = async () => {
  try {
    loading.value = true

    await limpiarEventosTink()
    const loginData = await getLoginUrl(localUserId)
    await abrirTink(loginData.loginUrl)
  } catch (error) {
    console.error(error)
    await mostrarToast(
      error instanceof Error
        ? error.message
        : 'No se pudo iniciar la conexión bancaria.',
      'danger'
    )
    loading.value = false
  }
}

const conectarBancoTransacciones = async () => {
  try {
    loading.value = true

    const loginData = await getTransactionsLoginUrl(localUserId)
    await abrirTink(loginData.loginUrl)
  } catch (error) {
    console.error(error)
    await mostrarToast(
      error instanceof Error
        ? error.message
        : 'No se pudo iniciar la autorización de transacciones.',
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

const mostrarDialogoReconectar = async (mensajeServidor?: string) => {
  const alert = await alertController.create({
    header: 'Reconectar banco',
    message:
      mensajeServidor && mensajeServidor.trim() !== ''
        ? mensajeServidor
        : 'La autorización para sincronizar movimientos ha caducado. Necesitas volver a autorizar el acceso a tus movimientos bancarios.',
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

    const resultado = await sincronizarMovimientosBancarios(usuarioId)
    await recargarInicio()

    const mensaje =
      resultado?.mensaje ||
      (resultado?.nuevas > 0
        ? `Se han importado ${resultado.nuevas} movimientos nuevos.`
        : 'Sincronización completada. No había movimientos nuevos.')

    await mostrarToast(mensaje, 'success')
  } catch (error) {
    console.error(error)

    const mensaje =
      error instanceof Error
        ? error.message.trim()
        : 'No se pudo sincronizar la cuenta bancaria.'

    if (esErrorDeAutorizacionCaducada(mensaje)) {
      await mostrarDialogoReconectar(mensaje)
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

    await desvincularCuentaBancaria(usuarioId)
    cuentaGuardada.value = null
    await mostrarToast('Cuenta desvinculada correctamente.', 'success')
  } catch (error) {
    console.error(error)
    await mostrarToast(
      error instanceof Error
        ? error.message
        : 'No se pudo desvincular la cuenta bancaria.',
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
  padding: 18px 16px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.account-card {
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 8px 22px rgba(35, 63, 107, 0.08);
  padding: 18px;
}

.empty-bank-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.empty-bank-icon,
.bank-summary-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: #f2f0ef;
  color: #233f6b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  flex-shrink: 0;
}

.empty-bank-text h2,
.bank-card-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #17181c;
  font-weight: 700;
}

.empty-bank-text p {
  margin: 0;
  color: #6f7782;
  line-height: 1.5;
  font-size: 0.98rem;
}

.connect-button {
  margin-top: 18px;
  --background: #f1b80f;
  --background-hover: #f1b80f;
  --background-activated: #f1b80f;
  --color: #17181c;
  --border-radius: 18px;
  font-weight: 700;
  min-height: 52px;
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
  font-weight: 600;
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
  font-weight: 600;
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
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 8px 22px rgba(35, 63, 107, 0.08);
  padding: 16px 14px;
}

.summary-label {
  margin: 0 0 10px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #17181c;
}

.summary-amount {
  margin: 0;
  font-size: 1.85rem;
  font-weight: 800;
  color: #17181c;
  line-height: 1.1;
}

.summary-meta {
  margin: 10px 0 0;
  font-size: 0.83rem;
  color: #7a8088;
}

.summary-card.gastos .summary-amount {
  color: #17181c;
}

.summary-card.ingresos .summary-amount {
  color: #17181c;
}

ion-spinner {
  width: 16px;
  height: 16px;
}

@media (max-width: 360px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>