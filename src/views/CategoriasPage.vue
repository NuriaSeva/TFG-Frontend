<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <div class="topbar">
          <div class="topbar-left">
            <button class="back-button" type="button" @click="volver" aria-label="Volver">
              <ion-icon :icon="arrowBackOutline" />
            </button>

            <div>
              <p class="topbar-kicker">FinMind</p>
              <h1 class="topbar-title">Categorías</h1>
            
            </div>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="categories-content">
      <div class="page-shell">
        <div class="categories-wrapper">
          <section class="summary-card">

            <div class="chips-row">
              <button
                class="filter-chip"
                :class="{ active: filtroArchivadas === 'activas' }"
                @click="filtroArchivadas = 'activas'"
              >
                Activas
              </button>

              <button
                class="filter-chip"
                :class="{ active: filtroArchivadas === 'archivadas' }"
                @click="filtroArchivadas = 'archivadas'"
              >
                Archivadas
              </button>
            </div>
          </section>

          <section v-if="loading" class="state-card">
            <ion-spinner name="crescent" />
            <p>Cargando categorías...</p>
          </section>

          <section v-else-if="error" class="state-card error-state">
            <ion-icon :icon="alertCircleOutline" />
            <p>{{ error }}</p>
          </section>

          <template v-else>
            <section class="block-section">
              <div class="block-header">
                <h2>Creadas por ti</h2>
                <span class="block-counter">{{ totalUsuario }}</span>
              </div>

              <div v-if="categoriasUsuario.length === 0" class="empty-card">
                <p>
                  {{
                    filtroArchivadas === 'activas'
                      ? 'No tienes categorías en este apartado.'
                      : 'No tienes categorías archivadas en este apartado.'
                  }}
                </p>
              </div>

              <template v-else>
                <div class="mini-title">Ingresos</div>
                <div v-if="categoriasUsuarioIngreso.length === 0" class="empty-card small">
                  <p>Sin categorías de ingreso.</p>
                </div>

                <div v-else class="category-card">
                  <div
                    v-for="categoria in categoriasUsuarioIngreso"
                    :key="categoria.id"
                    class="category-item"
                  >
                    <div class="category-left">
                      <div class="category-icon income">
                        <ion-icon :icon="arrowUpOutline" />
                      </div>

                      <div class="category-text">
                        <h3>{{ categoria.nombre }}</h3>
                      </div>
                    </div>

                    <div class="category-actions">
                      <button
                        v-if="filtroArchivadas === 'activas'"
                        class="action-button"
                        type="button"
                        @click="editarCategoria(categoria)"
                      >
                        Editar
                      </button>

                      <button
                        v-if="filtroArchivadas === 'activas'"
                        class="action-button danger"
                        type="button"
                        @click="cambiarArchivado(categoria, true)"
                      >
                        Archivar
                      </button>

                      <button
                        v-else
                        class="action-button"
                        type="button"
                        @click="cambiarArchivado(categoria, false)"
                      >
                        Desarchivar
                      </button>
                    </div>
                  </div>
                </div>

                <div class="mini-title">Gastos</div>
                <div v-if="categoriasUsuarioGasto.length === 0" class="empty-card small">
                  <p>Sin categorías de gasto.</p>
                </div>

                <div v-else class="category-card">
                  <div
                    v-for="categoria in categoriasUsuarioGasto"
                    :key="categoria.id"
                    class="category-item"
                  >
                    <div class="category-left">
                      <div class="category-icon expense">
                        <ion-icon :icon="arrowDownOutline" />
                      </div>

                      <div class="category-text">
                        <h3>{{ categoria.nombre }}</h3>
                      </div>
                    </div>

                    <div class="category-actions">
                      <button
                        v-if="filtroArchivadas === 'activas'"
                        class="action-button"
                        type="button"
                        @click="editarCategoria(categoria)"
                      >
                        Editar
                      </button>

                      <button
                        v-if="filtroArchivadas === 'activas'"
                        class="action-button danger"
                        type="button"
                        @click="cambiarArchivado(categoria, true)"
                      >
                        Archivar
                      </button>

                      <button
                        v-else
                        class="action-button"
                        type="button"
                        @click="cambiarArchivado(categoria, false)"
                      >
                        Desarchivar
                      </button>
                    </div>
                  </div>
                </div>
              </template>
            </section>

            <section class="block-section">
              <div class="block-header">
                <h2>Disponibles</h2>
                <span class="block-counter">{{ totalSistema }}</span>
              </div>

              <div class="mini-title">Ingresos</div>
              <div v-if="categoriasSistemaIngreso.length === 0" class="empty-card small">
                <p>Sin categorías de ingreso.</p>
              </div>

              <div v-else class="category-card">
                <div
                  v-for="categoria in categoriasSistemaIngreso"
                  :key="categoria.id"
                  class="category-item"
                >
                  <div class="category-left">
                    <div class="category-icon income">
                      <ion-icon :icon="arrowUpOutline" />
                    </div>

                    <div class="category-text">
                      <h3>{{ categoria.nombre }}</h3>
                    </div>
                  </div>

                  <div class="category-actions">
                    <button
                      v-if="filtroArchivadas === 'activas'"
                      class="action-button danger"
                      type="button"
                      @click="cambiarArchivado(categoria, true)"
                    >
                      Archivar
                    </button>

                    <button
                      v-else
                      class="action-button"
                      type="button"
                      @click="cambiarArchivado(categoria, false)"
                    >
                      Desarchivar
                    </button>
                  </div>
                </div>
              </div>

              <div class="mini-title">Gastos</div>
              <div v-if="categoriasSistemaGasto.length === 0" class="empty-card small">
                <p>Sin categorías de gasto.</p>
              </div>

              <div v-else class="category-card">
                <div
                  v-for="categoria in categoriasSistemaGasto"
                  :key="categoria.id"
                  class="category-item"
                >
                  <div class="category-left">
                    <div class="category-icon expense">
                      <ion-icon :icon="arrowDownOutline" />
                    </div>

                    <div class="category-text">
                      <h3>{{ categoria.nombre }}</h3>
                    </div>
                  </div>

                  <div class="category-actions">
                    <button
                      v-if="filtroArchivadas === 'activas'"
                      class="action-button danger"
                      type="button"
                      @click="cambiarArchivado(categoria, true)"
                    >
                      Archivar
                    </button>

                    <button
                      v-else
                      class="action-button"
                      type="button"
                      @click="cambiarArchivado(categoria, false)"
                    >
                      Desarchivar
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section v-if="totalCategoriasFiltradas === 0" class="state-card">
              <ion-icon :icon="folderOpenOutline" />
              <p>
                {{
                  filtroArchivadas === 'activas'
                    ? 'No hay categorías activas.'
                    : 'No hay categorías archivadas.'
                }}
              </p>
            </section>
          </template>
        </div>
      </div>

      <button
        v-if="filtroArchivadas === 'activas'"
        class="fab-add-button"
        type="button"
        @click="abrirNuevaCategoria"
        aria-label="Añadir categoría"
      >
        <ion-icon :icon="addOutline" />
      </button>

      <CategoriaModal
        :is-open="mostrandoModalCategoria"
        :usuario-id="usuarioId"
        :categoria="categoriaSeleccionada"
        @close="cerrarModalCategoria"
        @guardada="onCategoriaGuardada"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
  IonSpinner,
  alertController,
  toastController
} from '@ionic/vue'
import { computed, onMounted, ref } from 'vue'
import {
  addOutline,
  arrowBackOutline,
  arrowUpOutline,
  arrowDownOutline,
  alertCircleOutline,
  folderOpenOutline
} from 'ionicons/icons'
import { useRouter } from 'vue-router'
import CategoriaModal from '@/components/CategoriaModal.vue'
import {
  getCategorias,
  cambiarArchivadoCategoria,
  type Categoria
} from '@/services/categoriaService'

