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
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 h-screen overflow-y-auto" onClick={() => setIsOpen(false)}>
          <div className="rounded-lg shadow-lg max-w-2xl max-h-screen " onClick={e => e.stopPropagation()}>
            { children }
          </div>
        </div>
      )}
      <div className="z-50 fixed bottom-0 right-4 flex items-center justify-center">
        <div className="mr-2 mb-10 w-40 text-center relative bg-slate-600 text-white p-4 rounded-lg max-w-xs cursor-pointer" onClick={toggleInstructions}>
          { isOpen ? 'Close' : 'Ask me for help' }
          <div className="absolute -bottom-2 left-[7rem] w-4 h-4 bg-slate-600 rotate-45"></div>
        </div>
        <img src="./images/clippy.jpg" onClick={toggleInstructions} className="w-16 h-16 object-contain cursor-pointer rounded-2xl"/>
      </div>
    </div>
  )
}