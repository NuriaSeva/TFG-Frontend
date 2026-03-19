import { Capacitor } from '@capacitor/core'
import {
  InAppBrowser,
  DefaultWebViewOptions,
} from '@capacitor/inappbrowser'

const API_BASE_URL = 'https://localhost:7197/api/banking/tink'

export interface LoginUrlResponse {
  localUserId: string
  state: string
  loginUrl: string
}

export interface AccountCheckLastResultResponse {
  localUserId: string
  state?: string
  success: boolean
  error?: string
  errorDescription?: string
  accountVerificationReportId?: string
  received: Record<string, string>
}

export interface CuentaGuardadaResponse {
  id: string
  idCuentaExterna: string
  nombre: string
  banco: string
  iban: string
  moneda: string
  tipo: string
  saldoActual: number | null
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

  await InAppBrowser.openInWebView({
    url: loginUrl,
    options: {
      ...DefaultWebViewOptions,
      showURL: false,
      showToolbar: true,
      showNavigationButtons: true,
      closeButtonText: 'Cerrar'
    }
  })
}

export const cerrarTink = async () => {
  await InAppBrowser.close()
}

export const escucharNavegacionTink = async (
  callbackBaseUrl: string,
  onCallbackDetectado: () => Promise<void>
) => {
  return await InAppBrowser.addListener('browserPageNavigationCompleted', async (data) => {
    if (data.url?.startsWith(callbackBaseUrl)) {
      await InAppBrowser.close()
      await onCallbackDetectado()
    }
  })
}

export const limpiarEventosTink = async () => {
  await InAppBrowser.removeAllListeners()
}

export const getLastAccountCheckResult = async (
  localUserId: string
): Promise<AccountCheckLastResultResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/account-check/last-result?localUserId=${encodeURIComponent(localUserId)}`
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`No se pudo obtener el último resultado de Tink. ${errorText}`)
  }

  return await response.json()
}

export const guardarCuentaDesdeAccountCheck = async (
  usuarioId: string,
  reportId: string
): Promise<CuentaGuardadaResponse> => {
  const response = await fetch(`${API_BASE_URL}/account-check/guardar-cuenta`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      usuarioId,
      reportId
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`No se pudo guardar la cuenta. ${errorText}`)
  }

  return await response.json()
}