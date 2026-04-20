<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <div class="topbar">
          <div>
            <h1 class="topbar-title">Tus movimientos</h1>
            <p class="topbar-subtitle">{{ nombreMesActual }}</p>
          </div>

          <button
            class="profile-button"
            type="button"
            @click="abrirOpcionesExportacion"
            :disabled="exportandoCsv"
            aria-label="Exportar movimientos"
          >
            <ion-spinner v-if="exportandoCsv" name="crescent" />
            <ion-icon v-else :icon="downloadOutline" />
          </button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="movements-content">
      <div class="page-shell">
        <div class="movements-wrapper">
          <section class="filters-card">
            <div class="filters-grid">
              <div class="filter-group">
                <label class="filter-label">Mes</label>
                <ion-select
                  v-model="filtroMes"
                  interface="popover"
                  class="custom-select"
                >
                  <ion-select-option
                    v-for="mes in mesesDisponibles"
                    :key="mes.value"
                    :value="mes.value"
                  >
                    {{ mes.label }}
                  </ion-select-option>
                </ion-select>
              </div>

              <div class="filter-group">
                <label class="filter-label">Año</label>
                <ion-select
                  v-model="filtroAnio"
                  interface="popover"
                  class="custom-select"
                >
                  <ion-select-option
                    v-for="anio in aniosDisponibles"
                    :key="anio"
                    :value="anio"
                  >
                    {{ anio }}
                  </ion-select-option>
                </ion-select>
              </div>
            </div>

            <div class="search-box">
              <ion-icon :icon="searchOutline" />
              <ion-input
                v-model="filtroTexto"
                placeholder="Buscar movimiento"
                @keyup.enter="buscar"
              />
            </div>

            <div class="chips-row">
              <button
                class="filter-chip"
                :class="{ active: filtroTipo === null }"
                @click="setFiltroTipo(null)"
              >
                Todos
              </button>

              <button
                class="filter-chip"
                :class="{ active: filtroTipo === 1 }"
                @click="setFiltroTipo(1)"
              >
                Ingresos
              </button>

              <button
                class="filter-chip"
                :class="{ active: filtroTipo === 2 }"
                @click="setFiltroTipo(2)"
              >
                Gastos
              </button>
            </div>
          </section>

          <section class="summary-strip" v-if="!loading && !error && transacciones.length > 0">
            <p>
              {{ total }} movimiento<span v-if="total !== 1">s</span>
              en {{ nombreMesActual }}
            </p>
          </section>

          <section class="movements-section">
            <div v-if="loading && transacciones.length === 0" class="loading-state">
              <ion-spinner name="crescent" />
              <p>Cargando movimientos...</p>
            </div>

            <div v-else-if="error" class="error-state">
              <ion-icon :icon="alertCircleOutline" />
              <p>{{ error }}</p>
            </div>

            <div v-else-if="transacciones.length === 0" class="empty-state">
              <ion-icon :icon="receiptOutline" />
              <h4>No hay movimientos</h4>
              <p>No se encontraron transacciones con los filtros actuales.</p>
            </div>

            <div v-else class="movements-list">
              <div
                v-for="grupo in transaccionesAgrupadasPorDia"
                :key="grupo.clave"
                class="day-group"
              >
                <div class="day-header">
                  {{ grupo.titulo }}
                </div>

                <div class="day-card">
                  <div
                    v-for="transaccion in grupo.items"
                    :key="transaccion.id"
                    class="movement-item"
                  >
                    <div class="movement-left">
                      <div
                        class="movement-icon"
                        :class="transaccion.tipo === 1 ? 'income' : 'expense'"
                      >
                        <ion-icon
                          :icon="transaccion.tipo === 1 ? arrowUpOutline : arrowDownOutline"
                        />
                      </div>

                      <div class="movement-text">
                        <h4>{{ transaccion.descripcion || 'Movimiento bancario' }}</h4>
                        <p class="movement-meta">
                          {{ formatearFechaCorta(transaccion.fecha) }}
                          <span class="movement-tag">
                            {{ transaccion.categoriaNombre || 'Sin categoría' }}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div class="movement-right">
                      <div
                        class="movement-amount"
                        :class="transaccion.tipo === 1 ? 'income' : 'expense'"
                      >
                        {{ textoImporte(transaccion) }}
                      </div>

                      <button
                        v-if="Number(transaccion.origen) === 1"
                        class="edit-movement-button"
                        type="button"
                        @click.stop="abrirEditarMovimiento(transaccion)"
                        aria-label="Editar movimiento"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="list-footer" v-if="transacciones.length > 0">
              <ion-button
                v-if="hayMasPaginas"
                class="load-more-button"
                @click="cargarMas"
                :disabled="loading"
              >
                <ion-spinner v-if="loading" name="crescent" />
                <span v-else>Ver más movimientos</span>
              </ion-button>

              <p v-else class="end-text">No hay más movimientos</p>
            </div>
          </section>
        </div>
      </div>

      <button
        class="fab-add-button"
        type="button"
        @click="abrirNuevoMovimiento"
        aria-label="Añadir movimiento"
      >
        <ion-icon :icon="addOutline" />
      </button>

      <NuevoMovimientoModal
        :abierto="mostrandoModalNuevo"
        :movimiento-inicial="movimientoSeleccionado"
        @cerrar="cerrarNuevoMovimiento"
        @guardar="onMovimientoGuardado"
      />

      <ion-action-sheet
        :is-open="mostrandoAccionesExportacion"
        header="¿Qué quieres exportar?"
        :buttons="accionesExportacion"
        @didDismiss="mostrandoAccionesExportacion = false"
      />

      <ion-action-sheet
        :is-open="mostrandoAccionesDestinoExportacion"
        header="¿Qué quieres hacer con el CSV?"
        :buttons="accionesDestinoExportacion"
        @didDismiss="mostrandoAccionesDestinoExportacion = false"
      />

      <ion-toast
        :is-open="toastAbierto"
        :message="toastMensaje"
        :duration="2600"
        :color="toastColor"
        position="bottom"
        @didDismiss="toastAbierto = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonActionSheet,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonToast,
  IonToolbar,
  alertController
} from '@ionic/vue'
import { computed, onMounted, ref, watch } from 'vue'
import {
  addOutline,
  alertCircleOutline,
  arrowDownOutline,
  arrowUpOutline,
  documentTextOutline,
  downloadOutline,
  folderOpenOutline,
  funnelOutline,
  receiptOutline,
  searchOutline,
  shareSocialOutline
} from 'ionicons/icons'
import {
  actualizarMovimiento,
  crearMovimientoManual,
  exportarTransaccionesCsv,
  getTransaccionesPorUsuario,
  sugerirCategoriaIA,
  type ModoExportacionCsv,
  type TransaccionListadoResponse
} from '@/services/transaccionService'
import NuevoMovimientoModal, {
  type MovimientoFormulario
} from '@/components/NuevoMovimientoModal.vue'

