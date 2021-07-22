import { useState } from 'react'

export function useMemoryState(key, initialState) {
  //   const stored = localStorage.getItem(key)

  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, initialState)
  }
  //   const [state, setState] = useState(stored ? stored : initialState)

  //   console.log('INT STORED 2', localStorage.getItem(key))

  const onChange = (nextState) => {
    localStorage.setItem(key, nextState)
    // setState(nextState)
    return
  }

  const removeItem = () => {
    localStorage.removeItem(key)
    return
  }
  return [localStorage.getItem(key), onChange, removeItem]
}
