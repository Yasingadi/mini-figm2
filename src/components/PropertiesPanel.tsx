import type { Shape } from '../types/shape'

interface PropertiesPanelProps {
  shape: Shape | null
  onChangeFill: (fill: string) => void
}

export default function PropertiesPanel({ shape, onChangeFill }: PropertiesPanelProps) {
  return (
    <aside className="absolute bottom-3 right-3 flex w-56 flex-col gap-3 rounded-lg border border-neutral-700/60 bg-neutral-800/90 p-3 shadow-xl backdrop-blur">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
        Properties
      </h2>
      {shape ? (
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-400">Type</dt>
            <dd className="capitalize text-neutral-200">{shape.type}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-neutral-400">Fill</dt>
            <dd className="flex items-center gap-2">
              <input
                type="color"
                value={shape.fill}
                onChange={(event) => onChangeFill(event.target.value)}
                className="h-7 w-10 cursor-pointer rounded border border-neutral-600 bg-transparent p-0.5"
              />
              <span className="font-mono text-xs text-neutral-300">{shape.fill}</span>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-400">X</dt>
            <dd className="text-neutral-200">{Math.round(shape.point.x)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-400">Y</dt>
            <dd className="text-neutral-200">{Math.round(shape.point.y)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-400">W</dt>
            <dd className="text-neutral-200">{Math.round(shape.size.width)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-400">H</dt>
            <dd className="text-neutral-200">{Math.round(shape.size.height)}</dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-neutral-500">Select a shape to edit its properties.</p>
      )}
    </aside>
  )
}