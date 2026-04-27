<template>
  <ion-page>
    <ion-content class="settings-content">
      <div class="page-shell">
        <div class="admin-wrapper">
          <section class="admin-actions">
            <button
              class="action-icon action-refresh"
              type="button"
              :disabled="cargandoGeneral"
              @click="refrescarVistaActiva"
              aria-label="Refrescar panel"
            >
              <ion-icon :icon="refreshOutline" />
            </button>
            <button
              class="action-icon action-logout"
              type="button"
              @click="onCerrarSesion"
              aria-label="Cerrar sesion"
            >
              <ion-icon :icon="logOutOutline" />
            </button>
          </section>

          <ion-segment v-model="panelActivo" class="admin-segment">
            <ion-segment-button value="rendimiento">
              <ion-label>Rendimiento</ion-label>
            </ion-segment-button>
            <ion-segment-button value="usuarios">
              <ion-label>Usuarios</ion-label>
            </ion-segment-button>
          </ion-segment>

          <template v-if="panelActivo === 'usuarios'">
            <section class="admin-section">
              <div class="users-header">
                <h3 class="section-title">Listado</h3>
                <p class="users-total">{{ usuarios.length }} usuarios</p>
              </div>

              <div class="search-box-admin">
                <ion-icon :icon="searchOutline" />
                <input
                  v-model.trim="busquedaUsuario"
                  type="text"
                  placeholder="Buscar por nombre o email"
                  aria-label="Buscar usuarios"
                >
              </div>

              <div class="users-list">
                <article v-for="usuario in usuariosFiltrados" :key="usuario.id" class="user-card">
                  <div class="user-head">
                    <div>
                      <p class="user-name">{{ usuario.nombre }}</p>
                      <p class="user-email">{{ usuario.email }}</p>
                      <p v-if="usuario.fechaUltimoAcceso" class="user-last-access">
                        Ultimo acceso: {{ new Date(usuario.fechaUltimoAcceso).toLocaleString() }}
                      </p>
                    </div>
                    <div class="user-meta">
                      <span class="pill">{{ usuario.rol }}</span>
                      <span class="pill" :class="usuario.activo ? 'pill-ok' : 'pill-off'">
                        {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                      </span>
                    </div>
                  </div>

                  <div class="user-actions">
                    <ion-button
                      class="action-btn action-btn-secondary"
                      size="small"
                      fill="outline"
                      :disabled="actualizandoUsuarioId === usuario.id"
                      @click="onCambiarEstado(usuario)"
                    >
                      {{ usuario.activo ? 'Desactivar' : 'Activar' }}
                    </ion-button>

                    <ion-button
                      class="action-btn"
                      size="small"
                      :color="usuario.rol === 'Admin' ? 'medium' : 'primary'"
                      :disabled="actualizandoUsuarioId === usuario.id"
                      @click="onCambiarRol(usuario)"
                    >
                      {{ usuario.rol === 'Admin' ? 'Asignar rol usuario' : 'Asignar rol admin' }}
                    </ion-button>
                  </div>

                  <button
                    type="button"
                    class="reset-password-link"
                    :disabled="actualizandoUsuarioId === usuario.id"
                    @click="onResetearPassword(usuario)"
                  >
                    <ion-icon :icon="keyOutline" />
                    Restablecer contrasena
                  </button>
                </article>

                <p v-if="!cargandoUsuarios && usuariosFiltrados.length === 0" class="empty-state">
                  No hay coincidencias con esa busqueda.
                </p>
              </div>

              <div class="pagination-row">
                <ion-button fill="clear" size="small" :disabled="pagina <= 1 || cargandoUsuarios" @click="irAPagina(pagina - 1)">
                  Anterior
                </ion-button>
                <span>Pagina {{ pagina }} de {{ totalPaginas }}</span>
                <ion-button
                  fill="clear"
                  size="small"
                  :disabled="pagina >= totalPaginas || cargandoUsuarios"
                  @click="irAPagina(pagina + 1)"
                >
                  Siguiente
                </ion-button>
              </div>
            </section>
          </template>

          <template v-else>
            <section class="admin-section">
              <h3 class="section-title">Resumen tecnico</h3>

              <div class="health-grid">
                <article class="health-card">
                  <p class="health-label">API</p>
                  <p class="health-value" :class="apiHealthy ? 'health-value-ok' : 'health-value-bad'">
                    {{ estadoApiLabel }}
                  </p>
                </article>

                <article class="health-card">
                  <p class="health-label">Base de datos</p>
                  <p class="health-value" :class="dbConectada ? 'health-value-ok' : 'health-value-bad'">
                    {{ dbConectada ? 'Conectada' : 'Sin conexion' }}
                  </p>
                </article>

                <article class="health-card">
                  <p class="health-label">Proveedor DB</p>
                  <p class="health-sub">{{ health?.baseDeDatos?.proveedor ?? '-' }}</p>
                </article>

                <article class="health-card">
                  <p class="health-label">Tamano DB</p>
                  <p class="health-value">{{ formatearBytes(health?.baseDeDatos?.tamanoBytes ?? null) }}</p>
                </article>
              </div>
            </section>

            <section class="admin-section charts-section">
              <h3 class="section-title">Almacenamiento</h3>

              <article class="chart-card">
                <div class="ring-wrap">
                  <svg viewBox="0 0 42 42" class="ring-chart" role="img" aria-label="Uso de disco">
                    <circle class="ring-bg" cx="21" cy="21" r="15.915" />
                    <circle
                      class="ring-free"
                      cx="21"
                      cy="21"
                      r="15.915"
                      :stroke-dasharray="`${porcentajeLibreDisco.toFixed(2)} ${100 - porcentajeLibreDisco}`"
                    />
                  </svg>
                  <div class="ring-center">
                    <strong>{{ porcentajeLibreDisco.toFixed(1) }}%</strong>
                    <span>Libre</span>
                  </div>
                </div>

                <div class="chart-copy">
                  <p class="chart-title">Almacenamiento runtime</p>
                  <p class="chart-sub">Contenedor App Platform - unidad {{ health?.almacenamiento?.unidad ?? '-' }}</p>
                  <div class="meter-row">
                    <span>Libre</span>
                    <strong>{{ formatearBytes(health?.almacenamiento?.disponibleBytes ?? null) }}</strong>
                  </div>
                  <div class="meter-row">
                    <span>Total</span>
                    <strong>{{ formatearBytes(health?.almacenamiento?.totalBytes ?? null) }}</strong>
                  </div>
                </div>
              </article>

              <article class="chart-card chart-card-column">
                <div class="bar-head">
                  <p class="chart-title">Peso relativo de la base de datos</p>
                  <strong>{{ ratioDbSobreDisco.toFixed(2) }}%</strong>
                </div>
                <div class="progress-track">
                  <div class="progress-fill" :style="{ width: `${Math.max(ratioDbSobreDisco, 1)}%` }" />
                </div>
                <p class="chart-sub">
                  {{ formatearBytes(health?.baseDeDatos?.tamanoBytes ?? null) }} de
                  {{ formatearBytes(health?.almacenamiento?.totalBytes ?? null) }}
                </p>
              </article>
            </section>
          </template>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonIcon,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  alertController,
  toastController
} from '@ionic/vue'
import { computed, onMounted, ref, watch } from 'vue'
import { refreshOutline, searchOutline, keyOutline, logOutOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'
import {
  type AdminHealthResponse,
  type AdminUsuarioResumen,
  actualizarEstadoUsuarioAdmin,
  actualizarRolUsuarioAdmin,
  obtenerHealthAdmin,
  obtenerUsuariosAdmin,
  resetearPasswordUsuarioAdmin
} from '@/services/adminService'
import { actualizarSesionUsuario, cerrarSesion, obtenerUsuarioSesion } from '@/services/autenticacionService'

const panelActivo = ref<'usuarios' | 'rendimiento'>('rendimiento')
const router = useRouter()
const busquedaUsuario = ref('')
const usuarios = ref<AdminUsuarioResumen[]>([])
const health = ref<AdminHealthResponse | null>(null)
const pagina = ref(1)
const tamanoPagina = 20
const totalUsuarios = ref(0)
const cargandoUsuarios = ref(false)
const cargandoHealth = ref(false)
const actualizandoUsuarioId = ref<string | null>(null)

const totalPaginas = computed(() => {
  const total = Math.ceil(totalUsuarios.value / tamanoPagina)
  return total > 0 ? total : 1
})

const cargandoGeneral = computed(() => cargandoUsuarios.value || cargandoHealth.value)

const porcentajeLibreDisco = computed(() => {
  return health.value?.almacenamiento?.porcentajeLibre ?? 0
})

const ratioDbSobreDisco = computed(() => {
  const db = health.value?.baseDeDatos?.tamanoBytes ?? 0
  const total = health.value?.almacenamiento?.totalBytes ?? 0
  if (!db || !total) return 0
  return (db / total) * 100
})

const estadoApiLabel = computed(() => {
  const estado = (health.value?.estadoApi ?? '').trim().toLowerCase()
  if (estado === 'ok' || estado === 'healthy' || estado === 'healty') {
    return 'Healthy'
  }

  return health.value?.estadoApi ?? '-'
})

const apiHealthy = computed(() => estadoApiLabel.value.toLowerCase() === 'healthy')

const dbConectada = computed(() => Boolean(health.value?.baseDeDatos?.conectada))

const usuariosFiltrados = computed(() => {
  const term = busquedaUsuario.value.toLowerCase()
  if (!term) return usuarios.value

  return usuarios.value.filter(u =>
    u.nombre.toLowerCase().includes(term) ||
    u.email.toLowerCase().includes(term)
  )
})

const refrescarVistaActiva = async () => {
  if (panelActivo.value === 'usuarios') {
    await cargarUsuarios()
    return
  }

  await cargarHealth()
}

const refrescarTodo = async () => {
  await Promise.all([cargarHealth(), cargarUsuarios()])
}

const cargarHealth = async () => {
  try {
    cargandoHealth.value = true
    health.value = await obtenerHealthAdmin()
  } catch (error: any) {
    await mostrarToast(error?.message || 'No hemos podido cargar el estado del sistema.', 'danger')
  } finally {
    cargandoHealth.value = false
  }
}

const cargarUsuarios = async () => {
  try {
    cargandoUsuarios.value = true
    const response = await obtenerUsuariosAdmin(pagina.value, tamanoPagina)
    usuarios.value = response.usuarios
    totalUsuarios.value = response.total
  } catch (error: any) {
    await mostrarToast(error?.message || 'No hemos podido cargar los usuarios.', 'danger')
  } finally {
    cargandoUsuarios.value = false
  }
}

const onCambiarEstado = async (usuario: AdminUsuarioResumen) => {
  const siguienteEstado = !usuario.activo
  const alert = await alertController.create({
    header: siguienteEstado ? 'Activar usuario' : 'Desactivar usuario',
    message: `Se actualizara el estado de ${usuario.email}.`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Confirmar',
        role: 'confirm',
        handler: async () => {
          await ejecutarCambioEstado(usuario, siguienteEstado)
        }
      }
    ]
  })

  await alert.present()
}

