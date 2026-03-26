<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <div class="topbar">
          <div>
            <p class="topbar-kicker">FinMind</p>
            <h1 class="topbar-title">Tus movimientos</h1>
            <p class="topbar-subtitle">{{ nombreMesActual }}</p>
          </div>

          <button class="profile-button" type="button" aria-label="Opciones">
            <ion-icon :icon="optionsOutline" />
          </button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="movements-content">
      <div class="page-shell">
        <div class="movements-wrapper">
          <section class="filters-card">
            <div class="filters-header">
              <h2>Filtrar</h2>
              <p>Consulta tus ingresos y gastos del periodo seleccionado.</p>
            </div>

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
                    :class="{ clickable: Number(transaccion.origen) === 1 }"
                    @click="abrirEditarMovimiento(transaccion)"
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
                            {{ transaccion.tipo === 1 ? 'Ingreso' : 'Gasto' }}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div
                      class="movement-amount"
                      :class="transaccion.tipo === 1 ? 'income' : 'expense'"
                    >
                      {{ textoImporte(transaccion) }}
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
        :is-open="mostrandoModalNuevo"
        :usuario-id="usuarioId"
        :movimiento="movimientoSeleccionado"
        @close="cerrarNuevoMovimiento"
        @guardado="onMovimientoGuardado"
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
  IonButton,
  IonSpinner,
  IonInput,
  IonSelect,
  IonSelectOption
} from '@ionic/vue'
import { computed, onMounted, ref, watch } from 'vue'
import {
  optionsOutline,
  searchOutline,
  receiptOutline,
  alertCircleOutline,
  arrowUpOutline,
  arrowDownOutline,
  addOutline
} from 'ionicons/icons'
import {
  getTransaccionesPorUsuario,
  type TransaccionListadoResponse
} from '@/services/transaccionService'
import NuevoMovimientoModal from '@/components/NuevoMovimientoModal.vue'

const usuarioId = 'e7178a9b-d998-4efd-a029-f4e24977166a'

const hoy = new Date()
const mesActual = hoy.getMonth() + 1
const anioActual = hoy.getFullYear()

const filtroMes = ref<number | null>(mesActual)
const filtroAnio = ref<number | null>(anioActual)
const filtroTipo = ref<number | null>(null)
const filtroTexto = ref('')

const loading = ref(false)
const error = ref('')

const transacciones = ref<TransaccionListadoResponse[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const totalPages = ref(0)

const mostrandoModalNuevo = ref(false)
const movimientoSeleccionado = ref<TransaccionListadoResponse | null>(null)

const abrirNuevoMovimiento = () => {
  movimientoSeleccionado.value = null
  mostrandoModalNuevo.value = true
}

const abrirEditarMovimiento = (transaccion: TransaccionListadoResponse) => {
  if (Number(transaccion.origen) !== 1) {
    return
  }

  movimientoSeleccionado.value = transaccion
  mostrandoModalNuevo.value = true
}

const cerrarNuevoMovimiento = () => {
  mostrandoModalNuevo.value = false
  movimientoSeleccionado.value = null
}

const onMovimientoGuardado = async () => {
  await cargarTransacciones(true)
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

const cargarTransacciones = async (reset = false) => {
  try {
    loading.value = true
    error.value = ''

    if (reset) {
      page.value = 1
    }

    const resultado = await getTransaccionesPorUsuario({
      usuarioId,
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
.custom-toolbar {
  --background: #233f6b;
  --color: #ffffff;
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

.movements-content {
  --background: #f2f0ef;
}

.page-shell {
  display: flex;
  justify-content: center;
  width: 100%;
}

.movements-wrapper {
  width: 100%;
  max-width: 430px;
  padding: 18px 16px 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.filters-card {
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 8px 22px rgba(35, 63, 107, 0.08);
  padding: 18px;
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

.filter-label {
  font-size: 0.88rem;
  color: #6f7782;
  font-weight: 700;
}

.custom-select {
  --placeholder-color: #6f7782;
  --placeholder-opacity: 1;
  --color: #17181c;
  --highlight-color-focused: transparent;
  --padding-start: 14px;
  --padding-end: 12px;
  background: #f8f7f6;
  border-radius: 16px;
  min-height: 50px;
  color: #17181c;
  font-weight: 700;
  display: flex;
  align-items: center;
}

ion-select {
  color: #17181c;
}

.filter-group ion-select::part(text) {
  color: #17181c;
  opacity: 1;
}

.filter-group ion-select::part(icon) {
  color: #6f7782;
  opacity: 1;
}

.search-box {
  margin-top: 14px;
  background: #f8f7f6;
  border-radius: 16px;
  padding: 0 14px;
  min-height: 52px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6f7782;
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

.summary-strip {
  padding: 0 2px;
}

.summary-strip p {
  margin: 0;
  font-size: 0.95rem;
  color: #233f6b;
  font-weight: 700;
}

.movements-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading-state,
.empty-state,
.error-state {
  background: #ffffff;
  border-radius: 22px;
  box-shadow: 0 8px 22px rgba(35, 63, 107, 0.08);
  padding: 28px 16px;
  text-align: center;
  color: #6f7782;
}

.empty-state h4 {
  margin: 10px 0 6px;
  color: #17181c;
  font-size: 1.06rem;
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

.day-card {
  background: #ffffff;
  border-radius: 22px;
  box-shadow: 0 8px 22px rgba(35, 63, 107, 0.08);
  padding: 0 16px;
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

.movement-item.clickable {
  cursor: pointer;
}

.movement-item.clickable:active {
  opacity: 0.85;
}

.movement-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
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