import { useEffect, useRef, useState } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import axios    from 'axios'
import Clippy   from '../components/clippy'
import Guide    from './guide'
import NewTrack from '../components/new_track'
import Track    from '../components/track'

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
  { time: 1, volume: 0.5 }
]
const DEFAULT_PAN   = 0
const DEFAULT_SPEED = 1
const DEFAULT_START = 1
const DEFAULT_STOP  = 10

const HEADERS = { headers: {
  'Accept':       'application/json',
  'Content-Type': 'application/json',
}}

export default function Infinity() {
  const [ playing, setPlaying ] = useState(false)
  const [ showNew, setShowNew ] = useState(false)
  const [ tracks, setTracks ]   = useState([])
  const tracksRef = useRef([])

  useEffect(() => {
    axios.get('/api/get-all-tracks', HEADERS)
      .then(res => {
        setTracks(res.data.tracks)
      })
  }, [])

  useEffect(() => {
    tracksRef.current = tracks
  }, [tracks])

  // Handle data updates.
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     getNewTracks(),
  //     getTrackUpdates()
  //   }, 60000) // 60,000 ms = 1 minute

  //   return () => clearInterval(interval) // cleanup on unmount
  // }, [])

  const today  = new Date()
  const after  = new Date('2025-05-04')
  const canAdd = today < after

  // Add track to top of the list.
  const addTrack = (track) => {
    setTracks([ track, ...tracks ])
    updatePositions(tracks)
  }

  // Gets any new tracks that have been added since page load.
  const getNewTracks = () => {
    if (tracksRef.current.length === 0) return

    axios.post('/api/get-new-tracks', { existing_ids: tracksRef.current.map(t => t.id)})
      .then(res => {
        setTracks([ ...res.data.new_tracks, ...tracksRef.current ])
      })
  }

  // Gets the track data from the backend.
  const getTrackUpdates = () => {
    if (tracksRef.current.length === 0) return

    axios.post('/api/update-track-data', { track_ids: tracksRef.current.map(t => t.id)})
      .then(res => {
        updateTracks(res.data.updated_tracks)
      })
  }

  // Plays all tracks selected as playing.
  const playAllActive = () => {
    setPlaying(!playing)
  }

  // Update track data
  const updateTracks = (updatedData) => {
    const updateMap = new Map(
      updatedData.map(track => [track.id, track])
    )

    setTracks(prevTracks =>
      prevTracks.map(track => {
        const updated = updateMap.get(track.id)
        if (!updated) return track

        return {
          ...track,
          is_playing:     updated.is_playing,
          start:          updated.start,
          stop:           updated.stop,
          envelope:       updated.envelope,
          pan:            updated.pan,
          speed:          updated.speed,
          preserve_pitch: updated.preserve_pitch
        }
      })
    )
  }

  // Update the position of tracks.
  const updatePositions = (arr) => {
    const positions = arr.map(a => ({ id: a.i, position: a.y }))
    axios.post('/api/update-track-order', { positions: positions })
      .then(res => {
        console.log(res)
      })
  }

  return (
    <div>
      <div className='p-4 md:p-[4rem] bg-slate-950'>
        {showNew && (
          <div className='mb-4 min-h-40'>
            <NewTrack addTrack={addTrack}/>
          </div>
        )}
        <div className='mb-[2rem] flex space-x-4 items-center justify-center'>
          {canAdd && (
            <button onClick={() => setShowNew(!showNew)} className="px-4 py-2 w-40 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm disabled:opacity-50">
              { showNew ? 'Hide' : 'Add your track' }
            </button>
          )}
          { playing
            ? <button onClick={playAllActive} className="px-4 py-2 w-40 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm disabled:opacity-50">Pause composition</button>
            : <button onClick={playAllActive} className="px-4 py-2 w-40 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm disabled:opacity-50">Play composition</button>
          }
        </div>
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
                <div className='flex' key={t.id}>
                  <div className='drag-handle border-4 border-gray-300 cursor-pointer my-6'></div>
                  <div className="pl-4 flex-1">
                    <Track
                      id            = { t.id }
                      audioFile     = { t.url }
                      envProp       = { t.envelope || DEFAULT_ENVELOPE }
                      isUsedProp    = { t.is_playing || false }
                      panProp       = { t.pan || DEFAULT_PAN }
                      pitchProp     = { t.preserve_pitch }
                      play          = { playing }
                      speedProp     = { t.speed || DEFAULT_SPEED }
                      startProp     = { t.start || DEFAULT_START }
                      stopProp      = { t.stop || DEFAULT_STOP }
                      title         = { t.title || ''} />
                  </div>
                </div>
              ))
            }
          </ResponsiveGridLayout>
        </div>
      </div>
      <Clippy>
        <Guide/>
      </Clippy>
    </div>
  )
}