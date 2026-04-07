const API_BASE_URL = 'http://10.0.2.2:5047/api/autenticacion'

export interface RegistroUsuarioRequest {
  email: string
  password: string
  nombre: string
  apellidos?: string | null
}

export interface InicioSesionRequest {
  email: string
  password: string
}

export interface RespuestaAutenticacion {
  usuarioId: string
  nombre: string
  email: string
  token: string
  expiracionToken: string
}

const CLAVE_SESION = 'finmind_sesion'

export interface SesionUsuario {
  usuarioId: string
  nombre: string
  email: string
  token: string
  expiracionToken: string
}

export const registrarUsuario = async (
  payload: RegistroUsuarioRequest
): Promise<RespuestaAutenticacion> => {
  const response = await fetch(`${API_BASE_URL}/registro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(extraerMensajeError(errorText, 'No se pudo completar el registro.'))
  }

  return await response.json()
}

export const iniciarSesion = async (
  payload: InicioSesionRequest
): Promise<RespuestaAutenticacion> => {
  const response = await fetch(`${API_BASE_URL}/inicio-sesion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(extraerMensajeError(errorText, 'No se pudo iniciar sesión.'))
  }

  return await response.json()
}

export const guardarSesion = (respuesta: RespuestaAutenticacion) => {
  const sesion: SesionUsuario = {
    usuarioId: respuesta.usuarioId,
    nombre: respuesta.nombre,
    email: respuesta.email,
    token: respuesta.token,
    expiracionToken: respuesta.expiracionToken
  }

  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))
}

export const obtenerSesion = (): SesionUsuario | null => {
  const raw = localStorage.getItem(CLAVE_SESION)
  if (!raw) return null

  try {
    return JSON.parse(raw) as SesionUsuario
  } catch {
    localStorage.removeItem(CLAVE_SESION)
    return null
  }
}

export const obtenerToken = (): string | null => {
  const sesion = obtenerSesion()
  if (!sesion) return null

  if (sesionExpirada(sesion)) {
    limpiarSesion()
    return null
  }

  return sesion.token
}

export const obtenerUsuarioSesion = (): SesionUsuario | null => {
  const sesion = obtenerSesion()
  if (!sesion) return null

  if (sesionExpirada(sesion)) {
    limpiarSesion()
    return null
  }

  return sesion
}

export const estaAutenticado = (): boolean => {
  return !!obtenerToken()
}

export const limpiarSesion = () => {
  localStorage.removeItem(CLAVE_SESION)
}

export const cerrarSesion = async () => {
  const token = obtenerToken()

  try {
    if (token) {
      await fetch(`${API_BASE_URL}/cierre-sesion`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
    }
  } catch {
  } finally {
    limpiarSesion()
  }
}

const sesionExpirada = (sesion: SesionUsuario): boolean => {
  const expiracion = new Date(sesion.expiracionToken).getTime()
  if (Number.isNaN(expiracion)) return true

  return Date.now() >= expiracion
}

const extraerMensajeError = (errorText: string, mensajePorDefecto: string): string => {
  if (!errorText || errorText.trim() === '') {
    return mensajePorDefecto
  }

  try {
    const parsed = JSON.parse(errorText)
    return parsed?.mensaje || parsed?.message || mensajePorDefecto
  } catch {
    return errorText
  }
}