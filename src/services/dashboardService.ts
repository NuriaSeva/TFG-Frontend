const API_BASE_URL = 'http://10.0.2.2:5047/api/dashboard'

export interface DashboardResumenResponse {
  gastosMes: number
  ingresosMes: number
  numeroGastosMes: number
  numeroIngresosMes: number
}

export const getResumenMesActual = async (
  usuarioId: string
): Promise<DashboardResumenResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/resumen/${encodeURIComponent(usuarioId)}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    }
  )

  if (!response.ok) {
    const errorText = (await response.text()).trim()
    throw new Error(errorText || 'No se pudo cargar el resumen del mes.')
  }

  return await response.json()
}