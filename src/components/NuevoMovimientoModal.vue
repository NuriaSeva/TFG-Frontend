<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
  IonDatetime,
  IonDatetimeButton,
  IonText,
  IonIcon,
  IonSpinner,
  toastController
} from '@ionic/vue'
import { addCircleOutline, calendarOutline } from 'ionicons/icons'
import CategoriaModal, { type CategoriaFormulario } from '@/components/CategoriaModal.vue'
import {
  getCategorias,
  crearCategoria,
  type Categoria
} from '@/services/categoriaService'
import {
  sugerirCategoriaIA,
  type SugerenciaCategoriaIAResponse
} from '@/services/transaccionService'

export interface MovimientoFormulario {
  categoriaId?: string | null
  importe: number | null
  tipo: number
  fecha: string
  descripcion?: string | null
  moneda?: string | null
}

const props = defineProps<{
  abierto: boolean
  movimientoInicial?: MovimientoFormulario | null
  soloCategoria?: boolean
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardar', value: MovimientoFormulario): void
}>()

const categoriaId = ref<string | null>(null)
const importe = ref<number | null>(null)
const tipo = ref<number>(2)
const fecha = ref<string>(new Date().toISOString())
const descripcion = ref<string>('')
const moneda = ref<string>('EUR')

const categorias = ref<Categoria[]>([])
const cargandoCategorias = ref(false)

const sugerenciaIA = ref<SugerenciaCategoriaIAResponse | null>(null)
const cargandoSugerenciaIA = ref(false)
const errorSugerenciaIA = ref<string | null>(null)
let sugerenciaDebounceId: number | null = null
let sugerenciaRequestId = 0

const mostrandoModalCategoria = ref(false)

const obtenerFechaPorDefecto = () => new Date().toISOString()

const aplicarMovimientoInicial = (value?: MovimientoFormulario | null) => {
  categoriaId.value = value?.categoriaId ?? null
  importe.value = value?.importe ?? null
  tipo.value = value?.tipo ?? 2
  fecha.value = value?.fecha ?? obtenerFechaPorDefecto()
  descripcion.value = value?.descripcion ?? ''
  moneda.value = value?.moneda ?? 'EUR'
}

watch(
  () => props.movimientoInicial,
  value => {
    if (props.abierto) {
      aplicarMovimientoInicial(value)
    }
  },
  { immediate: true }
)

watch(
  () => props.abierto,
  async abierto => {
    if (abierto) {
      aplicarMovimientoInicial(props.movimientoInicial)
      await cargarCategorias()
      programarSugerenciaIA()
      return
    }

    if (sugerenciaDebounceId !== null) {
      window.clearTimeout(sugerenciaDebounceId)
      sugerenciaDebounceId = null
    }

    sugerenciaRequestId++
    limpiarSugerenciaIA()
    mostrandoModalCategoria.value = false
    aplicarMovimientoInicial(null)
  },
  { immediate: true }
)

const categoriasFiltradas = computed(() => {
  return categorias.value.filter(c => !c.archivada && c.tipo === tipo.value)
})

const formularioValido = computed(() => {
  if (props.soloCategoria) return true
  return importe.value !== null && Number(importe.value) > 0 && fecha.value.trim() !== ''
})

const puedeSugerirIA = computed(() => {
  return (
    props.abierto &&
    !props.soloCategoria &&
    categoriaId.value == null &&
    descripcion.value.trim().length >= 3
  )
})

const fechaFormateada = computed(() => {
  if (!fecha.value) return ''

  const parsed = new Date(fecha.value)
  if (Number.isNaN(parsed.getTime())) return ''

  return parsed.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
})

const cargarCategorias = async () => {
  cargandoCategorias.value = true

  try {
    categorias.value = await getCategorias()
  } catch (error: any) {
    await mostrarToast(error?.message || 'No hemos podido cargar las categorías.', 'danger')
  } finally {
    cargandoCategorias.value = false
  }
}

const limpiarSugerenciaIA = () => {
  sugerenciaIA.value = null
  errorSugerenciaIA.value = null
  cargandoSugerenciaIA.value = false
}

const solicitarSugerenciaIA = async () => {
  if (!puedeSugerirIA.value) {
    limpiarSugerenciaIA()
    return
  }

  const requestId = ++sugerenciaRequestId
  cargandoSugerenciaIA.value = true
  errorSugerenciaIA.value = null

  try {
    const respuesta = await sugerirCategoriaIA({
      descripcion: descripcion.value.trim(),
      importe: Number(importe.value ?? 0),
      tipo: tipo.value
    })

    if (requestId !== sugerenciaRequestId) return
    sugerenciaIA.value = respuesta
  } catch (error: any) {
    if (requestId !== sugerenciaRequestId) return
    sugerenciaIA.value = null
    errorSugerenciaIA.value =
      error?.message || 'Ahora mismo no podemos recomendar una categoría.'
  } finally {
    if (requestId === sugerenciaRequestId) {
      cargandoSugerenciaIA.value = false
    }
  }
}

