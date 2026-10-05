import { useState, useRef, useCallback } from 'react'
import { CheckCircle2, Upload, FileText, X, AlertCircle } from 'lucide-react'

import { api } from '../lib/api'

const inputClass = 'field'

const labelClass = 'mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700'

const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Marketing',
  'Human Resources',
  'Engineering',
  'Customer Support',
  'Sales',
  'Administration',
  'Other',
]

// ---------------------------------------------------------------------------

function SuccessMessage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-ink-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-ink-600" />
        </div>
      </div>

      <h3 className="font-display text-2xl font-medium text-ink-900 mb-3">
        Resume Submitted
      </h3>

      <p className="font-body text-sm text-ink-700/70 max-w-sm leading-relaxed">
        Thank you for submitting your resume. Our recruitment team will review
        your application and contact you if there is a match.
      </p>

      <div className="mt-6 px-5 py-3 bg-ink-50 border border-ink-100 rounded-sm">
        <p className="font-body text-xs text-ink-500">
          Expected response time:{' '}
          <span className="font-semibold text-ink-700">3 to 5 business days</span>
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

function UploadZone({ file, onFileChange, error }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setDragging(false), [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragging(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped) onFileChange(dropped)
    },
    [onFileChange],
  )

  const handleInputChange = (e) => {
    const selected = e.target.files[0]
    if (selected) onFileChange(selected)
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    onFileChange(null)
    inputRef.current.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        onChange={handleInputChange}
        className="sr-only"
        accept=".pdf,.doc,.docx"
      />

      {file ? (
        <div className="relative flex items-center gap-4 p-4 bg-ink-50 border-2 border-ink-400 rounded-sm">
          <div className="w-10 h-10 bg-ink-700 rounded-sm flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-cream-100" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-body text-sm font-semibold text-ink-900 truncate">
              {file.name}
            </p>
            <p className="font-body text-xs text-ink-500 mt-0.5">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="w-7 h-7 rounded-full bg-white border border-ink-200 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`p-8 border-2 border-dashed rounded-sm cursor-pointer text-center ${
            dragging
              ? 'border-ink-500 bg-ink-50'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-ink-200 bg-ink-50/50'
          }`}
        >
          <Upload className="w-6 h-6 text-ink-600 mx-auto mb-2" />
          <p className="font-body text-sm text-ink-800">
            Drag and drop your resume or browse files
          </p>
          <p className="font-body text-xs text-ink-400 mt-1">
            PDF, DOC, DOCX · Max 10 MB
          </p>
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------

export default function ResumeSubmissionForm() {
  const formRef = useRef(null)

  const [file,      setFile]      = useState(null)
  const [fileError, setFileError] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleFileChange(selectedFile) {
    setFileError('')

    if (!selectedFile) {
      setFile(null)
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError('File size must be under 10MB')
      setFile(null)
      return
    }

    setFile(selectedFile)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!file) {
      setFileError('Please attach your resume before submitting.')
      return
    }

    setLoading(true)
    setFileError('')

    try {
      // 1) upload the resume file, 2) submit the form details that reference it
      const { id } = await api.upload('/public/upload', file, { auth: false })
      const f = formRef.current
      await api.post('/public/resume', {
        firstName: f.firstName.value.trim(),
        lastName: f.lastName.value.trim(),
        email: f.email.value.trim(),
        phone: f.phone.value.trim(),
        industry: f.industry.value,
        message: f.message.value.trim(),
        website: f.website.value,
        fileId: id,
      }, { auth: false })
      setSubmitted(true)
    } catch (err) {
      setFileError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return <SuccessMessage />

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" noValidate>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>First Name *</label>
          <input
            type="text"
            name="firstName"
            required
            placeholder="Jane"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Last Name *</label>
          <input
            type="text"
            name="lastName"
            required
            placeholder="Smith"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Email Address *</label>
          <input
            type="email"
            name="email"
            required
            placeholder="jane@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Phone Number</label>
          <input
            type="tel"
            name="phone"
            placeholder="(503) 555-0100"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Industry *</label>
        <select name="industry" required defaultValue="" className={inputClass}>
          <option value="" disabled>Select your industry...</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind}>{ind}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Additional Notes</label>
        <textarea
          name="message"
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className={labelClass}>Resume / CV *</label>

        <UploadZone file={file} onFileChange={handleFileChange} error={!!fileError} />

        {fileError && (
          <p className="flex items-center gap-1.5 mt-2 text-xs text-red-600">
            <AlertCircle className="w-3.5 h-3.5" />
            {fileError}
          </p>
        )}
      </div>

      <div className="h-px bg-ink-100" />

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full justify-center text-sm py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Submit Resume'}
      </button>

      <p className="font-body text-xs text-center text-ink-400">
        Your information is kept confidential and used only for recruitment.
      </p>
    </form>
  )
}
