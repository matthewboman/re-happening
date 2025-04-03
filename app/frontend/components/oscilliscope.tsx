import { useEffect, useRef } from 'react'

export default function Oscilliscope({ stream }) {
  const analyzerRef    = useRef(null)
  const animationIdRef = useRef(null)
  const audioCtxRef    = useRef(null)
  const canvasRef      = useRef(null)
  const sourceRef      = useRef(null)

  useEffect(() => {
    if (!stream) return

    const audioCtx = new (window.AudioContext || window.webkitAudioContext )()
    const analyzer = audioCtx.createAnalyser()
    const source   = audioCtx.createMediaStreamSource(stream)

    analyzer.fftSize = 2048
    source.connect(analyzer)

    audioCtxRef.current = audioCtx
    analyzerRef.current = analyzer
    sourceRef.current   = source

    const canvas       = canvasRef.current
    const canvasCtx    = canvas.getContext('2d')
    canvas.width       = canvas.offsetWidth
    const bufferLength = analyzer.fftSize
    const dataArray    = new Uint8Array(bufferLength)

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw)

      analyzer.getByteTimeDomainData(dataArray)

      canvasCtx.fillStyle   = '#0a0a0a'
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height)
      canvasCtx.lineWidth   = 2
      canvasCtx.strokeStyle = '#54e8c5'
      canvasCtx.beginPath()

      const sliceWidth = canvas.width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2
        i === 0 ? canvasCtx.moveTo(x, y) : canvasCtx.lineTo(x, y)
        x += sliceWidth
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2)
      canvasCtx.stroke()
    }

    draw()

    return () => {
      cancelAnimationFrame(animationIdRef.current)
      audioCtx.close()
    }

  }, [ stream ])

  return (
    <canvas
      ref = {canvasRef}
      height = {100}
      className='border rounded'/>
  )
}