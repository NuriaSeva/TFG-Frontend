import { API_BASE_URL } from './api'
import { crearHeadersAutenticacion } from './httpService'

export interface CuentaBancariaResponse {
  id: string
  idCuentaExterna: string
  nombre: string
  banco: string
  iban: string
  moneda: string
  tipo: string
  saldoActual: number | null
  fechaUltimaSincronizacion?: string | null
}

export const getCuentaPrincipalPorUsuario = async (
): Promise<CuentaBancariaResponse | null> => {
  const response = await fetch(
    `${API_BASE_URL}/api/CuentasBancarias/usuario`,
    {
      method: 'GET',
      headers: crearHeadersAutenticacion()
    }
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`No hemos podido cargar la cuenta bancaria. ${errorText}`)
  }

  return await response.json()
}
