const API_BASE_URL = 'http://10.0.2.2:5047/api/categorias'

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

export const getCategorias = async (usuarioId: string): Promise<Categoria[]> => {
  const response = await fetch(
    `${API_BASE_URL}/obtener/${encodeURIComponent(usuarioId)}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`No se pudieron obtener las categorías. ${errorText}`)
  }

  const data = await response.json()

  return (data ?? []).filter((c: Categoria) => !c.archivada)
}