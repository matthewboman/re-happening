import { useRef, useState } from 'react'
import axios from 'axios'
import Oscilliscope from './oscilliscope'

const NewTrack = ({ addTrack }) => {
  const [ audioURL, setAudioURL ]       = useState<string | null>(null)
  const [ isPlaying, setIsPlaying ]     = useState(false)
  const [ isRecording, setIsRecording ] = useState(false)
  const [ showForm, setShowForm ]       = useState(false)
  const [ form, setForm ]               = useState({
    name:           '',
    email:          '',
    title:          '',
    receiveUpdates: false,
    participate:    false
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef   = useRef<Blob[]>([])
  const audioRef         = useRef<HTMLAudioElement | null>(null)
  const streamRef        = useRef(null)

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
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
      audioRef.current?.play()
    }
  }

  // Toggle track record
  const handleRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
    } else {
      const stream      = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder    = new MediaRecorder(stream)
      streamRef.current = stream

      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url       = URL.createObjectURL(audioBlob)
        setAudioURL(url)
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
    }
  }

  // Submit track && form
  const handleSubmit = async (e) => {
    if (!form.title.trim()) {
      alert('The track must have a name')
      return
    }

    const blob = await fetch(audioURL!).then(res => res.blob())
    const data = new FormData()

    data.append('audio', blob, `${form.title}.webm`)
    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value.toString())
    })

    axios.post('/api/create-track', data)
      .then(res => {
        const track = res.data.track
        addTrack(track)
      })

    setShowForm(false)
  }

  return (
    <div className="flex flex-col mb-4">
      {!showForm && (
        <div className="flex flex-col items-center space-y-4">
          <Oscilliscope stream={streamRef.current}/>
          <div className="flex space-x-4">
            <button
              onClick={handleRecord}
              className={`px-4 py-2 rounded-xl text-white text-sm ${
                isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              { isRecording ? 'Stop' : 'Record' }
            </button>
            <button
              onClick={handlePlayback}
              disabled={!audioURL}
              className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm disabled:opacity-50"
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
            className="border border-white text-white bg-transparent rounded-lg px-4 py-2 w-100"
          />
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            className="border border-white text-white bg-transparent rounded-lg px-4 py-2 w-100"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border border-white text-white bg-transparent rounded-lg px-4 py-2 w-100"
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