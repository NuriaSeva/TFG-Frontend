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

export const getResumenMesActual = async (
  params?: FiltroDashboardParams
): Promise<DashboardResumenResponse> => {
  const response = await fetch(`${DASHBOARD_API_URL}/resumen${construirQuery(params)}`, {
    method: 'GET',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = (await response.text()).trim()
    throw new Error(`[${response.status}] ${errorText || 'No se pudo cargar el resumen del mes.'}`)
  }

  return await response.json()
}

export const getVisualizaciones = async (
  params?: FiltroDashboardParams
): Promise<DashboardVisualizacionesResponse> => {
  const response = await fetch(`${DASHBOARD_API_URL}/visualizaciones${construirQuery(params)}`, {
    method: 'GET',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = (await response.text()).trim()
    throw new Error(`[${response.status}] ${errorText || 'No se pudieron cargar las visualizaciones.'}`)
  }

  return await response.json()
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
    throw new Error(`[${response.status}] ${errorText || 'No se pudo cargar el mapa de calor.'}`)
  }

  return await response.json()
}