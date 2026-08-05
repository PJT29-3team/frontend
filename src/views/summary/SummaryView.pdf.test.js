import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SummaryView from './SummaryView.vue'

const save = vi.fn()
const addImage = vi.fn()
const addPage = vi.fn()

vi.mock('html2canvas', () => ({
  default: vi.fn(() => Promise.resolve({
    width: 794,
    height: 1123,
    toDataURL: () => 'data:image/png;base64,test',
  })),
}))

vi.mock('jspdf', () => ({
  default: {},
  jsPDF: function () {
    return { addImage, addPage, save }
  },
}))

describe('SummaryView PDF download', () => {
  beforeEach(() => {
    save.mockClear()
    addImage.mockClear()
    addPage.mockClear()
  })

  it('creates and saves a PDF when the download button is clicked', async () => {
    const wrapper = mount(SummaryView)

    await wrapper.get('.pdf-btn').trigger('click')
    await flushPromises()

    expect(addImage).toHaveBeenCalled()
    expect(save).toHaveBeenCalledOnce()
  })
})
