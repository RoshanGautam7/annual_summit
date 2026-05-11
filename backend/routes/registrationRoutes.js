const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const {
  createRegistration,
  getAllRegistrations,
  getRegistrationById,
  deleteRegistration,
  getIdCardPdf,
} = require('../controllers/registrationController')

router.post('/',               upload.single('photo'), createRegistration)
router.get('/',                getAllRegistrations)
router.get('/:id/idcard.pdf',  getIdCardPdf)
router.get('/:id',             getRegistrationById)
router.delete('/:id',          deleteRegistration)

module.exports = router
