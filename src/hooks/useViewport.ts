import { useCallback, useEffect, useRef, useState } from 'react'
import type { Point } from '../types/shape'
import { screenToCanvas } from '../utils/geometry'

export const MIN_ZOOM = 0.1
export const MAX_ZOOM = 4
export const ZOOM_SENSITIVITY = 0.0015

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    (target as HTMLElement).isContentEditable
  )
}

export interface ViewportHandlers {
  onPointerDown: React.PointerEventHandler<HTMLDivElement>
  onPointerMove: React.PointerEventHandler<HTMLDivElement>
  onPointerUp: React.PointerEventHandler<HTMLDivElement>
  onWheel: React.WheelEventHandler<HTMLDivElement>
}

export interface UseViewportResult extends ViewportHandlers {
  ref: React.RefObject<HTMLDivElement | null>
  zoom: number
  pan: Point
  spaceDown: boolean
  isPanning: boolean
}

export function useViewport(): UseViewportResult {
  const ref = useRef<HTMLDivElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 })
  const [spaceDown, setSpaceDown] = useState(false)
  const [isPanning, setPanning] = useState(false)

  const spaceDownRef = useRef(false)
  const isPanningRef = useRef(false)
  const lastClientRef = useRef<Point | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPan({ x: rect.width / 2, y: rect.height / 2 })
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || isEditableTarget(event.target)) return
      spaceDownRef.current = true
      setSpaceDown(true)
      event.preventDefault()
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return
      spaceDownRef.current = false
      setSpaceDown(false)
      if (isPanningRef.current) {
        isPanningRef.current = false
        lastClientRef.current = null
        setPanning(false)
      }
    }
    const handleBlur = () => {
      spaceDownRef.current = false
      isPanningRef.current = false
      lastClientRef.current = null
      setSpaceDown(false)
      setPanning(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!spaceDownRef.current) return
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      isPanningRef.current = true
      lastClientRef.current = { x: event.clientX, y: event.clientY }
      setPanning(true)
    },
    [],
  )

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanningRef.current || !lastClientRef.current) return
    const dx = event.clientX - lastClientRef.current.x
    const dy = event.clientY - lastClientRef.current.y
    lastClientRef.current = { x: event.clientX, y: event.clientY }
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
  }, [])

  const onPointerUp = useCallback(() => {
    if (!isPanningRef.current) return
    isPanningRef.current = false
    lastClientRef.current = null
    setPanning(false)
  }, [])

  const onWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      const factor = Math.exp(-event.deltaY * ZOOM_SENSITIVITY)
      const nextZoom = clamp(zoom * factor, MIN_ZOOM, MAX_ZOOM)
      if (nextZoom === zoom) return
      const point = screenToCanvas(
        { x: event.clientX, y: event.clientY },
        { zoom, offsetX: pan.x, offsetY: pan.y },
      )
      setZoom(nextZoom)
      setPan({
        x: event.clientX - point.x * nextZoom,
        y: event.clientY - point.y * nextZoom,
      })
    },
    [zoom, pan],
  )

  return {
    ref,
    zoom,
    pan,
    spaceDown,
    isPanning,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onWheel,
  }
}