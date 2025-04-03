import { useEffect, useState } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import axios        from 'axios'
import Clippy       from '../components/clippy'
import Instructions from '../components/instructions'
import NewTrack     from '../components/new_track'
import Waveform     from '../components/track'

import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

// TODO: is this needed?
// import dynamic from 'next/dynamic'
// Wavesurfer.js requires 'window'
// const Waveform = dynamic(() => import('../components/track'), {
//   ssr: false
// })

const DEFAULT_ENVELOPE = [
  { time: 0, volume: 0.9 },
  { time: 2, volume: 0.5 }
]
const DEFAULT_PAN   = 0
const DEFAULT_SPEED = 1
const DEFAULT_START = 1
const DEFAULT_STOP  = 10
const DEFAULT_ZOOM  = 10

const HEADERS = { headers: {
  'Accept':       'application/json',
  'Content-Type': 'application/json',
}}

export default function Infinity() {
  const [ tracks, setTracks ] = useState([])

  useEffect(() => {
    axios.get('/api/get-all-tracks', HEADERS)
      .then(res => {
        setTracks(res.data.tracks)
      })
  }, [])

  // Add track to top of the list
  const addTrack = (track) => {
    // setTracks([ track, ...tracks ])
    // updatePositions(tracks)
  }

  // Update the position of tracks
  const updatePositions = (arr) => {
    const positions = arr.map(a => ({ id: a.i, position: a.y }))
    axios.post('/api/update-track-order', { positions: positions })
      .then(res => console.log(res))
  }

  return (
    <div>
      <div className='p-4 md:p-[4rem] bg-black'>
        <NewTrack addTrack={addTrack}/>
        <div className='mt-4'>
          <ResponsiveGridLayout
            layout = { {lg: tracks } }
            breakpoints = {{ lg: 0 }}
            cols   = { { lg: 1} }
            rowHeight = { 240 }
            isBounded = { true }
            preventCollision = { false }
            margin = {[0,0]}
            containerPadding = {[0,0]}
            compactType = 'vertical'
            isResizeable = { false }
            allowOverlap = { false }
            draggableHandle = '.drag-handle'
            onLayoutChange = {updatePositions}
          >
            {
              tracks.map(t => (
                <div key={t.id} className='flex'>
                  <div className='drag-handle border-4 border-gray-300 cursor-pointer my-6'></div>
                  <div className="pl-4 flex-1">
                    <Waveform
                      id            = { t.id }
                      key           = { t.title }
                      audioFile     = { t.url }
                      envProp       = { t.envelope || DEFAULT_ENVELOPE }
                      isPlayingProp = { t.is_playing || false }
                      panProp       = { t.pan || DEFAULT_PAN }
                      pitchProp     = { t.preserve_pitch }
                      speedProp     = { t.speed || DEFAULT_SPEED }
                      startProp     = { t.start || DEFAULT_START }
                      stopProp      = { t.stop || DEFAULT_STOP }
                      zoomProp      = { DEFAULT_ZOOM } />
                  </div>
                </div>
              ))
            }
          </ResponsiveGridLayout>
        </div>
      </div>
      <Clippy>
        <Instructions/>
      </Clippy>
    </div>
  )
}