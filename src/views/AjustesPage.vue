<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <div class="topbar">
          <h1 class="topbar-title">Ajustes</h1>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="settings-content">
      <div class="page-shell">
        <div class="settings-wrapper">
          <section class="settings-section">
            <h2 class="section-title">Accesibilidad</h2>

            <div class="settings-list">
              <div class="settings-row settings-row-control">
                <div class="settings-row-left">
                  <div class="settings-icon settings-icon-accessibility">
                    <ion-icon :icon="textOutline" />
                  </div>

                  <span class="settings-row-title">Tamaño del texto</span>
                </div>

                <ion-select
                  v-model="tamanoTextoSeleccionado"
                  interface="popover"
                  class="settings-select"
                  aria-label="Seleccionar tamaño del texto"
                >
                  <ion-select-option value="normal">Normal</ion-select-option>
                  <ion-select-option value="grande">Grande</ion-select-option>
                  <ion-select-option value="muy-grande">Muy grande</ion-select-option>
                </ion-select>
              </div>

              <div class="settings-row settings-row-control">
                <div class="settings-row-left">
                  <div class="settings-icon settings-icon-accessibility">
                    <ion-icon :icon="removeCircleOutline" />
                  </div>

                  <span class="settings-row-title">Reducir animaciones</span>
                </div>

                <ion-toggle
                  v-model="reducirAnimaciones"
                  class="settings-toggle"
                  aria-label="Reducir animaciones"
                />
              </div>

              <div class="settings-row settings-row-control">
                <div class="settings-row-left">
                  <div class="settings-icon settings-icon-accessibility">
                    <ion-icon :icon="eyeOutline" />
                  </div>

                  <span class="settings-row-title">Alto contraste</span>
                </div>

                <ion-toggle
                  v-model="altoContraste"
                  class="settings-toggle"
                  aria-label="Activar alto contraste"
                />
              </div>

              <div class="settings-row settings-row-control">
                <div class="settings-row-left">
                  <div class="settings-icon settings-icon-accessibility">
                    <ion-icon :icon="optionsOutline" />
                  </div>

                  <span class="settings-row-title">Controles más cómodos</span>
                </div>

                <ion-toggle
                  v-model="controlesComodos"
                  class="settings-toggle"
                  aria-label="Activar controles más cómodos"
                />
              </div>
            </div>
          </section>

          <section class="settings-section">
            <h2 class="section-title">Alertas y avisos</h2>

            <div class="settings-list">
              <div class="settings-row settings-row-control">
                <div class="settings-row-left">
                  <div class="settings-icon settings-icon-security">
                    <ion-icon :icon="notificationsOutline" />
                  </div>

                  <div>
                    <span class="settings-row-title">Alertas automáticas</span>
                    <p class="settings-row-subtitle">
                      Activa o desactiva la generación de avisos en Inicio y campana.
                    </p>
                  </div>
                </div>

                <ion-toggle
                  :checked="alertasActivas"
                  class="settings-toggle"
                  aria-label="Activar alertas automáticas"
                  :disabled="cargandoAlertas || actualizandoAlertas"
                  @ionChange="onToggleAlertas"
                />
              </div>
            </div>
          </section>

          <section class="settings-section">
            <h2 class="section-title">Cuenta y seguridad</h2>

            <div class="settings-list">
              <button class="settings-row" type="button" @click="abrirModalPassword">
                <div class="settings-row-left">
                  <div class="settings-icon settings-icon-security">
                    <ion-icon :icon="lockClosedOutline" />
                  </div>

                  <span class="settings-row-title">Cambiar contraseña</span>
                </div>

                <ion-icon :icon="chevronForwardOutline" class="settings-arrow" />
              </button>

              <button class="settings-row settings-row-danger" type="button" @click="onCerrarSesion">
                <div class="settings-row-left">
                  <div class="settings-icon settings-icon-danger">
                    <ion-icon :icon="logOutOutline" />
                  </div>

                  <span class="settings-row-title settings-row-title-danger">Cerrar sesión</span>
                </div>

                <ion-icon :icon="chevronForwardOutline" class="settings-arrow" />
              </button>
            </div>
          </section>

          <section class="settings-section">
            <h2 class="section-title">Organización</h2>

            <div class="settings-list">
              <button class="settings-row" type="button" @click="irACategorias">
                <div class="settings-row-left">
                  <div class="settings-icon settings-icon-accent">
                    <ion-icon :icon="pricetagsOutline" />
                  </div>

                  <span class="settings-row-title">Categorías</span>
                </div>

                <ion-icon :icon="chevronForwardOutline" class="settings-arrow" />
              </button>
            </div>
          </section>
        </div>
      </div>

      <ion-modal :is-open="mostrarModalPassword" @didDismiss="cerrarModalPassword">
        <ion-header class="ion-no-border modal-header-shell">
          <ion-toolbar class="modal-toolbar">
            <ion-title>Cambiar contraseña</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="cerrarModalPassword">Cerrar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="modal-content">
          <div class="password-modal-body">
            <div class="password-form-card">
              <ion-item lines="none" class="password-item">
                <ion-label position="stacked">Contraseña actual</ion-label>
                <ion-input
                  v-model="formularioPassword.passwordActual"
                  type="password"
                  placeholder="Introduce tu contraseña actual"
                />
              </ion-item>

              <ion-item lines="none" class="password-item">
                <ion-label position="stacked">Nueva contraseña</ion-label>
                <ion-input
                  v-model="formularioPassword.passwordNueva"
                  type="password"
                  placeholder="Introduce la nueva contraseña"
                />
              </ion-item>

              <ion-item lines="none" class="password-item">
                <ion-label position="stacked">Repetir nueva contraseña</ion-label>
                <ion-input
                  v-model="formularioPassword.repetirPasswordNueva"
                  type="password"
                  placeholder="Repite la nueva contraseña"
                />
              </ion-item>

              <ul class="password-rules-list" aria-label="Requisitos de la nueva contraseña">
                <li
                  v-for="requisito in REQUISITOS_PASSWORD"
                  :key="requisito"
                  :class="cumpleRequisito(requisito) ? 'cumplido' : 'pendiente'"
                >
                  {{ requisito }}
                </li>
              </ul>

              <div v-if="mensajeValidacionPassword" class="password-validation-box">
                {{ mensajeValidacionPassword }}
              </div>

              <ion-button
                expand="block"
                class="save-password-button"
                :disabled="guardandoPassword"
                @click="guardarNuevaPassword"
              >
                {{ guardandoPassword ? 'Guardando...' : 'Guardar contraseña' }}
              </ion-button>
            </div>
          </div>
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
  IonIcon,
  IonModal,
  IonTitle,
  IonButtons,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonToggle,
  alertController,
  toastController
} from '@ionic/vue'
import {
  pricetagsOutline,
  chevronForwardOutline,
  logOutOutline,
  lockClosedOutline,
  notificationsOutline,
  textOutline,
  removeCircleOutline,
  eyeOutline,
  optionsOutline
} from 'ionicons/icons'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  REQUISITOS_PASSWORD,
  cambiarPassword,
  cerrarSesion,
  validarPasswordSegura
} from '@/services/autenticacionService'
import {
  type TamanoTextoAccesible,
  useAccesibilidad
} from '@/services/accesibilidadService'
import {
  actualizarNotificacionesActivas,
  getConfiguracionUsuario
} from '@/services/configuracionUsuarioService'

