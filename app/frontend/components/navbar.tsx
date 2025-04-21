import { useState } from 'react'

const Navbar = () => {
  const [ isOpen, setIsOpen ] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav className="bg-slate-900 border-b border-white text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <a href="https://exclusive-or.io" className="text-xl font-semibold">
              XOR
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4 items-center">
            <a href="/" className="">
              concrète radio
            </a>
            <a href="/how-to" className="">
              guide
            </a>
            <a href="/about" className="">
              about
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="tfocus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="white"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="/" className="block">
              concrète radio
            </a>
            <a href="/how-to" className="block">
              guide
            </a>
            <a href="/about" className="block">
              about
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar