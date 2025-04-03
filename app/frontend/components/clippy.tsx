import { useState, ReactNode } from "react"

interface ClippyProps {
  children: ReactNode
}

export default function Clippy({ children }: ClippyProps) {
  const [ isOpen, setIsOpen ] = useState(false)

  const toggleInstructions = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="">
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center text-white p-4 z-50" onClick={() => setIsOpen(false)}>
          <div className="bg-black text-white p-8 rounded-lg shadow-lg max-w-2xl" onClick={e => e.stopPropagation()}>
            { children }
          </div>
        </div>
      )}
      <div className="z-50 fixed bottom-0 right-4 flex items-center justify-center">
        <div className="mr-2 mb-10 relative bg-blue-600 text-white p-4 rounded-lg max-w-xs cursor-pointer" onClick={toggleInstructions}>
          Ask me for help
          <div className="absolute -bottom-2 left-[7rem] w-4 h-4 bg-blue-600 rotate-45"></div>
        </div>
        <img src="./images/clippy.jpg" onClick={toggleInstructions} className="w-16 h-16 object-contain cursor-pointer rounded-2xl"/>
      </div>
    </div>
  )
}