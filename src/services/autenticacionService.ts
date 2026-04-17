import { API_BASE_URL } from './api'

const AUTENTICACION_API_URL = `${API_BASE_URL}/api/autenticacion`

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

export interface CambiarPasswordRequest {
  passwordActual: string
  passwordNueva: string
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

export const REQUISITOS_PASSWORD = [
  'Al menos 8 caracteres',
  'Una letra mayúscula',
  'Una letra minúscula',
  'Un número',
  'Un carácter especial'
] as const

export const validarPasswordSegura = (password: string): string[] => {
  const errores: string[] = []
  const valor = password ?? ''

  if (valor.length < 8) {
    errores.push('La contraseña debe tener al menos 8 caracteres.')
  }

  if (!/[A-ZÁÉÍÓÚÜÑ]/.test(valor)) {
    errores.push('La contraseña debe incluir al menos una letra mayúscula.')
  }

  if (!/[a-záéíóúüñ]/.test(valor)) {
    errores.push('La contraseña debe incluir al menos una letra minúscula.')
  }

  if (!/\d/.test(valor)) {
    errores.push('La contraseña debe incluir al menos un número.')
  }

  if (!/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/.test(valor)) {
    errores.push('La contraseña debe incluir al menos un carácter especial.')
  }

  return errores
}

export const registrarUsuario = async (
  payload: RegistroUsuarioRequest
): Promise<RespuestaAutenticacion> => {
  const response = await fetch(`${AUTENTICACION_API_URL}/registro`, {
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
  const response = await fetch(`${AUTENTICACION_API_URL}/inicio-sesion`, {
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

export const cambiarPassword = async (
  payload: CambiarPasswordRequest
): Promise<void> => {
  const token = obtenerToken()
  if (!token) {
    throw new Error('Tu sesión ha caducado. Vuelve a iniciar sesión.')
  }

  const response = await fetch(`${AUTENTICACION_API_URL}/cambiar-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(extraerMensajeError(errorText, 'No se pudo cambiar la contraseña.'))
  }
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
      await fetch(`${AUTENTICACION_API_URL}/cierre-sesion`, {
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