const ejecutarCambioEstado = async (usuario: AdminUsuarioResumen, activo: boolean) => {
  try {
    actualizandoUsuarioId.value = usuario.id
    await actualizarEstadoUsuarioAdmin(usuario.id, activo)
    usuario.activo = activo
    await mostrarToast('Estado actualizado correctamente.', 'success')
  } catch (error: any) {
    await mostrarToast(error?.message || 'No hemos podido actualizar el estado.', 'danger')
  } finally {
    actualizandoUsuarioId.value = null
  }
}

const onCambiarRol = async (usuario: AdminUsuarioResumen) => {
  const nuevoRol = usuario.rol === 'Admin' ? 'User' : 'Admin'
  const alert = await alertController.create({
    header: 'Actualizar rol',
    message: `Se cambiara el rol de ${usuario.email} a ${nuevoRol}.`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Confirmar',
        role: 'confirm',
        handler: async () => {
          await ejecutarCambioRol(usuario, nuevoRol)
        }
      }
    ]
  })

  await alert.present()
}

const ejecutarCambioRol = async (usuario: AdminUsuarioResumen, rol: 'User' | 'Admin') => {
  try {
    actualizandoUsuarioId.value = usuario.id
    await actualizarRolUsuarioAdmin(usuario.id, rol)
    usuario.rol = rol

    const sesion = obtenerUsuarioSesion()
    if (sesion?.usuarioId === usuario.id && rol === 'User') {
      actualizarSesionUsuario({ rol: 'User' })
      await mostrarToast('Tu rol ha cambiado a User. Te redirigimos al inicio.', 'warning')
      window.location.href = '/inicio'
      return
    }

    await mostrarToast('Rol actualizado correctamente.', 'success')
  } catch (error: any) {
    await mostrarToast(error?.message || 'No hemos podido actualizar el rol.', 'danger')
  } finally {
    actualizandoUsuarioId.value = null
  }
}

