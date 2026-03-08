import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import './App.css'

const STATUSES = [
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
]

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
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

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...(job && { id: job.id }),
      company: company.trim(),
      role: role.trim(),
      status,
      appliedAt: appliedAt || new Date().toISOString().slice(0, 10),
      notes: notes.trim(),
      link: link.trim(),
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

function JobCard({ job, onEdit, onDelete }) {
  const statusInfo = STATUSES.find((s) => s.value === job.status)

  return (
    <article className="job-card" data-status={job.status}>
      <div className="job-card-header">
        <div>
          <h3>{job.company}</h3>
          <p className="job-role">{job.role}</p>
        </div>
        <span className={`status-badge status-${job.status}`}>
          {statusInfo?.label ?? job.status}
        </span>
      </div>
      <div className="job-card-meta">
        <span className="date">Applied: {job.appliedAt}</span>
        {job.link && (
          <a href={job.link} target="_blank" rel="noopener noreferrer" className="job-link">
            View posting →
          </a>
        )}
      </div>
      {job.notes && <p className="job-notes">{job.notes}</p>}
      <div className="job-card-actions">
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
  const [modal, setModal] = useState(null) // null | 'add' | { type: 'edit', job }

  const filteredJobs =
    filter === 'all'
      ? jobs
      : jobs.filter((j) => j.status === filter)

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

      <div className="filters">
        <button
          type="button"
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All ({jobs.length})
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
        {filteredJobs.length === 0 ? (
          <div className="empty-state">
            {jobs.length === 0
              ? 'No applications yet. Click "Add application" to get started.'
              : `No applications with status "${STATUSES.find((s) => s.value === filter)?.label ?? filter}".`}
          </div>
        ) : (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={openEdit}
              onDelete={deleteJob}
            />
          ))
        )}
      </section>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
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