const hoy = new Date()
const mesActual = hoy.getMonth() + 1
const anioActual = hoy.getFullYear()

const filtroMes = ref<number | null>(mesActual)
const filtroAnio = ref<number | null>(anioActual)
const filtroTipo = ref<number | null>(null)
const filtroTexto = ref('')

const loading = ref(false)
const exportandoCsv = ref(false)
const error = ref('')

const transacciones = ref<TransaccionListadoResponse[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const totalPages = ref(0)

const mostrandoModalNuevo = ref(false)
const movimientoSeleccionado = ref<TransaccionListadoResponse | null>(null)
const mostrandoAccionesExportacion = ref(false)
const mostrandoAccionesDestinoExportacion = ref(false)
const exportacionPendienteTodo = ref(false)
const toastAbierto = ref(false)
const toastMensaje = ref('')
const toastColor = ref<'success' | 'warning' | 'danger'>('success')

const abrirNuevoMovimiento = () => {
  movimientoSeleccionado.value = null
  mostrandoModalNuevo.value = true
}

const abrirEditarMovimiento = (transaccion: TransaccionListadoResponse) => {
  if (Number(transaccion.origen) !== 1) {
    return
  }

  movimientoSeleccionado.value = {
    ...transaccion
  }

  mostrandoModalNuevo.value = true
}

const cerrarNuevoMovimiento = () => {
  mostrandoModalNuevo.value = false
  movimientoSeleccionado.value = null
}

const construirPayloadActualizacion = (
  transaccion: TransaccionListadoResponse,
  formulario: MovimientoFormulario,
  categoriaId: string | null
) => {
  return {
    id: transaccion.id,
    cuentaBancariaId: transaccion.cuentaBancariaId ?? null,
    categoriaId,
    importe: Number(formulario.importe ?? 0),
    moneda: formulario.moneda?.trim() || 'EUR',
    tipo: formulario.tipo,
    origen: transaccion.origen,
    proveedor: transaccion.proveedor,
    fecha: formulario.fecha,
    descripcion: formulario.descripcion?.trim() || null,
    idTransaccionExterna: transaccion.idTransaccionExterna ?? null
  }
}

const aplicarSugerenciaConConfirmacion = async (
  transaccionCreada: TransaccionListadoResponse,
  formulario: MovimientoFormulario
) => {
  if (formulario.categoriaId != null || transaccionCreada.categoriaId != null) {
    return
  }

  try {
    const sugerencia = await sugerirCategoriaIA({
      descripcion: transaccionCreada.descripcion ?? 'Movimiento manual',
      importe: transaccionCreada.importe,
      tipo: transaccionCreada.tipo
    })

    const mejorSugerencia = sugerencia.mejorSugerencia

    if (!sugerencia.requiereConfirmacion || !mejorSugerencia?.categoriaId) {
      return
    }

    const confianzaPorcentaje = Math.round((mejorSugerencia.confianza ?? 0) * 100)

    const alerta = await alertController.create({
      header: 'Sugerencia de categoría',
      message: `La IA sugiere <strong>${mejorSugerencia.categoriaNombre}</strong> (${confianzaPorcentaje}% de confianza). ¿Quieres aplicarla?`,
      buttons: [
        {
          text: 'Mantener sin categoría',
          role: 'cancel'
        },
        {
          text: 'Aplicar sugerencia',
          handler: () => {
            void (async () => {
              try {
                await actualizarMovimiento(
                  construirPayloadActualizacion(
                    transaccionCreada,
                    formulario,
                    mejorSugerencia.categoriaId
                  )
                )

                await cargarTransacciones(true)
                mostrarToast(
                  `Categoría sugerida aplicada: ${mejorSugerencia.categoriaNombre}.`,
                  'success'
                )
              } catch (error) {
                console.error(error)
                mostrarToast(
                  error instanceof Error
                    ? error.message
                    : 'No se pudo aplicar la categoría sugerida.',
                  'danger'
                )
              }
            })()
          }
        }
      ]
    })

    await alerta.present()
  } catch (e) {
    console.error(e)
  }
}

const onMovimientoGuardado = async (formulario: MovimientoFormulario) => {
  try {
    const isEdicion = movimientoSeleccionado.value != null

    if (isEdicion && movimientoSeleccionado.value) {
      await actualizarMovimiento(
        construirPayloadActualizacion(
          movimientoSeleccionado.value,
          formulario,
          formulario.categoriaId ?? null
        )
      )

      mostrarToast('Movimiento actualizado correctamente.', 'success')
      cerrarNuevoMovimiento()
      await cargarTransacciones(true)
      return
    }

    const transaccionCreada = await crearMovimientoManual({
      categoriaId: formulario.categoriaId ?? null,
      importe: Number(formulario.importe ?? 0),
      tipo: formulario.tipo,
      fecha: formulario.fecha,
      descripcion: formulario.descripcion?.trim() || null,
      moneda: formulario.moneda?.trim() || 'EUR'
    })

    cerrarNuevoMovimiento()
    await cargarTransacciones(true)

    if (transaccionCreada.categoriaId != null) {
      mostrarToast('Movimiento creado y categorizado automáticamente.', 'success')
      return
    }

    mostrarToast('Movimiento creado sin categoría automática.', 'warning')
    await aplicarSugerenciaConConfirmacion(transaccionCreada, formulario)
  } catch (e) {
    console.error(e)
    mostrarToast(
      e instanceof Error ? e.message : 'No se pudo guardar el movimiento.',
      'danger'
    )
  }
}

const aniosDisponibles = computed(() => [anioActual, anioActual - 1, anioActual - 2])

const mesesBase = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' }
]

