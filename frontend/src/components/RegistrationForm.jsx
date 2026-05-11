import { useState, useRef } from 'react'
import { User, Building2, Briefcase, Tag, Mail, Phone, CheckCircle2, Loader2, Camera, X, MailCheck } from 'lucide-react'

import API from '../config'
const INITIAL = { name: '', organization: '', title: '', businessType: '', email: '', phone: '' }

export default function RegistrationForm() {
  const [form, setForm]               = useState(INITIAL)
  const [photo, setPhoto]             = useState(null)
  const [preview, setPreview]         = useState(null)
  const [errors, setErrors]           = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading]         = useState(false)
  const [submitted, setSubmitted]     = useState(false)
  const fileRef = useRef()

  function validate() {
    const e = {}
    if (!form.name.trim())         e.name         = 'Full name is required'
    if (!form.organization.trim()) e.organization = 'Organization is required'
    if (!form.title.trim())        e.title        = 'Title / designation is required'
    if (!form.businessType.trim()) e.businessType = 'Type of business is required'
    if (!form.email.trim())        e.email        = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.phone.trim())        e.phone        = 'Phone number is required'
    if (!photo)                    e.photo        = 'Please upload a photo'
    return e
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }))
    if (serverError)  setServerError('')
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setErrors(er => ({ ...er, photo: 'Image must be under 5 MB' }))
      return
    }
    setPhoto(file)
    setErrors(er => ({ ...er, photo: '' }))
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  function removePhoto() {
    setPhoto(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setServerError('')
    try {
      const formData = new FormData()
      formData.append('name',         form.name.trim())
      formData.append('organization', form.organization.trim())
      formData.append('title',        form.title.trim())
      formData.append('businessType', form.businessType.trim())
      formData.append('email',        form.email.trim())
      formData.append('phone',        form.phone.trim())
      formData.append('photo',        photo)

      const res  = await fetch(`${API}/registrations`, { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) { setServerError(data.message || 'Registration failed.'); return }
      setSubmitted(true)
    } catch {
      setServerError('Unable to connect to the server. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-[#0D6731]/10 flex items-center justify-center">
          <CheckCircle2 size={36} className="text-[#0D6731]" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Registration Successful!</h3>
        <p className="text-gray-500 text-sm max-w-xs">
          Thank you, <strong>{form.name}</strong>. Your seat has been reserved for the PNG Diwai Holdings Annual Industry Summit 2026.
        </p>
        <div className="flex items-center gap-2 bg-[#0D6731]/8 border border-[#0D6731]/20 text-[#0D6731] text-sm font-medium rounded-lg px-4 py-2.5">
          <MailCheck size={15} className="flex-shrink-0" />
          You will receive an email shortly at <strong className="ml-1">{form.email}</strong>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <h3 className="text-lg font-bold text-gray-800 mb-1">Register Your Attendance</h3>

      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {serverError}
        </div>
      )}

      {/* ── Photo Upload ── */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Profile Photo</label>
        <div className="flex items-center gap-4">

          {/* Circle preview */}
          <div className="relative flex-shrink-0">
            <div className={`w-20 h-20 rounded-full overflow-hidden border-2 flex items-center justify-center bg-gray-100 ${errors.photo ? 'border-red-400' : 'border-gray-200'}`}>
              {preview
                ? <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                : <Camera size={28} className="text-gray-300" />
              }
            </div>
            {preview && (
              <button
                type="button"
                onClick={removePhoto}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition shadow"
              >
                <X size={11} />
              </button>
            )}
          </div>

          {/* Drop zone */}
          <div className="flex-1">
            <input
              ref={fileRef}
              id="photo-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <label
              htmlFor="photo-upload"
              className={`flex flex-col items-center justify-center w-full py-4 px-3 border-2 border-dashed rounded-xl cursor-pointer transition-all text-center ${
                errors.photo
                  ? 'border-red-400 bg-red-50'
                  : preview
                    ? 'border-[#0D6731]/40 bg-[#0D6731]/5'
                    : 'border-gray-200 bg-gray-50 hover:border-[#0D6731]/50 hover:bg-[#0D6731]/5'
              }`}
            >
              {preview ? (
                <span className="text-xs text-[#0D6731] font-semibold truncate max-w-full px-2">✓ {photo?.name}</span>
              ) : (
                <>
                  <Camera size={18} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500 font-medium">Click to upload photo</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">JPEG · PNG · WebP &nbsp;·&nbsp; Max 5 MB</span>
                </>
              )}
            </label>
          </div>
        </div>
        {errors.photo && <p className="text-xs text-red-500 mt-0.5">{errors.photo}</p>}
      </div>

      {/* Name */}
      <Field icon={<User size={16} />} label="Full Name" error={errors.name}>
        <input type="text" name="name" value={form.name} onChange={handleChange}
          placeholder="e.g. James Kila" className={inputCls(errors.name)} />
      </Field>

      {/* Organization */}
      <Field icon={<Building2 size={16} />} label="Organization" error={errors.organization}>
        <input type="text" name="organization" value={form.organization} onChange={handleChange}
          placeholder="e.g. PNG Diwai Holdings Ltd" className={inputCls(errors.organization)} />
      </Field>

      {/* Title + Business Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field icon={<Briefcase size={16} />} label="Title / Designation" error={errors.title}>
          <input type="text" name="title" value={form.title} onChange={handleChange}
            placeholder="e.g. Chief Executive Officer" className={inputCls(errors.title)} />
        </Field>
        <Field icon={<Tag size={16} />} label="Type of Business" error={errors.businessType}>
          <input type="text" name="businessType" value={form.businessType} onChange={handleChange}
            placeholder="e.g. Forestry & Timber" className={inputCls(errors.businessType)} />
        </Field>
      </div>

      {/* Email */}
      <Field icon={<Mail size={16} />} label="Email Address" error={errors.email}>
        <input type="email" name="email" value={form.email} onChange={handleChange}
          placeholder="e.g. james@company.com.pg" className={inputCls(errors.email)} />
      </Field>

      {/* Phone */}
      <Field icon={<Phone size={16} />} label="Phone Number" error={errors.phone}>
        <input type="tel" name="phone" value={form.phone} onChange={handleChange}
          placeholder="e.g. +675 325 7842" className={inputCls(errors.phone)} />
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full flex items-center justify-center gap-2 py-3 bg-[#0D6731] text-white font-semibold rounded-xl hover:bg-[#095224] active:scale-[0.98] transition-all duration-200 shadow-md disabled:opacity-60"
      >
        {loading ? <><Loader2 size={18} className="animate-spin" /> Submitting…</> : 'Confirm Registration'}
      </button>

      <p className="text-center text-xs text-gray-400">
        Your information is kept confidential and used for event coordination only.
      </p>
    </form>
  )
}

function inputCls(err) {
  return `w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm outline-none transition-all duration-150 ${
    err
      ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-200'
      : 'border-gray-200 bg-gray-50 focus:border-[#0D6731] focus:ring-1 focus:ring-[#0D6731]/20 focus:bg-white'
  }`
}

function Field({ icon, label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        {children}
      </div>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
}