const router = useRouter()
const mostrarModalPassword = ref(false)
const guardandoPassword = ref(false)
const alertasActivas = ref(true)
const cargandoAlertas = ref(false)
const actualizandoAlertas = ref(false)

const formularioPassword = reactive({
  passwordActual: '',
  passwordNueva: '',
  repetirPasswordNueva: ''
})

const {
  preferenciasAccesibilidad,
  actualizarPreferenciasAccesibilidad
} = useAccesibilidad()

const tamanoTextoSeleccionado = computed<TamanoTextoAccesible>({
  get: () => preferenciasAccesibilidad.value.tamanoTexto,
  set: value => actualizarPreferenciasAccesibilidad({ tamanoTexto: value })
})

const reducirAnimaciones = computed<boolean>({
  get: () => preferenciasAccesibilidad.value.reducirAnimaciones,
  set: value => actualizarPreferenciasAccesibilidad({ reducirAnimaciones: value })
})

const altoContraste = computed<boolean>({
  get: () => preferenciasAccesibilidad.value.altoContraste,
  set: value => actualizarPreferenciasAccesibilidad({ altoContraste: value })
})

const controlesComodos = computed<boolean>({
  get: () => preferenciasAccesibilidad.value.controlesComodos,
  set: value => actualizarPreferenciasAccesibilidad({ controlesComodos: value })
})

