import { useRef, useState } from 'react'
import axios        from 'axios'
import Oscilliscope from './oscilliscope'
import Waveform     from './waveform'

const FORM = {
  name:           '',
  email:          '',
  title:          '',
  receiveUpdates: false,
  participate:    false
}

const NewTrack = ({ addTrack }) => {
  const [ audioURL, setAudioURL ]       = useState<string | null>(null)
  const [ error, setError ]             = useState(false)
  const [ isPlaying, setIsPlaying ]     = useState(false)
  const [ isRecording, setIsRecording ] = useState(false)
  const [ showForm, setShowForm ]       = useState(false)
  const [ form, setForm ]               = useState(FORM)

  const audioContextRef = useRef(null)
  const audioRef        = useRef<HTMLAudioElement | null>(null)
  const chunksRef       = useRef([])
  const inputRef        = useRef(null)
  const processorRef    = useRef(null)
  const recordedBlobRef = useRef(null)
  const streamRef       = useRef(null)
  const waveformRef     = useRef({})

  // Convert PCM to .wav
  const encodeWav = (buffers, sampleRate) => {
    const length = buffers.reduce((sum, b) => sum + b.length, 0)
    const buffer = new ArrayBuffer(44 + length * 2)
    const view   = new DataView(buffer)

    const writeString = (view, offset, str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i))
      }
    }

    let offset = 0
    writeString(view, offset, "RIFF"); offset += 4
    view.setUint32(offset, 36 + length * 2, true); offset += 4
    writeString(view, offset, "WAVE"); offset += 4
    writeString(view, offset, "fmt "); offset += 4
    view.setUint32(offset, 16, true); offset += 4
    view.setUint16(offset, 1, true); offset += 2
    view.setUint16(offset, 1, true); offset += 2
    view.setUint32(offset, sampleRate, true); offset += 4
    view.setUint32(offset, sampleRate * 2, true); offset += 4
    view.setUint16(offset, 2, true); offset += 2
    view.setUint16(offset, 16, true); offset += 2
    writeString(view, offset, "data"); offset += 4
    view.setUint32(offset, length * 2, true); offset += 4

    let pos = offset

    for (let i = 0; i < buffers.length; i++) {
      const b = buffers[i]

      for (let j = 0; j < b.length; j++) {
        let s = Math.max(-1, Math.min(1, b[j]))
        s = s < 0 ? s * 0x800 : s * 0x7FFF
        view.setInt16(pos, s, true)
        pos += 2
      }
    }

    return new Blob([ view ], { type: "audio/wav" })
  }

  // Update form elements
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target

    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  // Delete existing track
  const handleDelete = () => {
    setError(false)
    setAudioURL(null)
    setIsPlaying(false)

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  // Play/pause track
  const handlePlayback = () => {
    if (!audioURL) return

    if (isPlaying) {
      audioRef.current?.pause()
      waveformRef.current?.pause?.()
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
      waveformRef.current?.play?.()
      audioRef.current?.play()
    }
  }

  // Submit form && audio
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title.trim()) {
      alert('The track must have a name')
      return
    }

    if (!recordedBlobRef.current) {
      alert('No recording found')
      return
    }

    const data = new FormData()
    data.append('audio', recordedBlobRef.current, `${form.title}.wav`)
    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value.toString())
    })

    axios.post('/api/create-track', data)
      .then(res => {
        const track = res.data.track
        addTrack(track)
        setForm(FORM)
        setAudioURL(null)
      })
      .catch(err => {
        console.log(err)
        setError(true)
      })

    setShowForm(false)
  }

  // Record PCM
  const startRecording = async () => {
    setError(false)

    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    audioContextRef.current = audioContext

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream

    const input = audioContext.createMediaStreamSource(stream)
    inputRef.current = input

    const processor = audioContext.createScriptProcessor(4096, 1, 1)
    processorRef.current = processor
    chunksRef.current = []

    processor.onaudioprocess = (e) => {
      const data = e.inputBuffer.getChannelData(0)
      chunksRef.current.push(new Float32Array(data))
    }

    input.connect(processor)
    processor.connect(audioContext.destination)

    setIsRecording(true)
  }

  // Handle recording stop
  const stopRecording = () => {
    processorRef.current.disconnect()
    inputRef.current.disconnect()
    streamRef.current.getTracks().forEach((track) => track.stop())

    const wavBlob = encodeWav(chunksRef.current, audioContextRef.current.sampleRate)
    recordedBlobRef.current = wavBlob
    const url = URL.createObjectURL(wavBlob)

    setAudioURL(url)
    setIsRecording(false)
  }

  return (
    <div className="flex flex-col mb-4">
      {!showForm && (
        <div className="flex flex-col items-center space-y-4 border-b border-white pb-4 mb-4">
          <div className='min-h-40 flex items-center justify-center'>
            {isRecording && (<Oscilliscope stream={streamRef.current}/>)}
            {(!isRecording && audioURL && !error) && (<Waveform audioURL={audioURL} waveformCtrl={ctrl => { waveformRef.current = ctrl }} />)}
            {(!isRecording && !audioURL  && !error) && (
              <div className='text-white'>
                Waiting to record...
              </div>
            )}
            {(error && (
              <div className='text-white'>
              Error processing track. Record something shorter.
              </div>
            ))}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-4 py-2 w-24 rounded-xl text-white text-sm ${
                isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              { isRecording ? 'Stop' : 'Record' }
            </button>
            <button
              onClick={handlePlayback}
              disabled={!audioURL}
              className="px-4 py-2 w-24 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm disabled:opacity-50"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={handleDelete}
              disabled={!audioURL}
              className="px-4 py-2 rounded-xl bg-gray-600 hover:bg-gray-700 text-white text-sm disabled:opacity-50"
            >
              Delete
            </button>
            { audioURL && (
              <>
                <audio
                  ref={audioRef}
                  src={audioURL}
                  onEnded={() => setIsPlaying(false)}
                  hidden
                />
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                >
                  Use Track
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Track title (required)"
            value={form.title}
            onChange={handleChange}
            className="border border-white text-white bg-transparent rounded-lg px-4 py-2 w-80"
          />
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            className="border border-white text-white bg-transparent rounded-lg px-4 py-2 w-80"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border border-white text-white bg-transparent rounded-lg px-4 py-2 w-80"
          />
          <label className="flex items-center space-x-2 text-white">
            <input
              type="checkbox"
              name="receiveUpdates"
              checked={form.receiveUpdates}
              onChange={handleChange}
              className="w-4 h-4 accent-white border border-white"
            />
            <span>I want to receive email updates on the project</span>
          </label>
          <label className="flex items-center space-x-2 text-white">
            <input
              type="checkbox"
              name="participate"
              checked={form.participate}
              onChange={handleChange}
              className="w-4 h-4 accent-white border border-white"
            />
            <span>I want to create a song for the compilation</span>
          </label>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  )
}

export default NewTrack