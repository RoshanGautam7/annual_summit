import { useState, useEffect, useRef } from 'react'

const TARGET = new Date('2026-05-22T08:00:00')

function pad(n) {
  return String(n).padStart(2, '0')
}

function FlipUnit({ value, label }) {
  const [displayVal, setDisplayVal] = useState(value)
  const [animKey, setAnimKey] = useState(0)
  const prevRef = useRef(value)

  useEffect(() => {
    if (prevRef.current !== value) {
      prevRef.current = value
      setAnimKey(k => k + 1)
      setDisplayVal(value)
    }
  }, [value])

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative bg-white/10 backdrop-blur-sm border-2 border-yellow-400/80 rounded-xl px-3 py-2 sm:px-5 sm:py-3 min-w-[56px] sm:min-w-[76px] text-center shadow-[0_0_15px_rgba(250,204,21,0.15)]">
        <span
          key={animKey}
          className="block text-3xl sm:text-5xl font-bold text-white tabular-nums flip-anim"
        >
          {displayVal}
        </span>
      </div>
      <span className="text-white/60 text-[10px] sm:text-xs uppercase tracking-widest font-medium">{label}</span>
    </div>
  )
}

function Separator() {
  return (
    <span className="text-white/40 text-3xl sm:text-5xl font-bold mb-5 leading-none select-none">:</span>
  )
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft())

  function calcTimeLeft() {
    const diff = TARGET - new Date()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return {
      days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    }
  }

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-white/70 text-xs sm:text-sm uppercase tracking-[0.2em] font-medium">
        Event Starts In
      </p>
      <div className="flex items-end gap-2 sm:gap-3">
        <FlipUnit value={pad(timeLeft.days)}    label="Days"    />
        <Separator />
        <FlipUnit value={pad(timeLeft.hours)}   label="Hours"   />
        <Separator />
        <FlipUnit value={pad(timeLeft.minutes)} label="Minutes" />
        <Separator />
        <FlipUnit value={pad(timeLeft.seconds)} label="Seconds" />
      </div>
    </div>
  )
}
