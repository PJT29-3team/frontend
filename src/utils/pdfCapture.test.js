import { describe, expect, it } from 'vitest'
import { preparePdfCapture } from './pdfCapture'

describe('preparePdfCapture', () => {
  it('keeps the PDF element visible while placing it behind the app for capture', () => {
    const el = document.createElement('div')
    el.style.top = '-9999px'
    el.style.left = '-9999px'
    el.style.visibility = 'hidden'

    const restore = preparePdfCapture(el)

    expect(el.style.visibility).toBe('visible')
    expect(el.style.top).toBe('0px')
    expect(el.style.left).toBe('0px')
    expect(el.style.zIndex).toBe('-1')

    restore()

    expect(el.style.visibility).toBe('hidden')
    expect(el.style.top).toBe('-9999px')
    expect(el.style.left).toBe('-9999px')
    expect(el.style.zIndex).toBe('')
  })
})
