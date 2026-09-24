import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_FILL, DEFAULT_SHAPE_SIZE, MIN_SHAPE_SIZE } from '../constants/shapes'
import type { Point, Shape, ShapeType, Size } from '../types/shape'
import { getSizeFromCorners, translatePoint } from '../utils/geometry'

const MAX_HISTORY = 100

export interface ShapeInput {
  type: ShapeType
  point: Point
  size: Size
  fill?: string
}

export interface UseShapesResult {
  shapes: Shape[]
  draft: Shape | null
  selectedId: string | null
  addShape: (input: ShapeInput) => string
  updateShape: (id: string, patch: Partial<Omit<Shape, 'id'>>) => void
  removeShape: (id: string) => void
  selectShape: (id: string | null) => void
  startDraw: (canvasPoint: Point, type: ShapeType) => void
  updateDraw: (canvasPoint: Point) => void
  endDraw: () => void
  startMove: (id: string, canvasPoint: Point) => void
  updateMove: (canvasPoint: Point) => void
  endMove: () => void
  undo: () => void
  redo: () => void
}

interface MoveState {
  id: string
  origin: Point
  start: Point
}

export function useShapes(): UseShapesResult {
  const [shapes, setShapes] = useState<Shape[]>([])
  const [draft, setDraft] = useState<Shape | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const draftAnchorRef = useRef<Point | null>(null)
  const moveRef = useRef<MoveState | null>(null)
  const pastRef = useRef<Shape[][]>([])
  const futureRef = useRef<Shape[][]>([])
  const shapesRef = useRef<Shape[]>([])
  useEffect(() => {
    shapesRef.current = shapes
  }, [shapes])

  const commit = useCallback(() => {
    const nextPast = [...pastRef.current, shapesRef.current]
    pastRef.current =
      nextPast.length > MAX_HISTORY ? nextPast.slice(nextPast.length - MAX_HISTORY) : nextPast
    futureRef.current = []
  }, [])

  const undo = useCallback(() => {
    const past = pastRef.current
    if (past.length === 0) return
    const previous = past[past.length - 1]
    pastRef.current = past.slice(0, -1)
    futureRef.current = [shapesRef.current, ...futureRef.current]
    setShapes(previous)
  }, [])

  const redo = useCallback(() => {
    const future = futureRef.current
    if (future.length === 0) return
    const [next, ...rest] = future
    futureRef.current = rest
    pastRef.current = [...pastRef.current, shapesRef.current]
    setShapes(next)
  }, [])

  const addShape = useCallback((input: ShapeInput): string => {
    commit()
    const id = crypto.randomUUID()
    setShapes((prev) => [...prev, { fill: DEFAULT_FILL, rotation: 0, ...input, id }])
    setSelectedId(id)
    return id
  }, [commit])

  const updateShape = useCallback((id: string, patch: Partial<Omit<Shape, 'id'>>) => {
    commit()
    setShapes((prev) => prev.map((shape) => (shape.id === id ? { ...shape, ...patch } : shape)))
  }, [commit])

  const removeShape = useCallback((id: string) => {
    commit()
    setShapes((prev) => prev.filter((shape) => shape.id !== id))
    setSelectedId((current) => (current === id ? null : current))
  }, [commit])

  const selectShape = useCallback((id: string | null) => {
    setSelectedId(id)
  }, [])

  const startDraw = useCallback((canvasPoint: Point, type: ShapeType) => {
    draftAnchorRef.current = canvasPoint
    setSelectedId(null)
    setDraft({
      id: crypto.randomUUID(),
      type,
      point: canvasPoint,
      size: { width: 0, height: 0 },
      fill: DEFAULT_FILL,
      rotation: 0,
    })
  }, [])

  const updateDraw = useCallback((canvasPoint: Point) => {
    const anchor = draftAnchorRef.current
    if (!anchor) return
    setDraft((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        point: {
          x: Math.min(anchor.x, canvasPoint.x),
          y: Math.min(anchor.y, canvasPoint.y),
        },
        size: getSizeFromCorners(anchor, canvasPoint),
      }
    })
  }, [])

  const endDraw = useCallback(() => {
    if (!draft) return
    const anchor = draftAnchorRef.current ?? draft.point
    const tooSmall = draft.size.width < MIN_SHAPE_SIZE || draft.size.height < MIN_SHAPE_SIZE
    const shape: Shape = tooSmall
      ? {
          ...draft,
          point: anchor,
          size: { width: DEFAULT_SHAPE_SIZE, height: DEFAULT_SHAPE_SIZE },
        }
      : draft
    draftAnchorRef.current = null
    commit()
    setShapes((prev) => [...prev, shape])
    setSelectedId(shape.id)
    setDraft(null)
  }, [draft, commit])

  const startMove = useCallback((id: string, canvasPoint: Point) => {
    const shape = shapesRef.current.find((item) => item.id === id)
    if (!shape) return
    commit()
    moveRef.current = { id, origin: shape.point, start: canvasPoint }
    setSelectedId(id)
  }, [commit])

  const updateMove = useCallback((canvasPoint: Point) => {
    const move = moveRef.current
    if (!move) return
    const nextPoint = translatePoint(move.origin, {
      x: canvasPoint.x - move.start.x,
      y: canvasPoint.y - move.start.y,
    })
    setShapes((prev) => prev.map((item) => (item.id === move.id ? { ...item, point: nextPoint } : item)))
  }, [])

  const endMove = useCallback(() => {
    moveRef.current = null
  }, [])

  return {
    shapes,
    draft,
    selectedId,
    addShape,
    updateShape,
    removeShape,
    selectShape,
    startDraw,
    updateDraw,
    endDraw,
    startMove,
    updateMove,
    endMove,
    undo,
    redo,
  }
}