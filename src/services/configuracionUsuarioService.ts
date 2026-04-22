import { API_BASE_URL } from './api'
import { crearHeadersAutenticacion } from './httpService'

const CONFIGURACION_USUARIO_API_URL = `${API_BASE_URL}/api/configuracion-usuario`

export interface ConfiguracionUsuarioResponse {
  notificacionesActivas: boolean
  notificacionesSoloCriticas: boolean
}

export const getConfiguracionUsuario = async (): Promise<ConfiguracionUsuarioResponse> => {
  const response = await fetch(`${CONFIGURACION_USUARIO_API_URL}/obtener`, {
    method: 'GET',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'No hemos podido cargar tu configuración.')
  }

  return await response.json()
}

export const actualizarNotificacionesActivas = async (
  notificacionesActivas: boolean,
  notificacionesSoloCriticas?: boolean
): Promise<ConfiguracionUsuarioResponse> => {
  const response = await fetch(`${CONFIGURACION_USUARIO_API_URL}/notificaciones`, {
    method: 'PATCH',
    headers: crearHeadersAutenticacion(true),
    body: JSON.stringify({ notificacionesActivas, notificacionesSoloCriticas })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'No hemos podido guardar los cambios de avisos.')
  }

  return await response.json()
}