const onResetearPassword = async (usuario: AdminUsuarioResumen) => {
  const alert = await alertController.create({
    header: 'Resetear contrasena',
    message: `Se generara una contrasena temporal para ${usuario.email}.`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Continuar',
        role: 'confirm',
        handler: async () => {
          await ejecutarReseteoPassword(usuario)
        }
      }
    ]
  })

  await alert.present()
}

const ejecutarReseteoPassword = async (usuario: AdminUsuarioResumen) => {
  try {
    actualizandoUsuarioId.value = usuario.id
    const response = await resetearPasswordUsuarioAdmin(usuario.id)

    const alert = await alertController.create({
      header: 'Contrasena temporal generada',
      cssClass: 'admin-password-alert',
      message: `Usuario: ${usuario.email}\n\nContrasena temporal: ${response.passwordTemporal}`,
      buttons: ['Cerrar']
    })

    await alert.present()
  } catch (error: any) {
    await mostrarToast(error?.message || 'No hemos podido resetear la contrasena.', 'danger')
  } finally {
    actualizandoUsuarioId.value = null
  }
}

const irAPagina = async (siguiente: number) => {
  if (siguiente < 1 || siguiente > totalPaginas.value) return
  pagina.value = siguiente
  await cargarUsuarios()
}

const formatearBytes = (valor: number | null | undefined): string => {
  if (valor == null) return '-'

  const unidades = ['B', 'KB', 'MB', 'GB', 'TB']
  let numero = valor
  let indice = 0

  while (numero >= 1024 && indice < unidades.length - 1) {
    numero /= 1024
    indice += 1
  }

  return `${numero.toFixed(numero >= 10 || indice === 0 ? 0 : 1)} ${unidades[indice]}`
}