const mesesDisponibles = computed(() => {
  if (filtroAnio.value === anioActual) {
    return mesesBase.filter(m => m.value <= mesActual)
  }
  return mesesBase
})

const nombreMesActual = computed(() => {
  if (!filtroMes.value || !filtroAnio.value) return ''
  return new Date(filtroAnio.value, filtroMes.value - 1, 1).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  })
})

const hayMasPaginas = computed(() => {
  return transacciones.value.length < total.value
})

const accionesExportacion = computed(() => [
  {
    text: 'Movimientos visibles',
    icon: funnelOutline,
    handler: () => {
      prepararExportacion(false)
    }
  },
  {
    text: 'Todos los movimientos',
    icon: documentTextOutline,
    handler: () => {
      prepararExportacion(true)
    }
  },
  {
    text: 'Cancelar',
    role: 'cancel'
  }
])

const accionesDestinoExportacion = computed(() => [
  {
    text: 'Guardar en dispositivo',
    icon: folderOpenOutline,
    handler: () => {
      void exportarCsv(exportacionPendienteTodo.value, 'guardar')
    }
  },
  {
    text: 'Compartir CSV',
    icon: shareSocialOutline,
    handler: () => {
      void exportarCsv(exportacionPendienteTodo.value, 'compartir')
    }
  },
  {
    text: 'Cancelar',
    role: 'cancel'
  }
])

