<template>
  <ion-modal :is-open="isOpen" @didDismiss="cerrar">
    <ion-page>
      <ion-header class="ion-no-border">
        <ion-toolbar class="modal-toolbar">
          <ion-title>{{ esEdicion ? 'Editar movimiento' : 'Nuevo movimiento' }}</ion-title>
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
              <label class="field-label">Importe</label>
              <ion-input
                v-model="importe"
                type="number"
                inputmode="decimal"
                placeholder="0,00"
                class="custom-input"
              />
            </div>

            <div class="field-group">
              <label class="field-label">Descripción</label>
              <ion-input
                v-model="descripcion"
                placeholder="Ej. Farmacia, nómina, supermercado..."
                class="custom-input"
              />
            </div>

            <div class="field-group">
              <label class="field-label">Fecha</label>
              <ion-input
                v-model="fecha"
                type="date"
                class="custom-input"
              />
            </div>

            <div class="field-group">
              <label class="field-label">Categoría</label>
              <ion-select
                v-model="categoriaId"
                interface="popover"
                placeholder="Selecciona una categoría"
                class="custom-select"
              >
                <ion-select-option
                  v-for="categoria in categoriasFiltradas"
                  :key="categoria.id"
                  :value="categoria.id"
                >
                  {{ categoria.nombre }}
                </ion-select-option>
              </ion-select>
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
              <span v-else>{{ esEdicion ? 'Guardar cambios' : 'Guardar movimiento' }}</span>
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
  IonSelect,
  IonSelectOption,
  IonSpinner
} from '@ionic/vue'
import { computed, ref, watch } from 'vue'
import { getCategorias, type Categoria } from '@/services/categoriaService'
import {
  crearMovimientoManual,
  actualizarMovimiento,
  type TransaccionListadoResponse
} from '@/services/transaccionService'

const props = defineProps<{
  isOpen: boolean
  usuarioId: string
  movimiento?: TransaccionListadoResponse | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'guardado'): void
}>()

const tipo = ref(2)
const importe = ref('')
const descripcion = ref('')
const fecha = ref(new Date().toISOString().split('T')[0])
const categoriaId = ref<string | null>(null)
const esEdicion = computed(() => !!props.movimiento)
const categorias = ref<Categoria[]>([])
const loading = ref(false)
const error = ref('')

const categoriasFiltradas = computed(() => {
  return categorias.value.filter(c => Number(c.tipo) === tipo.value)
})

const cargarCategorias = async () => {
  try {
    error.value = ''
    categorias.value = await getCategorias(props.usuarioId)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudieron cargar las categorías.'
  }
}

const resetFormulario = () => {
  tipo.value = 2
  importe.value = ''
  descripcion.value = ''
  fecha.value = new Date().toISOString().split('T')[0]
  categoriaId.value = null
  error.value = ''
}

const cargarFormularioDesdeMovimiento = () => {
  if (!props.movimiento) {
    resetFormulario()
    return
  }

  tipo.value = Number(props.movimiento.tipo)
  importe.value = String(props.movimiento.importe ?? '')
  descripcion.value = props.movimiento.descripcion ?? ''
  fecha.value = new Date(props.movimiento.fecha).toISOString().split('T')[0]
  categoriaId.value = props.movimiento.categoriaId ?? null
  error.value = ''
}

const cerrar = () => {
  emit('close')
}

const guardar = async () => {
  const importeNumero = Number(String(importe.value).replace(',', '.'))

  if (!importeNumero || importeNumero <= 0) {
    error.value = 'Introduce un importe válido mayor que cero.'
    return
  }

  if (!fecha.value) {
    error.value = 'Selecciona una fecha.'
    return
  }

  try {
    loading.value = true
    error.value = ''

    if (esEdicion.value && props.movimiento) {
      await actualizarMovimiento({
        id: props.movimiento.id,
        usuarioId: props.usuarioId,
        cuentaBancariaId: props.movimiento.cuentaBancariaId ?? null,
        categoriaId: categoriaId.value,
        importe: importeNumero,
        moneda: props.movimiento.moneda ?? 'EUR',
        tipo: tipo.value,
        origen: props.movimiento.origen,
        proveedor: props.movimiento.proveedor,
        fecha: `${fecha.value}T00:00:00`,
        descripcion: descripcion.value?.trim() || null,
        idTransaccionExterna: props.movimiento.idTransaccionExterna ?? null
      })
    } else {
      await crearMovimientoManual({
        usuarioId: props.usuarioId,
        cuentaBancariaId: null,
        categoriaId: categoriaId.value,
        importe: importeNumero,
        tipo: tipo.value,
        fecha: `${fecha.value}T00:00:00`,
        descripcion: descripcion.value?.trim() || null,
        moneda: 'EUR'
      })
    }

    resetFormulario()
    emit('guardado')
    emit('close')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo guardar el movimiento.'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.isOpen,
  async (abierto) => {
    if (abierto) {
      await cargarCategorias()
      cargarFormularioDesdeMovimiento()
    }
  }
)

watch(tipo, () => {
  categoriaId.value = null
})
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

.custom-input,
.custom-select {
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
  margin-top: 4px;
}
</style>