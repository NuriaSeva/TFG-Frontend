import { API_BASE_URL, extraerMensajeError } from './api'
import { crearHeadersAutenticacion } from './httpService'

const ADMIN_API_URL = `${API_BASE_URL}/api/admin`

export interface AdminUsuarioResumen {
  id: string
  email: string
  nombre: string
  apellidos: string | null
  rol: string
  activo: boolean
  fechaCreacion: string
  fechaUltimoAcceso: string | null
}

export interface AdminUsuariosPaginadosResponse {
  usuarios: AdminUsuarioResumen[]
  total: number
  pagina: number
  tamanoPagina: number
}

export interface AdminHealthResponse {
  estadoApi: string
  timestampUtc: string
  entorno: string
  baseDeDatos: {
    conectada: boolean
    proveedor: string
    totalUsuarios: number
    tamanoBytes: number | null
  }
  almacenamiento: {
    unidad: string
    totalBytes: number
    disponibleBytes: number
    porcentajeLibre: number
  }
  modeloPrediccionGasto: {
    datasetDisponible: boolean
    modeloDisponible: boolean
    registrosDataset: number
    mae: number | null
    rmse: number | null
    r2: number | null
    fechaModeloUtc: string | null
    mensaje: string | null
  }
}

export interface AdminResetPasswordResponse {
  usuarioId: string
  passwordTemporal: string
  fechaGeneracionUtc: string
}

export const obtenerUsuariosAdmin = async (
  pagina = 1,
  tamanoPagina = 25
): Promise<AdminUsuariosPaginadosResponse> => {
  const query = new URLSearchParams({
    pagina: String(pagina),
    tamanoPagina: String(tamanoPagina)
  })

  const response = await fetch(`${ADMIN_API_URL}/usuarios?${query.toString()}`, {
    method: 'GET',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(extraerMensajeError(errorText, 'No hemos podido cargar los usuarios.'))
  }

  return await response.json()
}

export const actualizarEstadoUsuarioAdmin = async (
  usuarioId: string,
  activo: boolean
): Promise<void> => {
  const response = await fetch(`${ADMIN_API_URL}/usuarios/${usuarioId}/estado`, {
    method: 'PATCH',
    headers: crearHeadersAutenticacion(true),
    body: JSON.stringify({ activo })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(extraerMensajeError(errorText, 'No hemos podido actualizar el estado del usuario.'))
  }
}

export const actualizarRolUsuarioAdmin = async (
  usuarioId: string,
  rol: 'User' | 'Admin'
): Promise<void> => {
  const response = await fetch(`${ADMIN_API_URL}/usuarios/${usuarioId}/rol`, {
    method: 'PATCH',
    headers: crearHeadersAutenticacion(true),
    body: JSON.stringify({ rol })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(extraerMensajeError(errorText, 'No hemos podido actualizar el rol del usuario.'))
  }
}

export const obtenerHealthAdmin = async (): Promise<AdminHealthResponse> => {
  const response = await fetch(`${ADMIN_API_URL}/health`, {
    method: 'GET',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(extraerMensajeError(errorText, 'No hemos podido cargar el estado del sistema.'))
  }

  return await response.json()
}

export const resetearPasswordUsuarioAdmin = async (
  usuarioId: string
): Promise<AdminResetPasswordResponse> => {
  const response = await fetch(`${ADMIN_API_URL}/usuarios/${usuarioId}/reset-password`, {
    method: 'POST',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(extraerMensajeError(errorText, 'No hemos podido resetear la contraseña del usuario.'))
  }

  return await response.json()
}
