export type Tool = 'select' | 'rectangle' | 'ellipse'

export type ShapeType = 'rectangle' | 'ellipse'

export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Shape {
  id: string
  type: ShapeType
  point: Point
  size: Size
  fill: string
  rotation: number
}

export interface Viewport {
  zoom: number
  offsetX: number
  offsetY: number
}