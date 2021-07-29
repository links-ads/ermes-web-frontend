import { useState } from 'react'

export function useMemoryState(key: string, initialState: any, overwrite: boolean | undefined = false) {
  if (!localStorage.getItem(key) || overwrite) {
    localStorage.setItem(key, initialState)
  }

  const changeItem = (nextState: any) => {
    localStorage.setItem(key, nextState)
    return
  }

  const removeItem = () => {
    localStorage.removeItem(key)
    return
  }

  return [localStorage.getItem(key), changeItem, removeItem] as const
}
