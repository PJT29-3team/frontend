import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authStore } from '../stores/authStore'
import SocialProfileCompletionView from './SocialProfileCompletionView.vue'

const routerReplace = vi.hoisted(() => vi.fn())

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({ replace: routerReplace }),
  }
})

describe('SocialProfileCompletionView', () => {
  beforeEach(() => {
    routerReplace.mockReset()
  })

  it('collects the missing name and birth date then enters the main screen', async () => {
    vi.spyOn(authStore, 'completeSocialProfile').mockResolvedValue({})
    const wrapper = mount(SocialProfileCompletionView)

    expect(wrapper.text()).toContain('몇 가지만 더 확인할게요')
    expect(wrapper.get('input[name="birthDate"]').attributes('type')).toBe('date')

    await wrapper.get('input[name="name"]').setValue('김집현')
    await wrapper.get('input[name="birthDate"]').setValue('1955-04-12')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(authStore.completeSocialProfile).toHaveBeenCalledWith('김집현', 1955)
    expect(routerReplace).toHaveBeenCalledWith('/main')
  })
})