const router = useRouter()
const usuarioId = 'e7178a9b-d998-4efd-a029-f4e24977166a'

const categorias = ref<Categoria[]>([])
const loading = ref(false)
const error = ref('')
const mostrandoModalCategoria = ref(false)
const categoriaSeleccionada = ref<Categoria | null>(null)
const filtroArchivadas = ref<'activas' | 'archivadas'>('activas')

const categoriasFiltradas = computed(() =>
  categorias.value.filter(c =>
    filtroArchivadas.value === 'activas' ? !c.archivada : c.archivada
  )
)

const categoriasUsuario = computed(() =>
  categoriasFiltradas.value.filter(c => !c.esSistema)
)

const categoriasSistema = computed(() =>
  categoriasFiltradas.value.filter(c => c.esSistema)
)

const categoriasUsuarioIngreso = computed(() =>
  categoriasFiltradas.value.filter(c => !c.esSistema && Number(c.tipo) === 1)
)

const categoriasUsuarioGasto = computed(() =>
  categoriasFiltradas.value.filter(c => !c.esSistema && Number(c.tipo) === 2)
)

const categoriasSistemaIngreso = computed(() =>
  categoriasFiltradas.value.filter(c => c.esSistema && Number(c.tipo) === 1)
)

const categoriasSistemaGasto = computed(() =>
  categoriasFiltradas.value.filter(c => c.esSistema && Number(c.tipo) === 2)
)

const totalCategoriasFiltradas = computed(() => categoriasFiltradas.value.length)
const totalUsuario = computed(() => categoriasUsuario.value.length)
const totalSistema = computed(() => categoriasSistema.value.length)

const mostrarToast = async (
  mensaje: string,
  color: 'success' | 'warning' | 'danger' = 'success'
) => {
  const toast = await toastController.create({
    message: mensaje,
    duration: 1800,
    position: 'bottom',
    color
  })

  await toast.present()
}

const volver = () => {
  router.back()
}

const abrirNuevaCategoria = () => {
  categoriaSeleccionada.value = null
  mostrandoModalCategoria.value = true
}