const claveDia = (fecha: string) => {
  const d = new Date(fecha)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const tituloGrupoDia = (fecha: string) => {
  const d = new Date(fecha)
  const hoyLocal = new Date()
  const ayer = new Date()
  ayer.setDate(hoyLocal.getDate() - 1)

  const esMismoDia = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  if (esMismoDia(d, hoyLocal)) return 'Hoy'
  if (esMismoDia(d, ayer)) return 'Ayer'

  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const transaccionesAgrupadasPorDia = computed(() => {
  const grupos = new Map<string, TransaccionListadoResponse[]>()

  for (const transaccion of transacciones.value) {
    const clave = claveDia(transaccion.fecha)
    const items = grupos.get(clave) ?? []
    items.push(transaccion)
    grupos.set(clave, items)
  }

  return Array.from(grupos.entries()).map(([clave, items]) => ({
    clave,
    titulo: tituloGrupoDia(items[0].fecha),
    items
  }))
})

const mostrarToast = (mensaje: string, color: 'success' | 'warning' | 'danger') => {
  toastMensaje.value = mensaje
  toastColor.value = color
  toastAbierto.value = true
}

const abrirOpcionesExportacion = () => {
  if (exportandoCsv.value) return
  mostrandoAccionesExportacion.value = true
}

const prepararExportacion = (exportarTodo: boolean) => {
  exportacionPendienteTodo.value = exportarTodo
  mostrandoAccionesExportacion.value = false
  mostrandoAccionesDestinoExportacion.value = true
}

const exportarCsv = async (exportarTodo: boolean, modo: ModoExportacionCsv) => {
  if (!exportarTodo && total.value === 0) {
    mostrarToast('No hay movimientos con los filtros actuales para exportar.', 'warning')
    return
  }

  try {
    exportandoCsv.value = true
    mostrandoAccionesDestinoExportacion.value = false

    const resultado = await exportarTransaccionesCsv({
      mes: filtroMes.value,
      anio: filtroAnio.value,
      tipo: filtroTipo.value,
      texto: filtroTexto.value,
      exportarTodo
    }, modo)

    if (modo === 'guardar') {
      const nombreArchivo = resultado?.nombreArchivo ?? 'movimientos.csv'
      mostrarToast(`CSV guardado en Documentos/FinMind: ${nombreArchivo}`, 'success')
      return
    }

    mostrarToast(
      exportarTodo
        ? 'Se ha abierto el selector para compartir todos los movimientos.'
        : 'Se ha abierto el selector para compartir los movimientos visibles.',
      'success'
    )
  } catch (e) {
    console.error(e)
    mostrarToast(
      e instanceof Error ? e.message : 'No se pudieron exportar los movimientos.',
      'danger'
    )
  } finally {
    exportandoCsv.value = false
  }
}

const cargarTransacciones = async (reset = false) => {
  try {
    loading.value = true
    error.value = ''

    if (reset) {
      page.value = 1
    }

    const resultado = await getTransaccionesPorUsuario({
      mes: filtroMes.value,
      anio: filtroAnio.value,
      tipo: filtroTipo.value,
      texto: filtroTexto.value,
      pagina: page.value,
      tamanyo: pageSize.value
    })

    total.value = resultado.total
    totalPages.value = resultado.totalPaginas

    if (reset) {
      transacciones.value = resultado.items
    } else {
      const existentes = new Set(transacciones.value.map(t => t.id))
      const nuevos = resultado.items.filter(t => !existentes.has(t.id))
      transacciones.value = [...transacciones.value, ...nuevos]
    }
  } catch (e) {
    console.error(e)
    error.value =
      e instanceof Error ? e.message : 'No se pudieron cargar los movimientos.'
  } finally {
    loading.value = false
  }
}

const buscar = async () => {
  await cargarTransacciones(true)
}

const setFiltroTipo = async (tipo: number | null) => {
  filtroTipo.value = tipo
  await cargarTransacciones(true)
}

const cargarMas = async () => {
  if (!hayMasPaginas.value || loading.value) return
  page.value += 1
  await cargarTransacciones(false)
}

const formatearFechaCorta = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short'
  })
}

