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

const subtituloActual = computed(() => {
  if (filtroArchivado.value === 'archivadas') {
    return 'Categorías archivadas'
  }

  return 'Categorías activas'
})

const textoResumen = computed(() => {
  const total = categoriasFiltradas.value.length
  const bloque = filtroArchivado.value === 'archivadas' ? 'archivadas' : 'activas'

  if (filtroTipo.value === 'gastos') {
    return `${total} categoría${total === 1 ? '' : 's'} de gasto ${bloque}`
  }

  if (filtroTipo.value === 'ingresos') {
    return `${total} categoría${total === 1 ? '' : 's'} de ingreso ${bloque}`
  }

  return `${total} categoría${total === 1 ? '' : 's'} ${bloque}`
})

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

const obtenerNombreIcono = (icono?: string | null) => {
  return icono && icono.trim().length > 0 ? icono : 'pricetag-outline'
}

const obtenerFondoIcono = (categoria: Categoria) => {
  const color = categoria.color?.trim()

  if (!color) {
    return categoria.tipo === 1 ? 'rgba(35, 63, 107, 0.12)' : 'rgba(241, 184, 15, 0.18)'
  }

  if (color.startsWith('#')) {
    let hex = color.slice(1)

    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('')
    }

    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)

      return `rgba(${r}, ${g}, ${b}, 0.16)`
    }
  }

  return 'rgba(35, 63, 107, 0.12)'
}

const setFiltroTipo = (valor: 'todas' | 'gastos' | 'ingresos') => {
  filtroTipo.value = valor
}

const setFiltroArchivado = (valor: 'activas' | 'archivadas') => {
  filtroArchivado.value = valor
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
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <div class="topbar">
          <div>
            <h1 class="topbar-title">Categorías</h1>
            <p class="topbar-subtitle">{{ subtituloActual }}</p>
          </div>

          <button class="refresh-button" type="button" @click="refrescar" aria-label="Actualizar">
            <ion-icon :icon="refreshOutline" />
          </button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="categories-content">
      <div class="page-shell">
        <div class="categories-wrapper">
          <section class="filters-card">
            <div class="filters-header-row">
              <div>
                <h2 class="section-title">Gestiona tus categorías</h2>
              </div>

              <ion-button class="create-button" @click="abrirCrearCategoria">
                <ion-icon slot="start" :icon="addOutline" />
                Nueva
              </ion-button>
            </div>

            <div class="summary-chips">
              <span class="summary-chip">Activas: {{ totalActivas }}</span>
              <span class="summary-chip secondary">Archivadas: {{ totalArchivadas }}</span>
            </div>

            <div class="filter-block">
              <label class="filter-label">Tipo</label>
              <div class="chips-row">
                <button
                  class="filter-chip"
                  :class="{ active: filtroTipo === 'todas' }"
                  @click="setFiltroTipo('todas')"
                >
                  Todas
                </button>
                <button
                  class="filter-chip"
                  :class="{ active: filtroTipo === 'gastos' }"
                  @click="setFiltroTipo('gastos')"
                >
                  Gastos
                </button>
                <button
                  class="filter-chip"
                  :class="{ active: filtroTipo === 'ingresos' }"
                  @click="setFiltroTipo('ingresos')"
                >
                  Ingresos
                </button>
              </div>
            </div>

            <div class="filter-block filter-block-last">
              <label class="filter-label">Estado</label>
              <div class="chips-row">
                <button
                  class="filter-chip"
                  :class="{ active: filtroArchivado === 'activas' }"
                  @click="setFiltroArchivado('activas')"
                >
                  Activas
                </button>
                <button
                  class="filter-chip"
                  :class="{ active: filtroArchivado === 'archivadas' }"
                  @click="setFiltroArchivado('archivadas')"
                >
                  Archivadas
                </button>
              </div>
            </div>
          </section>

          <section v-if="!cargando" class="summary-strip">
            <p>{{ textoResumen }}</p>
          </section>

          <section class="categories-section">
            <div v-if="cargando" class="loading-state">
              <ion-spinner name="crescent" />
              <p>Cargando categorías...</p>
            </div>

            <div v-else-if="categoriasFiltradas.length === 0" class="empty-state">
              <ion-icon :icon="fileTrayOutline" />
              <h4>No hay categorías</h4>
              <p>
                {{
                  filtroArchivado === 'archivadas'
                    ? 'No hay categorías archivadas con este filtro.'
                    : 'Crea tu primera categoría personalizada para empezar.'
                }}
              </p>
            </div>

            <div v-else class="categories-card">
              <div
                v-for="categoria in categoriasFiltradas"
                :key="categoria.id"
                class="category-item"
              >
                <div class="category-left">
                  <div
                    class="category-icon"
                    :style="{
                      backgroundColor: obtenerFondoIcono(categoria),
                      color: categoria.color || '#233f6b'
                    }"
                  >
                    <ion-icon :name="obtenerNombreIcono(categoria.icono)" />
                  </div>

                  <div class="category-text">
                    <h4>{{ categoria.nombre }}</h4>
                    <div class="category-meta">
                      <span class="category-tag">{{ textoEstado(categoria) }}</span>
                      <span v-if="categoria.esSistema" class="category-tag system">Sistema</span>
                    </div>
                  </div>
                </div>

                <div class="category-right">
                  <button
                    class="edit-category-button"
                    type="button"
                    @click="abrirEditarCategoria(categoria)"
                  >
                    <ion-icon :icon="createOutline" />
                    <span>Editar</span>
                  </button>

                  <button
                    class="archive-category-button"
                    type="button"
                    @click="onCambiarArchivado(categoria, !categoria.archivada)"
                  >
                    <ion-icon :icon="archiveOutline" />
                    <span>{{ categoria.archivada ? 'Desarchivar' : 'Archivar' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
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
.categories-wrapper {
  gap: 12px;
}

.categories-card {
  padding: 0 16px 16px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 18px;
}

.topbar-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.15;
}

.topbar-subtitle {
  margin: 6px 0 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.92);
}

