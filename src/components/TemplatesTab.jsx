import { useState, useEffect } from 'react'
import { templatesAPI, unwrap, unwrapError } from '../api'
import Modal from './Modal'
import S from './styles'

const EMPTY = { title: '', content: '' }

export default function TemplatesTab() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [error, setError]         = useState('')
  const [saving, setSaving]       = useState(false)
  const [copied, setCopied]       = useState(null)

  const load = async () => {
    try { setTemplates(unwrap(await templatesAPI.list())) }
    catch { }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true) }
  const openEdit = (t) => { setEditing(t); setForm({ title: t.title, content: t.content }); setError(''); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      editing ? await templatesAPI.update(editing.id, form) : await templatesAPI.create(form)
      setModal(false); load()
    } catch (err) { setError(unwrapError(err)) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return
    await templatesAPI.delete(id); load()
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) return <div style={S.empty}>⏳ Loading message templates...</div>

  return (
    <div>
      <div style={S.toolbar}>
        <div>
          <h3 style={S.heading}>Message Templates</h3>
          <p style={{ fontSize: '14px', color: '#667781', marginTop: '4px' }}>Draft and save messages for reusable scheduling.</p>
        </div>
        <button style={S.btn} onClick={openAdd}>+ New Template</button>
      </div>

      {templates.length === 0
        ? <div style={S.empty}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <p>No templates yet. Create your first message template to auto-send.</p>
            <button style={{ ...S.btnSm, marginTop: '16px', padding: '10px 20px' }} onClick={openAdd}>Create New Template</button>
          </div>
        : (
          <div style={S.grid}>
            {templates.map((t) => (
              <div key={t.id} style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={S.cardTitle}>{t.title}</div>
                  <button 
                    onClick={() => copyToClipboard(t.content, t.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                    title="Copy to clipboard"
                  >
                    {copied === t.id ? '✅' : '📋'}
                  </button>
                </div>
                <div style={S.cardContent}>
                  {t.content.length > 200 ? t.content.slice(0, 200) + '…' : t.content}
                </div>
                <div style={S.cardFooter}>
                  <span style={S.dateText}>Modified {new Date(t.updated_at).toLocaleDateString()}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={S.btnSm} onClick={() => openEdit(t)}>Edit</button>
                    <button style={S.btnDanger} onClick={() => handleDelete(t.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {modal && (
        <Modal title={editing ? 'Edit Message Template' : 'Create New Template'} onClose={() => setModal(false)}>
          {error && <div style={S.error}>{error}</div>}
          <form onSubmit={handleSave}>
            <label style={S.label}>Template Title</label>
            <input style={S.input} placeholder="e.g. Weekly Diet Chart Reminder" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />

            <label style={S.label}>WhatsApp Message Content</label>
            <textarea style={{ ...S.input, minHeight: 180, resize: 'vertical', lineHeight: '1.5' }}
              placeholder="Type your message exactly as it should appear in WhatsApp..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })} required />
            <p style={S.hint}>💡 Tip: You can use *bold*, _italics_, and emojis here.</p>

            <div style={{ ...S.row, justifyContent: 'flex-end', marginTop: '24px' }}>
              <button style={S.btnSecondary} type="button" onClick={() => setModal(false)}>Cancel</button>
              <button style={S.btn} type="submit" disabled={saving}>
                {saving ? 'Saving...' : (editing ? 'Update Template' : 'Save Template')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

