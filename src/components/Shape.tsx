import type { Shape, Tool } from '../types/shape'

interface ShapeViewProps {
  shape: Shape
  selected: boolean
  tool: Tool
  spaceDown: boolean
  onSelect: (id: string) => void
  onStartMove: (event: React.PointerEvent<HTMLDivElement>) => void
}

const HANDLE_SIZE = 10
const HANDLE_OFFSET = 5
const SELECTION_COLOR = '#9ca3af'

export default function ShapeView({
  shape,
  selected,
  tool,
  spaceDown,
  onSelect,
  onStartMove,
}: ShapeViewProps) {
  const draggable = tool === 'select' && !spaceDown

  return (
    <div
      className="absolute"
      style={{
        left: shape.point.x,
        top: shape.point.y,
        width: shape.size.width,
        height: shape.size.height,
        cursor: draggable ? 'move' : 'pointer',
      }}
      onPointerDown={(event) => {
        event.stopPropagation()
        if (!draggable) return
        event.currentTarget.setPointerCapture(event.pointerId)
        onStartMove(event)
      }}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(shape.id)
      }}
    >
      <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
        {shape.type === 'ellipse' ? (
          <ellipse
            cx="50%"
            cy="50%"
            rx="50%"
            ry="50%"
            fill={shape.fill}
            stroke={selected ? SELECTION_COLOR : 'none'}
            strokeWidth={selected ? 1.5 : 0}
            vectorEffect="non-scaling-stroke"
          />
        ) : (
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill={shape.fill}
            stroke={selected ? SELECTION_COLOR : 'none'}
            strokeWidth={selected ? 1.5 : 0}
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      {selected && <SelectionFrame shape={shape} />}
    </div>
  )
}

function SelectionFrame({ shape }: { shape: Shape }) {
  const { width, height } = shape.size
  const frameWidth = width + HANDLE_OFFSET * 2
  const frameHeight = height + HANDLE_OFFSET * 2
  const handles = [
    { x: 0, y: 0 },
    { x: frameWidth / 2, y: 0 },
    { x: frameWidth, y: 0 },
    { x: 0, y: frameHeight / 2 },
    { x: frameWidth, y: frameHeight / 2 },
    { x: 0, y: frameHeight },
    { x: frameWidth / 2, y: frameHeight },
    { x: frameWidth, y: frameHeight },
  ]

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: -HANDLE_OFFSET,
        top: -HANDLE_OFFSET,
        width: frameWidth,
        height: frameHeight,
      }}
    >
      <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
        <rect
          x={HANDLE_OFFSET}
          y={HANDLE_OFFSET}
          width={width}
          height={height}
          fill="none"
          stroke={SELECTION_COLOR}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {handles.map((handle, index) => (
        <span
          key={index}
          className="absolute block"
          style={{
            left: handle.x,
            top: handle.y,
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            transform: 'translate(-50%, -50%)',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            border: `1.5px solid ${SELECTION_COLOR}`,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  )
}