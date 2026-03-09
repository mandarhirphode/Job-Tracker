import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import './App.css'

const STATUSES = [
  { value: 'applied', label: 'Applied' },
  { value: 'waiting_for_referral', label: 'Waiting for referral' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
]

const FOLLOW_UP_OPTIONS = [
  { value: 0, label: 'No follow-up' },
  { value: 3, label: 'Every 3 days' },
  { value: 5, label: 'Every 5 days' },
  { value: 7, label: 'Every 7 days' },
  { value: 10, label: 'Every 10 days' },
  { value: 14, label: 'Every 14 days' },
  { value: 21, label: 'Every 21 days' },
]

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function formatLocalDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function todayStr() {
  return formatLocalDate(new Date())
}

function addDays(dateStr, days) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  d.setDate(d.getDate() + days)
  return formatLocalDate(d)
}

/** Returns { href, type: 'email'|'linkedin'|'phone' } or null if not a valid contact */
function getContactLink(contact) {
  const s = (contact || '').trim()
  if (!s) return null
  const lower = s.toLowerCase()
  if (lower.includes('linkedin.com')) {
    const url = s.startsWith('http') ? s : `https://${s}`
    return { href: url, type: 'linkedin' }
  }
  if (s.includes('@') && !s.includes(' ')) {
    return { href: `mailto:${s}`, type: 'email' }
  }
  const digits = s.replace(/\D/g, '')
  if (digits.length >= 10) {
    return { href: `tel:${s}`, type: 'phone' }
  }
  return null
}

