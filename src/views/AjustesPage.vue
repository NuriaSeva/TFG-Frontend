<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <div class="topbar">
          <div>
            <h1 class="topbar-title">Ajustes</h1>
          </div>

          <div class="header-spacer" aria-hidden="true"></div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="settings-content">
      <div class="page-shell">
        <div class="settings-wrapper">
          <section class="settings-section">
            <h2 class="section-title">Cuenta y seguridad</h2>
            <div class="settings-list">
              <button class="settings-row" type="button" @click="abrirModalPerfil">
                <div class="settings-row-left">
                  <div class="settings-icon settings-icon-security">
                    <ion-icon :icon="personOutline" />
                  </div>
                  <span class="settings-row-title">Perfil</span>
                </div>
                <ion-icon :icon="chevronForwardOutline" class="settings-arrow" />
              </button>
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

          <section v-if="esAdmin" class="settings-section">
            <h2 class="section-title">AdministraciÃ³n</h2>

            <div class="settings-list">
              <button class="settings-row" type="button" @click="irAPanelAdmin">
                <div class="settings-row-left">
                  <div class="settings-icon settings-icon-security">
                    <ion-icon :icon="shieldCheckmarkOutline" />
                  </div>
                  <span class="settings-row-title">Panel admin</span>
                </div>

                <ion-icon :icon="chevronForwardOutline" class="settings-arrow" />
              </button>
            </div>
          </section>

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
                    <span class="settings-row-title">Alertas</span>
                  </div>
                </div>

                <ion-toggle
                  :checked="alertasActivas"
                  class="settings-toggle"
                  aria-label="Activar alertas automÃ¡ticas"
                  :disabled="cargandoAlertas || actualizandoAlertas"
                  @ionChange="onToggleAlertas"
                />
              </div>

              <div class="settings-row settings-row-control">
                <div class="settings-row-left">
                  <div class="settings-icon settings-icon-security">
                    <ion-icon :icon="notificationsOutline" />
                  </div>
                  <div>
                    <span class="settings-row-title">Modo de avisos</span>
                  </div>
                </div>

                <ion-select
                  :model-value="modoAvisos"
                  interface="popover"
                  class="settings-select"
                  aria-label="Seleccionar modo de avisos"
                  :disabled="cargandoAlertas || actualizandoAlertas || !alertasActivas"
                  @ionChange="onCambioModoAvisos"
                >
                  <ion-select-option value="todas">Todas</ion-select-option>
                  <ion-select-option value="solo-criticas">Solo criticas</ion-select-option>
                </ion-select>
              </div>
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
                <ion-label position="stacked">contraseña actual</ion-label>
                <ion-input
                  v-model="formularioPassword.passwordActual"
                  :type="mostrarPasswordActual ? 'text' : 'password'"
                  placeholder="Introduce tu contraseña actual"
                />
                <button
                  type="button"
                  class="password-toggle-inline"
                  :aria-label="mostrarPasswordActual ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'"
                  @click.stop="mostrarPasswordActual = !mostrarPasswordActual"
                >
                  <ion-icon :icon="mostrarPasswordActual ? eyeOffOutline : eyeOutline" />
                </button>
              </ion-item>

              <ion-item lines="none" class="password-item">
                <ion-label position="stacked">Nueva contraseña</ion-label>
                <ion-input
                  v-model="formularioPassword.passwordNueva"
                  :type="mostrarPasswordNueva ? 'text' : 'password'"
                  placeholder="Introduce la nueva contraseña"
                />
                <button
                  type="button"
                  class="password-toggle-inline"
                  :aria-label="mostrarPasswordNueva ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'"
                  @click.stop="mostrarPasswordNueva = !mostrarPasswordNueva"
                >
                  <ion-icon :icon="mostrarPasswordNueva ? eyeOffOutline : eyeOutline" />
                </button>
              </ion-item>

              <ion-item lines="none" class="password-item">
                <ion-label position="stacked">Repetir nueva contraseña</ion-label>
                <ion-input
                  v-model="formularioPassword.repetirPasswordNueva"
                  :type="mostrarPasswordRepetida ? 'text' : 'password'"
                  placeholder="Repite la nueva contraseña"
                />
                <button
                  type="button"
                  class="password-toggle-inline"
                  :aria-label="mostrarPasswordRepetida ? 'Ocultar repeticion de contraseña' : 'Mostrar repeticion de contraseña'"
                  @click.stop="mostrarPasswordRepetida = !mostrarPasswordRepetida"
                >
                  <ion-icon :icon="mostrarPasswordRepetida ? eyeOffOutline : eyeOutline" />
                </button>
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

      <ion-modal :is-open="mostrarModalPerfil" @didDismiss="cerrarModalPerfil">
        <ion-header class="ion-no-border modal-header-shell">
          <ion-toolbar class="modal-toolbar">
            <ion-title>Editar perfil</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="cerrarModalPerfil">Cerrar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="modal-content">
          <div class="password-modal-body">
            <div class="password-form-card">
              <ion-item lines="none" class="profile-item">
                <ion-label position="stacked">Correo electrónico</ion-label>
                <ion-input
                  :value="formularioPerfil.email"
                  readonly
                  disabled
                  placeholder="No disponible"
                />
              </ion-item>
              <ion-item lines="none" class="profile-item">
                <ion-label position="stacked">Nombre</ion-label>
                <ion-input
                  v-model="formularioPerfil.nombre"
                  placeholder="Tu nombre"
                  :disabled="cargandoPerfil || guardandoPerfil"
                />
              </ion-item>
              <ion-item lines="none" class="profile-item">
                <ion-label position="stacked">Apellidos</ion-label>
                <ion-input
                  v-model="formularioPerfil.apellidos"
                  placeholder="Tus apellidos"
                  :disabled="cargandoPerfil || guardandoPerfil"
                />
              </ion-item>
              <div v-if="mensajeValidacionPerfil" class="profile-validation-box">
                {{ mensajeValidacionPerfil }}
              </div>
              <ion-button
                expand="block"
                class="profile-save-button"
                :disabled="cargandoPerfil || guardandoPerfil"
                @click="guardarPerfilUsuario"
              >
                {{
                  cargandoPerfil
                    ? 'Cargando perfil...'
                    : guardandoPerfil
                      ? 'Guardando...'
                      : 'Guardar cambios de perfil'
                }}
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
  personOutline,
  textOutline,
  removeCircleOutline,
  eyeOutline,
  eyeOffOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  REQUISITOS_PASSWORD,
  cambiarPassword,
  cerrarSesion,
  esUsuarioAdmin,
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
import {
  actualizarPerfilUsuario,
  getPerfilUsuario
} from '@/services/perfilUsuarioService'

