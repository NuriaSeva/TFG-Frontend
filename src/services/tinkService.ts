import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'
import { API_BASE_URL, extraerMensajeError } from './api'
import { crearHeadersAutenticacion } from './httpService'

const TINK_API_URL = `${API_BASE_URL}/api/banking/tink`

export interface LoginUrlResponse {
  localUserId: string
  state: string
  loginUrl: string
}

export const getLoginUrl = async (): Promise<LoginUrlResponse> => {
  const url = `${TINK_API_URL}/login-url`
  console.log('URL login-url:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: crearHeadersAutenticacion()
    })

    console.log('response status:', response.status)
    console.log('response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('errorText:', errorText)
      throw new Error(`No hemos podido iniciar la conexión con tu banco. ${errorText}`)
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

export const getTransactionsLoginUrl = async (
): Promise<LoginUrlResponse> => {
  const url = `${TINK_API_URL}/transactions/login-url`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: crearHeadersAutenticacion()
    })

    if (!response.ok) {
      const errorText = await response.text()
          throw new Error(extraerMensajeError(errorText, 'No hemos podido iniciar la autorización de movimientos'))
    }
    return await response.json()
  } catch (error) {
    throw error
  }
}

export const desvincularCuentaBancaria = async (): Promise<void> => {
  const response = await fetch(`${TINK_API_URL}/desvincular`, {
    method: 'POST',
    headers: crearHeadersAutenticacion()
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`No hemos podido desvincular la cuenta bancaria. ${errorText}`)
  }
}
