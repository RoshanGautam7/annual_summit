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

        {/* Overlay — top bleeds from navbar #0D6731, fades to deep green/black */}
        <div className="absolute inset-0 bg-[#0D6731]/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D6731] via-[#0D6731]/50 to-black/70" />

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
        <div className="relative z-10 flex flex-col items-center gap-7 text-center w-full max-w-3xl mx-auto px-6 py-16">

          {/* Event logo */}
          <img
            src="/event-logo.jpeg"
            alt="Event logos"
            className="w-full max-w-sm rounded-xl opacity-90 shadow-lg"
          />

          {/* Badge */}
          <div className="flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/90 text-xs font-medium uppercase tracking-widest">
                Registration Open
              </span>
            </div>

            {/* Scroll down hint */}
            <button
              onClick={() => document.getElementById('register').scrollIntoView({ behavior: 'smooth' })}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <span className="text-white/80 text-base font-semibold tracking-wide group-hover:text-white transition-colors">
                Scroll down to register
              </span>
              <ChevronDown size={28} className="text-white/80 group-hover:text-white transition-colors animate-bounce-y" />
            </button>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
              Annual Industry<br />
              <span className="text-green-300">Summit 2026</span>
            </h1>
            <p className="text-white/75 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
              PNG Diwai Holdings Limited invites industry leaders, government officials, and partners to our flagship annual summit.
            </p>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap justify-center gap-2 text-xs sm:text-sm">
            <span className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-4 py-2 text-white/85 backdrop-blur-sm">
              📅 22nd May 2026
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-4 py-2 text-white/85 backdrop-blur-sm">
              📍 Port Moresby, PNG
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-4 py-2 text-white/85 backdrop-blur-sm">
              🌿 Forestry &amp; Industry
            </span>
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
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Register Your Attendance</h2>
            <p className="text-white/70 mt-2 text-sm sm:text-base">Fill in your details below to confirm your place at the summit.</p>
          </div>

          {/* Form card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-10">
            <div className="h-1 w-12 bg-[#0D6731] rounded-full mb-7" />
            <RegistrationForm />
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white/60">
            <span>🔒 Secure</span>
            <span>✅ Free Entry</span>
            <span>📋 Instant Confirmation</span>
          </div>
        </div>
      </section>
    </>
  )
}
