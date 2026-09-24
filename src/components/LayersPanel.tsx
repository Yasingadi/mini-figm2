import type { Shape } from '../types/shape'

interface LayersPanelProps {
  shapes: Shape[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export default function LayersPanel({ shapes, selectedId, onSelect }: LayersPanelProps) {
  return (
    <aside className="absolute right-3 top-3 flex w-56 flex-col gap-3 rounded-lg border border-neutral-700/60 bg-neutral-800/90 p-3 shadow-xl backdrop-blur">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Layers</h2>
      {shapes.length === 0 ? (
        <p className="text-sm text-neutral-500">No layers yet.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {[...shapes].reverse().map((shape) => {
            const active = shape.id === selectedId
            return (
              <li key={shape.id}>
                <button
                  type="button"
                  onClick={() => onSelect(active ? null : shape.id)}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm capitalize transition-colors ${
                    active ? 'bg-blue-600 text-white' : 'text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {shape.type}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}