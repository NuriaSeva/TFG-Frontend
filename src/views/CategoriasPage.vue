<script setup lang="ts">
import { computed, ref } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonIcon,
  IonLabel,
  IonCard,
  IonCardContent,
  IonChip,
  IonText,
  IonSpinner,
  alertController,
  toastController
} from '@ionic/vue'
import {
  addOutline,
  createOutline,
  archiveOutline,
  refreshOutline,
  trashOutline,
  fileTrayOutline,
  pricetagOutline,
  walletOutline,
  filmOutline,
  shirtOutline,
  heartOutline,
  homeOutline,
  carOutline,
  busOutline,
  trainOutline,
  cartOutline,
  medicalOutline,
  giftOutline,
  airplaneOutline,
  schoolOutline,
  footballOutline,
  gameControllerOutline,
  cashOutline,
  briefcaseOutline,
  fitnessOutline,
  cafeOutline,
  restaurantOutline,
  colorWandOutline,
  phonePortraitOutline,
  laptopOutline,
  bookOutline,
  musicalNotesOutline,
  pawOutline,
  cardOutline,
  bagHandleOutline,
  basketOutline,
  libraryOutline,
  bedOutline,
  buildOutline,
  diamondOutline,
  flowerOutline,
  hardwareChipOutline,
  leafOutline,
  newspaperOutline,
  nutritionOutline,
  rocketOutline,
  storefrontOutline,
  trophyOutline
} from 'ionicons/icons'
import CategoriaModal, { type CategoriaFormulario } from '@/components/CategoriaModal.vue'
import {
  getCategorias,
  crearCategoria,
  actualizarCategoria,
  cambiarArchivadoCategoria,
  eliminarCategoria,
  obtenerImpactoEliminarCategoria,
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

const iconosMap: Record<string, string> = {
  'pricetag-outline': pricetagOutline,
  'wallet-outline': walletOutline,
  'film-outline': filmOutline,
  'shirt-outline': shirtOutline,
  'heart-outline': heartOutline,
  'home-outline': homeOutline,
  'car-outline': carOutline,
  'bus-outline': busOutline,
  'train-outline': trainOutline,
  'cart-outline': cartOutline,
  'medical-outline': medicalOutline,
  'gift-outline': giftOutline,
  'airplane-outline': airplaneOutline,
  'school-outline': schoolOutline,
  'football-outline': footballOutline,
  'game-controller-outline': gameControllerOutline,
  'cash-outline': cashOutline,
  'briefcase-outline': briefcaseOutline,
  'fitness-outline': fitnessOutline,
  'cafe-outline': cafeOutline,
  'restaurant-outline': restaurantOutline,
  'color-wand-outline': colorWandOutline,
  'phone-portrait-outline': phonePortraitOutline,
  'laptop-outline': laptopOutline,
  'book-outline': bookOutline,
  'musical-notes-outline': musicalNotesOutline,
  'paw-outline': pawOutline,
  'card-outline': cardOutline,
  'bag-handle-outline': bagHandleOutline,
  'basket-outline': basketOutline,
  'library-outline': libraryOutline,
  'bed-outline': bedOutline,
  'build-outline': buildOutline,
  'diamond-outline': diamondOutline,
  'flower-outline': flowerOutline,
  'hardware-chip-outline': hardwareChipOutline,
  'leaf-outline': leafOutline,
  'newspaper-outline': newspaperOutline,
  'nutrition-outline': nutritionOutline,
  'rocket-outline': rocketOutline,
  'storefront-outline': storefrontOutline,
  'trophy-outline': trophyOutline
}

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
        usuarioId: categoriaEditando.value.usuarioId ?? null,
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

const onEliminarCategoria = async (categoria: Categoria) => {
  if (categoria.esSistema) {
    await mostrarToast('Las categorías del sistema no se pueden eliminar.', 'warning')
    return
  }

  try {
    const impacto = await obtenerImpactoEliminarCategoria(categoria.id)
    const totalAfectados = impacto.movimientosSinCategoria ?? 0
    const mensajeImpacto =
      totalAfectados === 0
        ? 'No hay movimientos asociados a esta categoría.'
        : `Se quedarán sin categoría ${totalAfectados} movimiento${totalAfectados === 1 ? '' : 's'}.`

    const alert = await alertController.create({
      header: 'Eliminar categoría',
      message: `¿Quieres eliminar la categoría "${categoria.nombre}"? ${mensajeImpacto}`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            void (async () => {
              try {
                await eliminarCategoria(categoria.id)
                await mostrarToast('Categoría eliminada correctamente.')
                await cargarCategorias()
              } catch (error: any) {
                await mostrarToast(
                  error?.message || 'No se pudo eliminar la categoría.',
                  'danger'
                )
              }
            })()
          }
        }
      ]
    })

    await alert.present()
  } catch (error: any) {
    await mostrarToast(
      error?.message || 'No se pudo preparar la eliminación de la categoría.',
      'danger'
    )
  }
}

