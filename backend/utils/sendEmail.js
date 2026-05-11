const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

function buildHtml(reg) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:#04572f;padding:36px 40px 28px;text-align:center;">
              <p style="margin:0 0 6px;color:#f4b400;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Launching of</p>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:900;line-height:1.2;text-transform:uppercase;">PNG Diwai Holding Limited</h1>
              <p style="margin:10px 0 0;color:#a8d5b5;font-size:14px;">Industry Summit &mdash; May 22nd, 2026</p>
              <div style="margin:20px auto 0;width:48px;height:4px;background:#f4b400;border-radius:2px;"></div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:36px 40px 0;">
              <h2 style="margin:0 0 12px;color:#04572f;font-size:20px;font-weight:800;">Dear ${escHtml(reg.name)},</h2>
              <p style="margin:0;color:#444;font-size:15px;line-height:1.7;">
                Thank you for registering for the <strong>Launching of PNG Diwai Holding Limited</strong>.
                Your registration has been confirmed and we look forward to welcoming you to this landmark event.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:28px 40px 0;">
              <div style="height:1px;background:#e8e8e8;"></div>
            </td>
          </tr>

          <!-- Registration Details -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0 0 16px;color:#04572f;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Your Registration Details</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${detailRow('Full Name',       reg.name)}
                ${detailRow('Organization',    reg.organization)}
                ${detailRow('Title',           reg.title)}
                ${detailRow('Type of Business',reg.business_type)}
                ${detailRow('Email',           reg.email)}
                ${detailRow('Phone',           reg.phone)}
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:28px 40px 0;">
              <div style="height:1px;background:#e8e8e8;"></div>
            </td>
          </tr>

          <!-- ID Card note -->
          <tr>
            <td style="padding:24px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9f4;border-left:4px solid #04572f;border-radius:6px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 4px;color:#04572f;font-size:14px;font-weight:700;">Your ID Card is Attached</p>
                    <p style="margin:0;color:#555;font-size:13px;line-height:1.6;">
                      Please find your personalised ID card attached to this email as a PDF.
                      Bring a printed or digital copy on the day of the event for check-in.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Event Info -->
          <tr>
            <td style="padding:24px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbea;border-left:4px solid #f4b400;border-radius:6px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 4px;color:#b8860b;font-size:14px;font-weight:700;">Event Details</p>
                    <p style="margin:0;color:#555;font-size:13px;line-height:1.6;">
                      <strong>Date:</strong> May 22nd, 2026<br/>
                      <strong>Organiser:</strong> PNG Diwai Holding Limited<br/>
                      <strong>Website:</strong> <a href="https://forestryforum.pngdhl.com/" style="color:#04572f;">forestryforum.pngdhl.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:28px 40px 0;text-align:center;">
              <a href="https://forestryforum.pngdhl.com/"
                 style="display:inline-block;background:#04572f;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:0.5px;">
                Visit Program Website
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px;text-align:center;">
              <p style="margin:0 0 6px;color:#999;font-size:12px;">
                This email was sent to <a href="mailto:${escHtml(reg.email)}" style="color:#04572f;">${escHtml(reg.email)}</a> because you registered for the PNGDHL event.
              </p>
              <p style="margin:0;color:#bbb;font-size:11px;">&copy; 2026 PNG Diwai Holding Limited. All rights reserved.</p>
              <div style="margin:16px auto 0;width:32px;height:3px;background:#f4b400;border-radius:2px;"></div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function detailRow(label, value) {
  return `<tr>
    <td style="padding:5px 0;color:#888;font-size:13px;width:150px;vertical-align:top;">${escHtml(label)}</td>
    <td style="padding:5px 0;color:#222;font-size:13px;font-weight:600;vertical-align:top;">${escHtml(value || '—')}</td>
  </tr>`
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function sendRegistrationEmail(registration, pdfPath) {
  const attachments = []

  if (pdfPath && fs.existsSync(pdfPath)) {
    attachments.push({
      filename: `PNGDHL-IDCard-${registration.name.replace(/\s+/g, '-')}.pdf`,
      path: pdfPath,
      contentType: 'application/pdf',
    })
  }

  await transporter.sendMail({
    from:    `"PNG Diwai Holding Limited" <${process.env.EMAIL_USER}>`,
    to:      registration.email,
    subject: `Your PNGDHL Registration Confirmed – ID Card Enclosed`,
    html:    buildHtml(registration),
    attachments,
  })
}

module.exports = sendRegistrationEmail
