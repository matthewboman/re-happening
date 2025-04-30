import { useEffect, useRef } from "react"
import WaveSurfer from "wavesurfer.js"

export default function Waveform({ audioURL, waveformCtrl }) {
  const waveformRef = useRef(null)
  const wavesurfer  = useRef(null)

  useEffect(() => {
    if (!audioURL) return

    wavesurfer.current = WaveSurfer.create({
      container:     waveformRef.current,
      autoScroll:    false,
      height:        140,
      waveColor:     "#54e8c5",
      progressColor: "#54e8c5",
      barWidth:      0,
      audioRate:     1,
      backend:       'MediaElement',
    })

    wavesurfer.current.load(audioURL)

    waveformCtrl?.({
      play:  async () => {
        const ctx = wavesurfer.current.getAudioContext()
        if (ctx.state === 'suspended') await ctx.resume()
        wavesurfer.current.play()
      },
      pause: () => wavesurfer.current.pause()
    })

    return () => wavesurfer.current.destroy()
  }, [audioURL])

  return <div ref={waveformRef} className='waveform min-w-[90vw]'/>
}
