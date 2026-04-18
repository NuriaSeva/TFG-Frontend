
// Local Android Studio: http://10.0.2.2:5047
// Local navegador:      https://localhost:7197
// DigitalOcean:        https://goldfish-app-e8j7y.ondigitalocean.app
export const API_BASE_URL = 'http://10.0.2.2:5047'
export const extraerMensajeError = (errorText: string, mensajePorDefecto: string): string => {
  if (!errorText || errorText.trim() === '') {
    return mensajePorDefecto
  }

  const intentarParsearJson = (texto: string): string | null => {
    try {
      const parsed = JSON.parse(texto)
      return parsed?.mensaje || parsed?.message || parsed?.detalle || null
    } catch {
      return null
    }
  }

  const mensajeDirecto = intentarParsearJson(errorText)
  if (mensajeDirecto) return mensajeDirecto

  const inicioJson = errorText.indexOf('{')
  const finJson = errorText.lastIndexOf('}')

  if (inicioJson !== -1 && finJson > inicioJson) {
    const mensajeEmbebido = intentarParsearJson(errorText.slice(inicioJson, finJson + 1))
    if (mensajeEmbebido) return mensajeEmbebido
  }

  return errorText
}