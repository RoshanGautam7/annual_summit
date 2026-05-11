import { useState, useRef, useEffect } from 'react'
import { X, Lock, ShieldCheck, Loader2 } from 'lucide-react'

import API from '../config'

export default function PinModal({ onSuccess, onClose }) {
  const [digits, setDigits]   = useState(['', '', '', ''])
  const [error, setError]     = useState(false)
  const [shake, setShake]     = useState(false)
  const [loading, setLoading] = useState(false)
  const refs = [useRef(), useRef(), useRef(), useRef()]

  useEffect(() => {
    refs[0].current?.focus()
  }, [])

  async function verifyPin(pin) {
    setLoading(true)
    try {
      const res  = await fetch(`${API}/auth/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json()

      if (data.success) {
        setTimeout(onSuccess, 200)
      } else {
        triggerError()
      }
    } catch {
      triggerError()
    } finally {
      setLoading(false)
    }
  }

  function triggerError() {
    setError(true)
    setShake(true)
    setTimeout(() => {
      setDigits(['', '', '', ''])
      setShake(false)
      setError(false)
      refs[0].current?.focus()
    }, 650)
  }

  function handleKey(i, e) {
    if (loading) return
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = val
    setDigits(next)
    setError(false)

    if (val && i < 3) {
      refs[i + 1].current?.focus()
    }

    // Auto-submit when all 4 digits filled
    const pin = next.join('')
    if (pin.length === 4) {
      verifyPin(pin)
    }
  }

  function handleBackspace(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs[i - 1].current?.focus()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative"
        onClick={e => e.stopPropagation()}
        style={{ animation: shake ? 'shake 0.4s ease' : 'none' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center gap-5 text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 ${error ? 'bg-red-100' : 'bg-[#0D6731]/10'}`}>
            {loading
              ? <Loader2 size={30} className="text-[#0D6731] animate-spin" />
              : error
                ? <Lock size={30} className="text-red-400" />
                : <ShieldCheck size={30} className="text-[#0D6731]" />
            }
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800">Admin Portal</h2>
            <p className="text-sm text-gray-500 mt-1">Enter your 4-digit PIN to continue</p>
          </div>

          {/* PIN inputs */}
          <div className="flex gap-3">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={refs[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                disabled={loading}
                onChange={e => handleKey(i, e)}
                onKeyDown={e => handleBackspace(i, e)}
                className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all duration-150 disabled:opacity-50 ${
                  error
                    ? 'border-red-400 bg-red-50 text-red-500'
                    : d
                      ? 'border-[#0D6731] bg-[#0D6731]/5 text-[#0D6731]'
                      : 'border-gray-200 bg-gray-50 text-gray-800 focus:border-[#0D6731] focus:bg-white'
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium">Incorrect PIN. Please try again.</p>
          )}

          <p className="text-xs text-gray-400">Restricted access — authorized personnel only</p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
      `}</style>
    </div>
  )
}
