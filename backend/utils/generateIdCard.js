const PDFDocument = require('pdfkit')
const QRCode = require('qrcode')
const fs = require('fs')
const path = require('path')

const ASSETS = path.join(__dirname, '..', 'assets')
const UPLOADS = path.join(__dirname, '..', 'uploads')

const FORUM_URL = 'https://register.pngdhl.com/uploads/program.pdf'

const GREEN = '#04572f'
const YELLOW = '#f4b400'
const WHITE = '#ffffff'
const LIGHT_GRAY = '#f7f7f7'

const W = 480   // card width  (points)
const HEADER_H = 225   // green header height
const PROFILE_R = 110    // profile circle radius
const OVERLAP = 15    // how much profile dips into header
const CORNER_SIZE = 90    // corner triangle size

function circleClipImage(doc, imgPath, cx, cy, r) {
   if (!imgPath || !fs.existsSync(imgPath)) return
   doc.save()
   doc.circle(cx, cy, r).clip()
   doc.image(imgPath, cx - r, cy - r, { width: r * 2, height: r * 2 })
   doc.restore()
}

async function generateIdCard(registration, outputPath) {
   // ── QR code ──────────────────────────────────────────────────
   const qrBuffer = await QRCode.toBuffer(FORUM_URL, { width: 220, margin: 1, type: 'png' })

   // ── Profile photo ─────────────────────────────────────────────
   let profilePath = null
   if (registration.photo) {
      const filename = registration.photo.split('/uploads/')[1]
      if (filename) {
         const p = path.join(UPLOADS, filename)
         if (fs.existsSync(p)) profilePath = p
      }
   }

   // ── Layout measurements ───────────────────────────────────────
   const profileCY = HEADER_H - OVERLAP + PROFILE_R        // circle centre Y
   const infoStartY = profileCY + PROFILE_R + 50
   const ROWS = [
      ['Name', registration.name],
      ['Organization', registration.organization],
      ['Title', registration.title],
      ['Type of Business', registration.business_type],
      ['Email', registration.email],
      ['Phone', registration.phone],
   ]
   const ROW_H = 35
   const infoEndY = infoStartY + ROWS.length * ROW_H
   const QR_SIZE = 170
   const qrY = infoEndY + 100
   const scanTextY = qrY + QR_SIZE + 16
   const sigY = scanTextY + 120
   const sigW = 180
   const sigH = 105
   const sigLineY = sigY + sigH + 8
   const signedTextY = sigLineY + 12
   const TOTAL_H = signedTextY + 45 + CORNER_SIZE

   // ── Create document ───────────────────────────────────────────
   const doc = new PDFDocument({ size: [W, TOTAL_H], margin: 0, autoFirstPage: true })
   const stream = fs.createWriteStream(outputPath)
   doc.pipe(stream)

   // ── Green header ──────────────────────────────────────────────
   doc.rect(0, 0, W, HEADER_H).fill(GREEN)

   // Left logo (circle clipped)
   circleClipImage(doc, path.join(ASSETS, 'pngfa.png'), (W / 2) - 140, 70, 38)
   // Center logo (no clip – transparent bg)
   if (fs.existsSync(path.join(ASSETS, 'bird.png'))) {
      doc.image(path.join(ASSETS, 'bird.png'), W / 2 - 60, -10, { width: 120, height: 120 })
   }
   // Right logo (circle clipped)
   circleClipImage(doc, path.join(ASSETS, 'png.png'), (W / 2) + 140, 70, 38)

   // "LAUNCHING OF"
   doc.font('Helvetica-Bold').fontSize(9).fillColor(YELLOW)
      .text('LAUNCHING OF', 0, 110, { align: 'center', width: W, characterSpacing: 2 })

   // "PNG DIWAI HOLDING LIMITED"
   doc.font('Helvetica-Bold').fontSize(22).fillColor(WHITE)
      .text('PNG DIWAI HOLDING LIMITED', 0, 123, { align: 'center', width: W })

   // "MAY 22ND, 2026"
   doc.font('Helvetica-Bold').fontSize(17).fillColor(WHITE)
      .text('MAY 22ND, 2026', 0, 155, { align: 'center', width: W })

   // Yellow wave accent line
   doc.moveTo(0, HEADER_H - 30)
      .bezierCurveTo(W * 0.32, HEADER_H + 18, W * 0.70, HEADER_H - 48, W, HEADER_H - 8)
      .strokeColor(YELLOW).lineWidth(7).stroke()

   // ── Light-gray content area ───────────────────────────────────
   doc.rect(0, HEADER_H, W, TOTAL_H - HEADER_H).fill(LIGHT_GRAY)

   // ── Background Overlay ────────────────────────────────────────
   if (fs.existsSync(path.join(ASSETS, 'bgoverlay.png'))) {
      doc.save()
      doc.opacity(0.4)
      doc.image(path.join(ASSETS, 'bgoverlay.png'), -20, HEADER_H - 20, {
         width: W + 40,
         height: TOTAL_H - HEADER_H + 40
      })
      doc.restore()
   }

   // ── Profile circle ────────────────────────────────────────────
   // White border
   doc.circle(W / 2, profileCY, PROFILE_R + 7).fill(WHITE)
   // Photo
   if (profilePath) {
      circleClipImage(doc, profilePath, W / 2, profileCY, PROFILE_R)
   } else {
      doc.circle(W / 2, profileCY, PROFILE_R).fill('#cccccc')
   }

   // ── Info rows ─────────────────────────────────────────────────
   const LABEL_X = 40
   const LABEL_W = 160
   const VALUE_X = LABEL_X + LABEL_W

   ROWS.forEach(([label, value], i) => {
      const rowY = infoStartY + i * ROW_H
      doc.font('Helvetica-Bold').fontSize(15).fillColor('#111111')
         .text(label + ':', LABEL_X, rowY, { width: LABEL_W, lineBreak: false })
      doc.font('Helvetica').fontSize(15).fillColor('#333333')
         .text(value || '—', VALUE_X, rowY, { width: W - VALUE_X - LABEL_X })
   })

   // ── QR code ───────────────────────────────────────────────────
   const qrX = (W - QR_SIZE) / 2
   doc.rect(qrX - 6, qrY - 6, QR_SIZE + 12, QR_SIZE + 12)
      .lineWidth(2).strokeColor('#111111').stroke()
   doc.image(qrBuffer, qrX, qrY, { width: QR_SIZE, height: QR_SIZE })

   doc.font('Helvetica-Bold').fontSize(9).fillColor('#555555')
      .text('Scan QR code to access Program Details', 0, scanTextY, { align: 'center', width: W })

   // ── Signature ─────────────────────────────────────────────────
   const sigPath = path.join(ASSETS, 'sign.png')
   if (fs.existsSync(sigPath)) {
      doc.image(sigPath, (W - sigW) / 2, sigY, { width: sigW, height: sigH })
   }

   doc.moveTo((W - 180) / 2, sigLineY).lineTo((W + 180) / 2, sigLineY).strokeColor('#888').lineWidth(1).stroke()

   doc.font('Helvetica-Bold').fontSize(11).fillColor('#444444')
      .text('Signed by: Ms. Verolyn Daugil', 0, signedTextY, { align: 'center', width: W })
   doc.font('Helvetica-Bold').fontSize(11).fillColor('#444444')
      .text('Chief Operating Officer PNGDHL', 0, signedTextY + 16, { align: 'center', width: W })

   // ── Corner triangles ──────────────────────────────────────────
   // Bottom-left (yellow)
   doc.polygon([0, TOTAL_H], [CORNER_SIZE, TOTAL_H], [0, TOTAL_H - CORNER_SIZE])
      .fill(YELLOW)
   // Bottom-right (green)
   doc.polygon([W, TOTAL_H], [W - CORNER_SIZE, TOTAL_H], [W, TOTAL_H - CORNER_SIZE])
      .fill(GREEN)

   doc.end()

   return new Promise((resolve, reject) => {
      stream.on('finish', resolve)
      stream.on('error', reject)
   })
}

module.exports = generateIdCard