const router = useRouter()
const mostrarModalPassword = ref(false)
const mostrarModalPerfil = ref(false)
const guardandoPassword = ref(false)
const mostrarPasswordActual = ref(false)
const mostrarPasswordNueva = ref(false)
const mostrarPasswordRepetida = ref(false)
const alertasActivas = ref(true)
const notificacionesSoloCriticas = ref(false)
const cargandoAlertas = ref(false)
const actualizandoAlertas = ref(false)
const cargandoPerfil = ref(false)
const guardandoPerfil = ref(false)

const formularioPassword = reactive({
  passwordActual: '',
  passwordNueva: '',
  repetirPasswordNueva: ''
})

const formularioPerfil = reactive({
  email: '',
  nombre: '',
  apellidos: '',
  monedaPreferida: 'EUR',
  idioma: 'es'
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

const modoAvisos = computed<'todas' | 'solo-criticas'>(() =>
  notificacionesSoloCriticas.value ? 'solo-criticas' : 'todas'
)

const esAdmin = computed(() => esUsuarioAdmin())

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
    return 'La nueva contraseña y su repeticiÃ³n no coinciden.'
  }

  return ''
})

const mensajeValidacionPerfil = computed(() => {
  const nombre = formularioPerfil.nombre.trim()
  const apellidos = formularioPerfil.apellidos.trim()

  if (!nombre) {
    return 'El nombre es obligatorio.'
  }

  if (nombre.length < 2) {
    return 'El nombre debe tener al menos 2 caracteres.'
  }

  if (nombre.length > 80) {
    return 'El nombre no puede superar los 80 caracteres.'
  }

  if (apellidos.length > 120) {
    return 'Los apellidos no pueden superar los 120 caracteres.'
  }

  return ''
})

