import { useMemo, useState } from 'react'
import Canvas from './components/Canvas'
import LayersPanel from './components/LayersPanel'
import PropertiesPanel from './components/PropertiesPanel'
import Toolbar from './components/Toolbar'
import { DEFAULT_TOOL, TOOLS } from './constants/tools'
import { useHotkeys, type HotkeyMap } from './hooks/useHotkeys'
import { useShapes } from './hooks/useShapes'
import type { Tool } from './types/shape'

function App() {
  const [tool, setTool] = useState<Tool>(DEFAULT_TOOL)
  const {
    shapes,
    draft,
    selectedId,
    selectShape,
    startDraw,
    updateDraw,
    endDraw,
    updateShape,
    startMove,
    updateMove,
    endMove,
    undo,
    redo,
  } = useShapes()

  const selectedShape = shapes.find((shape) => shape.id === selectedId) ?? null

  const hotkeys = useMemo<HotkeyMap>(() => {
    const handlers: HotkeyMap = {}
    for (const item of TOOLS) {
      if (item.shortcut) handlers[item.shortcut] = () => setTool(item.id)
    }
    handlers['ctrl+z'] = undo
    handlers['ctrl+shift+z'] = redo
    return handlers
  }, [undo, redo])

  useHotkeys(hotkeys)

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-neutral-900 text-neutral-200">
      <Canvas
        shapes={shapes}
        draft={draft}
        selectedId={selectedId}
        tool={tool}
        onSelect={selectShape}
        onStartDraw={startDraw}
        onUpdateDraw={updateDraw}
        onEndDraw={endDraw}
        onStartMove={startMove}
        onUpdateMove={updateMove}
        onEndMove={endMove}
      />
      <Toolbar activeTool={tool} onSelectTool={setTool} />
      <PropertiesPanel
        shape={selectedShape}
        onChangeFill={(fill) => {
          if (selectedShape) updateShape(selectedShape.id, { fill })
        }}
      />
      <LayersPanel shapes={shapes} selectedId={selectedId} onSelect={selectShape} />
    </div>
  )
}

export default App