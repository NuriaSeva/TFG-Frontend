<script setup lang="ts">
import { computed, ref } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardContent,
  IonChip,
  IonText,
  IonSpinner,
  IonButtons,
  alertController,
  toastController
} from '@ionic/vue'
import {
  addOutline,
  createOutline,
  archiveOutline,
  refreshOutline,
  fileTrayOutline
} from 'ionicons/icons'
import CategoriaModal, { type CategoriaFormulario } from '@/components/CategoriaModal.vue'
import {
  getCategorias,
  crearCategoria,
  actualizarCategoria,
  cambiarArchivadoCategoria,
  type Categoria
} from '@/services/categoriaService'

const cargando = ref(false)
const categorias = ref<Categoria[]>([])

const modalAbierto = ref(false)
const modoModal = ref<'crear' | 'editar'>('crear')
const categoriaEditando = ref<Categoria | null>(null)
const categoriaInicial = ref<CategoriaFormulario | null>(null)

const filtroTipo = ref<'todas' | 'gastos' | 'ingresos'>('todas')
const filtroArchivado = ref<'activas' | 'archivadas'>('activas')

const cargarCategorias = async () => {
  cargando.value = true

  try {
    categorias.value = await getCategorias()
  } catch (error: any) {
    await mostrarToast(error?.message || 'No se pudieron cargar las categorías.', 'danger')
  } finally {
    cargando.value = false
  }
}

onIonViewWillEnter(async () => {
  await cargarCategorias()
})

const categoriasFiltradas = computed(() => {
  let resultado = [...categorias.value]

  if (filtroTipo.value === 'gastos') {
    resultado = resultado.filter(c => c.tipo === 2)
  } else if (filtroTipo.value === 'ingresos') {
    resultado = resultado.filter(c => c.tipo === 1)
  }

  const mostrarArchivadas = filtroArchivado.value === 'archivadas'
  resultado = resultado.filter(c => c.archivada === mostrarArchivadas)

  return resultado.sort((a, b) => {
    if (a.esSistema !== b.esSistema) return a.esSistema ? 1 : -1
    return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
  })
})

const totalActivas = computed(() => categorias.value.filter(c => !c.archivada).length)
const totalArchivadas = computed(() => categorias.value.filter(c => c.archivada).length)

const abrirCrearCategoria = () => {
  modoModal.value = 'crear'
  categoriaEditando.value = null
  categoriaInicial.value = {
    nombre: '',
    tipo: 2,
    color: null,
    icono: null,
    esSistema: false,
    archivada: false
  }
  modalAbierto.value = true
}

const abrirEditarCategoria = (categoria: Categoria) => {
  modoModal.value = 'editar'
  categoriaEditando.value = categoria
  categoriaInicial.value = {
    nombre: categoria.nombre,
    tipo: categoria.tipo,
    color: categoria.color ?? null,
    icono: categoria.icono ?? null,
    esSistema: categoria.esSistema,
    archivada: categoria.archivada
  }
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
  categoriaEditando.value = null
  categoriaInicial.value = null
}

const onGuardarCategoria = async (formulario: CategoriaFormulario) => {
  try {
    if (modoModal.value === 'crear') {
      await crearCategoria(formulario)
      await mostrarToast('Categoría creada correctamente.')
    } else if (categoriaEditando.value) {
      await actualizarCategoria({
        id: categoriaEditando.value.id,
        ...formulario
      })
      await mostrarToast('Categoría actualizada correctamente.')
    }

    cerrarModal()
    await cargarCategorias()
  } catch (error: any) {
    await mostrarToast(error?.message || 'No se pudo guardar la categoría.', 'danger')
  }
}

const onCambiarArchivado = async (categoria: Categoria, archivada: boolean) => {
  const alert = await alertController.create({
    header: archivada ? 'Archivar categoría' : 'Desarchivar categoría',
    message: archivada
      ? `¿Quieres archivar la categoría "${categoria.nombre}"?`
      : `¿Quieres desarchivar la categoría "${categoria.nombre}"?`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: archivada ? 'Archivar' : 'Desarchivar',
        role: 'confirm',
        handler: async () => {
          try {
            await cambiarArchivadoCategoria(categoria, archivada)
            await mostrarToast(
              archivada
                ? 'Categoría archivada correctamente.'
                : 'Categoría desarchivada correctamente.'
            )
            await cargarCategorias()
          } catch (error: any) {
            await mostrarToast(
              error?.message ||
                (archivada
                  ? 'No se pudo archivar la categoría.'
                  : 'No se pudo desarchivar la categoría.'),
              'danger'
            )
          }
        }
      }
    ]
  })

  await alert.present()
}

const refrescar = async () => {
  await cargarCategorias()
}