const textoImporte = (t: TransaccionListadoResponse) => {
  const valor = t.importe.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  return t.tipo === 1 ? `+${valor} €` : `-${valor} €`
}

watch(filtroAnio, async (nuevoAnio) => {
  if (nuevoAnio == null) return

  const mesesValidos = nuevoAnio === anioActual
    ? mesesBase.filter(m => m.value <= mesActual)
    : mesesBase

  const mesValido = mesesValidos.some(m => m.value === filtroMes.value)

  if (!mesValido) {
    filtroMes.value = mesesValidos[mesesValidos.length - 1]?.value ?? 1
    return
  }

  await cargarTransacciones(true)
})

watch(filtroMes, async () => {
  await cargarTransacciones(true)
})

onMounted(async () => {
  await cargarTransacciones(true)
})
</script>

<style scoped>
.movements-wrapper {
  gap: 14px;
}

.day-card {
  padding: 0 16px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 18px;
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
  font-size: 1.75rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.15;
}

.topbar-subtitle {
  margin: 6px 0 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.92);
  text-transform: capitalize;
}

.profile-button {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.profile-button:disabled {
  opacity: 0.72;
}

.filters-header {
  margin-bottom: 14px;
}

.filters-header h2 {
  margin: 0;
  font-size: 1.08rem;
  color: #17181c;
  font-weight: 800;
}

.filters-header p {
  margin: 6px 0 0;
  font-size: 0.92rem;
  color: #6f7782;
  line-height: 1.4;
}

.filters-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.movements-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.movements-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.day-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.day-header {
  font-size: 0.9rem;
  font-weight: 800;
  color: #233f6b;
  padding: 2px 4px;
  text-transform: capitalize;
}

.movement-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid #ece8e6;
}

.movement-item:last-child {
  border-bottom: none;
}

.movement-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.movement-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.edit-movement-button {
  border: none;
  background: transparent;
  color: #233f6b;
  font-size: 0.84rem;
  font-weight: 700;
  padding: 0;
}

.movement-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.movement-icon.income {
  background: rgba(147, 169, 194, 0.24);
  color: #233f6b;
}

.movement-icon.expense {
  background: rgba(241, 184, 15, 0.18);
  color: #1c1c1f;
}

.movement-text {
  flex: 1;
  min-width: 0;
}

.movement-text h4 {
  margin: 0 0 6px;
  font-size: 1rem;
  color: #17181c;
  font-weight: 800;
  line-height: 1.3;
}

.movement-meta {
  margin: 0;
  font-size: 0.88rem;
  color: #6f7782;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.movement-tag {
  font-weight: 700;
}

.movement-amount {
  white-space: nowrap;
  font-weight: 800;
  font-size: 1rem;
  flex-shrink: 0;
}

.movement-amount.income {
  color: #233f6b;
}

.movement-amount.expense {
  color: #c43d2f;
}

.list-footer {
  margin-top: 6px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.load-more-button {
  --background: #233f6b;
  --background-hover: #233f6b;
  --background-activated: #233f6b;
  --color: #ffffff;
  --border-radius: 18px;
  min-height: 50px;
  font-weight: 800;
}

.end-text {
  margin: 0;
  font-size: 0.9rem;
  color: #6f7782;
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

ion-spinner {
  width: 18px;
  height: 18px;
}
</style>
