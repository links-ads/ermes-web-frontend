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
  const getItem = () =>{
    return localStorage.getItem(key)
  }
  return [getItem(), changeItem, removeItem, getItem] as const
}
