<template>
  <ion-page>
    <ion-header class="ion-no-border forced-header-shell">
      <ion-toolbar class="forced-toolbar">
        <ion-title>Cambio obligatorio</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="settings-content">
      <div class="page-shell">
        <section class="forced-wrapper">
          <article class="forced-card">
            <p class="forced-subtitle">
              Debes actualizar tu contraseña temporal para continuar.
            </p>

            <div class="campo-password">
              <ion-input
                v-model="passwordActual"
                :type="mostrarPasswordActual ? 'text' : 'password'"
                fill="outline"
                label-placement="stacked"
                placeholder="contraseña actual (temporal)"
                class="campo"
              />
              <button
                type="button"
                class="password-toggle"
                :aria-label="mostrarPasswordActual ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'"
                @click.stop="mostrarPasswordActual = !mostrarPasswordActual"
              >
                <ion-icon :icon="mostrarPasswordActual ? eyeOffOutline : eyeOutline" />
              </button>
            </div>

            <div class="campo-password">
              <ion-input
                v-model="passwordNueva"
                :type="mostrarPasswordNueva ? 'text' : 'password'"
                fill="outline"
                label-placement="stacked"
                placeholder="Nueva contraseña"
                class="campo"
              />
              <button
                type="button"
                class="password-toggle"
                :aria-label="mostrarPasswordNueva ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'"
                @click.stop="mostrarPasswordNueva = !mostrarPasswordNueva"
              >
                <ion-icon :icon="mostrarPasswordNueva ? eyeOffOutline : eyeOutline" />
              </button>
            </div>

            <div class="campo-password">
              <ion-input
                v-model="passwordNueva2"
                :type="mostrarPasswordNueva2 ? 'text' : 'password'"
                fill="outline"
                label-placement="stacked"
                placeholder="Repetir nueva contraseña"
                class="campo"
              />
              <button
                type="button"
                class="password-toggle"
                :aria-label="mostrarPasswordNueva2 ? 'Ocultar repetición de contraseña' : 'Mostrar repetición de contraseña'"
                @click.stop="mostrarPasswordNueva2 = !mostrarPasswordNueva2"
              >
                <ion-icon :icon="mostrarPasswordNueva2 ? eyeOffOutline : eyeOutline" />
              </button>
            </div>

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
              class="boton-principal"
              :disabled="Boolean(mensajeValidacionPassword) || cargando"
              @click="onCambiarPassword"
            >
              <template v-if="!cargando">Guardar y continuar</template>
              <template v-else><ion-spinner name="crescent" /></template>
            </ion-button>
          </article>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  toastController
} from '@ionic/vue'
import { eyeOffOutline, eyeOutline } from 'ionicons/icons'
import {
  REQUISITOS_PASSWORD,
  cambiarPassword,
  cerrarSesion,
  validarPasswordSegura
} from '@/services/autenticacionService'

const router = useRouter()
const passwordActual = ref('')
const passwordNueva = ref('')
const passwordNueva2 = ref('')
const mostrarPasswordActual = ref(false)
const mostrarPasswordNueva = ref(false)
const mostrarPasswordNueva2 = ref(false)
const cargando = ref(false)

const mensajeValidacionPassword = computed(() => {
  if (!passwordActual.value && !passwordNueva.value && !passwordNueva2.value) {
    return ''
  }

  if (!passwordActual.value) {
    return 'Debes indicar tu contraseña actual.'
  }

  if (!passwordNueva.value) {
    return 'Debes introducir una nueva contraseña.'
  }

  const erroresPassword = validarPasswordSegura(passwordNueva.value)
  if (erroresPassword.length > 0) {
    return erroresPassword[0]
  }

  if (passwordNueva.value === passwordActual.value) {
    return 'La nueva contraseña no puede ser igual a la actual.'
  }

  if (!passwordNueva2.value) {
    return 'Debes repetir la nueva contraseña.'
  }

  if (passwordNueva.value !== passwordNueva2.value) {
    return 'La nueva contraseña y su repeticion no coinciden.'
  }

  return ''
})

const cumpleRequisito = (requisito: string): boolean => {
  const texto = passwordNueva.value

  switch (requisito) {
    case 'Al menos 8 caracteres':
      return texto.length >= 8
    case 'Una letra mayuscula':
      return /[A-Z]/.test(texto)
    case 'Una letra minuscula':
      return /[a-z]/.test(texto)
    case 'Un numero':
      return /\d/.test(texto)
    case 'Un caracter especial':
      return /[^A-Za-z0-9]/.test(texto)
    default:
      return false
  }
}

const onCambiarPassword = async () => {
  if (mensajeValidacionPassword.value || cargando.value) return

  cargando.value = true
  try {
    await cambiarPassword({
      passwordActual: passwordActual.value,
      passwordNueva: passwordNueva.value
    })

    await cerrarSesion()

    const toast = await toastController.create({
      message: 'contraseña actualizada. Inicia sesión de nuevo.',
      duration: 2200,
      position: 'bottom',
      color: 'success'
    })
    await toast.present()

    await router.replace('/inicio-sesion')
  } catch (error: any) {
    const toast = await toastController.create({
      message: error?.message || 'No se pudo actualizar la contraseña.',
      duration: 2600,
      position: 'bottom',
      color: 'danger'
    })
    await toast.present()
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.forced-header-shell {
  box-shadow: none;
}

.forced-toolbar {
  --background: #243a5e;
  --color: #ffffff;
  --min-height: 92px;
  --padding-top: max(env(safe-area-inset-top), 10px);
}

.forced-wrapper {
  width: 100%;
  max-width: 430px;
  padding: 16px;
}

.forced-card {
  background: #ffffff;
  border: 1px solid #dfe7f1;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 8px 18px rgba(17, 44, 78, 0.06);
}

.forced-subtitle {
  margin: 0 0 12px;
  color: #51637c;
  font-size: 0.88rem;
}

.campo {
  margin-bottom: 12px;
}

.campo-password {
  position: relative;
}

.campo-password .campo {
  --padding-end: 44px;
  margin-bottom: 12px;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
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
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
}

.password-rules-list li + li {
  margin-top: 6px;
}

.password-rules-list li.cumplido {
  color: #1f8b4c;
  font-weight: 600;
}

.password-rules-list li.pendiente {
  color: #6b7d95;
}

.password-validation-box {
  border: 1px solid #f3cccf;
  background: #fff4f5;
  color: #8f2727;
  border-radius: 12px;
  padding: 10px;
  font-size: 0.82rem;
  margin-bottom: 10px;
}

.boton-principal {
  margin-top: 2px;
  --background: var(--finmind-color-primary);
  --background-hover: var(--finmind-color-primary);
  --background-activated: var(--finmind-color-primary);
  --border-radius: 12px;
  --box-shadow: none;
  font-weight: 600;
  min-height: 46px;
}
</style>
