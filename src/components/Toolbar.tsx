import type { ReactNode } from 'react'
import { TOOLS } from '../constants/tools'
import type { Tool } from '../types/shape'

interface ToolbarProps {
  activeTool: Tool
  onSelectTool: (tool: Tool) => void
}

const ICONS: Record<Tool, ReactNode> = {
  select: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 3 L18 11 L11.5 12.5 L10 19 Z" />
    </svg>
  ),
  rectangle: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="4" y="6" width="16" height="12" rx="1" />
    </svg>
  ),
  ellipse: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <ellipse cx="12" cy="12" rx="9" ry="6" />
    </svg>
  ),
}

export default function Toolbar({ activeTool, onSelectTool }: ToolbarProps) {
  return (
    <div className="absolute left-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1 rounded-lg border border-neutral-700/60 bg-neutral-800/90 p-1.5 shadow-xl backdrop-blur">
      {TOOLS.map((tool) => {
        const active = tool.id === activeTool
        return (
          <button
            key={tool.id}
            type="button"
            title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut.toUpperCase()})` : ''}`}
            onClick={() => onSelectTool(tool.id)}
            className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
              active
                ? 'bg-neutral-400 text-white'
                : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
            }`}
          >
            {ICONS[tool.id]}
          </button>
        )
      })}
    </div>
  )
}