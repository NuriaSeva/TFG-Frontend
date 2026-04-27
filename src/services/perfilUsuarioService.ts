import { API_BASE_URL, extraerMensajeError } from './api'
import { actualizarSesionUsuario } from './autenticacionService'
import { crearHeadersAutenticacion } from './httpService'

const PERFIL_USUARIO_API_URL = `${API_BASE_URL}/api/autenticacion/perfil`

export interface PerfilUsuarioResponse {
  email: string
  nombre: string
  apellidos: string | null
  monedaPreferida: string
  idioma: string
  rol: string
}

export interface ActualizarPerfilUsuarioRequest {
  nombre: string
  apellidos?: string | null
  monedaPreferida: string
  idioma: string
}

export const getPerfilUsuario = async (): Promise<PerfilUsuarioResponse> => {
  const response = await fetch(PERFIL_USUARIO_API_URL, {
    method: 'GET',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(extraerMensajeError(errorText, 'No hemos podido cargar tu perfil.'))
  }

  return await response.json()
}

export const actualizarPerfilUsuario = async (
  payload: ActualizarPerfilUsuarioRequest
): Promise<PerfilUsuarioResponse> => {
  const response = await fetch(PERFIL_USUARIO_API_URL, {
    method: 'PUT',
    headers: crearHeadersAutenticacion(true),
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(extraerMensajeError(errorText, 'No hemos podido guardar los cambios del perfil.'))
  }

  const perfilActualizado = (await response.json()) as PerfilUsuarioResponse

  actualizarSesionUsuario({
    nombre: perfilActualizado.nombre,
    email: perfilActualizado.email,
    rol: perfilActualizado.rol
  })

  return perfilActualizado
}
