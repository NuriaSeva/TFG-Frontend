import { crearHeadersAutenticacion } from './httpService'

const API_BASE_URL = 'http://10.0.2.2:5047/api/dashboard'

export interface DashboardResumenResponse {
  gastosMes: number
  ingresosMes: number
  numeroGastosMes: number
  numeroIngresosMes: number
}

export const getResumenMesActual = async (
): Promise<DashboardResumenResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/resumen`,
    {
      method: 'GET',
      headers: crearHeadersAutenticacion()
    }
  )

if (!response.ok) {
  const errorText = (await response.text()).trim()
  throw new Error(`[${response.status}] ${errorText || 'No se pudo cargar el resumen del mes.'}`)
}

  return await response.json()
}