// POST /api/auth/verify-pin
const verifyPin = (req, res) => {
  const { pin } = req.body

  if (!pin) {
    return res.status(400).json({ success: false, message: 'PIN is required' })
  }

  if (String(pin) === String(process.env.ADMIN_PIN)) {
    return res.status(200).json({ success: true, message: 'Access granted' })
  }

  return res.status(401).json({ success: false, message: 'Incorrect PIN' })
}

module.exports = { verifyPin }
