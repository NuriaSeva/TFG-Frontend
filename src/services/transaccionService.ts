import { Capacitor } from '@capacitor/core'
import { Directory, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { API_BASE_URL, extraerMensajeError } from './api'
import { crearHeadersAutenticacion } from './httpService'

const TRANSACCIONES_API_URL = `${API_BASE_URL}/api/transacciones`

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

export interface ExportarTransaccionesCsvParams {
  mes?: number | null
  anio?: number | null
  tipo?: number | null
  texto?: string | null
  exportarTodo?: boolean
}

export type ModoExportacionCsv = 'guardar' | 'compartir'

export interface ResultadoSincronizacionResponse {
  totalRecibidas: number
  nuevas: number
  ignoradas: number
  mensaje?: string
}

const construirQueryParams = ({
  mes,
  anio,
  tipo,
  texto,
  pagina,
  tamanyo,
  exportarTodo
}: ObtenerTransaccionesParams & ExportarTransaccionesCsvParams) => {
  const queryParams = new URLSearchParams()

  if (mes != null) queryParams.append('mes', String(mes))
  if (anio != null) queryParams.append('anio', String(anio))
  if (tipo != null) queryParams.append('tipo', String(tipo))
  if (texto && texto.trim() !== '') queryParams.append('texto', texto.trim())
  if (pagina != null) queryParams.append('pagina', String(pagina))
  if (tamanyo != null) queryParams.append('tamanyo', String(tamanyo))
  if (exportarTodo != null) queryParams.append('exportarTodo', String(exportarTodo))

  return queryParams
}

export const getTransaccionesPorUsuario = async ({
  mes,
  anio,
  tipo,
  texto,
  pagina = 1,
  tamanyo = 20
}: ObtenerTransaccionesParams): Promise<PaginacionResponse<TransaccionListadoResponse>> => {
  const queryParams = construirQueryParams({
    mes,
    anio,
    tipo,
    texto,
    pagina,
    tamanyo
  })

  const response = await fetch(
    `${TRANSACCIONES_API_URL}/obtener?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: crearHeadersAutenticacion()
    }
  )
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(extraerMensajeError(errorText, 'No se pudieron obtener las transacciones.'))
  }

  return await response.json()
}

const obtenerNombreArchivo = (response: Response) => {
  const contentDisposition = response.headers.get('content-disposition')
  const nombrePorDefecto = `movimientos_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}.csv`

  if (!contentDisposition) return nombrePorDefecto

  const matchUtf8 = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (matchUtf8?.[1]) {
    return decodeURIComponent(matchUtf8[1])
  }

  const matchSimple = contentDisposition.match(/filename="?([^";]+)"?/i)
  return matchSimple?.[1] ?? nombrePorDefecto
}

const convertirArrayBufferABase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  return btoa(binary)
}

const descargarEnNavegador = async (response: Response) => {
  const blob = await response.blob()
  const nombreArchivo = obtenerNombreArchivo(response)
  const url = window.URL.createObjectURL(blob)
  const enlace = document.createElement('a')

  enlace.href = url
  enlace.download = nombreArchivo
  enlace.style.display = 'none'

  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()

  window.setTimeout(() => {
    window.URL.revokeObjectURL(url)
  }, 1000)
}

const guardarEnDispositivoEnAppNativa = async (response: Response) => {
  const nombreArchivo = obtenerNombreArchivo(response)
  const arrayBuffer = await response.arrayBuffer()
  const data = convertirArrayBufferABase64(arrayBuffer)

  const resultado = await Filesystem.writeFile({
    path: `FinMind/${nombreArchivo}`,
    data,
    directory: Directory.Documents,
    recursive: true
  })

  return {
    uri: resultado.uri,
    nombreArchivo
  }
}

const guardarYCompartirEnAppNativa = async (response: Response) => {
  const nombreArchivo = obtenerNombreArchivo(response)
  const arrayBuffer = await response.arrayBuffer()
  const data = convertirArrayBufferABase64(arrayBuffer)

  const resultado = await Filesystem.writeFile({
    path: nombreArchivo,
    data,
    directory: Directory.Cache,
    recursive: true
  })

  await Share.share({
    title: 'Exportación de movimientos',
    text: 'Adjunto el CSV con tus movimientos de FinMind.',
    files: [resultado.uri],
    dialogTitle: 'Compartir CSV'
  })

  return {
    uri: resultado.uri,
    nombreArchivo
  }
}

export const exportarTransaccionesCsv = async (
  {
    mes,
    anio,
    tipo,
    texto,
    exportarTodo = false
  }: ExportarTransaccionesCsvParams = {},
  modo: ModoExportacionCsv = 'compartir'
) => {
  const queryParams = construirQueryParams({
    mes,
    anio,
    tipo,
    texto,
    exportarTodo
  })

  const response = await fetch(`${TRANSACCIONES_API_URL}/exportar-csv?${queryParams.toString()}`, {
    method: 'GET',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = (await response.text()).trim()
    throw new Error(errorText || 'No se pudieron exportar los movimientos.')
  }

  if (Capacitor.isNativePlatform()) {
    if (modo === 'guardar') {
      return await guardarEnDispositivoEnAppNativa(response)
    }

    return await guardarYCompartirEnAppNativa(response)
  }

  await descargarEnNavegador(response)
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
  const response = await fetch(`${TRANSACCIONES_API_URL}/crear`, {
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
  const response = await fetch(`${TRANSACCIONES_API_URL}/modificar/${payload.id}`, {
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
  const response = await fetch(`${TRANSACCIONES_API_URL}/${id}`, {
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
  const response = await fetch(`${TRANSACCIONES_API_URL}/sincronizar`, {
    method: 'POST',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = (await response.text()).trim()
    throw new Error(extraerMensajeError(errorText, 'No se pudieron obtener las transacciones.'))
  }

  return await response.json()
}