const cumpleRequisito = (requisito: string): boolean => {
  const texto = formularioPassword.passwordNueva

  switch (requisito) {
    case 'Al menos 8 caracteres':
      return texto.length >= 8
    case 'Una letra mayÃºscula':
      return /[A-ZÃÃ‰ÃÃ“ÃšÃœÃ‘]/.test(texto)
    case 'Una letra minÃºscula':
      return /[a-zÃ¡Ã©Ã­Ã³ÃºÃ¼Ã±]/.test(texto)
    case 'Un nÃºmero':
      return /\d/.test(texto)
    case 'Un carÃ¡cter especial':
      return /[^A-Za-zÃÃ‰ÃÃ“ÃšÃœÃ‘Ã¡Ã©Ã­Ã³ÃºÃ¼Ã±0-9]/.test(texto)
    default:
      return false
  }
}

const irACategorias = async () => {
  await router.push('/ajustes/categorias')
}

const irAPanelAdmin = async () => {
  await router.push('/admin')
}

const abrirModalPassword = () => {
  limpiarFormularioPassword()
  mostrarModalPassword.value = true
}

const abrirModalPerfil = async () => {
  mostrarModalPerfil.value = true
  await cargarPerfilUsuario()
}

const cerrarModalPerfil = () => {
  if (guardandoPerfil.value) return
  mostrarModalPerfil.value = false
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
  mostrarPasswordActual.value = false
  mostrarPasswordNueva.value = false
  mostrarPasswordRepetida.value = false
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
    await mostrarToast('contraseña actualizada correctamente.', 'success')
  } catch (error: any) {
    await mostrarToast(error?.message || 'No hemos podido cambiar la contraseña.', 'danger')
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
    notificacionesSoloCriticas.value = configuracion.notificacionesSoloCriticas ?? false
  } catch (error: any) {
    await mostrarToast(error?.message || 'No hemos podido cargar la configuración de avisos.', 'warning')
  } finally {
    cargandoAlertas.value = false
  }
}

const cargarPerfilUsuario = async () => {
  try {
    cargandoPerfil.value = true
    const perfil = await getPerfilUsuario()

    formularioPerfil.email = perfil.email ?? ''
    formularioPerfil.nombre = perfil.nombre ?? ''
    formularioPerfil.apellidos = perfil.apellidos ?? ''
    formularioPerfil.monedaPreferida = perfil.monedaPreferida ?? 'EUR'
    formularioPerfil.idioma = perfil.idioma ?? 'es'
  } catch (error: any) {
    await mostrarToast(error?.message || 'No hemos podido cargar tu perfil.', 'warning')
  } finally {
    cargandoPerfil.value = false
  }
}

