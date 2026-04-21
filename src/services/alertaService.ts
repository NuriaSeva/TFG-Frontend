import { API_BASE_URL } from './api'
import { crearHeadersAutenticacion } from './httpService'

const ALERTAS_API_URL = `${API_BASE_URL}/api/alertas`

export interface AlertaResponse {
  id: string
  tipo: number
  titulo: string
  mensaje: string
  leida: boolean
  fechaCreacion: string
}

export interface PaginacionResponse<T> {
  items: T[]
  pagina: number
  tamanyo: number
  total: number
  totalPaginas: number
}

export const getAlertas = async (
  pagina = 1,
  tamanyo = 20
): Promise<PaginacionResponse<AlertaResponse>> => {
  const query = new URLSearchParams({
    pagina: String(pagina),
    tamanyo: String(tamanyo)
  })

  const response = await fetch(`${ALERTAS_API_URL}/obtener?${query.toString()}`, {
    method: 'GET',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'No hemos podido cargar tus avisos.')
  }

  return await response.json()
}

export const getAlertasNoLeidasTotal = async (): Promise<number> => {
  const response = await fetch(`${ALERTAS_API_URL}/no-leidas-total`, {
    method: 'GET',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'No hemos podido comprobar tus avisos pendientes.')
  }

  const data = await response.json()
  return Number(data?.total ?? 0)
}

export const marcarTodasAlertasLeidas = async () => {
  const response = await fetch(`${ALERTAS_API_URL}/leer-todas`, {
    method: 'PATCH',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'No hemos podido marcar los avisos como leídos.')
  }
}
