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
  IonText,
  IonIcon,
  IonSpinner,
  toastController
} from '@ionic/vue'
import { addCircleOutline } from 'ionicons/icons'
import CategoriaModal, { type CategoriaFormulario } from '@/components/CategoriaModal.vue'
import {
  getCategorias,
  crearCategoria,
  type Categoria
} from '@/services/categoriaService'

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

const mostrandoModalCategoria = ref(false)

watch(
  () => props.movimientoInicial,
  value => {
    categoriaId.value = value?.categoriaId ?? null
    importe.value = value?.importe ?? null
    tipo.value = value?.tipo ?? 2
    fecha.value = value?.fecha ?? new Date().toISOString()
    descripcion.value = value?.descripcion ?? ''
    moneda.value = value?.moneda ?? 'EUR'
  },
  { immediate: true }
)

watch(
  () => props.abierto,
  async abierto => {
    if (abierto) {
      await cargarCategorias()
    }
  },
  { immediate: true }
)

const categoriasFiltradas = computed(() => {
  return categorias.value.filter(c => !c.archivada && c.tipo === tipo.value)
})

const formularioValido = computed(() => {
  return importe.value !== null && Number(importe.value) > 0 && fecha.value.trim() !== ''
})

const cargarCategorias = async () => {
  cargandoCategorias.value = true

  try {
    categorias.value = await getCategorias()
  } catch (error: any) {
    await mostrarToast(error?.message || 'No se pudieron cargar las categorías.', 'danger')
  } finally {
    cargandoCategorias.value = false
  }
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
    await mostrarToast(error?.message || 'No se pudo crear la categoría.', 'danger')
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
        <ion-title>Nuevo movimiento</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="cerrar">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="modal-content">
      <div class="contenedor-modal">
        <ion-list lines="none" class="lista-formulario">
          <ion-item class="item-formulario">
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

          <ion-item class="item-formulario">
            <ion-input
              v-model.number="importe"
              type="number"
              label="Importe"
              label-placement="stacked"
              placeholder="0,00"
            />
          </ion-item>

          <ion-item class="item-formulario">
            <ion-input
              v-model="descripcion"
              type="text"
              label="Descripción"
              label-placement="stacked"
              placeholder="Ej. Supermercado"
            />
          </ion-item>

          <ion-item class="item-formulario">
            <ion-input
              v-model="moneda"
              type="text"
              label="Moneda"
              label-placement="stacked"
              placeholder="EUR"
            />
          </ion-item>

          <ion-item class="item-formulario">
            <ion-datetime
              v-model="fecha"
              presentation="date"
              locale="es-ES"
            />
          </ion-item>

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
        </ion-list>

        <div v-if="cargandoCategorias" class="estado-carga">
          <ion-spinner name="crescent" />
          <ion-text color="medium">Cargando categorías...</ion-text>
        </div>

        <ion-text v-if="!formularioValido" color="danger" class="texto-ayuda">
          Debes indicar al menos un importe válido y una fecha.
        </ion-text>

        <div class="acciones">
          <ion-button
            expand="block"
            class="boton-guardar"
            :disabled="!formularioValido"
            @click="guardar"
          >
            Guardar movimiento
          </ion-button>
        </div>
      </div>

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
.acciones-categoria {
  display: flex;
  justify-content: flex-start;
  margin: 6px 0 14px;
}

.boton-nueva-categoria {
  --color: #233f6b;
  font-weight: 600;
}

.estado-carga {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  padding: 8px 0 6px;
}
</style>