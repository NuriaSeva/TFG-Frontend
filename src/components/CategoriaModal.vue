<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonText,
  IonIcon
} from '@ionic/vue'
import {
  walletOutline,
  restaurantOutline,
  carOutline,
  homeOutline,
  cartOutline,
  medicalOutline,
  giftOutline,
  airplaneOutline,
  schoolOutline,
  fitnessOutline,
  gameControllerOutline,
  cashOutline,
  cafeOutline,
  fastFoodOutline,
  filmOutline,
  pawOutline,
  phonePortraitOutline,
  constructOutline,
  bedOutline,
  musicalNotesOutline,
  shirtOutline,
  storefrontOutline,
  heartOutline,
  chevronDownOutline,
  chevronUpOutline
} from 'ionicons/icons'

export interface CategoriaFormulario {
  nombre: string
  tipo: number
  color?: string | null
  icono?: string | null
  esSistema: boolean
  archivada: boolean
}

const props = defineProps<{
  abierto: boolean
  modo: 'crear' | 'editar'
  categoriaInicial?: CategoriaFormulario | null
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardar', value: CategoriaFormulario): void
}>()

const COLOR_OPTIONS = [
  '#233f6b',
  '#f1b80f',
  '#198754',
  '#dc3545',
  '#6f42c1',
  '#fd7e14',
  '#20c997',
  '#0d6efd',
  '#e83e8c',
  '#6c757d',
  '#14b8a6',
  '#8b5cf6'
]

const ICON_OPTIONS = [
  { value: 'wallet-outline', icon: walletOutline },
  { value: 'restaurant-outline', icon: restaurantOutline },
  { value: 'cafe-outline', icon: cafeOutline },
  { value: 'fast-food-outline', icon: fastFoodOutline },
  { value: 'car-outline', icon: carOutline },
  { value: 'home-outline', icon: homeOutline },
  { value: 'cart-outline', icon: cartOutline },
  { value: 'medical-outline', icon: medicalOutline },
  { value: 'gift-outline', icon: giftOutline },
  { value: 'airplane-outline', icon: airplaneOutline },
  { value: 'school-outline', icon: schoolOutline },
  { value: 'fitness-outline', icon: fitnessOutline },
  { value: 'game-controller-outline', icon: gameControllerOutline },
  { value: 'cash-outline', icon: cashOutline },
  { value: 'film-outline', icon: filmOutline },
  { value: 'paw-outline', icon: pawOutline },
  { value: 'phone-portrait-outline', icon: phonePortraitOutline },
  { value: 'construct-outline', icon: constructOutline },
  { value: 'bed-outline', icon: bedOutline },
  { value: 'musical-notes-outline', icon: musicalNotesOutline },
  { value: 'shirt-outline', icon: shirtOutline },
  { value: 'storefront-outline', icon: storefrontOutline },
  { value: 'heart-outline', icon: heartOutline }
]

const DEFAULT_COLOR = COLOR_OPTIONS[0]
const DEFAULT_ICON = ICON_OPTIONS[0].value

const formulario = reactive<CategoriaFormulario>({
  nombre: '',
  tipo: 2,
  color: DEFAULT_COLOR,
  icono: DEFAULT_ICON,
  esSistema: false,
  archivada: false
})

const mostrarColores = ref(false)
const mostrarIconos = ref(false)

watch(
  () => props.categoriaInicial,
  value => {
    formulario.nombre = value?.nombre ?? ''
    formulario.tipo = value?.tipo ?? 2
    formulario.color = value?.color ?? DEFAULT_COLOR
    formulario.icono = value?.icono ?? DEFAULT_ICON
    formulario.esSistema = value?.esSistema ?? false
    formulario.archivada = value?.archivada ?? false
  },
  { immediate: true }
)

watch(
  () => props.abierto,
  abierta => {
    if (abierta) {
      mostrarColores.value = false
      mostrarIconos.value = false
    }
  }
)

const titulo = computed(() =>
  props.modo === 'crear' ? 'Nueva categoría' : 'Editar categoría'
)

const formularioValido = computed(() => formulario.nombre.trim().length > 0)

const iconoSeleccionado = computed(
  () => ICON_OPTIONS.find(icono => icono.value === formulario.icono) ?? ICON_OPTIONS[0]
)

const onCerrar = () => {
  emit('cerrar')
}

const toggleColores = () => {
  mostrarColores.value = !mostrarColores.value
}

const toggleIconos = () => {
  mostrarIconos.value = !mostrarIconos.value
}

const seleccionarColor = (color: string) => {
  formulario.color = color
  mostrarColores.value = false
}

const seleccionarIcono = (icono: string) => {
  formulario.icono = icono
  mostrarIconos.value = false
}

const onGuardar = () => {
  if (!formularioValido.value) return

  emit('guardar', {
    nombre: formulario.nombre.trim(),
    tipo: formulario.tipo,
    color: formulario.color?.trim() || DEFAULT_COLOR,
    icono: formulario.icono?.trim() || DEFAULT_ICON,
    esSistema: formulario.esSistema,
    archivada: formulario.archivada
  })
}
</script>

