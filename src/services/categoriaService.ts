import { API_BASE_URL } from './api'
import { crearHeadersAutenticacion } from './httpService'

const CATEGORIAS_API_URL = `${API_BASE_URL}/api/categorias`

export interface Categoria {
  id: string
  usuarioId?: string | null
  nombre: string
  tipo: number
  color?: string | null
  icono?: string | null
  esSistema: boolean
  archivada: boolean
  fechaCreacion: string
}

export interface CrearCategoriaRequest {
  nombre: string
  tipo: number
  color?: string | null
  icono?: string | null
  esSistema: boolean
  archivada: boolean
}

export interface ActualizarCategoriaRequest {
  id: string
  nombre: string
  tipo: number
  color?: string | null
  icono?: string | null
  esSistema: boolean
  archivada: boolean
}

export const getCategorias = async (): Promise<Categoria[]> => {
  const response = await fetch(`${CATEGORIAS_API_URL}/obtener`, {
    method: 'GET',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`No se pudieron obtener las categorías. ${errorText}`)
  }

  const data = await response.json()
  return data ?? []
}

export const crearCategoria = async (payload: CrearCategoriaRequest): Promise<Categoria> => {
  const response = await fetch(`${CATEGORIAS_API_URL}/crear`, {
    method: 'POST',
    headers: crearHeadersAutenticacion(true),
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`No se pudo crear la categoría. ${errorText}`)
  }

  return await response.json()
}

export const actualizarCategoria = async (payload: ActualizarCategoriaRequest) => {
  const response = await fetch(`${CATEGORIAS_API_URL}/modificar/${payload.id}`, {
    method: 'PUT',
    headers: crearHeadersAutenticacion(true),
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`No se pudo actualizar la categoría. ${errorText}`)
  }

  if (response.status === 204) return

  const text = await response.text()
  return text ? JSON.parse(text) : null
}

export const cambiarArchivadoCategoria = async (
  categoria: Categoria,
  archivada: boolean
) => {
  const response = await fetch(`${CATEGORIAS_API_URL}/modificar/${categoria.id}`, {
    method: 'PUT',
    headers: crearHeadersAutenticacion(true),
    body: JSON.stringify({
      id: categoria.id,
      nombre: categoria.nombre,
      tipo: categoria.tipo,
      color: categoria.color ?? null,
      icono: categoria.icono ?? null,
      esSistema: categoria.esSistema,
      archivada
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      archivada
        ? `No se pudo archivar la categoría. ${errorText}`
        : `No se pudo desarchivar la categoría. ${errorText}`
    )
  }

  if (response.status === 204) return

  const text = await response.text()
  return text ? JSON.parse(text) : null
}