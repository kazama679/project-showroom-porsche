'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent, WheelEvent as ReactWheelEvent } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'

type Porsche3DStreamProps = {
  modelCode: string
  className?: string
  productPayload?: PorscheProductPayload | null
  initialCamera?: string
  hideUpdateOverlay?: boolean
  onBusyChange?: (busy: boolean) => void
}

type PorscheProductPayload = {
  id: string
  options: {
    config: string[]
    country: string
    modelYear: number
  }
}

type PorscheSessionResponse = {
  threeD?: {
    session?: {
      token?: string
      websocketUrl?: string
      error?: string
    } | null
  }
}

type SignalingMessage = {
  type?: string
  ids?: string[]
  sdp?: string
  candidate?: RTCIceCandidateInit
  peerConnectionOptions?: RTCConfiguration
  time?: number
}

const STREAMER_MESSAGES = {
  UIInteraction: { id: 50, structure: ['string'] },
  MouseEnter: { id: 70, structure: [] },
  MouseLeave: { id: 71, structure: [] },
  MouseDown: { id: 72, structure: ['uint8', 'uint16', 'uint16'] },
  MouseUp: { id: 73, structure: ['uint8', 'uint16', 'uint16'] },
  MouseMove: { id: 74, structure: ['uint16', 'uint16', 'int16', 'int16'] },
  MouseWheel: { id: 75, structure: ['int16', 'uint16', 'uint16'] },
} as const

type StreamerMessageName = keyof typeof STREAMER_MESSAGES
type PorscheAnimationId = 'RigDoorFL' | 'RigDoorFR' | 'RigTrunkF' | 'RigGasCapR'

const ANIMATION_CONTROLS: Array<{
  id: PorscheAnimationId
  label: string
  animationIds: string[]
}> = [
  { id: 'RigDoorFL', label: 'Cua trai', animationIds: ['RigDoorFL'] },
  { id: 'RigDoorFR', label: 'Cua phai', animationIds: ['RigDoorFR'] },
  { id: 'RigTrunkF', label: 'Cop truoc', animationIds: ['RigTrunkF', 'RigHood'] },
  {
    id: 'RigGasCapR',
    label: 'Nap xang',
    animationIds: ['RigGasCapR', 'RigFuelCap', 'RigFuelDoor'],
  },
]

function buildWebSocketUrl(websocketUrl: string, token: string) {
  const separator = websocketUrl.includes('?') ? '&' : '?'
  return `${websocketUrl}${separator}token=${encodeURIComponent(token)}`
}

function sendSignalingMessage(socket: WebSocket | null, message: Record<string, unknown>) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message))
  }
}

