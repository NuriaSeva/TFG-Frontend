import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'

const API_BASE_URL = 'http://10.0.2.2:5047/api/banking/tink'

export interface LoginUrlResponse {
  localUserId: string
  state: string
  loginUrl: string
}

export const getLoginUrl = async (localUserId: string): Promise<LoginUrlResponse> => {
  const url = `${API_BASE_URL}/login-url?localUserId=${encodeURIComponent(localUserId)}`
  console.log('URL login-url:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    })

    console.log('response status:', response.status)
    console.log('response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('errorText:', errorText)
      throw new Error(`No se pudo obtener la URL de Tink. ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('data login-url:', JSON.stringify(data))
    return data
  } catch (error: any) {
    console.error('fetch error completo:', error)
    console.error('fetch error message:', error?.message)
    console.error('fetch error string:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    throw error
  }
}

export const abrirTink = async (loginUrl: string) => {
  const platform = Capacitor.getPlatform()

  if (platform === 'web') {
    window.open(loginUrl, '_blank')
    return
  }

  await Browser.open({
    url: loginUrl
  })
}

export const cerrarTink = async () => {
  try {
    await Browser.close()
  } catch {
  }
}

export const limpiarEventosTink = async () => {
}