const mensajeValidacionPassword = computed(() => {
  if (!formularioPassword.passwordActual && !formularioPassword.passwordNueva && !formularioPassword.repetirPasswordNueva) {
    return ''
  }

  if (!formularioPassword.passwordActual) {
    return 'Debes indicar tu contraseña actual.'
  }

  if (!formularioPassword.passwordNueva) {
    return 'Debes introducir una nueva contraseña.'
  }

  const erroresPassword = validarPasswordSegura(formularioPassword.passwordNueva)
  if (erroresPassword.length > 0) {
    return erroresPassword[0]
  }

  if (formularioPassword.passwordNueva === formularioPassword.passwordActual) {
    return 'La nueva contraseña no puede ser igual a la actual.'
  }

  if (!formularioPassword.repetirPasswordNueva) {
    return 'Debes repetir la nueva contraseña.'
  }

  if (formularioPassword.passwordNueva !== formularioPassword.repetirPasswordNueva) {
    return 'La nueva contraseña y su repetición no coinciden.'
  }

  return ''
})

const cumpleRequisito = (requisito: string): boolean => {
  const texto = formularioPassword.passwordNueva

  switch (requisito) {
    case 'Al menos 8 caracteres':
      return texto.length >= 8
    case 'Una letra mayúscula':
      return /[A-ZÁÉÍÓÚÜÑ]/.test(texto)
    case 'Una letra minúscula':
      return /[a-záéíóúüñ]/.test(texto)
    case 'Un número':
      return /\d/.test(texto)
    case 'Un carácter especial':
      return /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/.test(texto)
    default:
      return false
  }
}

const irACategorias = async () => {
  await router.push('/ajustes/categorias')
}

const abrirModalPassword = () => {
  limpiarFormularioPassword()
  mostrarModalPassword.value = true
}

const cerrarModalPassword = () => {
  if (guardandoPassword.value) return
  mostrarModalPassword.value = false
  limpiarFormularioPassword()
}

const limpiarFormularioPassword = () => {
  formularioPassword.passwordActual = ''
  formularioPassword.passwordNueva = ''
  formularioPassword.repetirPasswordNueva = ''
}

const mostrarToast = async (message: string, color: 'success' | 'danger' | 'warning' = 'success') => {
  const toast = await toastController.create({
    message,
    duration: 2200,
    position: 'bottom',
    color
  })

  await toast.present()
}

const guardarNuevaPassword = async () => {
  if (mensajeValidacionPassword.value) {
    await mostrarToast(mensajeValidacionPassword.value, 'warning')
    return
  }

  try {
    guardandoPassword.value = true

    await cambiarPassword({
      passwordActual: formularioPassword.passwordActual,
      passwordNueva: formularioPassword.passwordNueva
    })

    cerrarModalPassword()
    await mostrarToast('Contraseña actualizada correctamente.', 'success')
  } catch (error: any) {
    await mostrarToast(error?.message || 'No se pudo cambiar la contraseña.', 'danger')
  } finally {
    guardandoPassword.value = false
  }
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
          await mostrarToast('Sesión cerrada correctamente.', 'success')
          await router.replace('/inicio-sesion')
        }
      }
    ]
  })

  await alert.present()
}

const cargarConfiguracionAlertas = async () => {
  try {
    cargandoAlertas.value = true
    const configuracion = await getConfiguracionUsuario()
    alertasActivas.value = configuracion.notificacionesActivas
  } catch (error: any) {
    await mostrarToast(error?.message || 'No se pudo cargar la configuración de alertas.', 'warning')
  } finally {
    cargandoAlertas.value = false
  }
}

