import { crearHeadersAutenticacion } from './httpService'

const API_BASE_URL = 'http://10.0.2.2:5047/api/transacciones'

export interface TransaccionListadoResponse {
  id: string
  cuentaBancariaId: string | null
  categoriaId: string | null
  importe: number
  moneda: string
  tipo: number
  origen: number
  proveedor: number
  fecha: string
  descripcion: string | null
  idTransaccionExterna: string | null
  usuarioId?: string
  categoriaNombre?: string | null
}

export interface PaginacionResponse<T> {
  items: T[]
  pagina: number
  tamanyo: number
  total: number
  totalPaginas: number
}

export interface ObtenerTransaccionesParams {
  mes?: number | null
  anio?: number | null
  tipo?: number | null
  texto?: string | null
  pagina?: number
  tamanyo?: number
}

export interface ResultadoSincronizacionResponse {
  totalRecibidas: number
  nuevas: number
  ignoradas: number
  mensaje?: string
}

export const getTransaccionesPorUsuario = async ({
  mes,
  anio,
  tipo,
  texto,
  pagina = 1,
  tamanyo = 20
}: ObtenerTransaccionesParams): Promise<PaginacionResponse<TransaccionListadoResponse>> => {
  const queryParams = new URLSearchParams()

  if (mes != null) queryParams.append('mes', String(mes))
  if (anio != null) queryParams.append('anio', String(anio))
  if (tipo != null) queryParams.append('tipo', String(tipo))
  if (texto && texto.trim() !== '') queryParams.append('texto', texto.trim())

  queryParams.append('pagina', String(pagina))
  queryParams.append('tamanyo', String(tamanyo))

  const response = await fetch(
    `${API_BASE_URL}/obtener?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: crearHeadersAutenticacion()
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`No se pudieron obtener las transacciones. ${errorText}`)
  }

  return await response.json()
}

export interface CrearMovimientoManualRequest {
  cuentaBancariaId?: string | null
  categoriaId?: string | null
  importe: number
  tipo: number
  fecha: string
  descripcion?: string | null
  moneda?: string | null
}

export interface ActualizarMovimientoRequest {
  id: string
  cuentaBancariaId?: string | null
  categoriaId?: string | null
  importe: number
  moneda: string
  tipo: number
  origen: number
  proveedor: number
  fecha: string
  descripcion?: string | null
  idTransaccionExterna?: string | null
}

export const crearMovimientoManual = async (payload: CrearMovimientoManualRequest) => {
  const response = await fetch(`${API_BASE_URL}/crear`, {
    method: 'POST',
    headers: crearHeadersAutenticacion(true),
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`No se pudo crear el movimiento. ${errorText}`)
  }

  return await response.json()
}

export const actualizarMovimiento = async (payload: ActualizarMovimientoRequest) => {
  const response = await fetch(`${API_BASE_URL}/modificar/${payload.id}`, {
    method: 'PUT',
    headers: crearHeadersAutenticacion(true),
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`No se pudo actualizar el movimiento. ${errorText}`)
  }

  if (response.status === 204) return

  const text = await response.text()
  return text ? JSON.parse(text) : null
}

export const eliminarMovimiento = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`No se pudo eliminar el movimiento. ${errorText}`)
  }
}

export const sincronizarMovimientosBancarios = async (
): Promise<ResultadoSincronizacionResponse> => {
  const response = await fetch(`${API_BASE_URL}`, {
    method: 'POST',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = (await response.text()).trim()
    throw new Error(errorText || 'No se pudo sincronizar la cuenta bancaria.')
  }

  return await response.json()
}