import { obtenerToken } from './autenticacionService'
export const crearHeadersAutenticacion = (incluirContentType = false): HeadersInit => {
  const token = obtenerToken()

  const headers: Record<string, string> = {
    Accept: 'application/json'
  }

  if (incluirContentType) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}
