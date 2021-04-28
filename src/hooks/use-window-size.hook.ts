import { useState, useLayoutEffect, useCallback /* , useEffect */ } from 'react'
import { ContainerSize } from '../common/size-aware-container.component'

// Hook from https://usehooks.com/useWindowSize/
export function useWindowSize() {
  const isClient = typeof window === 'object'

  const getSize = useCallback(
    function getSize() {
      return {
        width: isClient ? window.innerWidth : undefined,
        height: isClient ? window.innerHeight : undefined
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [window.innerHeight, window.innerWidth]
  ) // Empty array ensures that effect is only run on mount and unmount

  const [windowSize, setWindowSize] = useState(getSize)

  useLayoutEffect(() => {
    if (!isClient) {
      return
    }

    function handleResize() {
      setWindowSize(getSize())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty array ensures that effect is only run on mount and unmount

  return windowSize
}

export function useClientSize(
  clientRef: React.RefObject<HTMLElement>,
  defaultWith: number,
  defaultHeight: number
) {
  const isClient = typeof window === 'object'

  const [clientSize, setClientSize] = useState<ContainerSize>({
    width: clientRef.current?.clientWidth || defaultWith,
    height: clientRef.current?.clientHeight || defaultHeight
  })

  useLayoutEffect(() => {
    if (!isClient) {
      return
    }

    function handleResize(entries?: ReadonlyArray<ResizeObserverEntry>) {
      if (entries && Array.isArray(entries) && entries.length > 0) {
        const element: ResizeObserverEntry = entries[0]
        const size = { width: element.contentRect.width, height: element.contentRect.height }
        // console.debug('Resize', element, size, clientSize, clientRef)
        setClientSize(size)
      }
    }
    const resizeObserver = new ResizeObserver(handleResize)
    const elem = clientRef.current
    if (elem) {
      handleResize()
      resizeObserver.observe(elem)
      return () => (elem ? resizeObserver.unobserve(elem) : undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientRef]) // Empty array ensures that effect is only run on mount and unmount

  return clientSize
}
