import { FC, useState } from "react"

const PauseButton = () => (
  <svg xmlns     = "http://www.w3.org/2000/svg"
       viewBox   = "0 0 24 24"
       fill      = "none"
       stroke    = "#54e8c5"
       className = "w-6 h-6"
  >
    <rect x="6" y="5" width="4" height="14" />
    <rect x="14" y="5" width="4" height="14" />
  </svg>
)

const PlayButton = () => (
  <svg xmlns     = "http://www.w3.org/2000/svg"
       viewBox   = "0 0 24 24"
       fill      = "none"
       stroke    = "#54e8c5"
       className = "w-6 h-6"
  >
    <path d="M5 3.5v17l15-8.5-15-8.5z" />
  </svg>
)

interface PlayPauseButtonProps {
  onClick: () => void
}

export const PlayPauseButton: FC<PlayPauseButtonProps> = ({ onClick }) => {
  const [ isPlaying, setIsPlaying ] = useState(false)

  const handleClick = () => {
    setIsPlaying(!isPlaying)
    onClick() // Notify the parent component
  }

  return (
    <button
      onClick   = {handleClick}
      className = "flex items-center justify-center w-12 h-12 rounded-full border-2 border-[#54e8c5]"
      aria-label = { isPlaying ? "Pause" : "Play" }
    >
      { isPlaying ? <PauseButton/> : <PlayButton/> }
    </button>
  )
}