import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePropertyStore } from './propertyStore'
import * as propertyApi from '../api/propertyApi'

describe('propertyStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('fetches recommended properties with the current condition', async () => {
    vi.spyOn(propertyApi, 'getRecommendedProperties').mockResolvedValue([{ propertyId: 'p1' }])
    const store = usePropertyStore()
    store.setCondition({ budget: 300000000, region: '서울 중랑구', priority: 'safety' })

    await store.fetchRecommended()

    expect(propertyApi.getRecommendedProperties).toHaveBeenCalledWith({
      budget: 300000000,
      region: '서울 중랑구',
      priority: 'safety',
    })
    expect(store.properties).toEqual([{ propertyId: 'p1' }])
    expect(store.isLoading).toBe(false)
  })

  it('sets an error message and rethrows when the request fails', async () => {
    vi.spyOn(propertyApi, 'getRecommendedProperties').mockRejectedValue(new Error('network'))
    const store = usePropertyStore()

    await expect(store.fetchRecommended()).rejects.toThrow()

    expect(store.error).toBe('추천 매물을 불러오지 못했습니다.')
    expect(store.isLoading).toBe(false)
  })
})