const onToggleAlertas = async (event: CustomEvent) => {
  const siguienteValor = Boolean((event.detail as { checked?: boolean })?.checked)
  const valorAnterior = alertasActivas.value
  alertasActivas.value = siguienteValor

  try {
    actualizandoAlertas.value = true
    const resultado = await actualizarNotificacionesActivas(siguienteValor)
    alertasActivas.value = resultado.notificacionesActivas

    await mostrarToast(
      resultado.notificacionesActivas
        ? 'Alertas automáticas activadas.'
        : 'Alertas automáticas desactivadas.',
      'success'
    )
  } catch (error: any) {
    alertasActivas.value = valorAnterior
    await mostrarToast(error?.message || 'No se pudo actualizar la configuración de alertas.', 'danger')
  } finally {
    actualizandoAlertas.value = false
  }
}

onMounted(async () => {
  await cargarConfiguracionAlertas()
})
</script>

<style scoped>
.settings-wrapper {
  gap: 20px;
}

.settings-list {
  overflow: hidden;
}

.password-form-card {
  padding: 16px;
}

.topbar {
  padding: 16px 18px 18px;
}

.topbar-title {
  margin: 0;
  font-size: 1.72rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.15;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  margin: 0;
  padding: 0 2px;
  font-size: 1rem;
  font-weight: 800;
  color: #17181c;
}

.settings-row {
  width: 100%;
  border: none;
  border-bottom: 1px solid #ece8e4;
  background: #ffffff;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-align: left;
}

.settings-row:last-child {
  border-bottom: none;
}

.settings-row-control {
  cursor: default;
}

.settings-row-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.settings-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.08rem;
  flex-shrink: 0;
}

.settings-icon-accessibility,
.settings-icon-security {
  background: rgba(35, 63, 107, 0.12);
  color: #233f6b;
}

.settings-icon-accent {
  background: rgba(241, 184, 15, 0.2);
  color: #17181c;
}

.settings-icon-danger {
  background: rgba(188, 56, 56, 0.12);
  color: #bc3838;
}

.settings-row-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: #17181c;
}

.settings-row-subtitle {
  margin: 4px 0 0;
  font-size: 0.82rem;
  color: #6f7782;
  line-height: 1.35;
}

.settings-row-title-danger {
  color: #8f2727;
}

.settings-arrow {
  font-size: 1.05rem;
  color: #7c8693;
  flex-shrink: 0;
}

.settings-select {
  min-width: 118px;
  max-width: 128px;
  --placeholder-color: #233f6b;
  color: #233f6b;
  font-weight: 700;
}

.settings-toggle {
  --track-background: rgba(35, 63, 107, 0.15);
  --track-background-checked: rgba(35, 63, 107, 0.38);
  --handle-background: #ffffff;
  --handle-background-checked: #233f6b;
}

.modal-header-shell,
.modal-toolbar {
  --background: #ffffff;
  --color: #17181c;
}

.modal-content {
  --background: #f2f0ef;
}

.password-modal-body {
  max-width: 430px;
  margin: 0 auto;
  padding: 18px 16px 28px;
}

.password-item {
  --background: #f8f7f6;
  --border-radius: 16px;
  --padding-start: 14px;
  --inner-padding-end: 14px;
  --min-height: 74px;
  margin-bottom: 12px;
  border-radius: 16px;
}

.password-rules-list {
  margin: 4px 0 14px;
  padding-left: 18px;
  color: #536071;
  font-size: 0.9rem;
  line-height: 1.5;
}

.password-rules-list li + li {
  margin-top: 4px;
}

.password-rules-list li.cumplido {
  color: #1f8b4c;
  font-weight: 700;
}

.password-rules-list li.pendiente {
  color: #536071;
}

.password-validation-box {
  margin-bottom: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(188, 56, 56, 0.1);
  color: #8f2727;
  font-size: 0.9rem;
  line-height: 1.4;
}

.save-password-button {
  --background: #233f6b;
  --background-activated: #1c3257;
  --background-hover: #1c3257;
  --border-radius: 16px;
  min-height: 48px;
  font-weight: 700;
}
</style>
