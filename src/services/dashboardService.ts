import { API_BASE_URL } from './api'
import { crearHeadersAutenticacion } from './httpService'

const DASHBOARD_API_URL = `${API_BASE_URL}/api/dashboard`

export interface DashboardResumenResponse {
  gastosMes: number
  ingresosMes: number
  numeroGastosMes: number
  numeroIngresosMes: number
}

export interface DashboardCategoriaGastoResponse {
  categoria: string
  importe: number
  porcentaje: number
}

export interface DashboardEvolucionMensualResponse {
  anio: number
  mes: number
  etiqueta: string
  gastos: number
  ingresos: number
}

export interface DashboardVisualizacionesResponse {
  resumenMesActual: DashboardResumenResponse
  distribucionGastosPorCategoria: DashboardCategoriaGastoResponse[]
  evolucionUltimosMeses: DashboardEvolucionMensualResponse[]
  alertasProactivas: DashboardAlertaProactivaResponse[]
}

export interface DashboardAlertaProactivaResponse {
  tipo: string
  severidad: 'baja' | 'media' | 'alta'
  titulo: string
  mensaje: string
}

export interface DashboardMapaCalorDiaResponse {
  fecha: string
  totalGasto: number
  numeroMovimientos: number
}

export interface DashboardMapaCalorResponse {
  anio: number
  mes: number
  maximoGastoDia: number
  dias: DashboardMapaCalorDiaResponse[]
}

export interface FiltroDashboardParams {
  mes?: number | null
  anio?: number | null
}

const construirQuery = (params?: FiltroDashboardParams) => {
  const query = new URLSearchParams()

  if (params?.mes != null) query.append('mes', String(params.mes))
  if (params?.anio != null) query.append('anio', String(params.anio))

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const crearSignalTimeout = (timeoutMs: number) => {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  return { signal: controller.signal, clear: () => window.clearTimeout(timeoutId) }
}

export const getResumenMesActual = async (
  params?: FiltroDashboardParams
): Promise<DashboardResumenResponse> => {
  const response = await fetch(`${DASHBOARD_API_URL}/resumen${construirQuery(params)}`, {
    method: 'GET',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = (await response.text()).trim()
    throw new Error(errorText || 'No hemos podido cargar tu resumen de este mes.')
  }

  return await response.json()
}

export const getVisualizaciones = async (
  params?: FiltroDashboardParams
): Promise<DashboardVisualizacionesResponse> => {
  const timeout = crearSignalTimeout(12000)

  try {
    const response = await fetch(`${DASHBOARD_API_URL}/visualizaciones${construirQuery(params)}`, {
      method: 'GET',
      headers: crearHeadersAutenticacion(),
      signal: timeout.signal
    })

    if (!response.ok) {
      const errorText = (await response.text()).trim()
      throw new Error(errorText || 'No hemos podido cargar las visualizaciones.')
    }

    return await response.json()
  } finally {
    timeout.clear()
  }
}

export const getMapaCalorMesActual = async (
  params?: FiltroDashboardParams
): Promise<DashboardMapaCalorResponse> => {
  const response = await fetch(`${DASHBOARD_API_URL}/mapa-calor${construirQuery(params)}`, {
    method: 'GET',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = (await response.text()).trim()
    throw new Error(errorText || 'No hemos podido cargar el mapa de calor.')
  }

  return await response.json()
}
