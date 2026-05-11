import { useState } from 'react'
import { Download, Lock, Menu, X, ChevronRight } from 'lucide-react'

export default function Navbar({ onAdminClick }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D6731] shadow-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo — event banner image */}
          <div className="flex items-center flex-shrink-0 h-full py-2">
            <img
              src="/event-logo.jpeg"
              alt="PNG Diwai Holdings – Annual Industry Summit 2026"
              className="h-full w-auto object-contain max-w-[220px] sm:max-w-[300px]"
            />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white border border-white/40 rounded-lg hover:bg-white/15 transition-all duration-200"
            >
              <Download size={15} />
              Download Program
            </a>
            <button
              onClick={onAdminClick}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0D6731] bg-white rounded-lg hover:bg-white/90 transition-all duration-200 shadow"
            >
              <Lock size={15} />
              Admin Portal
            </button>
          </div>

          {/* Mobile: hint + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            {!menuOpen && (
              <div className="flex items-center gap-1 text-white/80 text-sm font-medium">
                <span>Download Program</span>
                <ChevronRight size={15} className="animate-bounce-x flex-shrink-0" />
              </div>
            )}
            <button
              className="p-2 rounded-lg text-white/80 hover:bg-white/10 transition"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-white/10 flex flex-col gap-2">
            <a
              href="#"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white border border-white/40 rounded-lg hover:bg-white/15 transition-all"
              onClick={() => setMenuOpen(false)}
            >
              <Download size={15} />
              Download Program
            </a>
            <button
              onClick={() => { setMenuOpen(false); onAdminClick() }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0D6731] bg-white rounded-lg hover:bg-white/90 transition-all shadow"
            >
              <Lock size={15} />
              Admin Portal
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
