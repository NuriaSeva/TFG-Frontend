import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'

const API_BASE_URL =
  'https://findmind-api-g9ete3bdaxe4e6bc.spaincentral-01.azurewebsites.net/api/banking/tink'

export interface LoginUrlResponse {
  localUserId: string
  state: string
  loginUrl: string
}

export const getLoginUrl = async (localUserId: string): Promise<LoginUrlResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/login-url?localUserId=${encodeURIComponent(localUserId)}`
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`No se pudo obtener la URL de Tink. ${errorText}`)
  }

  return await response.json()
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
    // En algunas plataformas puede no cerrar nada y no pasa nada
  }
}

export const limpiarEventosTink = async () => {
  // Ya no usamos listeners del navegador embebido
}