const refrescar = async () => {
  await cargarCategorias()
}

const textoEstado = (categoria: Categoria) => {
  return categoria.tipo === 1 ? 'Ingreso' : 'Gasto'
}

const normalizarColor = (color?: string | null) => {
  if (!color) return '#233f6b'
  const valor = color.trim()
  return valor.startsWith('#') ? valor : `#${valor}`
}

const resolverIcono = (icono?: string | null) => {
  if (!icono) return pricetagOutline

  const clave = icono.trim().toLowerCase()
  return iconosMap[clave] ?? pricetagOutline
}

const fondoIcono = (categoria: Categoria) => {
  const color = normalizarColor(categoria.color)
  return `linear-gradient(0deg, rgba(255,255,255,0.78), rgba(255,255,255,0.78)), ${color}`
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
            <h1 class="topbar-title">Gestión de Categorías</h1>
          </div>

          <button
            class="profile-button"
            type="button"
            @click="refrescar"
            aria-label="Actualizar categorías"
          >
            <ion-icon :icon="refreshOutline" />
          </button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="categories-content">
      <section class="filters-card">
        <div class="categories-actions-row">
          <button class="create-category-button" type="button" @click="abrirCrearCategoria">
            <ion-icon :icon="addOutline" />
            <span>Nueva categoría</span>
          </button>
        </div>

        <div class="filter-block">
          <p class="filter-block-label">Tipo</p>
          <div class="chips-row">
            <button
              class="filter-chip"
              :class="{ active: filtroTipo === 'todas' }"
              @click="filtroTipo = 'todas'"
            >
              Todas
            </button>
            <button
              class="filter-chip"
              :class="{ active: filtroTipo === 'gastos' }"
              @click="filtroTipo = 'gastos'"
            >
              Gastos
            </button>
            <button
              class="filter-chip"
              :class="{ active: filtroTipo === 'ingresos' }"
              @click="filtroTipo = 'ingresos'"
            >
              Ingresos
            </button>
          </div>
        </div>

        <div class="filter-block">
          <p class="filter-block-label">Estado</p>
          <div class="chips-row">
            <button
              class="filter-chip"
              :class="{ active: filtroArchivado === 'activas' }"
              @click="filtroArchivado = 'activas'"
            >
              Activas
            </button>
            <button
              class="filter-chip"
              :class="{ active: filtroArchivado === 'archivadas' }"
              @click="filtroArchivado = 'archivadas'"
            >
              Archivadas
            </button>
          </div>
        </div>
      </section>

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
                  <div class="icono-categoria" :style="{ background: fondoIcono(categoria) }">
                    <ion-icon
                      class="simbolo-categoria"
                      :icon="resolverIcono(categoria.icono)"
                      :style="{ color: normalizarColor(categoria.color) }"
                    />
                  </div>
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

              <ion-button
                v-if="!categoria.esSistema"
                fill="clear"
                size="small"
                class="boton-eliminar"
                @click="onEliminarCategoria(categoria)"
              >
                <ion-icon slot="start" :icon="trashOutline" />
                Eliminar
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

.filters-card {
  margin: 14px 16px 10px;
  padding: 14px;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(35, 63, 107, 0.08);
}

.categories-actions-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.create-category-button {
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #e6b21d 0%, #f2c647 100%);
  color: #181d27;
  font-size: 0.84rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  padding: 10px 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 8px 16px rgba(230, 178, 29, 0.26);
}

.create-category-button ion-icon {
  font-size: 1rem;
}

.filter-block + .filter-block {
  margin-top: 12px;
}

.filter-block-label {
  margin: 0 0 8px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6f7782;
  font-weight: 700;
}

.chips-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chip {
  border: none;
  border-radius: 999px;
  padding: 9px 14px;
  background: #edf1f6;
  color: #233f6b;
  font-weight: 700;
  font-size: 0.85rem;
}

.filter-chip.active {
  background: #f1b80f;
  color: #17181c;
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
  gap: 12px;
}

.titulo-linea h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #233f6b;
}

.icono-categoria {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(35, 63, 107, 0.06);
}

.simbolo-categoria {
  font-size: 1.15rem;
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

.boton-eliminar {
  --color: #c43d2f;
}
</style>
