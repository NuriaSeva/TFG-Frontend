const API_BASE_URL =
  'http://10.0.2.2:5047'

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
  usuarioId: string
): Promise<CuentaBancariaResponse | null> => {
  const response = await fetch(
    `${API_BASE_URL}/api/CuentasBancarias/usuario/${encodeURIComponent(usuarioId)}`
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`No se pudo obtener la cuenta bancaria. ${errorText}`)
  }

  return await response.json()
}