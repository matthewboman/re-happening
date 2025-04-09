import React, { FC, useEffect, useRef, useState } from 'react'
import axios             from 'axios'
import { Knob }          from 'primereact/knob'
import WaveSurfer        from 'wavesurfer.js'
import EnvelopePlugin,
       { EnvelopePoint } from 'wavesurfer.js/dist/plugins/envelope.esm.js'
import RegionsPlugin     from "wavesurfer.js/dist/plugins/regions.esm.js"

interface Props {
  id:            number,
  audioFile:     string,
  envProp:       EnvelopePoint[],
  isPlayingProp: boolean,
  panProp:       number,
  pitchProp:     boolean,
  play:          boolean,
  speedProp:     number,
  startProp:     number,
  stopProp:      number,
  zoomProp:      number,
}

const Track: FC<Props> = ({
  id,
  audioFile,
  envProp,
  isPlayingProp,
  panProp,
  pitchProp,
  play,
  speedProp,
  startProp,
  stopProp,
  zoomProp
}) => {
  const waveformRef = useRef<HTMLDivElement | null>(null)
  const wavesurfer  = useRef<WaveSurfer | null>(null)
  let activeRegion  = useRef<any>(null)
  let audioContext  = useRef<any>(null)
  let panNode       = useRef<any>(null)

  const [ isPlaying, setIsPlaying ]           = useState(false) // Current playback state
  const [ isUsed, setIsUsed ]                 = useState(false) // Saves in DB whether selected to play
  const [ env, setEnv ]                       = useState(envProp)
  const [ pan, setPan ]                       = useState(panProp)
  const [ preservePitch, setPreservePitch ]   = useState(pitchProp)
  const [ selectedOption, setSelectedOption ] = useState("speed")
  const [ showEdit, setShowEdit ]             = useState(false)
  const [ speed, setSpeed ]                   = useState(speedProp)
  const [ start, setStart ]                   = useState(startProp)
  const [ stop, setStop ]                     = useState(stopProp)
  const [ zoom, setZoom ]                     = useState(zoomProp)

  const regions  = RegionsPlugin.create()
  const envelope = EnvelopePlugin.create({
      volume:          0.8,
      lineColor:       '#548fe8',
      lineWidth:       '2',
      dragPointSize:   6,
      dragLine:        true,
      dragPointFill:   '#548fe8',
      dragPointStroke: '#548fe8',
      points:          envProp,
    })

  // Playback from parent
  useEffect(() => {
    setIsUsed(isPlayingProp)

    if (play == true && isPlayingProp == true) {
      setIsPlaying(true)
      wavesurfer.current?.playPause()
    }
    if (play == false) {
      setIsPlaying(false)
      wavesurfer.current?.playPause()

    }
  }, [play])

  // Waveform rendering
  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = create(waveformRef.current)
    }

    return () => {
      wavesurfer.current?.destroy()
    }
  }, [ audioFile ])

  const create = (waveformRef: HTMLElement) => {
    let ws = WaveSurfer.create({
      container:     waveformRef,
      autoScroll:    false,
      height:        160,
      waveColor:     "#54e8c5",
      progressColor: "#54e8c5",
      barWidth:      0,
      audioRate:     1,
      plugins:       [ regions, envelope ]
    })

    ws.load(audioFile)

    ws.on('decode', () => {
      regions.addRegion({
        start:  startProp,
        end:    stopProp,
        color:  hexToRgba("#54e8c5"),
        drag:   true,
        resize: true
      })
    })

    // Envelope updates
    envelope.on('points-change', (points) => {
      setEnv(points)
    })

    // Region looping
    regions.on("region-in", (region: any) => {
      activeRegion.current = region
    })
    regions.on("region-out", (region: any) => {
      if (activeRegion.current === region) {
        region.play()
      }
    })
    regions.on("region-updated", (region: any) => {
      setStart(region.start)
      setStop(region.end)
    })

    // Panning
    ws.on('ready', () => {
      audioContext.current = new AudioContext()

      const audio  = ws.getMediaElement()
      const source = audioContext.current.createMediaElementSource(audio)

      panNode.current = audioContext.current.createStereoPanner()

      source.connect(panNode.current)
      panNode.current.connect(audioContext.current.destination)
    })

    // TESTING: un-comment to test values
    // regions.on('region-updated', (region) => {
    //   console.log('Updated region', region)
    // })
    // envelope.on('points-change', (points) => {
    //   console.log('Envelope points changed', points)
    // })

    return ws
  }

  // Converts hex colors to rgba
  const hexToRgba = (hex: string, alpha = 0.2) => {
    hex = hex.replace(/^#/, '')

    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // Handles L/R audio panning
  const panAudio = (event: any) => {
    const panAmount = event.target.value

    setPan(panAmount)

    const panValue = parseInt(panAmount) / 45 // Normalize value to range [-1, 1]

    if (panNode.current) {
      panNode.current.pan.value = panValue // Set the panning position
    }
  }

  // Toggles play/pause
  const playPause = () => {
    setIsPlaying(!isPlaying)
    setIsUsed(!isUsed)
    wavesurfer.current?.playPause()
  }

  // Saves the current state of the loop:
  const saveLoop = () => {
    const state = {
      envelope:       env,
      is_playing:     isUsed,
      pan:            pan,
      preserve_pitch: preservePitch,
      speed:          speed,
      start:          start,
      stop:           stop
    }

    axios.post(`/api/update-track/${id}`, state)
  }

  // Show/hide the edit controls
  const toggleControl = () => {
    setShowEdit(!showEdit)
  }

  // Toggles whether pitch is preserved with audio speed adjustment
  const togglePreservePitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const preserve = event.target.checked
    setPreservePitch(preserve)
    wavesurfer.current?.setPlaybackRate(wavesurfer.current?.getPlaybackRate(), preserve)
  }

  // Changes the playback speed of the audio
  const updateSpeed = (event) => {
    const speed = parseFloat(event.value)

    setSpeed(speed)
    wavesurfer.current?.setPlaybackRate(speed)
  }

  // Changes the zoom of the waveform
  const updateZoom = (event) => {
    const minPxPerSec = event.target.valueAsNumber

    setZoom(minPxPerSec)
    wavesurfer.current?.zoom(minPxPerSec)
  }

  return (
    <div>
      <div className="overflow-hidden">
        <div className="mb-4">
          <div>
            <button onClick={playPause} className="bg-gray-800 text-white px-2 py-1 text-xs mx-2 cursor-pointer" >
              { isPlaying ? 'PAUSE' : 'PLAY' }
            </button>
            <button onClick={toggleControl} className="bg-gray-800 text-white px-2 py-1 text-xs mx-2 cursor-pointer" >
              EDIT
            </button>
            <button onClick={saveLoop} className="bg-gray-800 text-white px-2 py-1 text-xs mx-2 cursor-pointer" >
              SAVE
            </button>
          </div>
          { showEdit && <div className='fixed text-white p-4 z-[100]'>
              <div className="block bg-black text-white p-4 rounded-2 w-[16rem] h-[14rem]">
                <select
                  className="w-full p-2 border rounded teal-select"
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                >
                  <option value="speed">Speed</option>
                  <option value="pan">Pan</option>
                  <option value="zoom">Zoom</option>
                </select>

                <div className="mt-4">
                { selectedOption === "speed" && <div className="grid grid-cols-2 justify-center items-center gap-4">
                    <div className="flex flex-col items-center">
                      <Knob
                        value={speed}
                        onChange={updateSpeed}
                        min={0.25}
                        max={4}
                        step={0.01}
                        strokeWidth={10}
                        size={60}
                        textColor='#54e8c5'
                        valueColor='#54e8c5'
                        rangeColor='#0a0a0a'/>
                      <br/>
                      <label className="teal mt-2">Speed</label>
                    </div>
                    <div className="flex flex-col justify-between items-center h-full">
                      <div className="flex-grow flex justify-center items-center">
                        <input
                          type="checkbox"
                          checked={preservePitch}
                          onChange={togglePreservePitch}
                          className='border-teal'
                        />
                      </div>
                      <label className="teal text-center">
                        Preserve pitch
                      </label>
                    </div>
                  </div> }
                { selectedOption === "zoom" && <div className="flex flex-col justify-center items-center">
                    <div className="flex justify-center items-center teal mt-6">
                      <div className='mr-2'>10</div>
                        <input
                          id="panner-input"
                          type="range"
                          min="10"
                          max="100"
                          defaultValue="10"
                          onChange={updateZoom}
                          className='border-teal background-teal'
                        />
                        <div className='ml-2'>100</div>
                      </div>
                  </div> }
                { selectedOption === "pan" && <div className="flex flex-col justify-center items-center">
                    <div className="flex justify-center items-center teal mt-6">
                      <div className='mr-2'>L</div>
                        <input
                          id="panner-input"
                          type="range"
                          min="-45"
                          max="45"
                          defaultValue="0"
                          onChange={panAudio}
                          className='border-teal background-teal'
                        />
                        <div className='ml-2'>R</div>
                      </div>
                  </div> }
                </div>
              </div>
            </div>
          }
        </div>
        <div className='overflow-x-auto w-[90vw]'>
          <div ref={waveformRef} className='waveform min-w-[90vw]'/>
        </div>
      </div>
    </div>
  )
}

export default Track