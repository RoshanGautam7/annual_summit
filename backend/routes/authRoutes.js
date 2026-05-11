const express = require('express')
const router = express.Router()
const { verifyPin } = require('../controllers/authController')

router.post('/verify-pin', verifyPin)

module.exports = router
