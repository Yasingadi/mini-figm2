import type { Point, Shape, Size, Viewport } from '../types/shape'

export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

export function getShapeBounds(shape: Pick<Shape, 'point' | 'size'>): Bounds {
  return { x: shape.point.x, y: shape.point.y, width: shape.size.width, height: shape.size.height }
}

export function translatePoint(point: Point, delta: Point): Point {
  return { x: point.x + delta.x, y: point.y + delta.y }
}

export function getSizeFromCorners(anchor: Point, current: Point): Size {
  return {
    width: Math.abs(anchor.x - current.x),
    height: Math.abs(anchor.y - current.y),
  }
}

export function screenToCanvas(
  screen: Point,
  viewport: Viewport,
  origin: Point = { x: 0, y: 0 },
): Point {
  return {
    x: (screen.x - origin.x - viewport.offsetX) / viewport.zoom,
    y: (screen.y - origin.y - viewport.offsetY) / viewport.zoom,
  }
}

export function canvasToScreen(
  canvas: Point,
  viewport: Viewport,
  origin: Point = { x: 0, y: 0 },
): Point {
  return {
    x: canvas.x * viewport.zoom + viewport.offsetX + origin.x,
    y: canvas.y * viewport.zoom + viewport.offsetY + origin.y,
  }
}