const mostrarToast = async (
  message: string,
  color: 'success' | 'danger' | 'warning' = 'success'
) => {
  const toast = await toastController.create({
    message,
    duration: 2200,
    position: 'bottom',
    color
  })

  await toast.present()
}

const onCerrarSesion = async () => {
  const alert = await alertController.create({
    header: 'Cerrar sesion',
    message: 'Quieres cerrar la sesion actual?',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Cerrar sesion',
        role: 'destructive',
        handler: async () => {
          await cerrarSesion()
          await router.replace('/inicio-sesion')
        }
      }
    ]
  })

  await alert.present()
}

watch(panelActivo, async valor => {
  if (valor === 'usuarios' && usuarios.value.length === 0) {
    await cargarUsuarios()
  }

  if (valor === 'rendimiento' && !health.value) {
    await cargarHealth()
  }
})

onMounted(async () => {
  await refrescarTodo()
})
</script>

<style scoped>
.admin-wrapper {
  width: 100%;
  max-width: 430px;
  padding: 12px 14px 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.admin-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.action-icon {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: background-color 0.16s ease, color 0.16s ease;
}

.action-refresh {
  background: #ecf1f7;
  color: #2a456f;
}

.action-logout {
  background: #f8eef0;
  color: #8f2f3c;
}

.action-refresh:hover {
  background: #e3ebf5;
}

.action-logout:hover {
  background: #f4e3e7;
}

.admin-segment {
  --background: #eef2f7;
  border: 1px solid #dbe3ee;
  border-radius: 12px;
  padding: 3px;
}

.admin-segment ion-segment-button {
  min-height: 38px;
  font-weight: 700;
  font-size: 0.86rem;
  text-transform: none;
  --color: #2a456f;
  --color-checked: #ffffff;
  --indicator-color: #2a456f;
  --border-radius: 11px;
}

.admin-section {
  background: #ffffff;
  border: 1px solid #dfe7f1;
  border-radius: 14px;
  padding: 13px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 6px 14px rgba(17, 44, 78, 0.04);
}

.section-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: #17273f;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.users-total {
  margin: 0;
  font-size: 0.76rem;
  color: #4f6077;
  background: #eef3f8;
  border: 1px solid #d8e1ec;
  border-radius: 999px;
  padding: 4px 8px;
}

