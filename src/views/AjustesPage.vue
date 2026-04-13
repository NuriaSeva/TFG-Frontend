<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <div class="topbar">
          <div>
            <h1 class="topbar-title">Ajustes</h1>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="settings-content">
      <div class="page-shell">
        <div class="settings-wrapper">
          <section class="section-card">
            <div class="section-header">
              <h2>Organización</h2>
              <p>Gestiona la información que utilizas en tus movimientos.</p>
            </div>

            <button class="settings-item" type="button" @click="irACategorias">
              <div class="settings-item-left">
                <div class="settings-icon">
                  <ion-icon :icon="pricetagsOutline" />
                </div>

                <div class="settings-text">
                  <h3>Categorías</h3>
                  <p>Crea y consulta tus categorías de ingresos y gastos.</p>
                </div>
              </div>

              <ion-icon :icon="chevronForwardOutline" class="settings-arrow" />
            </button>
          </section>

          <section class="section-card section-card-danger">
            <div class="section-header">
              <h2>Sesión</h2>
              <p>Gestiona el acceso a tu cuenta en este dispositivo.</p>
            </div>

            <button class="settings-item settings-item-danger" type="button" @click="onCerrarSesion">
              <div class="settings-item-left">
                <div class="settings-icon settings-icon-danger">
                  <ion-icon :icon="logOutOutline" />
                </div>

                <div class="settings-text">
                  <h3>Cerrar sesión</h3>
                  <p>Salir de tu cuenta y volver a la pantalla de inicio de sesión.</p>
                </div>
              </div>

              <ion-icon :icon="chevronForwardOutline" class="settings-arrow" />
            </button>
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
  IonIcon,
  alertController,
  toastController
} from '@ionic/vue'
import {
  pricetagsOutline,
  chevronForwardOutline,
  logOutOutline
} from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { cerrarSesion } from '@/services/autenticacionService'

const router = useRouter()

const irACategorias = async () => {
  await router.push('/ajustes/categorias')
}

const onCerrarSesion = async () => {
  const alert = await alertController.create({
    header: 'Cerrar sesión',
    message: '¿Quieres cerrar la sesión actual?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Cerrar sesión',
        role: 'destructive',
        handler: async () => {
          await cerrarSesion()

          const toast = await toastController.create({
            message: 'Sesión cerrada correctamente.',
            duration: 1800,
            position: 'bottom'
          })

          await toast.present()
          await router.replace('/inicio-sesion')
        }
      }
    ]
  })

  await alert.present()
}
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
  padding: 14px 18px 18px;
}

.topbar-kicker {
  margin: 0 0 4px;
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.78);
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.topbar-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.15;
}

.topbar-subtitle {
  margin: 6px 0 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.92);
}

.profile-button {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.settings-content {
  --background: #f2f0ef;
}

.page-shell {
  display: flex;
  justify-content: center;
  width: 100%;
}

.settings-wrapper {
  width: 100%;
  max-width: 430px;
  padding: 18px 16px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-card {
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 8px 22px rgba(35, 63, 107, 0.08);
  padding: 18px;
}

.section-header {
  margin-bottom: 14px;
}

.section-header h2 {
  margin: 0;
  font-size: 1.08rem;
  color: #17181c;
  font-weight: 800;
}

.section-header p {
  margin: 6px 0 0;
  font-size: 0.92rem;
  color: #6f7782;
  line-height: 1.4;
}

.settings-item {
  width: 100%;
  border: none;
  background: #f8f7f6;
  border-radius: 18px;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-align: left;
}

.settings-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.settings-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(241, 184, 15, 0.2);
  color: #17181c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.settings-text h3 {
  margin: 0 0 4px;
  font-size: 1rem;
  color: #17181c;
  font-weight: 800;
}

.settings-text p {
  margin: 0;
  font-size: 0.88rem;
  color: #6f7782;
  line-height: 1.35;
}

.settings-arrow {
  color: #233f6b;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.section-card-danger {
  margin-top: 18px;
}

.settings-item-danger {
  border: 1px solid rgba(180, 35, 24, 0.12);
}

.settings-icon-danger {
  background: rgba(180, 35, 24, 0.10);
  color: #b42318;
}
</style>