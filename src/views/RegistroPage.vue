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
import {
  REQUISITOS_PASSWORD,
  registrarUsuario,
  guardarSesion,
  validarPasswordSegura
} from '@/services/autenticacionService'

const router = useRouter()

const nombre = ref('')
const apellidos = ref('')
const email = ref('')
const password = ref('')
const repetirPassword = ref('')
const cargando = ref(false)

const erroresPassword = computed(() => {
  if (!password.value) return []
  return validarPasswordSegura(password.value)
})

const passwordSegura = computed(() => {
  return password.value !== '' && erroresPassword.value.length === 0
})

const passwordsCoinciden = computed(() => {
  return password.value !== '' && password.value === repetirPassword.value
})

const formularioValido = computed(() => {
  return (
    nombre.value.trim() !== '' &&
    email.value.trim() !== '' &&
    password.value.trim() !== '' &&
    repetirPassword.value.trim() !== '' &&
    passwordSegura.value &&
    passwordsCoinciden.value
  )
})

const cumpleRequisito = (requisito: string): boolean => {
  const texto = password.value

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
      duration: 2800,
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

            <div v-if="password" class="password-box">
              <p class="password-box-title">La contraseña debe incluir:</p>
              <ul class="password-rules-list">
                <li
                  v-for="requisito in REQUISITOS_PASSWORD"
                  :key="requisito"
                  :class="cumpleRequisito(requisito) ? 'cumplido' : 'pendiente'"
                >
                  {{ requisito }}
                </li>
              </ul>
            </div>

            <ion-input
              v-model="repetirPassword"
              type="password"
              fill="outline"
              placeholder="Repetir contraseña"
              class="campo"
            />

            <ion-text
              v-if="password && !passwordSegura"
              color="danger"
              class="texto-ayuda"
            >
              {{ erroresPassword[0] }}
            </ion-text>

            <ion-text
              v-if="repetirPassword && !passwordsCoinciden"
              color="danger"
              class="texto-ayuda"
            >
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
.cabecera {
  min-height: 220px;
  padding: 48px 24px 32px;
}

.marca h1 {
  margin: 0;
  font-size: 1.85rem;
  font-weight: 700;
}

.tarjeta-formulario {
  padding: 26px 22px 36px;
}

.password-box {
  background: #ffffff;
  border: 1px solid rgba(36, 58, 94, 0.12);
  border-radius: 16px;
  padding: 14px 14px 10px;
  margin: -2px 0 14px;
}

.password-box-title {
  margin: 0 0 10px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--finmind-color-primary);
}

.password-rules-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.password-rules-list li {
  font-size: 0.88rem;
  line-height: 1.35;
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-rules-list li::before {
  content: '•';
  font-size: 1rem;
}

.password-rules-list li.cumplido {
  color: #127a3f;
}

.password-rules-list li.pendiente {
  color: #8a2432;
}

.texto-ayuda {
  display: block;
  margin: -2px 0 8px;
  font-size: 0.88rem;
}

.boton-principal {
  margin-top: 8px;
  --background: var(--finmind-color-accent);
  --background-hover: var(--finmind-color-accent);
  --background-activated: var(--finmind-color-accent);
  --color: #1b1b1f;
  --border-radius: 14px;
  --box-shadow: none;
  font-weight: 700;
  min-height: 48px;
}

.enlace-texto {
  color: var(--finmind-color-primary);
}
</style>
