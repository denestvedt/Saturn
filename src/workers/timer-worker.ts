let intervalId: ReturnType<typeof setInterval> | null = null
let targetEndTime: number = 0
let remainingOnPause = 0

self.onmessage = (e: MessageEvent) => {
  const { type, duration } = e.data

  switch (type) {
    case 'START': {
      targetEndTime = Date.now() + duration * 1000
      if (intervalId) clearInterval(intervalId)
      intervalId = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000))
        self.postMessage({ type: 'TICK', remaining })
        if (remaining <= 0) {
          clearInterval(intervalId!)
          intervalId = null
          self.postMessage({ type: 'COMPLETE' })
        }
      }, 250)
      break
    }
    case 'PAUSE': {
      if (intervalId) clearInterval(intervalId)
      intervalId = null
      remainingOnPause = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000))
      self.postMessage({ type: 'PAUSED', remaining: remainingOnPause })
      break
    }
    case 'RESUME': {
      targetEndTime = Date.now() + remainingOnPause * 1000
      if (intervalId) clearInterval(intervalId)
      intervalId = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000))
        self.postMessage({ type: 'TICK', remaining })
        if (remaining <= 0) {
          clearInterval(intervalId!)
          intervalId = null
          self.postMessage({ type: 'COMPLETE' })
        }
      }, 250)
      break
    }
    case 'ADD_TIME': {
      const addSeconds = e.data.seconds || 300
      targetEndTime += addSeconds * 1000
      break
    }
    case 'RESET': {
      if (intervalId) clearInterval(intervalId)
      intervalId = null
      self.postMessage({ type: 'RESET' })
      break
    }
  }
}