async function parseSignalingMessage(data: MessageEvent['data']): Promise<SignalingMessage | null> {
  try {
    const text =
      typeof data === 'string'
        ? data
        : data instanceof Blob
          ? await data.text()
          : new TextDecoder().decode(data)

    return JSON.parse(text) as SignalingMessage
  } catch {
    return null
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function toUnsignedCoordinate(value: number, max: number) {
  if (max <= 0) return 65535
  return Math.round(clamp((value / max) * 65536, 0, 65535))
}

function toSignedDelta(value: number, size: number, videoSize: number, baseline: number) {
  if (size <= 0 || videoSize <= 0) return 0
  const ratio = videoSize > baseline ? videoSize / baseline : baseline / videoSize
  const normalized = (value / (0.5 * size) / ratio) * 1.6
  return Math.round(clamp(normalized * 32767, -32768, 32767))
}

function buildStreamerMessage(name: StreamerMessageName, values: Array<number | string> = []) {
  const message = STREAMER_MESSAGES[name]
  const size = message.structure.reduce((total, type, index) => {
    if (type === 'uint8') return total + 1
    if (type === 'string') return total + 2 + String(values[index] ?? '').length * 2
    return total + 2
  }, 1)
  const view = new DataView(new ArrayBuffer(size))
  view.setUint8(0, message.id)

  let offset = 1
  message.structure.forEach((type, index) => {
    const value = values[index] ?? 0
    if (type === 'uint8') {
      view.setUint8(offset, clamp(Math.round(Number(value)), 0, 255))
      offset += 1
      return
    }
    if (type === 'uint16') {
      view.setUint16(offset, clamp(Math.round(Number(value)), 0, 65535), true)
      offset += 2
      return
    }
    if (type === 'string') {
      const text = String(value)
      view.setUint16(offset, text.length, true)
      offset += 2
      for (let charIndex = 0; charIndex < text.length; charIndex += 1) {
        view.setUint16(offset, text.charCodeAt(charIndex), true)
        offset += 2
      }
      return
    }
    view.setInt16(offset, clamp(Math.round(Number(value)), -32768, 32767), true)
    offset += 2
  })

  return view.buffer
}

export function Porsche3DStream({
  modelCode,
  className,
  productPayload,
  initialCamera,
  hideUpdateOverlay = false,
  onBusyChange,
}: Porsche3DStreamProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const inputLayerRef = useRef<HTMLDivElement | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const lastPayloadRef = useRef<string | null>(null)
  const lastCameraRef = useRef<string | null>(null)
  const [status, setStatus] = useState('Dang khoi tao 3D stream...')
  const [error, setError] = useState<string | null>(null)
  const [inputReady, setInputReady] = useState(false)
  const [openAnimations, setOpenAnimations] = useState<Record<PorscheAnimationId, boolean>>({
    RigDoorFL: false,
    RigDoorFR: false,
    RigTrunkF: false,
    RigGasCapR: false,
  })

  const sendInputMessage = useCallback((name: StreamerMessageName, values: Array<number | string> = []) => {
    const channel = dataChannelRef.current
    if (channel?.readyState !== 'open') return
    channel.send(buildStreamerMessage(name, values))
  }, [])

  const sendUiInteraction = useCallback((messageType: string, data: Record<string, unknown>) => {
    const traceId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`
    const payload = JSON.stringify({
      messageType: `req_${messageType}`,
      body: {
        data,
        traceId,
      },
    })
    sendInputMessage('UIInteraction', [payload])
  }, [sendInputMessage])

  useEffect(() => {
    onBusyChange?.(!inputReady)
  }, [inputReady, onBusyChange])

  useEffect(() => {
    if (!inputReady || !productPayload) return

    const serializedPayload = JSON.stringify(productPayload)
    if (lastPayloadRef.current === serializedPayload) return
    lastPayloadRef.current = serializedPayload

    onBusyChange?.(true)
    sendUiInteraction('updateconfiguration', {
      product: productPayload,
    })

    const timer = window.setTimeout(() => {
      onBusyChange?.(false)
    }, 1200)

    return () => window.clearTimeout(timer)
  }, [inputReady, onBusyChange, productPayload, sendUiInteraction])

  useEffect(() => {
    if (!inputReady || !initialCamera || lastCameraRef.current === initialCamera) return

    lastCameraRef.current = initialCamera
    sendUiInteraction('setcamera', {
      id: initialCamera,
    })
  }, [initialCamera, inputReady, sendUiInteraction])

  const toggleAnimation = (control: (typeof ANIMATION_CONTROLS)[number]) => {
    if (!inputReady) return

    setOpenAnimations((current) => {
      const nextOpen = !current[control.id]
      control.animationIds.forEach((animationId) => {
        sendUiInteraction('playanimation', {
          id: animationId,
          jump: false,
          direction: nextOpen ? 'start' : 'end',
        })
      })
      return {
        ...current,
        [control.id]: nextOpen,
      }
    })
  }

  const getMouseCoordinates = (event: ReactMouseEvent<HTMLDivElement>) => {
    const layer = inputLayerRef.current
    const video = videoRef.current
    if (!layer || !video) return null

    const rect = layer.getBoundingClientRect()
    const localX = event.clientX - rect.left
    const localY = event.clientY - rect.top

    return {
      x: toUnsignedCoordinate(localX, rect.width),
      y: toUnsignedCoordinate(localY, rect.height),
      dx: toSignedDelta(event.movementX, rect.width, video.videoWidth || 1920, 1920),
      dy: toSignedDelta(event.movementY, rect.height, video.videoHeight || 1080, 1080),
    }
  }

  const handleMouseEnter = (event: ReactMouseEvent<HTMLDivElement>) => {
    sendInputMessage('MouseEnter')
    const coords = getMouseCoordinates(event)
    if (coords && event.buttons > 0) {
      if (event.buttons & 1) sendInputMessage('MouseDown', [0, coords.x, coords.y])
      if (event.buttons & 2) sendInputMessage('MouseDown', [2, coords.x, coords.y])
      if (event.buttons & 4) sendInputMessage('MouseDown', [1, coords.x, coords.y])
    }
  }

  const handleMouseLeave = (event: ReactMouseEvent<HTMLDivElement>) => {
    const coords = getMouseCoordinates(event)
    if (coords && event.buttons > 0) {
      if (event.buttons & 1) sendInputMessage('MouseUp', [0, coords.x, coords.y])
      if (event.buttons & 2) sendInputMessage('MouseUp', [2, coords.x, coords.y])
      if (event.buttons & 4) sendInputMessage('MouseUp', [1, coords.x, coords.y])
    }
    sendInputMessage('MouseLeave')
  }

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    const coords = getMouseCoordinates(event)
    if (!coords) return
    sendInputMessage('MouseDown', [event.button, coords.x, coords.y])
    event.currentTarget.setAttribute('data-grabbing', 'true')
    event.preventDefault()
  }

  const handleMouseUp = (event: ReactMouseEvent<HTMLDivElement>) => {
    const coords = getMouseCoordinates(event)
    if (!coords) return
    sendInputMessage('MouseUp', [event.button, coords.x, coords.y])
    event.currentTarget.removeAttribute('data-grabbing')
    event.preventDefault()
  }

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const coords = getMouseCoordinates(event)
    if (!coords) return
    sendInputMessage('MouseMove', [coords.x, coords.y, coords.dx, coords.dy])
    event.preventDefault()
  }

  const handleMouseWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const coords = getMouseCoordinates(event as unknown as ReactMouseEvent<HTMLDivElement>)
    if (!coords) return
    const nativeWheelDelta = (event.nativeEvent as ReactWheelEvent<HTMLDivElement>['nativeEvent'] & {
      wheelDelta?: number
    }).wheelDelta
    const wheelDelta = nativeWheelDelta ?? Math.sign(-event.deltaY) * 120
    sendInputMessage('MouseWheel', [wheelDelta, coords.x, coords.y])
    event.preventDefault()
  }

  useEffect(() => {
    const layer = inputLayerRef.current
    if (!layer) return

    const preventPageScroll = (event: globalThis.WheelEvent) => {
      event.preventDefault()
    }

    layer.addEventListener('wheel', preventPageScroll, { passive: false })
    return () => {
      layer.removeEventListener('wheel', preventPageScroll)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let socket: WebSocket | null = null
    let peerConnection: RTCPeerConnection | null = null

    const cleanup = () => {
      dataChannelRef.current?.close()
      dataChannelRef.current = null
      setInputReady(false)
      socket?.close()
      socket = null
      peerConnection?.getSenders().forEach((sender) => sender.track?.stop())
      peerConnection?.getReceivers().forEach((receiver) => receiver.track?.stop())
      peerConnection?.close()
      peerConnection = null
    }

    const createPeerConnection = (configuration?: RTCConfiguration) => {
      if (peerConnection) return peerConnection

      peerConnection = new RTCPeerConnection(configuration)
      peerConnection.addTransceiver('video', { direction: 'recvonly' })
      peerConnection.addTransceiver('audio', { direction: 'recvonly' })

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignalingMessage(socket, {
            type: 'iceCandidate',
            candidate: event.candidate.toJSON(),
          })
        }
      }

      peerConnection.ondatachannel = (event) => {
        const channel = event.channel
        channel.binaryType = 'arraybuffer'
        dataChannelRef.current = channel
        channel.onopen = () => {
          setInputReady(true)
          setStatus('3D stream da san sang thao tac chuot')
        }
        channel.onclose = () => {
          setInputReady(false)
          dataChannelRef.current = null
        }
      }

      peerConnection.ontrack = (event) => {
        if (event.track.kind !== 'video' || !videoRef.current) return

        const [stream] = event.streams
        videoRef.current.srcObject = stream
        void videoRef.current.play().catch(() => undefined)
        setStatus('Dang phat 3D stream tu Porsche PRS')
      }

      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection?.connectionState
        if (state === 'connected') setStatus('3D stream da ket noi')
        if (state === 'failed' || state === 'disconnected') {
          setError('Ket noi WebRTC toi Porsche PRS bi gian doan.')
        }
      }

      return peerConnection
    }

    const handleOffer = async (message: SignalingMessage) => {
      if (!message.sdp) return

      const pc = createPeerConnection()
      await pc.setRemoteDescription({ type: 'offer', sdp: message.sdp })
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      sendSignalingMessage(socket, { type: 'answer', sdp: answer.sdp })
      setStatus('Da tra WebRTC answer, dang doi video...')
    }

    const handleMessage = async (event: MessageEvent) => {
      const message = await parseSignalingMessage(event.data)
      if (!message?.type || cancelled) return

      if (message.type === 'config') {
        createPeerConnection(message.peerConnectionOptions)
        setStatus('Da nhan cau hinh WebRTC tu PRS')
        return
      }

      if (message.type === 'streamerList') {
        const streamerId = message.ids?.[0]
        if (streamerId) {
          sendSignalingMessage(socket, { type: 'subscribe', streamerId })
          setStatus('Da chon Unreal streamer, dang doi offer...')
        } else {
          setError('PRS khong tra ve streamer 3D nao cho session nay.')
        }
        return
      }

      if (message.type === 'offer') {
        await handleOffer(message)
        return
      }

      if (message.type === 'iceCandidate' && message.candidate) {
        await peerConnection?.addIceCandidate(message.candidate)
        return
      }

      if (message.type === 'ping') {
        sendSignalingMessage(socket, { type: 'pong', time: message.time })
      }
    }

    async function start() {
      try {
        setError(null)
        setStatus('Dang lay token PRS...')

        const response = await fetch(
          `/api/porsche-configurator?modelCode=${encodeURIComponent(modelCode)}&include3d=1`
        )
        if (!response.ok) throw new Error('Khong lay duoc session Porsche PRS.')

        const data = (await response.json()) as PorscheSessionResponse
        const session = data.threeD?.session
        if (session?.error) throw new Error(session.error)
        if (!session?.token || !session.websocketUrl) {
          throw new Error('Porsche PRS khong tra ve token hoac signaling server.')
        }

        if (cancelled) return
        socket = new WebSocket(buildWebSocketUrl(session.websocketUrl, session.token))
        socket.onopen = () => {
          setStatus('Da ket noi signaling, dang tim streamer...')
          sendSignalingMessage(socket, { type: 'listStreamers' })
        }
        socket.onmessage = (event) => {
          void handleMessage(event).catch((err) => {
            setError(err instanceof Error ? err.message : 'Loi xu ly WebRTC signaling.')
          })
        }
        socket.onerror = () => setError('Khong mo duoc WebSocket toi Porsche PRS.')
        socket.onclose = () => {
          if (!cancelled && !videoRef.current?.srcObject) {
            setError('Porsche PRS da dong signaling truoc khi video san sang.')
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Khong khoi tao duoc Porsche 3D stream.')
        }
      }
    }

    void start()

    return () => {
      cancelled = true
      cleanup()
    }
  }, [modelCode])

  return (
    <div className={className}>
      <video
        ref={videoRef}
        className="h-full w-full bg-black object-cover"
        playsInline
        muted
        autoPlay
      />

      <div
        ref={inputLayerRef}
        className="absolute inset-0 z-0 cursor-grab touch-none data-[grabbing=true]:cursor-grabbing"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleMouseWheel}
        onContextMenu={(event) => event.preventDefault()}
      />

      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2">
        {ANIMATION_CONTROLS.map((control) => {
          const active = openAnimations[control.id]
          return (
            <button
              key={control.id}
              type="button"
              disabled={!inputReady}
              title={control.label}
              aria-label={control.label}
              onMouseDown={(event) => {
                event.stopPropagation()
                event.preventDefault()
              }}
              onMouseUp={(event) => {
                event.stopPropagation()
              }}
              onClick={(event) => {
                event.stopPropagation()
                toggleAnimation(control)
              }}
              className={`rounded-full px-3 py-2 text-xs font-medium shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                active
                  ? 'bg-white text-near-black'
                  : 'bg-black/70 text-white hover:bg-black/85'
              }`}
            >
              {control.label}
            </button>
          )
        })}
      </div>

      {!error && !hideUpdateOverlay && (
        <div className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full bg-black/65 px-3 py-2 text-xs text-white">
          {!inputReady && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          <span>{inputReady ? 'Keo chuot de xoay, cuon de zoom' : status}</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-x-4 bottom-4 z-20 flex items-start gap-3 rounded-lg bg-white p-4 text-sm text-near-black shadow-lg">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
          <div>
            <p className="font-medium">Khong mo duoc Porsche 3D stream</p>
            <p className="mt-1 text-dark-gray">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
