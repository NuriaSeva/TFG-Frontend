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
              Debes actualizar tu contrasena temporal para continuar.
            </p>

            <ion-input
              v-model="passwordActual"
              type="password"
              fill="outline"
              label-placement="stacked"
              placeholder="Contrasena actual (temporal)"
              class="campo"
            />

            <ion-input
              v-model="passwordNueva"
              type="password"
              fill="outline"
              label-placement="stacked"
              placeholder="Nueva contrasena"
              class="campo"
            />

            <ion-input
              v-model="passwordNueva2"
              type="password"
              fill="outline"
              label-placement="stacked"
              placeholder="Repetir nueva contrasena"
              class="campo"
            />

            <ul class="password-rules-list" aria-label="Requisitos de la nueva contrasena">
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
  IonSpinner,
  toastController
} from '@ionic/vue'
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
const cargando = ref(false)

const mensajeValidacionPassword = computed(() => {
  if (!passwordActual.value && !passwordNueva.value && !passwordNueva2.value) {
    return ''
  }

  if (!passwordActual.value) {
    return 'Debes indicar tu contrasena actual.'
  }

  if (!passwordNueva.value) {
    return 'Debes introducir una nueva contrasena.'
  }

  const erroresPassword = validarPasswordSegura(passwordNueva.value)
  if (erroresPassword.length > 0) {
    return erroresPassword[0]
  }

  if (passwordNueva.value === passwordActual.value) {
    return 'La nueva contrasena no puede ser igual a la actual.'
  }

  if (!passwordNueva2.value) {
    return 'Debes repetir la nueva contrasena.'
  }

  if (passwordNueva.value !== passwordNueva2.value) {
    return 'La nueva contrasena y su repeticion no coinciden.'
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
      message: 'Contrasena actualizada. Inicia sesion de nuevo.',
      duration: 2200,
      position: 'bottom',
      color: 'success'
    })
    await toast.present()

    await router.replace('/inicio-sesion')
  } catch (error: any) {
    const toast = await toastController.create({
      message: error?.message || 'No se pudo actualizar la contrasena.',
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
