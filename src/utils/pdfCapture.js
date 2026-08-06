export function preparePdfCapture(el) {
  const originalStyle = {
    top: el.style.top,
    left: el.style.left,
    visibility: el.style.visibility,
    zIndex: el.style.zIndex,
  }

  el.style.top = '0'
  el.style.left = '0'
  el.style.visibility = 'visible'
  el.style.zIndex = '-1'

  return () => Object.assign(el.style, originalStyle)
}
