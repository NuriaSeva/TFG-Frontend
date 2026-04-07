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
import { registrarUsuario, guardarSesion } from '@/services/autenticacionService'

const router = useRouter()

const nombre = ref('')
const apellidos = ref('')
const email = ref('')
const password = ref('')
const repetirPassword = ref('')
const cargando = ref(false)

const passwordsCoinciden = computed(() => {
  return password.value !== '' && password.value === repetirPassword.value
})

const formularioValido = computed(() => {
  return (
    nombre.value.trim() !== '' &&
    email.value.trim() !== '' &&
    password.value.trim() !== '' &&
    repetirPassword.value.trim() !== '' &&
    passwordsCoinciden.value
  )
})

const irAInicioSesion = async () => {
  await router.push('/inicio-sesion')
}

const onRegistrar = async () => {
  if (!formularioValido.value || cargando.value) return

  cargando.value = true

  try {
    const respuesta = await registrarUsuario({
      nombre: nombre.value.trim(),
      apellidos: apellidos.value.trim() || null,
      email: email.value.trim(),
      password: password.value
    })

    guardarSesion(respuesta)

    const toast = await toastController.create({
      message: 'Cuenta creada correctamente.',
      duration: 1800,
      position: 'bottom'
    })

    await toast.present()
    await router.replace('/inicio')
  } catch (error: any) {
    const toast = await toastController.create({
      message: error?.message || 'No se pudo completar el registro.',
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

<template>
  <ion-page>
    <ion-content :fullscreen="true" class="pagina-autenticacion">
      <div class="contenedor">
        <section class="cabecera">
          <div class="marca">
            <h1>Crear cuenta</h1>
            <p>Empieza a organizar tus finanzas desde el móvil</p>
          </div>
        </section>

        <section class="tarjeta-formulario">
          <div class="formulario">
            <ion-input
              v-model="nombre"
              type="text"
              fill="outline"
              placeholder="Nombre"
              class="campo"
            />

            <ion-input
              v-model="apellidos"
              type="text"
              fill="outline"
              placeholder="Apellidos"
              class="campo"
            />

            <ion-input
              v-model="email"
              type="email"
              fill="outline"
              placeholder="Correo electrónico"
              class="campo"
            />

            <ion-input
              v-model="password"
              type="password"
              fill="outline"
              placeholder="Contraseña"
              class="campo"
            />

            <ion-input
              v-model="repetirPassword"
              type="password"
              fill="outline"
              placeholder="Repetir contraseña"
              class="campo"
            />

            <ion-text v-if="repetirPassword && !passwordsCoinciden" color="danger" class="texto-ayuda">
              Las contraseñas no coinciden.
            </ion-text>

            <ion-button
              expand="block"
              class="boton-principal"
              :disabled="!formularioValido || cargando"
              @click="onRegistrar"
            >
              <template v-if="!cargando">
                Registrarse
              </template>
              <template v-else>
                <ion-spinner name="crescent" />
              </template>
            </ion-button>

            <div class="pie-formulario">
              <ion-text color="medium">
                ¿Ya tienes cuenta?
              </ion-text>
              <button type="button" class="enlace-texto" @click="irAInicioSesion">
                Inicia sesión
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
  min-height: 220px;
  padding: 48px 24px 32px;
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
  font-size: 1.85rem;
  font-weight: 700;
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
  padding: 26px 22px 36px;
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

.texto-ayuda {
  display: block;
  margin: -2px 0 8px;
  font-size: 0.88rem;
}

.boton-principal {
  margin-top: 8px;
  --background: #f1b80f;
  --background-hover: #f1b80f;
  --background-activated: #f1b80f;
  --color: #1b1b1f;
  --border-radius: 14px;
  --box-shadow: none;
  font-weight: 700;
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
  color: #233f6b;
  font-weight: 700;
  cursor: pointer;
}

.enlace-texto:active {
  opacity: 0.8;
}
</style>