<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
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
  IonText
} from '@ionic/vue'

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

const formulario = reactive<CategoriaFormulario>({
  nombre: '',
  tipo: 2,
  color: null,
  icono: null,
  esSistema: false,
  archivada: false
})

watch(
  () => props.categoriaInicial,
  value => {
    formulario.nombre = value?.nombre ?? ''
    formulario.tipo = value?.tipo ?? 2
    formulario.color = value?.color ?? null
    formulario.icono = value?.icono ?? null
    formulario.esSistema = value?.esSistema ?? false
    formulario.archivada = value?.archivada ?? false
  },
  { immediate: true }
)

const titulo = computed(() =>
  props.modo === 'crear' ? 'Nueva categoría' : 'Editar categoría'
)

const formularioValido = computed(() => formulario.nombre.trim().length > 0)

const onCerrar = () => {
  emit('cerrar')
}

const onGuardar = () => {
  if (!formularioValido.value) return

  emit('guardar', {
    nombre: formulario.nombre.trim(),
    tipo: formulario.tipo,
    color: formulario.color?.trim() || null,
    icono: formulario.icono?.trim() || null,
    esSistema: formulario.esSistema,
    archivada: formulario.archivada
  })
}
</script>

<template>
  <ion-modal :is-open="abierto" @didDismiss="onCerrar">
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

          <ion-item class="item-formulario">
            <ion-input
              v-model="formulario.color"
              label="Color"
              label-placement="stacked"
              placeholder="#233F6B"
            />
          </ion-item>

          <ion-item class="item-formulario">
            <ion-input
              v-model="formulario.icono"
              label="Icono"
              label-placement="stacked"
              placeholder="wallet-outline"
            />
          </ion-item>

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
.modal-header ion-toolbar {
  --background: #233f6b;
  --color: #ffffff;
}

.modal-content {
  --background: #f8f7f6;
}

.contenedor-modal {
  padding: 18px 16px 28px;
}

.lista-formulario {
  background: transparent;
}

.item-formulario {
  --background: #ffffff;
  --border-radius: 16px;
  --padding-start: 14px;
  --inner-padding-end: 14px;
  margin-bottom: 14px;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(35, 63, 107, 0.06);
}

.toggle-item {
  min-height: 58px;
}

.texto-ayuda {
  display: block;
  margin: 6px 4px 0;
  font-size: 0.9rem;
}

.acciones {
  margin-top: 18px;
}

.boton-guardar {
  --background: #233f6b;
  --background-hover: #233f6b;
  --background-activated: #233f6b;
  --border-radius: 16px;
  min-height: 48px;
  font-weight: 600;
}
</style>