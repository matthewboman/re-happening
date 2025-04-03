import { useState, useRef } from 'react'

type Props = {
  onRecorded: (url: string) => void
}

const Recorder = ({ onRecorded }: Props) => {
  const [ isPlaying, setIsPlaying ]     = useState(false)
  const [ isRecording, setIsRecording ] = useState(false)
  const [ audioURL, setAudioURL ]       = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef   = useRef<Blob[]>([])
  const audioRef         = useRef<HTMLAudioElement | null>(null)

  const handleDelete = () => {
    setAudioURL(null)
    setIsPlaying(false)

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

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

  const handleRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
    } else {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)

      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url       = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        onRecorded(url)
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex space-x-4">
        <button
          onClick={handleRecord}
          className={`px-4 py-2 rounded-xl text-white text-sm ${
            isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          { isRecording ? 'Stop Recording' : 'Start Recording' }
        </button>

        <button
          onClick={handlePlayback}
          disabled={!audioURL}
          className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm disabled:opacity-50"
        >
          {isPlaying ? 'Pause Playback' : 'Play Recording'}
        </button>

        <button
          onClick={handleDelete}
          disabled={!audioURL}
          className="px-4 py-2 rounded-xl bg-gray-600 hover:bg-gray-700 text-white text-sm disabled:opacity-50"
        >
          Delete
        </button>
      </div>

      {audioURL && (
        <audio
          ref={audioRef}
          src={audioURL}
          onEnded={() => setIsPlaying(false)}
          hidden
        />
      )}
    </div>
  )
}

export default Recorder