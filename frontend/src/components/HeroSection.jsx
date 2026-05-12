import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import Countdown from './Countdown'
import RegistrationForm from './RegistrationForm'

const BG_IMAGES = [
  '/hero-section.jpeg',
  '/hero-section2.jpeg',
  '/hero-section3.jpeg',
]

export default function HeroSection() {
  const [bgIdx, setBgIdx] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setBgIdx(i => (i + 1) % BG_IMAGES.length)
        setFade(true)
      }, 600)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* ── Hero Section (full width) ── */}
      <section className="relative min-h-screen pt-16 sm:pt-20 flex flex-col items-center justify-center overflow-hidden">

        {/* Slideshow background */}
        <img
          src={BG_IMAGES[bgIdx]}
          alt="PNG landscape"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: fade ? 1 : 0 }}
        />

        {/* Dark overlay for text legibility without the green tint */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Slideshow dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {BG_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setFade(false); setTimeout(() => { setBgIdx(i); setFade(true) }, 300) }}
              className={`rounded-full transition-all duration-400 ${i === bgIdx ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`}
            />
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center gap-7 text-center w-full max-w-3xl mx-auto px-6 pt-8 pb-16">

          {/* Event logos */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 w-full max-w-2xl mx-auto -mb-12 -translate-y-[45px]">
            <img
              src="/pngfa.webp"
              alt="PNGFA Logo"
              className="w-28 sm:w-36 h-auto object-contain translate-y-[45px]"
            />
            <img
              src="/govt.webp"
              alt="Government Logo"
              className="w-40 sm:w-56 h-auto object-contain"
            />
            <img
              src="/png.webp"
              alt="PNG Diwai Holdings Logo"
              className="w-28 sm:w-36 h-auto object-contain translate-y-[45px]"
            />
          </div>

          {/* Badge */}
          <div className="flex flex-col items-center gap-3">
            {/* <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/90 text-xs font-medium uppercase tracking-widest">
                Registration Open
              </span>
            </div> */}

            {/* Scroll down hint */}
            <button
              onClick={() => document.getElementById('register').scrollIntoView({ behavior: 'smooth' })}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <span className="text-white/80 text-base font-semibold tracking-wide group-hover:text-white transition-colors">
                SCROLL DOWN TO REGISTER
              </span>
              <ChevronDown size={56} className="text-yellow-400 group-hover:text-yellow-300 drop-shadow-md transition-colors animate-bounce-y" />
            </button>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-3 -mt-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white leading-tight tracking-tight drop-shadow-lg whitespace-nowrap">
              PNG Diwai Holdings Limited Goes Live
              <span className="block mt-2 sm:mt-4 text-xl sm:text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap">
                Building Tomorrow in PNG, Today
              </span>
            </h1>
            {/* <p className="text-white/75 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
              PNG Diwai Holdings Limited invites industry leaders, government officials, and partners to our flagship annual summit.
            </p> */}
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-5 text-base sm:text-lg mt-3">
            <span className="flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-full px-6 py-3 text-white/95 backdrop-blur-sm shadow-md font-semibold">
              📅 22nd May 2026
            </span>
            <span className="flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-full px-6 py-3 text-white/95 backdrop-blur-sm shadow-md font-semibold">
              📍 Apec Haus, Port Moresby
            </span>
            {/* <span className="flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-full px-6 py-3 text-white/95 backdrop-blur-sm shadow-md font-semibold">
              🌿 Forestry &amp; Industry
            </span> */}
          </div>

          {/* Divider */}
          <div className="w-20 h-px bg-white/25" />

          {/* Countdown */}
          <Countdown />
        </div>

        {/* Decorative corners */}
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-tl-full pointer-events-none" />
        <div className="absolute top-0 left-0 w-28 h-28 bg-white/5 rounded-br-full pointer-events-none" />
      </section>

      {/* ── Registration Form (below hero) ── */}
      <section id="register" className="relative py-14 px-4 sm:px-6 overflow-hidden">

        {/* Background image */}
        <img
          src="/hero-section2.jpeg"
          alt="PNG highlands"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-[#0D6731]/80" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-[#0D6731]/60 to-black/40" />

        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto">

          {/* Section heading */}
          <div className="text-center mb-10">
            <span className="inline-block bg-white/10 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/20 mb-3">
              Secure Your Seat
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Register For The Event</h2>
            <p className="text-white/70 mt-2 text-sm sm:text-base">Fill in your details below to register for the event.</p>
          </div>

          {/* Form card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-10">
            <div className="h-1 w-12 bg-[#0D6731] rounded-full mb-7" />
            <RegistrationForm />
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white/60">
            <span>🔒 Secure</span>
            <span>📋 Instant Confirmation</span>
          </div>
        </div>
      </section>
    </>
  )
}
