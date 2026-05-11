import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import PinModal from './components/PinModal'
import AdminPortal from './components/AdminPortal'

function App() {
  const [showPin, setShowPin]     = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  function handleAdminClick() {
    setShowPin(true)
  }

  function handlePinSuccess() {
    setShowPin(false)
    setShowAdmin(true)
  }

  return (
    <div className="min-h-screen">
      <Navbar onAdminClick={handleAdminClick} />
      <HeroSection />

      {showPin && (
        <PinModal
          onSuccess={handlePinSuccess}
          onClose={() => setShowPin(false)}
        />
      )}

      {showAdmin && (
        <AdminPortal onClose={() => setShowAdmin(false)} />
      )}
    </div>
  )
}

export default App