const guardarPerfilUsuario = async () => {
  if (mensajeValidacionPerfil.value) {
    await mostrarToast(mensajeValidacionPerfil.value, 'warning')
    return
  }

  try {
    guardandoPerfil.value = true

    const perfilActualizado = await actualizarPerfilUsuario({
      nombre: formularioPerfil.nombre.trim(),
      apellidos: formularioPerfil.apellidos.trim() || null,
      monedaPreferida: formularioPerfil.monedaPreferida,
      idioma: formularioPerfil.idioma
    })

    formularioPerfil.email = perfilActualizado.email ?? formularioPerfil.email
    formularioPerfil.nombre = perfilActualizado.nombre ?? formularioPerfil.nombre
    formularioPerfil.apellidos = perfilActualizado.apellidos ?? ''
    formularioPerfil.monedaPreferida = perfilActualizado.monedaPreferida ?? formularioPerfil.monedaPreferida
    formularioPerfil.idioma = perfilActualizado.idioma ?? formularioPerfil.idioma

    cerrarModalPerfil()
    await mostrarToast('Perfil actualizado correctamente.', 'success')
  } catch (error: any) {
    await mostrarToast(error?.message || 'No hemos podido guardar tu perfil.', 'danger')
  } finally {
    guardandoPerfil.value = false
  }
}

const onToggleAlertas = async (event: CustomEvent) => {
  const siguienteValor = Boolean((event.detail as { checked?: boolean })?.checked)
  const valorAnterior = alertasActivas.value
  alertasActivas.value = siguienteValor

  try {
    actualizandoAlertas.value = true
    const resultado = await actualizarNotificacionesActivas(
      siguienteValor,
      notificacionesSoloCriticas.value
    )
    alertasActivas.value = resultado.notificacionesActivas
    notificacionesSoloCriticas.value = resultado.notificacionesSoloCriticas ?? false

    await mostrarToast(
      resultado.notificacionesActivas
        ? 'Alertas automáticas activadas.'
        : 'Alertas automáticas desactivadas.',
      'success'
    )
  } catch (error: any) {
    alertasActivas.value = valorAnterior
    await mostrarToast(error?.message || 'No hemos podido guardar la configuración de avisos.', 'danger')
  } finally {
    actualizandoAlertas.value = false
  }
}

const onCambioModoAvisos = async (event: CustomEvent) => {
  const siguienteModo = String((event.detail as { value?: string })?.value ?? 'todas')
  const siguienteSoloCriticas = siguienteModo === 'solo-criticas'
  const valorAnterior = notificacionesSoloCriticas.value
  notificacionesSoloCriticas.value = siguienteSoloCriticas

  try {
    actualizandoAlertas.value = true
    const resultado = await actualizarNotificacionesActivas(
      alertasActivas.value,
      siguienteSoloCriticas
    )
    alertasActivas.value = resultado.notificacionesActivas
    notificacionesSoloCriticas.value = resultado.notificacionesSoloCriticas ?? false

    await mostrarToast(
      notificacionesSoloCriticas.value ? 'Modo de avisos: solo criticas.' : 'Modo de avisos: todas.',
      'success'
    )
  } catch (error: any) {
    notificacionesSoloCriticas.value = valorAnterior
    await mostrarToast(error?.message || 'No hemos podido guardar el modo de avisos.', 'danger')
  } finally {
    actualizandoAlertas.value = false
  }
}
onMounted(async () => {
  await Promise.all([
    cargarConfiguracionAlertas(),
    cargarPerfilUsuario()
  ])
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

.header-spacer {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
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

.profile-item {
  --background: #f8f7f6;
  --border-radius: 16px;
  --padding-start: 14px;
  --inner-padding-end: 14px;
  --min-height: 74px;
  margin-bottom: 12px;
  border-radius: 16px;
}

.profile-item:last-of-type {
  margin-bottom: 10px;
}

.profile-validation-box {
  margin-bottom: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(188, 56, 56, 0.1);
  color: #8f2727;
  font-size: 0.9rem;
  line-height: 1.4;
}

.profile-save-button {
  --background: #233f6b;
  --background-activated: #1c3257;
  --background-hover: #1c3257;
  --border-radius: 16px;
  min-height: 48px;
  font-weight: 700;
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
  position: relative;
}

.password-item ion-input {
  --padding-end: 40px;
}

.password-toggle-inline {
  position: absolute;
  right: 12px;
  top: 44px;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: #46658f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  z-index: 3;
  pointer-events: auto;
  touch-action: manipulation;
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





