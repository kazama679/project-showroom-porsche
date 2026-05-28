import { useState, useEffect } from 'react'
import { VehicleListingResponse } from '@/services/vehicle-listing-api'

const STORAGE_KEY = 'porsche_saved_listings'

export function useSavedListings() {
  const [savedIds, setSavedIds] = useState<number[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setSavedIds(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Failed to load saved listings from localStorage', e)
    } finally {
      setLoaded(true)
    }
  }, [])

  const saveListing = (id: number) => {
    setSavedIds(prev => {
      if (prev.includes(id)) return prev
      const updated = [...prev, id]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new Event('savedListingsUpdated'))
      return updated
    })
  }

  const removeListing = (id: number) => {
    setSavedIds(prev => {
      const updated = prev.filter(savedId => savedId !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new Event('savedListingsUpdated'))
      return updated
    })
  }

  const toggleListing = (id: number) => {
    if (savedIds.includes(id)) {
      removeListing(id)
    } else {
      saveListing(id)
    }
  }

  const isSaved = (id: number) => savedIds.includes(id)

  // Listen to updates from other tabs or components
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          setSavedIds(JSON.parse(stored))
        } else {
          setSavedIds([])
        }
      } catch (e) {
        // Ignored
      }
    }

    window.addEventListener('savedListingsUpdated', handleUpdate)
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        handleUpdate()
      }
    })
    return () => {
      window.removeEventListener('savedListingsUpdated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  return {
    savedIds,
    loaded,
    saveListing,
    removeListing,
    toggleListing,
    isSaved
  }
}
