require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const path = require('path')
const fs = require('fs')

const { sequelize } = require('./models')
const registrationRoutes = require('./routes/registrationRoutes')

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, 'uploads')
const idCardsDir = path.join(uploadsDir, 'idcards')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
if (!fs.existsSync(idCardsDir)) fs.mkdirSync(idCardsDir, { recursive: true })
const authRoutes = require('./routes/authRoutes')
const { errorHandler, notFound } = require('./middleware/errorHandler')

const app = express()
const PORT = process.env.PORT || 5000

// ── Middleware ──
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Static: serve uploaded images ──
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── Routes ──
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date() })
})

app.use('/api/auth', authRoutes)
app.use('/api/registrations', registrationRoutes)

// ── 404 + Error handlers ──
app.use(notFound)
app.use(errorHandler)

// ── Start ──
const start = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ Database connected successfully')

    // Sync models — creates table if it doesn't exist
    await sequelize.sync({ alter: true })
    console.log('✅ Models synced')

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error.message)
    process.exit(1)
  }
}

start()
