import { useCallback, useState } from "react"

export function useMemoryState(key: string, initialState: any, overwrite: boolean | undefined = false) {

  const [stateKey,] = useState(key)

  if (!localStorage.getItem(key) || overwrite) {
    localStorage.setItem(key, initialState)
  }

  const changeItem = useCallback((nextState: any) => {
    localStorage.setItem(stateKey, nextState)
    return
  },[stateKey])

  const removeItem = useCallback(() => {
    localStorage.removeItem(stateKey)
    return
  },[stateKey])

  const getItem = useCallback(() =>{
    return localStorage.getItem(stateKey)
  },[stateKey])

  return [getItem(), changeItem, removeItem, getItem] as const
}
