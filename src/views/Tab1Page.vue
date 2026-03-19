<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Inicio</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="page-container">
        <ion-card class="main-card">
          <ion-card-header>
            <ion-card-title>Conectar banco</ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <p class="description">
              Conecta tu banco para vincular una cuenta a la aplicación.
            </p>

            <p class="status">{{ estado }}</p>

            <ion-button
              expand="block"
              class="connect-button"
              @click="conectarBanco"
              :disabled="loading"
            >
              <template v-if="loading && accionActual === 'abrir'">
                <ion-spinner name="crescent" />
              </template>
              <template v-else>
                Conectar banco
              </template>
            </ion-button>

            <ion-button
              expand="block"
              fill="outline"
              class="finish-button"
              @click="finalizarConexion"
              :disabled="loading"
            >
              <template v-if="loading && accionActual === 'guardar'">
                <ion-spinner name="crescent" />
              </template>
              <template v-else>
                He terminado
              </template>
            </ion-button>
          </ion-card-content>
        </ion-card>

        <ion-card v-if="cuentaGuardada" class="result-card">
          <ion-card-header>
            <ion-card-title>Cuenta conectada</ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <div class="detail-row">
              <span class="label">Nombre</span>
              <span>{{ cuentaGuardada.nombre }}</span>
            </div>

            <div class="detail-row">
              <span class="label">Banco</span>
              <span>{{ cuentaGuardada.banco }}</span>
            </div>

            <div class="detail-row">
              <span class="label">IBAN</span>
              <span>{{ cuentaGuardada.iban || 'No disponible' }}</span>
            </div>

            <div class="detail-row">
              <span class="label">Moneda</span>
              <span>{{ cuentaGuardada.moneda }}</span>
            </div>

            <div class="detail-row">
              <span class="label">Tipo</span>
              <span>{{ cuentaGuardada.tipo }}</span>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner
} from '@ionic/vue'
import { ref } from 'vue'
import {
  getLoginUrl,
  abrirTink,
  getLastAccountCheckResult,
  guardarCuentaDesdeAccountCheck
} from '@/services/tinkService'

interface CuentaGuardada {
  id: string
  idCuentaExterna: string
  nombre: string
  banco: string
  iban: string
  moneda: string
  tipo: string
  saldoActual: number | null
}

const loading = ref(false)
const accionActual = ref<'abrir' | 'guardar' | ''>('')
const estado = ref('Todavía no hay ninguna cuenta conectada.')
const cuentaGuardada = ref<CuentaGuardada | null>(null)

// Usuario de prueba
const usuarioId = 'e7178a9b-d998-4efd-a029-f4e24977166a'
const localUserId = usuarioId

const conectarBanco = async () => {
  try {
    loading.value = true
    accionActual.value = 'abrir'
    estado.value = 'Abriendo conexión con tu banco...'

    const loginData = await getLoginUrl(localUserId)
    await abrirTink(loginData.loginUrl)

    estado.value = 'Cuando termines el proceso en Tink, vuelve y pulsa "He terminado".'
  } catch (error) {
    console.error(error)
    estado.value = error instanceof Error
      ? error.message
      : 'No se pudo iniciar la conexión bancaria.'
  } finally {
    loading.value = false
    accionActual.value = ''
  }
}

const finalizarConexion = async () => {
  try {
    loading.value = true
    accionActual.value = 'guardar'
    estado.value = 'Comprobando resultado de la conexión...'

    const result = await getLastAccountCheckResult(localUserId)

    if (!result.success) {
      throw new Error(
        result.errorDescription || result.error || 'La conexión no se completó correctamente.'
      )
    }

    if (!result.accountVerificationReportId) {
      throw new Error('No se recibió el identificador del reporte de verificación.')
    }

    estado.value = 'Guardando cuenta seleccionada...'

    const cuenta = await guardarCuentaDesdeAccountCheck(
      usuarioId,
      result.accountVerificationReportId
    )

    cuentaGuardada.value = cuenta
    estado.value = 'Cuenta conectada correctamente.'
  } catch (error) {
    console.error(error)
    estado.value = error instanceof Error
      ? error.message
      : 'No se pudo finalizar la conexión bancaria.'
  } finally {
    loading.value = false
    accionActual.value = ''
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-card,
.result-card {
  border-radius: 18px;
}

.description {
  margin-top: 0;
  margin-bottom: 12px;
  color: var(--ion-color-medium);
}

.status {
  margin-bottom: 16px;
  font-size: 0.95rem;
  line-height: 1.4;
}

.connect-button {
  margin-bottom: 12px;
}

.finish-button {
  margin-top: 0;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 0;
  border-bottom: 1px solid var(--ion-color-light-shade);
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}
</style>