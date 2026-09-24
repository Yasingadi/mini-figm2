import { useCallback, useRef } from 'react'
import { useViewport } from '../hooks/useViewport'
import type { Point, Shape, ShapeType, Tool } from '../types/shape'
import { screenToCanvas } from '../utils/geometry'
import ShapeView from './Shape'

const GRID_STEP = 24
const CLICK_THRESHOLD = 5

interface CanvasProps {
  shapes: Shape[]
  draft: Shape | null
  selectedId: string | null
  tool: Tool
  onSelect: (id: string | null) => void
  onStartDraw: (canvasPoint: Point, type: ShapeType) => void
  onUpdateDraw: (canvasPoint: Point) => void
  onEndDraw: () => void
  onStartMove: (id: string, canvasPoint: Point) => void
  onUpdateMove: (canvasPoint: Point) => void
  onEndMove: () => void
}

export default function Canvas({
  shapes,
  draft,
  selectedId,
  tool,
  onSelect,
  onStartDraw,
  onUpdateDraw,
  onEndDraw,
  onStartMove,
  onUpdateMove,
  onEndMove,
}: CanvasProps) {
  const viewport = useViewport()
  const { ref, zoom, pan, spaceDown, isPanning } = viewport
  const downPointRef = useRef<Point | null>(null)
  const drawingRef = useRef(false)
  const movingRef = useRef(false)
  const isDrawingTool = tool === 'rectangle' || tool === 'ellipse'

  const toCanvasPoint = useCallback(
    (screen: Point): Point => screenToCanvas(screen, { zoom, offsetX: pan.x, offsetY: pan.y }),
    [zoom, pan],
  )

  const handleShapeStartMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, shape: Shape) => {
      movingRef.current = true
      onStartMove(shape.id, toCanvasPoint({ x: event.clientX, y: event.clientY }))
    },
    [onStartMove, toCanvasPoint],
  )

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      downPointRef.current = { x: event.clientX, y: event.clientY }
      if (spaceDown) {
        viewport.onPointerDown(event)
        return
      }
      if (!isDrawingTool) return
      drawingRef.current = true
      event.currentTarget.setPointerCapture(event.pointerId)
      onStartDraw(toCanvasPoint({ x: event.clientX, y: event.clientY }), tool)
    },
    [spaceDown, isDrawingTool, tool, onStartDraw, toCanvasPoint, viewport],
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const canvasPoint = toCanvasPoint({ x: event.clientX, y: event.clientY })
      if (movingRef.current) {
        onUpdateMove(canvasPoint)
      } else if (drawingRef.current) {
        onUpdateDraw(canvasPoint)
      }
      viewport.onPointerMove(event)
    },
    [onUpdateMove, onUpdateDraw, toCanvasPoint, viewport],
  )

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (movingRef.current) {
        movingRef.current = false
        onEndMove()
      }
      if (drawingRef.current) {
        drawingRef.current = false
        onEndDraw()
      }
      viewport.onPointerUp(event)
    },
    [onEndMove, onEndDraw, viewport],
  )

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (tool !== 'select' || event.target !== event.currentTarget || !downPointRef.current) return
      const dx = event.clientX - downPointRef.current.x
      const dy = event.clientY - downPointRef.current.y
      if (Math.hypot(dx, dy) > CLICK_THRESHOLD) return
      onSelect(null)
    },
    [tool, onSelect],
  )

  const gridSize = GRID_STEP * zoom

  return (
    <div
      ref={ref}
      className="absolute inset-0 touch-none select-none overflow-hidden"
      style={{
        backgroundColor: '#1e1e1e',
        backgroundImage: 'radial-gradient(circle, #3f3f3f 1px, transparent 1.6px)',
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
        cursor: isPanning
          ? 'grabbing'
          : spaceDown
            ? 'grab'
            : isDrawingTool
              ? 'crosshair'
              : 'default',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={viewport.onWheel}
      onClick={handleClick}
    >
      <div
        style={{
          position: 'absolute',
          left: pan.x,
          top: pan.y,
          transform: `scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {shapes.map((shape) => (
          <ShapeView
            key={shape.id}
            shape={shape}
            tool={tool}
            spaceDown={spaceDown}
            selected={shape.id === selectedId}
            onSelect={onSelect}
            onStartMove={(event) => handleShapeStartMove(event, shape)}
          />
        ))}
        {draft && (
          <ShapeView
            key={draft.id}
            shape={draft}
            tool={tool}
            spaceDown={spaceDown}
            selected
            onSelect={() => {}}
            onStartMove={() => {}}
          />
        )}
      </div>
    </div>
  )
}