<template>
  <ion-modal class="finmind-form-modal" :is-open="abierto" @didDismiss="onCerrar">
    <ion-header class="modal-header">
      <ion-toolbar>
        <ion-title>{{ titulo }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="onCerrar">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="modal-content">
      <div class="contenedor-modal">
        <ion-list lines="none" class="lista-formulario">
          <ion-item class="item-formulario">
            <ion-input
              v-model="formulario.nombre"
              label="Nombre"
              label-placement="stacked"
              placeholder="Ej. Supermercado"
            />
          </ion-item>

          <ion-item class="item-formulario">
            <ion-select
              v-model="formulario.tipo"
              label="Tipo"
              label-placement="stacked"
              interface="popover"
            >
              <ion-select-option :value="2">Gasto</ion-select-option>
              <ion-select-option :value="1">Ingreso</ion-select-option>
            </ion-select>
          </ion-item>
        </ion-list>

        <section class="selector-section compacta">
          <button
            type="button"
            class="selector-trigger"
            :aria-expanded="mostrarColores"
            @click="toggleColores"
          >
            <div class="selector-trigger-info">
              <span class="selector-titulo">Color</span>
              <div class="color-preview-row">
                <span class="color-preview" :style="{ backgroundColor: formulario.color || DEFAULT_COLOR }"></span>
              </div>
            </div>
            <ion-icon :icon="mostrarColores ? chevronUpOutline : chevronDownOutline" />
          </button>

          <div v-if="mostrarColores" class="colores-grid">
            <button
              v-for="color in COLOR_OPTIONS"
              :key="color"
              type="button"
              class="color-option"
              :class="{ selected: formulario.color === color }"
              :style="{ backgroundColor: color }"
              :aria-label="`Seleccionar color ${color}`"
              @click="seleccionarColor(color)"
            >
              <span v-if="formulario.color === color" class="color-check">✓</span>
            </button>
          </div>
        </section>

        <section class="selector-section compacta">
          <button
            type="button"
            class="selector-trigger"
            :aria-expanded="mostrarIconos"
            @click="toggleIconos"
          >
            <div class="selector-trigger-info">
              <span class="selector-titulo">Icono</span>
              <div class="icono-preview-row">
                <div class="icono-preview-circle" :style="{ backgroundColor: formulario.color || DEFAULT_COLOR }">
                  <ion-icon :icon="iconoSeleccionado.icon" />
                </div>
              </div>
            </div>
            <ion-icon :icon="mostrarIconos ? chevronUpOutline : chevronDownOutline" />
          </button>

          <div v-if="mostrarIconos" class="iconos-grid">
            <button
              v-for="item in ICON_OPTIONS"
              :key="item.value"
              type="button"
              class="icono-option"
              :class="{ selected: formulario.icono === item.value }"
              :aria-label="`Seleccionar icono ${item.value}`"
              @click="seleccionarIcono(item.value)"
            >
              <ion-icon :icon="item.icon" />
            </button>
          </div>
        </section>

        <ion-list lines="none" class="lista-formulario lista-formulario-secundaria">
          <ion-item class="item-formulario toggle-item">
            <ion-toggle v-model="formulario.archivada">Archivada</ion-toggle>
          </ion-item>

          <ion-item class="item-formulario toggle-item">
            <ion-toggle v-model="formulario.esSistema" disabled>
              Categoría del sistema
            </ion-toggle>
          </ion-item>
        </ion-list>

        <ion-text v-if="!formularioValido" color="danger" class="texto-ayuda">
          El nombre de la categoría es obligatorio.
        </ion-text>

        <div class="acciones">
          <ion-button
            expand="block"
            class="boton-guardar"
            :disabled="!formularioValido"
            @click="onGuardar"
          >
            {{ modo === 'crear' ? 'Crear categoría' : 'Guardar cambios' }}
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<style scoped>
:global(.finmind-form-modal) {
  --width: 100%;
  --height: 100%;
  --max-width: 100%;
  --max-height: 100%;
  --border-radius: 0;
  --box-shadow: none;
}

.modal-header ion-toolbar {
  --background: #233f6b;
  --color: #ffffff;
  --min-height: 78px;
  --padding-top: env(safe-area-inset-top);
}

.modal-content {
  --background: #f8f7f6;
}

.contenedor-modal {
  padding: 16px;
}

.lista-formulario {
  background: transparent;
  margin-bottom: 16px;
}

.lista-formulario-secundaria {
  margin-top: 8px;
}

.item-formulario {
  --background: #ffffff;
  --border-radius: 18px;
  --inner-border-width: 0;
  --padding-start: 14px;
  --padding-end: 14px;
  --min-height: 68px;
  margin-bottom: 12px;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(35, 63, 107, 0.06);
}

.toggle-item {
  min-height: 58px;
}

.selector-section {
  background: #ffffff;
  border-radius: 20px;
  padding: 14px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(35, 63, 107, 0.06);
}

.selector-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #233f6b;
}

.selector-trigger-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.selector-titulo {
  font-size: 0.95rem;
  font-weight: 700;
  color: #233f6b;
}

.color-preview-row,
.icono-preview-row {
  display: flex;
  align-items: center;
}

.color-preview {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 2px solid #e4e7ee;
}

.icono-preview-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 1rem;
}

.selector-trigger ion-icon {
  font-size: 1.15rem;
  flex-shrink: 0;
}

.colores-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.color-option {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 999px;
  border: 3px solid transparent;
  cursor: pointer;
  padding: 0;
}

.color-option.selected {
  border-color: #233f6b;
  transform: scale(1.04);
}

.color-check {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

.iconos-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.icono-option {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 58px;
  padding: 8px;
  border-radius: 16px;
  border: 1.5px solid #e3e7ee;
  background: #f8f7f6;
  color: #233f6b;
  cursor: pointer;
}

.icono-option ion-icon {
  font-size: 1.35rem;
}

.icono-option.selected {
  border-color: #233f6b;
  background: rgba(35, 63, 107, 0.08);
}

.texto-ayuda {
  display: block;
  margin: 2px 4px 14px;
  font-size: 0.85rem;
}

.acciones {
  margin-top: 2px;
}

.boton-guardar {
  --background: #f1b80f;
  --background-activated: #d9a400;
  --background-hover: #e0ab08;
  --color: #233f6b;
  font-weight: 700;
}
</style>