const programarSugerenciaIA = () => {
  if (sugerenciaDebounceId !== null) {
    window.clearTimeout(sugerenciaDebounceId)
    sugerenciaDebounceId = null
  }

  if (!puedeSugerirIA.value) {
    sugerenciaRequestId++
    limpiarSugerenciaIA()
    return
  }

  sugerenciaDebounceId = window.setTimeout(() => {
    void solicitarSugerenciaIA()
  }, 450)
}

const aplicarSugerenciaIA = async () => {
  const sugerida = sugerenciaIA.value?.mejorSugerencia
  if (!sugerida?.categoriaId) return

  categoriaId.value = sugerida.categoriaId
  await mostrarToast(`Categoría recomendada aplicada: ${sugerida.categoriaNombre}.`)
}

const cerrar = () => {
  emit('cerrar')
}

const guardar = () => {
  if (!formularioValido.value) return

  emit('guardar', {
    categoriaId: categoriaId.value,
    importe: importe.value,
    tipo: tipo.value,
    fecha: fecha.value,
    descripcion: descripcion.value.trim() || null,
    moneda: moneda.value.trim() || 'EUR'
  })
}

const tituloModal = computed(() => {
  if (props.soloCategoria) return 'Editar categoría'
  return props.movimientoInicial ? 'Editar movimiento' : 'Nuevo movimiento'
})

const textoBotonGuardar = computed(() => {
  return props.soloCategoria ? 'Guardar categoría' : 'Guardar movimiento'
})

watch(
  [descripcion, tipo, categoriaId, () => props.abierto],
  () => {
    programarSugerenciaIA()
  },
  { immediate: true }
)

const abrirNuevaCategoria = () => {
  mostrandoModalCategoria.value = true
}

const cerrarNuevaCategoria = () => {
  mostrandoModalCategoria.value = false
}

const onCategoriaGuardada = async (formulario: CategoriaFormulario) => {
  try {
    const categoriaCreada = await crearCategoria(formulario)
    await cargarCategorias()

    categoriaId.value = categoriaCreada.id
    mostrandoModalCategoria.value = false

    await mostrarToast('Categoría creada correctamente.')
  } catch (error: any) {
    await mostrarToast(error?.message || 'No hemos podido crear la categoría.', 'danger')
  }
}

const mostrarToast = async (
  message: string,
  color: 'success' | 'danger' | 'warning' | 'primary' = 'success'
) => {
  const toast = await toastController.create({
    message,
    duration: 2200,
    position: 'bottom',
    color
  })

  await toast.present()
}
</script>

