<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
  toastController
} from '@ionic/vue'
import { iniciarSesion, guardarSesion } from '@/services/autenticacionService'

const router = useRouter()

const email = ref('')
const password = ref('')
const cargando = ref(false)

const formularioValido = computed(() => {
  return email.value.trim() !== '' && password.value.trim() !== ''
})

const irARegistro = async () => {
  await router.push('/registro')
}

const onIniciarSesion = async () => {
  if (!formularioValido.value || cargando.value) return

  cargando.value = true

  try {
    const respuesta = await iniciarSesion({
      email: email.value.trim(),
      password: password.value
    })

    guardarSesion(respuesta)

    const toast = await toastController.create({
      message: `Bienvenida, ${respuesta.nombre}.`,
      duration: 1800,
      position: 'bottom'
    })

    await toast.present()
    await router.replace('/inicio')
  } catch (error: any) {
    const toast = await toastController.create({
      message: error?.message || 'No se pudo iniciar sesión.',
      duration: 2500,
      position: 'bottom',
      color: 'danger'
    })

    await toast.present()
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <ion-page>
    <ion-content :fullscreen="true" class="pagina-autenticacion">
      <div class="contenedor">
        <section class="cabecera">
          <div class="marca">
            <h1>FinMind</h1>
            <p>Entiende tu dinero, toma mejores decisiones</p>
          </div>
        </section>

        <section class="tarjeta-formulario">
          <div class="formulario">
            <ion-input
              v-model="email"
              type="email"
              fill="outline"
              label-placement="stacked"
              placeholder="Correo electrónico"
              class="campo"
            />

            <ion-input
              v-model="password"
              type="password"
              fill="outline"
              label-placement="stacked"
              placeholder="Contraseña"
              class="campo"
            />

            <ion-button
              expand="block"
              class="boton-principal"
              :disabled="!formularioValido || cargando"
              @click="onIniciarSesion"
            >
              <template v-if="!cargando">
                Iniciar sesión
              </template>
              <template v-else>
                <ion-spinner name="crescent" />
              </template>
            </ion-button>

            <div class="pie-formulario">
              <ion-text color="medium">
                ¿No tienes una cuenta?
              </ion-text>
              <button type="button" class="enlace-texto" @click="irARegistro">
                Crear una cuenta
              </button>
            </div>
          </div>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.pagina-autenticacion {
  --background: #f2f0ef;
}

.contenedor {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.cabecera {
  background: #233f6b;
  min-height: 230px;
  padding: 56px 24px 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.marca {
  text-align: center;
  color: #ffffff;
}

.marca h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.marca p {
  margin: 10px 0 0;
  font-size: 0.95rem;
  opacity: 0.95;
}

.tarjeta-formulario {
  flex: 1;
  margin-top: -22px;
  background: #f8f7f6;
  border-top-left-radius: 26px;
  border-top-right-radius: 26px;
  padding: 28px 22px 36px;
}

.formulario {
  max-width: 420px;
  margin: 0 auto;
}

.campo {
  --background: #ffffff;
  --border-radius: 14px;
  --padding-start: 14px;
  --padding-end: 14px;
  margin-bottom: 14px;
}

.boton-principal {
  margin-top: 8px;
  --background: #233f6b;
  --background-hover: #233f6b;
  --background-activated: #233f6b;
  --border-radius: 14px;
  --box-shadow: none;
  font-weight: 600;
  min-height: 48px;
}

.pie-formulario {
  margin-top: 18px;
  text-align: center;
  font-size: 0.92rem;
}

.enlace-texto {
  margin-left: 6px;
  background: transparent;
  border: none;
  padding: 0;
  color: #f1b80f;
  font-weight: 600;
  cursor: pointer;
}

.enlace-texto:active {
  opacity: 0.8;
}
</style>