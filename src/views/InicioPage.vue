<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <div class="topbar">
          <div>
            <h1 class="topbar-title">Hola, Nuria</h1>
            <p class="topbar-date">Enero de 2026</p>
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
                :disabled="loading"
              >
                <ion-spinner v-if="loading" name="crescent" />
                <span v-else>Conectar banco</span>
              </ion-button>
            </template>

            <template v-else>
              <div class="bank-summary-card">
                <div class="bank-summary-left">
                  <div class="bank-summary-icon">
                    <ion-icon :icon="cardOutline" />
                  </div>

                  <div class="bank-summary-text">
                    <p class="bank-summary-label">Cuenta conectada</p>
                    <h2>{{ cuentaGuardada.nombre || 'Cuenta principal' }}</h2>
                    <p class="bank-summary-bank">
                      {{ cuentaGuardada.banco || 'Banco no disponible' }}
                    </p>
                    <p class="bank-summary-iban">
                      {{ cuentaGuardada.iban || 'IBAN no disponible' }}
                    </p>
                  </div>
                </div>

                <div class="bank-summary-check">
                  <ion-icon :icon="checkmarkCircleOutline" />
                </div>
              </div>

              <div class="mini-info-grid">
                <div class="mini-info-item">
                  <span class="mini-info-label">Moneda</span>
                  <span class="mini-info-value">{{ cuentaGuardada.moneda || 'EUR' }}</span>
                </div>

                <div class="mini-info-item">
                  <span class="mini-info-label">Tipo</span>
                  <span class="mini-info-value">{{ cuentaGuardada.tipo || 'No disponible' }}</span>
                </div>
              </div>

              <div class="sync-line">
                <span class="sync-line-label">Última sincronización</span>
                <span class="sync-line-value">{{ fechaSincronizacionFormateada }}</span>
              </div>
            </template>
          </section>

          <section class="status-card">
            <div class="section-header">
              <ion-icon :icon="informationCircleOutline" />
              <h3>Estado</h3>
            </div>

            <p class="status-text">{{ estado }}</p>
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
  onIonViewWillEnter
} from '@ionic/vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  cardOutline,
  informationCircleOutline,
  checkmarkCircleOutline,
  notificationsOutline
} from 'ionicons/icons'
import {
  getLoginUrl,
  abrirTink,
  cerrarTink,
  limpiarEventosTink
} from '@/services/tinkService'
import { getCuentaPrincipalPorUsuario } from '@/services/cuentaBancariaService'

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

const loading = ref(false)
const estado = ref('Todavía no hay ninguna cuenta conectada.')
const cuentaGuardada = ref<CuentaGuardada | null>(null)

const route = useRoute()
const router = useRouter()

// Temporalmente seguimos usando este identificador de prueba
const usuarioId = 'e7178a9b-d998-4efd-a029-f4e24977166a'
const localUserId = usuarioId

const fechaSincronizacionFormateada = computed(() => {
  const fecha = cuentaGuardada.value?.fechaUltimaSincronizacion
  if (!fecha) return 'Hace un momento'

  const parsed = new Date(fecha)
  if (Number.isNaN(parsed.getTime())) return 'Hace un momento'

  return parsed.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const cargarCuentaConectada = async () => {
  try {
    const cuenta = await getCuentaPrincipalPorUsuario(usuarioId)
    cuentaGuardada.value = cuenta
  } catch (error) {
    console.error(error)
    estado.value =
      error instanceof Error
        ? error.message
        : 'No se pudo cargar la cuenta conectada.'
  }
}

const procesarRetornoBanco = async () => {
  const bank = route.query.bank
if (bank === 'connected') {
  try {
    await cerrarTink().catch(() => {})
    loading.value = false
    estado.value = 'Cuenta conectada correctamente. Actualizando datos...'
    await cargarCuentaConectada()

    if (cuentaGuardada.value) {
      estado.value = 'Cuenta conectada correctamente.'
    } else {
      estado.value = 'La conexión terminó, pero no se encontró ninguna cuenta guardada.'
    }
  } catch (error) {
    console.error(error)
    estado.value =
      error instanceof Error
        ? error.message
        : 'La cuenta se conectó, pero no se pudo refrescar la información.'
  } finally {
    await router.replace('/tabs/tab1')
  }

  return
}
    

  if (bank === 'error') {
    await cerrarTink().catch(() => {})
    loading.value = false
    estado.value = 'No se pudo completar la conexión bancaria.'
    await router.replace('/tabs/tab1')
  }
}

const conectarBanco = async () => {
  try {
    loading.value = true
    estado.value = 'Abriendo conexión con tu banco...'

    await limpiarEventosTink()

    const loginData = await getLoginUrl(localUserId)
    await abrirTink(loginData.loginUrl)
  } catch (error) {
    console.error(error)
    estado.value =
      error instanceof Error
        ? error.message
        : 'No se pudo iniciar la conexión bancaria.'
    loading.value = false
  }
}

onMounted(async () => {
  await procesarRetornoBanco()
  await cargarCuentaConectada()
})

onIonViewWillEnter(async () => {
  await procesarRetornoBanco()
})

watch(
  () => route.query.bank,
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

.account-card,
.status-card {
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 8px 22px rgba(35, 63, 107, 0.08);
}

.account-card {
  padding: 18px;
}

.empty-bank-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.empty-bank-icon,
.bank-summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #f2f0ef;
  color: #233f6b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.empty-bank-text h2,
.bank-summary-text h2 {
  margin: 0 0 8px;
  font-size: 1.25rem;
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

.bank-summary-card {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
}

.bank-summary-left {
  display: flex;
  gap: 12px;
  flex: 1;
}

.bank-summary-text {
  flex: 1;
}

.bank-summary-label {
  margin: 0 0 4px;
  font-size: 0.82rem;
  color: #6f7782;
  font-weight: 600;
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

.bank-summary-check {
  color: #2db36c;
  font-size: 1.35rem;
}

.mini-info-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.mini-info-item {
  background: #f8f7f6;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mini-info-label {
  font-size: 0.82rem;
  color: #6f7782;
  font-weight: 600;
}

.mini-info-value {
  font-size: 1rem;
  color: #17181c;
  font-weight: 700;
}

.sync-line {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 2px 0;
  border-top: 1px solid #ece8e6;
}

.sync-line-label {
  font-size: 0.86rem;
  color: #6f7782;
  font-weight: 600;
}

.sync-line-value {
  font-size: 0.92rem;
  color: #17181c;
  font-weight: 600;
  text-align: right;
}

.status-card {
  padding: 18px 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #233f6b;
}

.section-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.status-text {
  margin: 0;
  color: #17181c;
  font-size: 0.98rem;
  line-height: 1.45;
}

ion-spinner {
  width: 18px;
  height: 18px;
}
</style>