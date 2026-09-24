import { useEffect } from 'react'

export type HotkeyHandler = (event: KeyboardEvent) => void

export interface HotkeyMap {
  [key: string]: HotkeyHandler
}

const MODIFIERS = ['ctrl', 'meta', 'alt', 'shift'] as const

type Modifier = (typeof MODIFIERS)[number]

const MODIFIER_KEYS = new Set(['control', 'meta', 'shift', 'alt'])

function isModifierDown(event: KeyboardEvent, modifier: Modifier): boolean {
  switch (modifier) {
    case 'ctrl':
      return event.ctrlKey
    case 'meta':
      return event.metaKey
    case 'alt':
      return event.altKey
    case 'shift':
      return event.shiftKey
  }
}

function canonicalize(pattern: string): string {
  const parts = pattern.toLowerCase().split('+')
  const key = parts[parts.length - 1] ?? ''
  const mods = new Set(parts.slice(0, -1))
  const out: string[] = []
  for (const modifier of MODIFIERS) {
    if (mods.has(modifier)) out.push(modifier)
  }
  out.push(key)
  return out.join('+')
}

function eventKey(event: KeyboardEvent): string {
  const out: string[] = []
  for (const modifier of MODIFIERS) {
    if (isModifierDown(event, modifier)) out.push(modifier)
  }
  out.push(event.key.toLowerCase())
  return out.join('+')
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    (target as HTMLElement).isContentEditable
  )
}

export function useHotkeys(handlers: HotkeyMap) {
  useEffect(() => {
    const compiled = Object.entries(handlers).map(
      ([pattern, handler]) => [canonicalize(pattern), handler] as const,
    )
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return
      if (MODIFIER_KEYS.has(event.key.toLowerCase())) return
      const key = eventKey(event)
      const match = compiled.find(([pattern]) => pattern === key)
      if (!match) return
      if (event.ctrlKey || event.metaKey) event.preventDefault()
      match[1](event)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handlers])
}