import type { Tool } from '../types/shape'

export interface ToolMeta {
  id: Tool
  label: string
  shortcut: string | null
}

export const TOOLS: ToolMeta[] = [
  { id: 'select', label: 'Select', shortcut: 'v' },
  { id: 'rectangle', label: 'Rectangle', shortcut: 'r' },
  { id: 'ellipse', label: 'Ellipse', shortcut: 'o' },
]

export const DEFAULT_TOOL: Tool = 'select'

export const TOOL_BY_KEY: Record<string, Tool> = Object.fromEntries(
  TOOLS.filter((tool) => tool.shortcut !== null).map((tool) => [
    tool.shortcut as string,
    tool.id,
  ]),
) as Record<string, Tool>