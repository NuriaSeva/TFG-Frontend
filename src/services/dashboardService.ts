import { crearHeadersAutenticacion } from './httpService'

const API_BASE_URL = 'http://10.0.2.2:5047/api/dashboard'

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

export const getResumenMesActual = async (): Promise<DashboardResumenResponse> => {
  const response = await fetch(`${API_BASE_URL}/resumen`, {
    method: 'GET',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = (await response.text()).trim()
    throw new Error(`[${response.status}] ${errorText || 'No se pudo cargar el resumen del mes.'}`)
  }

  return await response.json()
}

export const getVisualizaciones = async (): Promise<DashboardVisualizacionesResponse> => {
  const response = await fetch(`${API_BASE_URL}/visualizaciones`, {
    method: 'GET',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = (await response.text()).trim()
    throw new Error(`[${response.status}] ${errorText || 'No se pudieron cargar las visualizaciones.'}`)
  }

  return await response.json()
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

export const getMapaCalorMesActual = async (): Promise<DashboardMapaCalorResponse> => {
  const response = await fetch(`${API_BASE_URL}/mapa-calor`, {
    method: 'GET',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = (await response.text()).trim()
    throw new Error(`[${response.status}] ${errorText || 'No se pudo cargar el mapa de calor.'}`)
  }

  return await response.json()
}