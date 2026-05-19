'use client'

import { useEffect, useState } from 'react'

/** True while the global site header is still in view (user has not scrolled past it). */
export function useSiteHeaderVisible(threshold = 48): boolean {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY < threshold)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return visible
}
