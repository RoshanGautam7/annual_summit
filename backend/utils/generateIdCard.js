const puppeteer = require('puppeteer')
const QRCode = require('qrcode')
const fs = require('fs')
const path = require('path')

const FORUM_URL = 'https://forestryforum.pngdhl.com/'

const ASSETS_DIR = path.join(__dirname, '..', 'assets')

function toBase64(filePath) {
  try {
    const data = fs.readFileSync(filePath)
    const ext = path.extname(filePath).slice(1).toLowerCase()
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg'
    return `data:${mime};base64,${data.toString('base64')}`
  } catch {
    return ''
  }
}

function buildHtml(reg, profileBase64, qrBase64) {
  const pngfa = toBase64(path.join(ASSETS_DIR, 'pngfa.jpeg'))
  const bird  = toBase64(path.join(ASSETS_DIR, 'bird.jpeg'))
  const png   = toBase64(path.join(ASSETS_DIR, 'png.jpeg'))
  const bg    = toBase64(path.join(ASSETS_DIR, 'id-card-background.png'))
  const sig   = toBase64(path.join(ASSETS_DIR, 'signature.jpeg'))

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;font-family:Arial,Helvetica,sans-serif;}
    body{background:#111827;display:flex;justify-content:center;align-items:flex-start;padding:20px;}
    .card{width:480px;background:#fff;border-radius:14px;overflow:hidden;position:relative;box-shadow:0 10px 30px rgba(0,0,0,0.35);}
    .top-section{background:#04572f;color:#fff;padding:14px 20px 85px;position:relative;text-align:center;}
    .logos{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;}
    .logos img{width:62px;height:62px;object-fit:cover;border-radius:50%;background:#fff;padding:4px;}
    .center-logo{width:80px!important;height:80px!important;border-radius:0!important;background:transparent!important;}
    .launch-text{font-size:14px;font-weight:700;letter-spacing:0.5px;margin-bottom:8px;}
    .company{font-size:34px;font-weight:900;line-height:1.1;text-transform:uppercase;}
    .date{margin-top:10px;font-size:24px;font-weight:800;}
    .wave{position:absolute;bottom:-1px;left:0;width:100%;height:90px;}
    .content{position:relative;padding:0 28px 24px;background:#f7f7f7;overflow:hidden;}
    .bg-pattern{position:absolute;right:-20px;bottom:0;width:230px;opacity:0.12;}
    .profile-wrapper{display:flex;justify-content:center;margin-top:20px;position:relative;z-index:5;}
    .profile{width:150px;height:150px;border-radius:50%;border:8px solid #fff;object-fit:cover;background:#ddd;box-shadow:0 6px 18px rgba(0,0,0,0.15);}
    .info{margin-top:16px;position:relative;z-index:5;}
    .row{display:flex;margin-bottom:8px;gap:10px;font-size:18px;line-height:1.4;}
    .label{font-weight:800;min-width:160px;color:#111;}
    .value{color:#333;word-break:break-word;}
    .qr-section{margin-top:14px;display:flex;flex-direction:column;align-items:center;position:relative;z-index:5;}
    .qr-section img{width:140px;height:140px;object-fit:cover;background:#fff;padding:8px;border:3px solid #111;}
    .scan-text{margin-top:8px;font-size:11px;color:#555;text-align:center;}
    .signature{margin-top:14px;text-align:center;position:relative;z-index:5;}
    .signature img{width:130px;opacity:0.85;}
    .signed-text{font-size:11px;margin-top:4px;color:#444;}
    .corner-left{position:absolute;bottom:0;left:0;width:0;height:0;border-left:110px solid #f4b400;border-top:110px solid transparent;}
    .corner-right{position:absolute;bottom:0;right:0;width:0;height:0;border-right:110px solid #04572f;border-top:110px solid transparent;}
  </style>
</head>
<body>
  <div class="card">
    <div class="top-section">
      <div class="logos">
        <img src="${pngfa}" alt="logo">
        <img class="center-logo" src="${bird}" alt="center logo">
        <img src="${png}" alt="logo">
      </div>
      <div class="launch-text">LAUNCHING OF</div>
      <div class="company">PNG DIWAI HOLDING LIMITED</div>
      <div class="date">MAY 22ND, 2026</div>
      <svg class="wave" viewBox="0 0 500 150" preserveAspectRatio="none">
        <path d="M0,70 C150,160 350,0 500,90 L500,150 L0,150 Z" fill="#f7f7f7"></path>
        <path d="M0,95 C160,170 360,20 500,110" stroke="#f4b400" stroke-width="8" fill="none"></path>
      </svg>
    </div>
    <div class="content">
      <img class="bg-pattern" src="${bg}" alt="">
      <div class="profile-wrapper">
        <img class="profile" src="${profileBase64}" alt="profile photo">
      </div>
      <div class="info">
        <div class="row"><div class="label">Name:</div><div class="value">${escHtml(reg.name)}</div></div>
        <div class="row"><div class="label">Organization:</div><div class="value">${escHtml(reg.organization)}</div></div>
        <div class="row"><div class="label">Title:</div><div class="value">${escHtml(reg.title)}</div></div>
        <div class="row"><div class="label">Type of Business:</div><div class="value">${escHtml(reg.business_type)}</div></div>
        <div class="row"><div class="label">Email:</div><div class="value">${escHtml(reg.email)}</div></div>
        <div class="row"><div class="label">Phone:</div><div class="value">${escHtml(reg.phone)}</div></div>
      </div>
      <div class="qr-section">
        <img src="${qrBase64}" alt="QR Code">
        <div class="scan-text">Scan QR code to access Program Details</div>
      </div>
      <div class="signature">
        <img src="${sig}" alt="signature">
        <div class="signed-text">Signed by: Ms. Verolyn Daugil<br>Chief Operating Officer PNGDHL</div>
      </div>
      <div class="corner-left"></div>
      <div class="corner-right"></div>
    </div>
  </div>
</body>
</html>`
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function generateIdCard(registration, outputPath) {
  // Resolve profile photo to base64
  let profileBase64 = ''
  if (registration.photo) {
    const filename = registration.photo.split('/uploads/')[1]
    if (filename) {
      profileBase64 = toBase64(path.join(__dirname, '..', 'uploads', filename))
    }
  }
  if (!profileBase64) {
    profileBase64 = toBase64(path.join(__dirname, '..', 'assets', 'profile.jpeg'))
  }

  const qrBase64 = await QRCode.toDataURL(FORUM_URL, { width: 200, margin: 1 })

  const html = buildHtml(registration, profileBase64, qrBase64)

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 520, height: 900 })
    await page.setContent(html, { waitUntil: 'load' })

    // Get exact card dimensions
    const cardRect = await page.$eval('.card', el => {
      const r = el.getBoundingClientRect()
      return { width: r.width, height: r.height }
    })

    await page.pdf({
      path: outputPath,
      width:  `${cardRect.width + 40}px`,
      height: `${cardRect.height + 40}px`,
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    })
  } finally {
    await browser.close()
  }
}

module.exports = generateIdCard
