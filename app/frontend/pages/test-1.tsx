import { useRef } from 'react'
import { useWavesurfer } from '@wavesurfer/react'

const TestOne = () => {
  const containerRef = useRef(null)

  const { wavesurfer, isReady, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    url: '/tracks/04-29-25-17-53_test-2.webm',
    waveColor: 'purple',
    height: 100,
  })

  const onPlayPause = () => {
    wavesurfer && wavesurfer.playPause()
  }

  return (
    <>
      <div ref={containerRef} />

      <button onClick={onPlayPause}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </>
  )
}

export default TestOne