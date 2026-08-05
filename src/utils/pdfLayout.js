export function fitCanvasToA4(canvas) {
  const pageWidth = 210
  const pageHeight = 297
  const scale = Math.min(pageWidth / canvas.width, pageHeight / canvas.height)
  const width = canvas.width * scale
  const height = canvas.height * scale

  return {
    width,
    height,
    x: (pageWidth - width) / 2,
    y: (pageHeight - height) / 2,
  }
}