const editarCategoria = (categoria: Categoria) => {
  if (categoria.esSistema || categoria.archivada) return
  categoriaSeleccionada.value = categoria
  mostrandoModalCategoria.value = true
}

const cerrarModalCategoria = () => {
  mostrandoModalCategoria.value = false
  categoriaSeleccionada.value = null
}

const cargarCategorias = async () => {
  try {
    loading.value = true
    error.value = ''
    categorias.value = await getCategorias(usuarioId)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudieron cargar las categorías.'
  } finally {
    loading.value = false
  }
}

const onCategoriaGuardada = async () => {
  await cargarCategorias()
  await mostrarToast(
    categoriaSeleccionada.value ? 'Categoría actualizada' : 'Categoría creada',
    'success'
  )
}

const cambiarArchivado = async (categoria: Categoria, archivada: boolean) => {
  const alerta = await alertController.create({
    header: archivada ? 'Archivar categoría' : 'Desarchivar categoría',
    message: archivada
      ? `¿Quieres archivar "${categoria.nombre}"?`
      : `¿Quieres desarchivar "${categoria.nombre}"?`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: archivada ? 'Archivar' : 'Desarchivar',
        role: 'destructive'
      }
    ]
  })

  await alerta.present()
  const { role } = await alerta.onDidDismiss()

  if (role !== 'destructive') return

  try {
    await cambiarArchivadoCategoria(categoria, archivada)
    await cargarCategorias()
    await mostrarToast(
      archivada ? 'Categoría archivada' : 'Categoría desarchivada',
      archivada ? 'warning' : 'success'
    )
  } catch (e) {
    error.value = e instanceof Error
      ? e.message
      : archivada
        ? 'No se pudo archivar la categoría.'
        : 'No se pudo desarchivar la categoría.'
  }
}

onMounted(async () => {
  await cargarCategorias()
})
</script>

<style scoped>
.custom-toolbar {
  --background: #233f6b;
  --color: #ffffff;
}

.topbar {
  padding: 14px 18px 18px;
}

.topbar-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.back-button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  flex-shrink: 0;
}

.topbar-kicker {
  margin: 0 0 4px;
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.78);
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.topbar-title {
  margin: 0;
  font-size: 1.7rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.15;
}

.topbar-subtitle {
  margin: 6px 0 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.92);
}

.categories-content {
  --background: #f2f0ef;
}

.page-shell {
  display: flex;
  justify-content: center;
  width: 100%;
}

.categories-wrapper {
  width: 100%;
  max-width: 430px;
  padding: 18px 16px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.summary-card {
  background: #ffffff;
  border-radius: 22px;
  box-shadow: 0 8px 22px rgba(35, 63, 107, 0.08);
  padding: 18px;
}

.summary-text h2 {
  margin: 0;
  font-size: 1.06rem;
  color: #17181c;
  font-weight: 800;
}

.summary-text p {
  margin: 6px 0 0;
  font-size: 0.92rem;
  color: #6f7782;
  line-height: 1.4;
}

.chips-row {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-chip {
  border: none;
  border-radius: 999px;
  padding: 12px 16px;
  background: #eef1f5;
  color: #233f6b;
  font-weight: 700;
  font-size: 0.95rem;
}

.filter-chip.active {
  background: #f1b80f;
  color: #17181c;
}

.block-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
}

.block-header h2 {
  margin: 0;
  font-size: 1.06rem;
  color: #17181c;
  font-weight: 800;
}

.block-counter {
  min-width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(35, 63, 107, 0.1);
  color: #233f6b;
  font-size: 0.85rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: #233f6b;
  padding: 0 4px;
  margin-top: 2px;
}

.category-card,
.empty-card,
.state-card {
  background: #ffffff;
  border-radius: 22px;
  box-shadow: 0 8px 22px rgba(35, 63, 107, 0.08);
}

.category-card {
  padding: 0 16px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid #ece8e6;
}

.category-item:last-child {
  border-bottom: none;
}

.category-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.category-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.category-icon.income {
  background: rgba(147, 169, 194, 0.24);
  color: #233f6b;
}

.category-icon.expense {
  background: rgba(241, 184, 15, 0.18);
  color: #17181c;
}

.category-text h3 {
  margin: 0;
  font-size: 1rem;
  color: #17181c;
  font-weight: 800;
}

.category-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.action-button {
  border: none;
  background: transparent;
  color: #233f6b;
  font-size: 0.84rem;
  font-weight: 700;
  padding: 0;
}

.action-button.danger {
  color: #c43d2f;
}

.empty-card,
.state-card {
  padding: 22px 16px;
  text-align: center;
  color: #6f7782;
}

.empty-card.small {
  padding: 16px 14px;
}

.error-state {
  color: #c43d2f;
}

.fab-add-button {
  position: fixed;
  right: 20px;
  bottom: 88px;
  width: 58px;
  height: 58px;
  border: none;
  border-radius: 50%;
  background: #f1b80f;
  color: #17181c;
  box-shadow: 0 10px 24px rgba(35, 63, 107, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  z-index: 20;
}
</style>