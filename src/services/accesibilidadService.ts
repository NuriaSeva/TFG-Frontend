import { readonly, ref } from 'vue'

export type TamanoTextoAccesible = 'normal' | 'grande' | 'muy-grande'

export interface PreferenciasAccesibilidad {
  tamanoTexto: TamanoTextoAccesible
  reducirAnimaciones: boolean
  altoContraste: boolean
  controlesComodos: boolean
}

const CLAVE_ACCESIBILIDAD = 'finmind_accesibilidad'

const preferenciasPorDefecto = (): PreferenciasAccesibilidad => ({
  tamanoTexto: 'normal',
  reducirAnimaciones:
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  altoContraste: false,
  controlesComodos: false
})

const normalizar = (valor: any): PreferenciasAccesibilidad => {
  const base = preferenciasPorDefecto()

  const tamanoTexto =
    valor?.tamanoTexto === 'grande' || valor?.tamanoTexto === 'muy-grande'
      ? valor.tamanoTexto
      : base.tamanoTexto

  return {
    tamanoTexto,
    reducirAnimaciones: typeof valor?.reducirAnimaciones === 'boolean' ? valor.reducirAnimaciones : base.reducirAnimaciones,
    altoContraste: typeof valor?.altoContraste === 'boolean' ? valor.altoContraste : base.altoContraste,
    controlesComodos: typeof valor?.controlesComodos === 'boolean' ? valor.controlesComodos : base.controlesComodos
  }
}

const leerPreferencias = (): PreferenciasAccesibilidad => {
  if (typeof localStorage === 'undefined') {
    return preferenciasPorDefecto()
  }

  const raw = localStorage.getItem(CLAVE_ACCESIBILIDAD)
  if (!raw) {
    return preferenciasPorDefecto()
  }

  try {
    return normalizar(JSON.parse(raw))
  } catch {
    localStorage.removeItem(CLAVE_ACCESIBILIDAD)
    return preferenciasPorDefecto()
  }
}

const estadoPreferencias = ref<PreferenciasAccesibilidad>(preferenciasPorDefecto())

const aplicarPreferencias = (preferencias: PreferenciasAccesibilidad) => {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  root.dataset.fmTextSize = preferencias.tamanoTexto
  root.classList.toggle('fm-reduce-motion', preferencias.reducirAnimaciones)
  root.classList.toggle('fm-high-contrast', preferencias.altoContraste)
  root.classList.toggle('fm-comfort-touch', preferencias.controlesComodos)
}

const persistirPreferencias = (preferencias: PreferenciasAccesibilidad) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(CLAVE_ACCESIBILIDAD, JSON.stringify(preferencias))
  }
}

export const inicializarAccesibilidad = () => {
  estadoPreferencias.value = leerPreferencias()
  aplicarPreferencias(estadoPreferencias.value)
}

export const actualizarPreferenciasAccesibilidad = (
  parcial: Partial<PreferenciasAccesibilidad>
) => {
  estadoPreferencias.value = normalizar({
    ...estadoPreferencias.value,
    ...parcial
  })

  persistirPreferencias(estadoPreferencias.value)
  aplicarPreferencias(estadoPreferencias.value)
}

export const restablecerPreferenciasAccesibilidad = () => {
  estadoPreferencias.value = preferenciasPorDefecto()
  persistirPreferencias(estadoPreferencias.value)
  aplicarPreferencias(estadoPreferencias.value)
}

export const useAccesibilidad = () => ({
  preferenciasAccesibilidad: readonly(estadoPreferencias),
  actualizarPreferenciasAccesibilidad,
  restablecerPreferenciasAccesibilidad
})
