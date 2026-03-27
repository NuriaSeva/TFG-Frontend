<template>
  <ion-modal :is-open="isOpen" @didDismiss="cerrar">
    <ion-page>
      <ion-header class="ion-no-border">
        <ion-toolbar class="modal-toolbar">
          <ion-title>{{ esEdicion ? 'Editar categoría' : 'Nueva categoría' }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="cerrar">Cerrar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content class="modal-content">
        <div class="form-shell">
          <div class="form-card">
            <div class="chips-row">
              <button
                class="type-chip"
                :class="{ active: tipo === 1 }"
                @click="tipo = 1"
                type="button"
              >
                Ingreso
              </button>

              <button
                class="type-chip"
                :class="{ active: tipo === 2 }"
                @click="tipo = 2"
                type="button"
              >
                Gasto
              </button>
            </div>

            <div class="field-group">
              <label class="field-label">Nombre</label>
              <ion-input
                v-model="nombre"
                placeholder="Ej. Mascotas, Salud, Regalos..."
                class="custom-input"
              />
            </div>

            <div v-if="error" class="error-box">
              {{ error }}
            </div>

            <ion-button
              expand="block"
              class="save-button"
              @click="guardar"
              :disabled="loading"
            >
              <ion-spinner v-if="loading" name="crescent" />
              <span v-else>{{ esEdicion ? 'Guardar cambios' : 'Crear categoría' }}</span>
            </ion-button>
          </div>
        </div>
      </ion-content>
    </ion-page>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonInput,
  IonSpinner
} from '@ionic/vue'
import { computed, ref, watch } from 'vue'
import {
  crearCategoria,
  actualizarCategoria,
  type Categoria
} from '@/services/categoriaService'

const props = defineProps<{
  isOpen: boolean
  usuarioId: string
  tipoInicial?: number | null
  categoria?: Categoria | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'guardada', categoria?: Categoria): void
}>()

const nombre = ref('')
const tipo = ref(2)
const loading = ref(false)
const error = ref('')

const esEdicion = computed(() => !!props.categoria)

const resetFormulario = () => {
  if (props.categoria) {
    nombre.value = props.categoria.nombre ?? ''
    tipo.value = Number(props.categoria.tipo) || 2
  } else {
    nombre.value = ''
    tipo.value = props.tipoInicial ?? 2
  }

  error.value = ''
}

const cerrar = () => {
  emit('close')
}

const guardar = async () => {
  if (!nombre.value.trim()) {
    error.value = 'Introduce un nombre para la categoría.'
    return
  }

  try {
    loading.value = true
    error.value = ''

    if (props.categoria) {
      await actualizarCategoria({
        id: props.categoria.id,
        usuarioId: props.categoria.usuarioId ?? props.usuarioId,
        nombre: nombre.value.trim(),
        tipo: tipo.value,
        color: props.categoria.color ?? null,
        icono: props.categoria.icono ?? null,
        esSistema: props.categoria.esSistema,
        archivada: props.categoria.archivada
      })

      emit('guardada')
    } else {
      const categoria = await crearCategoria({
        usuarioId: props.usuarioId,
        nombre: nombre.value.trim(),
        tipo: tipo.value,
        color: null,
        icono: null,
        esSistema: false,
        archivada: false
      })

      emit('guardada', categoria)
    }

    emit('close')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo guardar la categoría.'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.isOpen,
  (abierto) => {
    if (abierto) {
      resetFormulario()
    }
  }
)
</script>

<style scoped>
.modal-toolbar {
  --background: #233f6b;
  --color: #ffffff;
}

.modal-content {
  --background: #f2f0ef;
}

.form-shell {
  padding: 16px;
}

.form-card {
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 8px 22px rgba(35, 63, 107, 0.08);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.chips-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.type-chip {
  border: none;
  border-radius: 999px;
  padding: 12px 16px;
  background: #eef1f5;
  color: #233f6b;
  font-weight: 700;
  font-size: 0.95rem;
}

.type-chip.active {
  background: #f1b80f;
  color: #17181c;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.92rem;
  color: #6f7782;
  font-weight: 700;
}

.custom-input {
  --color: #17181c;
  --padding-start: 14px;
  --padding-end: 14px;
  --highlight-color-focused: transparent;
  background: #f8f7f6;
  border-radius: 16px;
  min-height: 52px;
  font-weight: 700;
}

.error-box {
  background: rgba(196, 61, 47, 0.08);
  color: #c43d2f;
  border-radius: 14px;
  padding: 12px;
  font-size: 0.92rem;
  font-weight: 600;
}

.save-button {
  --background: #233f6b;
  --background-hover: #233f6b;
  --background-activated: #233f6b;
  --color: #ffffff;
  --border-radius: 18px;
  min-height: 52px;
  font-weight: 800;
}
</style>