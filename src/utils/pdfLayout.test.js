import { describe, expect, it } from 'vitest'
import { fitCanvasToA4 } from './pdfLayout'

describe('fitCanvasToA4', () => {
  it('scales a tall report into one A4 page without exceeding its bounds', () => {
    const layout = fitCanvasToA4({ width: 794, height: 1800 })

    expect(layout.width).toBeLessThanOrEqual(210)
    expect(layout.height).toBeLessThanOrEqual(297)
    expect(layout.height).toBe(297)
    expect(layout.x).toBeGreaterThan(0)
    expect(layout.y).toBe(0)
  })
})
