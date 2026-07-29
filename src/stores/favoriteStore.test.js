import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFavoriteStore } from './favoriteStore'
import * as favoriteApi from '../api/favoriteApi'

function makeProperty(propertyId) {
  return { propertyId, name: `매물 ${propertyId}`, price: '3억' }
}

describe('favoriteStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('optimistically adds a favorite and shows a success toast', async () => {
    vi.spyOn(favoriteApi, 'addFavoriteProperty').mockResolvedValue(undefined)
    const store = useFavoriteStore()

    await store.addFavorite(makeProperty('p1'))

    expect(store.isFavorite('p1')).toBe(true)
    expect(store.toast.visible).toBe(true)
    expect(store.toast.tone).toBe('success')
  })

  it('rolls back and shows a danger toast when the API call fails', async () => {
    vi.spyOn(favoriteApi, 'addFavoriteProperty').mockRejectedValue(new Error('network'))
    const store = useFavoriteStore()

    await expect(store.addFavorite(makeProperty('p1'))).rejects.toThrow()

    expect(store.isFavorite('p1')).toBe(false)
    expect(store.toast.tone).toBe('danger')
  })

  it('blocks adding a 4th favorite and warns instead', async () => {
    vi.spyOn(favoriteApi, 'addFavoriteProperty').mockResolvedValue(undefined)
    const store = useFavoriteStore()

    await store.addFavorite(makeProperty('p1'))
    await store.addFavorite(makeProperty('p2'))
    await store.addFavorite(makeProperty('p3'))
    await store.addFavorite(makeProperty('p4'))

    expect(store.favorites).toHaveLength(3)
    expect(store.isFavorite('p4')).toBe(false)
    expect(store.toast.tone).toBe('warning')
  })

  it('removes a favorite and rolls back on failure', async () => {
    vi.spyOn(favoriteApi, 'addFavoriteProperty').mockResolvedValue(undefined)
    vi.spyOn(favoriteApi, 'removeFavoriteProperty').mockRejectedValue(new Error('network'))
    const store = useFavoriteStore()
    await store.addFavorite(makeProperty('p1'))

    await expect(store.removeFavorite('p1')).rejects.toThrow()

    expect(store.isFavorite('p1')).toBe(true)
  })
})
