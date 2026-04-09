import { useState, useEffect } from 'react'
import { schedulesAPI, templatesAPI, unwrap, unwrapError } from '../api'
import Modal from './Modal'
import S from './styles'

const DAYS  = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
const EMPTY = { message_template_id: '', days_of_week: [], time_of_day: '10:00', is_active: true }

export default function SchedulesTab() {
  const [schedules, setSchedules] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [error, setError]         = useState('')
  const [saving, setSaving]       = useState(false)

  const load = async () => {
    try {
      const [sc, tm] = await Promise.all([schedulesAPI.list(), templatesAPI.list()])
      setSchedules(unwrap(sc))
      setTemplates(unwrap(tm))
    } catch { }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true) }
  const openEdit = (s) => {
    setEditing(s)
    setForm({
      message_template_id: s.message_template_id,
      days_of_week: s.days_of_week,
      time_of_day: s.time_of_day.slice(0, 5),
      is_active: s.is_active,
    })
    setError(''); setModal(true)
  }

  const toggleDay = (day) =>
    setForm((f) => ({
      ...f,
      days_of_week: f.days_of_week.includes(day)
        ? f.days_of_week.filter((d) => d !== day)
        : [...f.days_of_week, day],
    }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.days_of_week.length) { setError('Please select at least one day.'); return }
    setSaving(true); setError('')
    
    // Align with backend HH:MM:00 format
    const payload = {
      ...form,
      time_of_day: form.time_of_day.length === 5 ? form.time_of_day + ':00' : form.time_of_day,
    }
    
    try {
      editing ? await schedulesAPI.update(editing.id, payload) : await schedulesAPI.create(payload)
      setModal(false); load()
    } catch (err) { setError(unwrapError(err)) }
    finally { setSaving(false) }
  }

  const handleDelete   = async (id) => { if (!window.confirm('Delete this automated schedule?')) return; await schedulesAPI.delete(id); load() }
  const toggleActive   = async (s)  => { await schedulesAPI.update(s.id, { is_active: !s.is_active }); load() }
  const templateName   = (id)       => templates.find((t) => t.id === id)?.title ?? '—'

  if (loading) return <div style={S.empty}>⏳ Loading your automation schedules...</div>

  return (
    <div>
      <div style={S.toolbar}>
        <div>
          <h3 style={S.heading}>Automation Schedules</h3>
          <p style={{ fontSize: '14px', color: '#667781', marginTop: '4px' }}>Re-send saved templates to all active groups on these days.</p>
        </div>
        <button style={S.btn} onClick={openAdd}>+ New Schedule</button>
      </div>

      {schedules.length === 0
        ? <div style={S.empty}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🕐</div>
            <p>No schedules active. Create a schedule to automate your messaging.</p>
            <button style={{ ...S.btnSm, marginTop: '16px', padding: '10px 20px' }} onClick={openAdd}>Setup Automation</button>
          </div>
        : (
          <div style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead>
                <tr>
                  {['Template','Scheduled Days','Send Time','Automation Status','Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id} style={S.tr}>
                    <td style={{ ...S.td, fontWeight: '600' }}>{templateName(s.message_template_id)}</td>
                    <td style={S.td}>
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                        {DAYS.map(d => (
                          <span 
                            key={d} 
                            style={s.days_of_week.includes(d) ? S.dayBadge : { color: '#ccc', fontSize: '11px', fontWeight: '700' }}
                          >
                            {d.slice(0,3).toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={S.td}><code style={S.code}>{s.time_of_day.slice(0,5)}</code></td>
                    <td style={S.td}>
                      <button onClick={() => toggleActive(s)} style={s.is_active ? S.toggleOn : S.toggleOff}>
                        {s.is_active ? '● Running' : '○ Paused'}
                      </button>
                    </td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={S.btnSm} onClick={() => openEdit(s)}>Edit</button>
                        <button style={S.btnDanger} onClick={() => handleDelete(s.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {modal && (
        <Modal title={editing ? 'Edit Automation Rule' : 'New Automation Rule'} onClose={() => setModal(false)}>
          {error && <div style={S.error}>{error}</div>}
          <form onSubmit={handleSave}>
            <label style={S.label}>Message Template</label>
            <select style={S.input} value={form.message_template_id}
              onChange={(e) => setForm({ ...form, message_template_id: e.target.value })} required>
              <option value="">— Select a template to send —</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>

            <label style={S.label}>Repeat on active days</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20, marginTop: 8 }}>
              {DAYS.map((day) => (
                <button key={day} type="button"
                  style={form.days_of_week.includes(day) ? S.dayBtnOn : S.dayBtnOff}
                  onClick={() => toggleDay(day)}>
                  {day.slice(0,3).toUpperCase()}
                </button>
              ))}
            </div>

            <label style={S.label}>Send Time (Daily)</label>
            <input style={S.input} type="time" value={form.time_of_day}
              onChange={(e) => setForm({ ...form, time_of_day: e.target.value })} required />

            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, background: '#f9f9f9', padding: '12px', borderRadius: '10px' }}>
              <input type="checkbox" id="active" checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                style={{ width:18, height:18, cursor:'pointer' }} />
              <label htmlFor="active" style={{ ...S.label, marginBottom:0, cursor: 'pointer' }}>Enabled & Running</label>
            </div>

            <div style={{ ...S.row, justifyContent: 'flex-end', marginTop: '24px' }}>
              <button style={S.btnSecondary} type="button" onClick={() => setModal(false)}>Cancel</button>
              <button style={S.btn} type="submit" disabled={saving}>
                {saving ? 'Saving...' : (editing ? 'Update Rule' : 'Start Automation')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