.refresh-button {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
}

.filters-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-title {
  margin: 0;
  font-size: 1.08rem;
  color: #17181c;
  font-weight: 800;
}

.create-button {
  --background: #f1b80f;
  --background-hover: #f1b80f;
  --background-activated: #f1b80f;
  --color: #17181c;
  --border-radius: 16px;
  font-weight: 800;
  text-transform: none;
}

.summary-chips {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.summary-chip {
  display: inline-flex;
  align-items: center;
  padding: 9px 13px;
  border-radius: 999px;
  background: #eef1f5;
  color: #233f6b;
  font-size: 0.87rem;
  font-weight: 700;
}

.summary-chip.secondary {
  background: #f7efcf;
  color: #8a6500;
}

.filter-block {
  margin-top: 16px;
}

.filter-block-last {
  margin-top: 14px;
}

.categories-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state ion-icon {
  font-size: 2rem;
  color: #98a2b3;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 0;
  border-bottom: 1px solid #ece8e6;
}

.category-item:last-child {
  border-bottom: none;
}

.category-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.18rem;
  box-shadow: inset 0 0 0 1px rgba(35, 63, 107, 0.05);
}

.category-text {
  flex: 1;
  min-width: 0;
}

.category-text h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #17181c;
  line-height: 1.25;
}

.category-meta {
  margin-top: 7px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #edf2fa;
  color: #233f6b;
  font-size: 0.78rem;
  font-weight: 700;
}

.category-tag.system {
  background: #fef3c7;
  color: #8a6500;
}

.category-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

.edit-category-button,
.archive-category-button {
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.84rem;
  font-weight: 700;
  padding: 2px 0;
}

.edit-category-button {
  color: #233f6b;
}

.archive-category-button {
  color: #6f7782;
}

@media (max-width: 380px) {
  .filters-header-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .create-button {
    width: 100%;
  }

  .category-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .category-right {
    width: 100%;
    flex-direction: row;
    justify-content: flex-end;
    gap: 14px;
  }
}
</style>
