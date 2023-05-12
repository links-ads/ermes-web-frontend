import { useEffect, useRef } from 'react'

const useInterval = (callback, delaySeconds: number) => {
  const savedCallback = useRef<any>()

  // remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // set up interval
  useEffect(() => {
    const tick = () => {
      savedCallback.current()
    }

    if (delaySeconds && delaySeconds !== null) {
      const milliSeconds = delaySeconds * 1000
      const id = setInterval(tick, milliSeconds)
      return () => {
        clearInterval(id)
      }
    }
  }, [callback, delaySeconds])
}

export default useInterval
