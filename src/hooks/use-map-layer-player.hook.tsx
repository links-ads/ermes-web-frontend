import { useEffect, useRef } from "react"

const useMapLayerPlayer = (callback, delay) => {
  const savedCallback = useRef<any>()

  // remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // set up timeout
  useEffect(() => {
    const tick = () => {
      const ret = savedCallback.current();

      if (!ret) {
        setTimeout(tick, delay);
      } else if (ret.constructor === Promise) {
        ret.then(() => setTimeout(tick, delay));
      }
    };

    const timer = setTimeout(tick, delay);

    return () => clearTimeout(timer);
  }, [delay]);
}

export default useMapLayerPlayer