const textoEstado = (categoria: Categoria) => {
  return categoria.tipo === 1 ? 'Ingreso' : 'Gasto'
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
  <ion-page>
    <ion-header translucent>
      <ion-toolbar class="toolbar-principal">
        <ion-title>Categorías</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refrescar">
            <ion-icon :icon="refreshOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="pagina-categorias">
      <div class="cabecera-resumen">
        <div>
          <h2>Gestiona tus categorías</h2>
          <p>Organiza ingresos y gastos de forma sencilla.</p>
        </div>

        <ion-button class="boton-crear" @click="abrirCrearCategoria">
          <ion-icon slot="start" :icon="addOutline" />
          Nueva
        </ion-button>
      </div>

      <div class="chips-resumen">
        <ion-chip class="chip-resumen">
          <ion-label>Activas: {{ totalActivas }}</ion-label>
        </ion-chip>
        <ion-chip class="chip-resumen chip-secundario">
          <ion-label>Archivadas: {{ totalArchivadas }}</ion-label>
        </ion-chip>
      </div>

      <div class="bloque-filtros">
        <ion-segment v-model="filtroTipo" class="segmento-tipo">
          <ion-segment-button value="todas">
            <ion-label>Todas</ion-label>
          </ion-segment-button>
          <ion-segment-button value="gastos">
            <ion-label>Gastos</ion-label>
          </ion-segment-button>
          <ion-segment-button value="ingresos">
            <ion-label>Ingresos</ion-label>
          </ion-segment-button>
        </ion-segment>

        <ion-segment v-model="filtroArchivado" class="segmento-archivado">
          <ion-segment-button value="activas">
            <ion-label>Activas</ion-label>
          </ion-segment-button>
          <ion-segment-button value="archivadas">
            <ion-label>Archivadas</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <div v-if="cargando" class="estado-carga">
        <ion-spinner name="crescent" />
        <ion-text color="medium">Cargando categorías...</ion-text>
      </div>

      <div v-else-if="categoriasFiltradas.length === 0" class="estado-vacio">
        <ion-icon :icon="fileTrayOutline" />
        <h3>No hay categorías para mostrar</h3>
        <p>
          {{
            filtroArchivado === 'archivadas'
              ? 'Todavía no tienes categorías archivadas con este filtro.'
              : 'Crea tu primera categoría personalizada para empezar.'
          }}
        </p>
      </div>

      <div v-else class="listado-categorias">
        <ion-card
          v-for="categoria in categoriasFiltradas"
          :key="categoria.id"
          class="tarjeta-categoria"
        >
          <ion-card-content>
            <div class="fila-superior">
              <div class="info-categoria">
                <div class="titulo-linea">
                  <span
                    class="punto-color"
                    :style="{ backgroundColor: categoria.color || '#233f6b' }"
                  />
                  <h3>{{ categoria.nombre }}</h3>
                </div>

                <div class="chips-linea">
                  <ion-chip class="chip-tipo">
                    <ion-label>{{ textoEstado(categoria) }}</ion-label>
                  </ion-chip>

                  <ion-chip v-if="categoria.esSistema" class="chip-sistema">
                    <ion-label>Sistema</ion-label>
                  </ion-chip>
                </div>
              </div>
            </div>

            <div v-if="categoria.icono" class="detalle-secundario">
              Icono: {{ categoria.icono }}
            </div>

            <div class="acciones-categoria">
              <ion-button
                fill="outline"
                size="small"
                class="boton-secundario"
                @click="abrirEditarCategoria(categoria)"
              >
                <ion-icon slot="start" :icon="createOutline" />
                Editar
              </ion-button>

              <ion-button
                fill="clear"
                size="small"
                class="boton-archivar"
                @click="onCambiarArchivado(categoria, !categoria.archivada)"
              >
                <ion-icon slot="start" :icon="archiveOutline" />
                {{ categoria.archivada ? 'Desarchivar' : 'Archivar' }}
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <CategoriaModal
        :abierto="modalAbierto"
        :modo="modoModal"
        :categoria-inicial="categoriaInicial"
        @cerrar="cerrarModal"
        @guardar="onGuardarCategoria"
      />
    </ion-content>
  </ion-page>
</template>

<style scoped>
.toolbar-principal {
  --background: #233f6b;
  --color: #ffffff;
}

.pagina-categorias {
  --background: #f2f0ef;
}

.cabecera-resumen {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 16px 8px;
}

.cabecera-resumen h2 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: #1d2b44;
}

.cabecera-resumen p {
  margin: 6px 0 0;
  color: #667085;
  font-size: 0.95rem;
}

.boton-crear {
  --background: #f1b80f;
  --background-hover: #f1b80f;
  --background-activated: #f1b80f;
  --color: #1b1b1f;
  --border-radius: 14px;
  font-weight: 700;
}

.chips-resumen {
  display: flex;
  gap: 10px;
  padding: 0 16px 10px;
  flex-wrap: wrap;
}

.chip-resumen {
  --background: #e9eef6;
  color: #233f6b;
  font-weight: 600;
}

.chip-secundario {
  --background: #f5edd1;
  color: #8a6500;
}

.bloque-filtros {
  padding: 0 16px 10px;
}

.segmento-tipo,
.segmento-archivado {
  background: #ffffff;
  border-radius: 16px;
  padding: 4px;
  margin-bottom: 10px;
}

.estado-carga,
.estado-vacio {
  padding: 40px 20px;
  text-align: center;
  color: #667085;
}

.estado-carga {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.estado-vacio ion-icon {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #98a2b3;
}

.estado-vacio h3 {
  margin: 0 0 8px;
  color: #233f6b;
}

.estado-vacio p {
  margin: 0;
}

.listado-categorias {
  padding: 4px 16px 24px;
}

.tarjeta-categoria {
  margin: 0 0 14px;
  border-radius: 20px;
  box-shadow: 0 10px 24px rgba(35, 63, 107, 0.08);
}

.fila-superior {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.info-categoria {
  flex: 1;
  min-width: 0;
}

.titulo-linea {
  display: flex;
  align-items: center;
  gap: 10px;
}

.titulo-linea h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #233f6b;
}

.punto-color {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  flex-shrink: 0;
}

.chips-linea {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.chip-tipo {
  --background: #edf2fa;
  color: #233f6b;
}

.chip-sistema {
  --background: #fef3c7;
  color: #8a6500;
}

.detalle-secundario {
  margin-top: 10px;
  color: #667085;
  font-size: 0.92rem;
}

.acciones-categoria {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.boton-secundario {
  --color: #233f6b;
  --border-color: #233f6b;
  --border-radius: 14px;
}

.boton-archivar {
  --color: #667085;
}
</style>