<template>
  <ion-modal class="finmind-form-modal" :is-open="abierto" @didDismiss="cerrar">
    <ion-header class="modal-header">
      <ion-toolbar>
        <ion-title>{{ tituloModal }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="cerrar">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="modal-content" :fullscreen="true">
      <div class="contenedor-modal">
        <ion-list lines="none" class="lista-formulario">
          <ion-item v-if="!props.soloCategoria" class="item-formulario">
            <ion-select
              v-model="tipo"
              label="Tipo"
              label-placement="stacked"
              interface="popover"
            >
              <ion-select-option :value="2">Gasto</ion-select-option>
              <ion-select-option :value="1">Ingreso</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item v-if="!props.soloCategoria" class="item-formulario">
            <ion-input
              v-model.number="importe"
              type="number"
              label="Importe"
              label-placement="stacked"
              placeholder="0,00"
            />
          </ion-item>

          <ion-item v-if="!props.soloCategoria" class="item-formulario">
            <ion-input
              v-model="descripcion"
              type="text"
              label="Descripción"
              label-placement="stacked"
              placeholder="Ej. Supermercado"
            />
          </ion-item>

          <ion-item v-if="!props.soloCategoria" class="item-formulario">
            <ion-input
              v-model="moneda"
              type="text"
              label="Moneda"
              label-placement="stacked"
              placeholder="EUR"
            />
          </ion-item>

          <div v-if="!props.soloCategoria" class="bloque-fecha">
            <div class="bloque-fecha__header">
              <span class="bloque-fecha__label">Fecha</span>
              <div class="bloque-fecha__valor">
                <ion-icon :icon="calendarOutline" />
                <span>{{ fechaFormateada }}</span>
              </div>
            </div>

            <ion-datetime-button datetime="selector-fecha" class="boton-fecha" />
          </div>

          <ion-item class="item-formulario">
            <ion-select
              v-model="categoriaId"
              label="Categoría"
              label-placement="stacked"
              interface="popover"
              :disabled="cargandoCategorias"
            >
              <ion-select-option :value="null">Sin categoría</ion-select-option>

              <ion-select-option
                v-for="categoria in categoriasFiltradas"
                :key="categoria.id"
                :value="categoria.id"
              >
                {{ categoria.nombre }}
              </ion-select-option>
            </ion-select>
          </ion-item>

          <div class="acciones-categoria">
            <ion-button
              fill="clear"
              class="boton-nueva-categoria"
              @click="abrirNuevaCategoria"
            >
              <ion-icon slot="start" :icon="addCircleOutline" />
              Nueva categoría
            </ion-button>
          </div>

          <div v-if="!props.soloCategoria && cargandoSugerenciaIA" class="sugerencia-ia sugerencia-ia--neutral">
            <ion-spinner name="crescent" />
            <ion-text>Buscando la categoría que mejor encaja...</ion-text>
          </div>

          <div
            v-else-if="!props.soloCategoria && puedeSugerirIA && sugerenciaIA?.mejorSugerencia"
            class="sugerencia-ia"
            :class="sugerenciaIA.requiereConfirmacion ? 'sugerencia-ia--warning' : 'sugerencia-ia--success'"
          >
            <ion-text>
              <strong>Categoría recomendada: {{ sugerenciaIA.mejorSugerencia.categoriaNombre }}</strong>
            </ion-text>

            <ion-text v-if="sugerenciaIA.requiereConfirmacion">
              Si te encaja, puedes usar esta categoría.
            </ion-text>

            <ion-text v-else>
              Si la dejas en "Sin categoría", se asignará automáticamente al guardar.
            </ion-text>

            <ion-button
              fill="outline"
              size="small"
              class="boton-aplicar-sugerencia"
              :disabled="!sugerenciaIA.mejorSugerencia.categoriaId"
              @click="aplicarSugerenciaIA"
            >
              Usar categoría
            </ion-button>
          </div>

          <ion-text
            v-else-if="!props.soloCategoria && errorSugerenciaIA && descripcion.trim().length >= 3 && categoriaId == null"
            color="medium"
            class="texto-ayuda"
          >
            {{ errorSugerenciaIA }}
          </ion-text>
        </ion-list>

        <div v-if="cargandoCategorias" class="estado-carga">
          <ion-spinner name="crescent" />
          <ion-text color="medium">Cargando categorías...</ion-text>
        </div>

        <ion-text v-if="!props.soloCategoria && !formularioValido" color="danger" class="texto-ayuda">
          Debes indicar al menos un importe válido y una fecha.
        </ion-text>

        <div class="acciones">
          <ion-button
            expand="block"
            class="boton-guardar"
            :disabled="!formularioValido"
            @click="guardar"
          >
            {{ textoBotonGuardar }}
          </ion-button>
        </div>
      </div>

      <ion-modal v-if="!props.soloCategoria" keep-contents-mounted>
        <ion-datetime
          id="selector-fecha"
          v-model="fecha"
          presentation="date"
          locale="es-ES"
          show-default-buttons
          :first-day-of-week="1"
        />
      </ion-modal>

      <CategoriaModal
        :abierto="mostrandoModalCategoria"
        modo="crear"
        :categoria-inicial="{
          nombre: '',
          tipo: tipo,
          color: null,
          icono: null,
          esSistema: false,
          archivada: false
        }"
        @cerrar="cerrarNuevaCategoria"
        @guardar="onCategoriaGuardada"
      />
    </ion-content>
  </ion-modal>
</template>

<style scoped>
.finmind-form-modal {
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

.bloque-fecha {
  background: #ffffff;
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 14px;
  box-shadow: 0 8px 20px rgba(35, 63, 107, 0.06);
}

.bloque-fecha__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.bloque-fecha__label {
  font-size: 0.82rem;
  color: #6b7280;
}

.bloque-fecha__valor {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #233f6b;
}

.boton-fecha {
  justify-content: flex-start;
}

.boton-fecha::part(native) {
  width: 100%;
  justify-content: flex-start;
  border-radius: 12px;
  background: #f3f4f6;
  color: #233f6b;
  font-weight: 600;
  padding: 12px 14px;
}

.acciones-categoria {
  display: flex;
  justify-content: flex-start;
  margin: 6px 0 14px;
}

.boton-nueva-categoria {
  --color: #233f6b;
  font-weight: 600;
}

.sugerencia-ia {
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sugerencia-ia ion-text {
  font-size: 0.86rem;
}

.sugerencia-ia--neutral {
  background: #eef2f7;
}

.sugerencia-ia--warning {
  background: #fff7ed;
  border: 1px solid #fed7aa;
}

.sugerencia-ia--success {
  background: #edf7f1;
  border: 1px solid #b8e2ca;
}

.boton-aplicar-sugerencia {
  align-self: flex-start;
  --color: #233f6b;
  --border-color: #233f6b;
}

.estado-carga {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  padding: 8px 0 6px;
}

.texto-ayuda {
  display: block;
  margin: 4px 4px 0;
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
