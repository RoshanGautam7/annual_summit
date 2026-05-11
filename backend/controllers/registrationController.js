const { Registration } = require('../models')
const { Op } = require('sequelize')
const fs = require('fs')
const path = require('path')
const generateIdCard = require('../utils/generateIdCard')
const sendRegistrationEmail = require('../utils/sendEmail')

const IDCARDS_DIR = path.join(__dirname, '..', 'uploads', 'idcards')

// POST /api/registrations
const createRegistration = async (req, res) => {
  try {
    const { name, organization, title, businessType, email, phone } = req.body

    // Build photo URL if file was uploaded
    const photoUrl = req.file
      ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
      : null

    const registration = await Registration.create({
      name:          name?.trim(),
      organization:  organization?.trim(),
      title:         title?.trim(),
      business_type: businessType?.trim(),
      email:         email?.trim().toLowerCase(),
      phone:         phone?.trim(),
      photo:         photoUrl,
    })

    // Generate PDF and send email — awaited so the client waits until email is delivered
    const pdfFilename = `${registration.id}.pdf`
    const pdfPath = path.join(IDCARDS_DIR, pdfFilename)
    await generateIdCard(registration, pdfPath)
    await registration.update({ pdf_path: pdfFilename })
    await sendRegistrationEmail(registration, pdfPath)
    console.log(`✅ ID card PDF generated and email sent for #${registration.id}`)

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: registration,
    })
  } catch (error) {
    // Sequelize validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map(e => e.message)
      return res.status(422).json({ success: false, message: messages[0], errors: messages })
    }
    console.error('createRegistration error:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// GET /api/registrations
const getAllRegistrations = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const where = search
      ? {
          [Op.or]: [
            { name:          { [Op.like]: `%${search}%` } },
            { organization:  { [Op.like]: `%${search}%` } },
            { email:         { [Op.like]: `%${search}%` } },
            { business_type: { [Op.like]: `%${search}%` } },
          ],
        }
      : {}

    const { count, rows } = await Registration.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit:  parseInt(limit),
      offset,
    })

    return res.status(200).json({
      success: true,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      data: rows,
    })
  } catch (error) {
    console.error('getAllRegistrations error:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// GET /api/registrations/:id
const getRegistrationById = async (req, res) => {
  try {
    const registration = await Registration.findByPk(req.params.id)
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' })
    }
    return res.status(200).json({ success: true, data: registration })
  } catch (error) {
    console.error('getRegistrationById error:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// DELETE /api/registrations/:id
const deleteRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByPk(req.params.id)
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' })
    }
    // Delete photo file from disk if exists
    if (registration.photo) {
      const filename = registration.photo.split('/uploads/')[1]
      if (filename) {
        fs.unlink(path.join(__dirname, '..', 'uploads', filename), () => {})
      }
    }
    // Delete generated ID card PDF if exists
    fs.unlink(path.join(IDCARDS_DIR, `${registration.id}.pdf`), () => {})

    await registration.destroy()
    return res.status(200).json({ success: true, message: 'Registration deleted' })
  } catch (error) {
    console.error('deleteRegistration error:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// GET /api/registrations/:id/idcard.pdf
const getIdCardPdf = async (req, res) => {
  try {
    const registration = await Registration.findByPk(req.params.id)
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' })
    }

    const pdfPath = path.join(IDCARDS_DIR, `${registration.id}.pdf`)

    if (!fs.existsSync(pdfPath)) {
      // PDF not yet generated — try to generate it now
      try {
        await generateIdCard(registration, pdfPath)
        await registration.update({ pdf_path: `${registration.id}.pdf` })
      } catch (genErr) {
        console.error('On-demand PDF generation failed:', genErr.message)
        return res.status(503).json({ success: false, message: 'PDF is still being generated, please retry in a moment' })
      }
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="idcard-${registration.id}.pdf"`)
    fs.createReadStream(pdfPath).pipe(res)
  } catch (error) {
    console.error('getIdCardPdf error:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

module.exports = {
  createRegistration,
  getAllRegistrations,
  getRegistrationById,
  deleteRegistration,
  getIdCardPdf,
}
