/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type AnimatedNumberProps = {
  value: number | null | undefined
  /**
   * Duration in ms for the count-up animation after it becomes visible.
   */
  durationMs?: number
  /**
   * Number of digits after decimal point.
   */
  decimals?: number
  /**
   * If true, the animation will trigger only once.
   */
  once?: boolean
  /**
   * How much of the element should be visible before triggering.
   */
  threshold?: number
  /**
   * Root margin for the IntersectionObserver (e.g. "0px 0px -20% 0px").
   */
  rootMargin?: string
  /**
   * Optional formatting hook (e.g. add commas). Receives the animated numeric value.
   */
  format?: (v: number) => string
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function defaultFormat(v: number, decimals: number) {
  if (decimals <= 0) return Math.round(v).toString()
  return v.toFixed(decimals)
}

export function AnimatedNumber({
  value,
  durationMs = 1000,
  decimals = 0,
  once = true,
  threshold = 0.35,
  rootMargin = '0px 0px -10% 0px',
  format,
}: AnimatedNumberProps) {
  const target = typeof value === 'number' && Number.isFinite(value) ? value : null
  const [display, setDisplay] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement | null>(null)
  const rafId = useRef<number | null>(null)
  const startTs = useRef<number | null>(null)
  const startValue = useRef(0)

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
  }, [])

  useEffect(() => {
    if (target === null) return
    if (reducedMotion) {
      setDisplay(target)
      setHasAnimated(true)
      return
    }
  }, [target, reducedMotion])

  useEffect(() => {
    if (!ref.current) return
    if (target === null) return
    if (once && hasAnimated) return
    if (reducedMotion) return

    const el = ref.current
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting) return

        observer.disconnect()

        startTs.current = null
        startValue.current = 0
        setDisplay(0)

        const tick = (ts: number) => {
          if (startTs.current === null) startTs.current = ts
          const t = ts - startTs.current
          const p = clamp(t / durationMs, 0, 1)
          // easeOutCubic
          const eased = 1 - Math.pow(1 - p, 3)
          const next = startValue.current + (target - startValue.current) * eased
          setDisplay(next)

          if (p < 1) {
            rafId.current = requestAnimationFrame(tick)
          } else {
            setDisplay(target)
            setHasAnimated(true)
            rafId.current = null
          }
        }

        rafId.current = requestAnimationFrame(tick)
      },
      { threshold, rootMargin }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
      if (rafId.current) cancelAnimationFrame(rafId.current)
      rafId.current = null
    }
  }, [target, durationMs, decimals, once, threshold, rootMargin, hasAnimated, reducedMotion])

  const text = useMemo(() => {
    const v = Number.isFinite(display) ? display : 0
    const normalized = decimals <= 0 ? Math.round(v) : v
    return format ? format(normalized) : defaultFormat(normalized, decimals)
  }, [display, decimals, format])

  return (
    <span ref={ref} aria-label={target === null ? 'N/A' : String(target)}>
      {target === null ? '---' : text}
    </span>
  )
}

