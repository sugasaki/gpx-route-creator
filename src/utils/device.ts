export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}

export const isAndroid = () => {
  return /Android/.test(navigator.userAgent)
}

export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export const isTablet = () => {
  return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent)
}