.search-box-admin {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #d7e0ea;
  border-radius: 11px;
  padding: 8px 10px;
  background: #f8fafc;
}

.search-box-admin ion-icon {
  color: #62758e;
}

.search-box-admin input {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  font-size: 0.88rem;
  color: #18283f;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-card {
  border: 1px solid #dfe7f1;
  border-radius: 12px;
  padding: 11px;
  background: #fcfdff;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.user-name {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: #142339;
}

.user-email {
  margin: 3px 0 0;
  font-size: 0.79rem;
  color: #62748d;
}

.user-last-access {
  margin: 4px 0 0;
  font-size: 0.72rem;
  color: #7b8ca3;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-end;
}

.pill {
  background: #e8edf6;
  color: #203c67;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.7rem;
  font-weight: 800;
}

.pill-ok {
  background: rgba(33, 147, 86, 0.14);
  color: #1f8b4c;
}

.pill-off {
  background: rgba(188, 56, 56, 0.14);
  color: #8f2727;
}

.user-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.action-btn {
  margin: 0;
  --border-radius: 10px;
  --box-shadow: none;
  min-height: 36px;
  font-weight: 600;
  letter-spacing: 0.2px;
  text-transform: none;
}

.action-btn-secondary {
  --border-color: #2a456f;
  --color: #2a456f;
}

.reset-password-link {
  border: 1px solid #d7e1ee;
  background: #f7fafd;
  border-radius: 9px;
  color: #3f5f89;
  font-size: 0.76rem;
  font-weight: 600;
  text-align: center;
  width: fit-content;
  padding: 6px 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.16s ease, border-color 0.16s ease;
}

.reset-password-link:disabled {
  opacity: 0.55;
}

.reset-password-link:hover {
  background: #edf3fb;
  border-color: #c8d6e9;
}

.pagination-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.82rem;
  color: #5c6b80;
}

.health-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.health-card {
  border: 1px solid #e4eaf1;
  border-radius: 12px;
  padding: 10px;
  background: #fbfcfe;
}

.health-label {
  margin: 0;
  color: #667892;
  font-size: 0.75rem;
}

.health-value {
  margin: 5px 0 0;
  font-size: 0.98rem;
  font-weight: 800;
  color: #16263d;
}

.health-value-ok {
  color: #1d8a4a;
}

.health-value-bad {
  color: #9b2c2c;
}

.health-sub {
  margin: 5px 0 0;
  color: #4f637f;
  font-size: 0.78rem;
  word-break: break-word;
}

.charts-section {
  gap: 10px;
}

.chart-card {
  border: 1px solid #dce5ef;
  border-radius: 14px;
  padding: 12px;
  background: #ffffff;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
}

.chart-card-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ring-wrap {
  position: relative;
  width: 102px;
  height: 102px;
}

.ring-chart {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: #e6ecf3;
  stroke-width: 3.8;
}

.ring-free {
  fill: none;
  stroke: #2f69c2;
  stroke-linecap: round;
  stroke-width: 3.8;
}

.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ring-center strong {
  font-size: 1.1rem;
  color: #1b2d48;
}

.ring-center span {
  font-size: 0.72rem;
  color: #60738d;
}

.chart-copy {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.chart-title {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 800;
  color: #172a45;
}

.chart-sub {
  margin: 0;
  font-size: 0.78rem;
  color: #60728b;
}

.meter-row,
.bar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.8rem;
  color: #4f617c;
}

.meter-row strong,
.bar-head strong {
  color: #172a45;
}

.progress-track {
  height: 12px;
  background: #edf2f8;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #2a5faf 0%, #4b82d3 100%);
}

.empty-state {
  margin: 0;
  color: #6b7d95;
  font-size: 0.84rem;
}

:global(.admin-password-alert .alert-message) {
  white-space: pre-line;
}

@media (max-width: 360px) {
  .health-grid {
    grid-template-columns: 1fr;
  }

  .chart-card {
    grid-template-columns: 1fr;
  }

  .user-actions {
    grid-template-columns: 1fr;
  }
}
</style>