function ReferralRow({ referral, onChange, onRemove }) {
  const contactValue =
    (referral.contact ?? '').trim() !== ''
      ? referral.contact
      : [referral.relation, referral.contact, referral.notes].filter(Boolean).join(' ').trim()
  return (
    <div className="referral-row">
      <div className="referral-fields">
        <input
          type="text"
          placeholder="Name"
          value={referral.name ?? ''}
          onChange={(e) => onChange({ ...referral, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Email, LinkedIn profile URL, or phone number"
          value={contactValue}
          onChange={(e) => onChange({ ...referral, contact: e.target.value })}
        />
      </div>
      <button type="button" className="btn-remove-referral" onClick={onRemove} title="Remove referral">
        ×
      </button>
    </div>
  )
}

function JobForm({ job, onSave, onCancel }) {
  const isEdit = !!job
  const [company, setCompany] = useState(job?.company ?? '')
  const [role, setRole] = useState(job?.role ?? '')
  const [status, setStatus] = useState(job?.status ?? 'applied')
  const [appliedAt, setAppliedAt] = useState(
    job?.appliedAt ?? new Date().toISOString().slice(0, 10)
  )
  const [notes, setNotes] = useState(job?.notes ?? '')
  const [link, setLink] = useState(job?.link ?? '')
  const [referrals, setReferrals] = useState(
    job?.referrals?.length ? job.referrals.map((r) => ({ ...r, id: r.id || generateId() })) : []
  )
  const [followUpIntervalDays, setFollowUpIntervalDays] = useState(
    job?.followUpIntervalDays ?? 0
  )
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
    job?.nextFollowUpDate ?? ''
  )

  const addReferral = () => {
    setReferrals((prev) => [
      ...prev,
      { id: generateId(), name: '', contact: '' },
    ])
  }

  const updateReferral = (id, data) => {
    setReferrals((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)))
  }

  const removeReferral = (id) => {
    setReferrals((prev) => prev.filter((r) => r.id !== id))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const today = todayStr()
    let nextFollowUp = nextFollowUpDate
    if (followUpIntervalDays > 0 && !nextFollowUp) {
      nextFollowUp = addDays(today, followUpIntervalDays)
    }
    onSave({
      ...(job && { id: job.id }),
      company: company.trim(),
      role: role.trim(),
      status,
      appliedAt: appliedAt || today,
      notes: notes.trim(),
      link: link.trim(),
      referrals:
        status === 'waiting_for_referral'
          ? referrals
              .filter((r) => (r.name || '').trim() || (r.contact || '').trim())
              .map((r) => ({ id: r.id, name: (r.name || '').trim(), contact: (r.contact || '').trim() }))
          : [],
      followUpIntervalDays: followUpIntervalDays || 0,
      ...(followUpIntervalDays > 0 && nextFollowUp && { nextFollowUpDate: nextFollowUp }),
    })
  }

  return (
    <form className="job-form" onSubmit={handleSubmit}>
      <h2>{isEdit ? 'Edit application' : 'Add application'}</h2>
      <div className="form-row">
        <label>
          Company *
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Inc."
            required
          />
        </label>
        <label>
          Role *
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Frontend Developer"
            required
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date applied
          <input
            type="date"
            value={appliedAt}
            onChange={(e) => setAppliedAt(e.target.value)}
          />
        </label>
      </div>

      {status === 'waiting_for_referral' && (
        <div className="form-block referrals-block">
          <div className="referrals-block-header">
            <span className="referrals-block-title">Referrals</span>
            <button type="button" className="btn-add-referral" onClick={addReferral}>
              + Add referral
            </button>
          </div>
          {referrals.length === 0 ? (
            <p className="referrals-empty">Add people you’re waiting for a referral from.</p>
          ) : (
            <div className="referrals-list">
              {referrals.map((ref) => (
                <ReferralRow
                  key={ref.id}
                  referral={ref}
                  onChange={(data) => updateReferral(ref.id, data)}
                  onRemove={() => removeReferral(ref.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="form-row">
        <label>
          Follow-up interval
          <select
            value={followUpIntervalDays}
            onChange={(e) => {
              const val = Number(e.target.value)
              setFollowUpIntervalDays(val)
              if (val > 0 && !nextFollowUpDate) {
                setNextFollowUpDate(addDays(todayStr(), val))
              }
              if (val === 0) setNextFollowUpDate('')
            }}
          >
            {FOLLOW_UP_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        {followUpIntervalDays > 0 && (
          <label>
            Next follow-up date
            <input
              type="date"
              value={nextFollowUpDate}
              onChange={(e) => setNextFollowUpDate(e.target.value)}
            />
          </label>
        )}
      </div>

      <label>
        Job posting URL
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
        />
      </label>
      <label>
        Notes
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Recruiter name, next steps..."
          rows={3}
        />
      </label>
      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {isEdit ? 'Save' : 'Add'}
        </button>
      </div>
    </form>
  )
}

function JobCard({ job, onEdit, onDelete, onMarkFollowUpDone }) {
  const statusInfo = STATUSES.find((s) => s.value === job.status)
  const hasFollowUp = job.followUpIntervalDays > 0 && job.nextFollowUpDate
  const isDueToday = hasFollowUp && job.nextFollowUpDate === todayStr()

  return (
    <article className="job-card" data-status={job.status}>
      <div className="job-card-header">
        <div>
          <h3>{job.company}</h3>
          <p className="job-role">{job.role}</p>
        </div>
        <span className={`status-badge status-${(job.status || '').replace('_', '-')}`}>
          {statusInfo?.label ?? job.status}
        </span>
      </div>
      <div className="job-card-meta">
        <span className="date">Applied: {job.appliedAt}</span>
        {hasFollowUp && (
          <span className="next-follow-up">
            Next follow-up: {job.nextFollowUpDate}
            {isDueToday && <span className="due-today"> · Due today</span>}
          </span>
        )}
        {job.link && (
          <a href={job.link} target="_blank" rel="noopener noreferrer" className="job-link">
            View posting →
          </a>
        )}
      </div>
      {job.status === 'waiting_for_referral' && job.referrals?.length > 0 && (
        <div className="job-referrals">
          <strong>Referrals:</strong>
          <ul className="referral-contact-list">
            {job.referrals.map((r) => {
              const contactVal = (r.contact || '').trim()
              const link = getContactLink(contactVal)
              return (
                <li key={r.id}>
                  {r.name && <span className="referral-name">{r.name}</span>}
                  {r.name && contactVal && ' · '}
                  {contactVal && link ? (
                    <a
                      href={link.href}
                      target={link.type === 'linkedin' ? '_blank' : undefined}
                      rel={link.type === 'linkedin' ? 'noopener noreferrer' : undefined}
                      className={`referral-link referral-link-${link.type}`}
                    >
                      {contactVal}
                    </a>
                  ) : (
                    contactVal
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
      {job.notes && <p className="job-notes">{job.notes}</p>}
      <div className="job-card-actions">
        {isDueToday && (
          <button
            type="button"
            className="btn-sm btn-done"
            onClick={() => onMarkFollowUpDone(job.id)}
          >
            Mark follow-up done
          </button>
        )}
        <button type="button" className="btn-sm" onClick={() => onEdit(job)}>
          Edit
        </button>
        <button
          type="button"
          className="btn-sm btn-danger"
          onClick={() => onDelete(job.id)}
        >
          Delete
        </button>
      </div>
    </article>
  )
}

export default function App() {
  const [jobs, setJobs] = useLocalStorage('job-tracker-apps', [])
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState(null)

  const today = todayStr()
  const todaysFollowUps = jobs.filter(
    (j) => j.followUpIntervalDays > 0 && j.nextFollowUpDate === today
  )

  const filteredJobs =
    filter === 'todays_follow_ups'
      ? todaysFollowUps
      : filter === 'all'
        ? jobs
        : jobs.filter((j) => j.status === filter)

  const todaysFollowUpIds = new Set(todaysFollowUps.map((j) => j.id))
  const mainListJobs =
    filter === 'all'
      ? filteredJobs.filter((j) => !todaysFollowUpIds.has(j.id))
      : filteredJobs

  const addJob = (data) => {
    setJobs((prev) => [
      ...prev,
      { ...data, id: data.id || generateId() },
    ])
    setModal(null)
  }

  const updateJob = (data) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === data.id ? { ...j, ...data } : j))
    )
    setModal(null)
  }

  const markFollowUpDone = (id) => {
    const job = jobs.find((j) => j.id === id)
    if (!job || job.followUpIntervalDays <= 0) return
    const next = addDays(today, job.followUpIntervalDays)
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, nextFollowUpDate: next } : j))
    )
  }

  const deleteJob = (id) => {
    if (window.confirm('Delete this application?')) {
      setJobs((prev) => prev.filter((j) => j.id !== id))
    }
  }

  const openEdit = (job) => setModal({ type: 'edit', job })
  const openAdd = () => setModal('add')

  return (
    <div className="app">
      <header className="header">
        <h1>Job Application Tracker</h1>
        <p className="tagline">Keep your job search organized</p>
        <button type="button" className="btn-add" onClick={openAdd}>
          + Add application
        </button>
      </header>

      {todaysFollowUps.length > 0 && filter !== 'todays_follow_ups' && (
        <section className="todays-follow-ups">
          <h2 className="section-title">Today&apos;s follow-ups</h2>
          <div className="job-list">
            {todaysFollowUps.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={openEdit}
                onDelete={deleteJob}
                onMarkFollowUpDone={markFollowUpDone}
              />
            ))}
          </div>
        </section>
      )}

      <div className="filters">
        <button
          type="button"
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All ({jobs.length})
        </button>
        <button
          type="button"
          className={filter === 'todays_follow_ups' ? 'active' : ''}
          onClick={() => setFilter('todays_follow_ups')}
          title="Applications with follow-up due today"
        >
          Today&apos;s follow-ups ({todaysFollowUps.length})
        </button>
        {STATUSES.map((s) => {
          const count = jobs.filter((j) => j.status === s.value).length
          return (
            <button
              key={s.value}
              type="button"
              className={filter === s.value ? 'active' : ''}
              onClick={() => setFilter(s.value)}
            >
              {s.label} ({count})
            </button>
          )
        })}
      </div>

      <section className="job-list">
        {mainListJobs.length === 0 ? (
          <div className="empty-state">
            {jobs.length === 0
              ? 'No applications yet. Click "Add application" to get started.'
              : filter === 'todays_follow_ups'
                ? 'No follow-ups due today. Set a follow-up interval on your applications to see them here.'
                : filter === 'all'
                  ? 'No other applications. Today\'s follow-ups are shown above.'
                  : `No applications with status "${STATUSES.find((s) => s.value === filter)?.label ?? filter}".`}
          </div>
        ) : (
          mainListJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={openEdit}
              onDelete={deleteJob}
              onMarkFollowUpDone={markFollowUpDone}
            />
          ))
        )}
      </section>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            {modal === 'add' ? (
              <JobForm onSave={addJob} onCancel={() => setModal(null)} />
            ) : (
              <JobForm
                job={modal.job}
                onSave={updateJob}
                onCancel={() => setModal(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
