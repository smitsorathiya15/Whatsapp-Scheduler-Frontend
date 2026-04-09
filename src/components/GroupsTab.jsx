import { useState, useEffect } from 'react'
import { groupsAPI, unwrap, unwrapError } from '../api'
import Modal from './Modal'
import S from './styles'

const EMPTY = { name: '', whatsapp_group_name: '' }

export default function GroupsTab() {
  const [groups, setGroups]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY)
  const [error, setError]     = useState('')
  const [saving, setSaving]   = useState(false)

  const load = async () => {
    try { setGroups(unwrap(await groupsAPI.list())) }
    catch { /* Handled by interceptor */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true) }
  const openEdit = (g) => { setEditing(g); setForm({ name: g.name, whatsapp_group_name: g.whatsapp_group_name }); setError(''); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      editing ? await groupsAPI.update(editing.id, form) : await groupsAPI.create(form)
      setModal(false); load()
    } catch (err) { setError(unwrapError(err)) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) return
    await groupsAPI.delete(id); load()
  }

  if (loading) return <div style={S.empty}>⏳ Loading your WhatsApp groups...</div>

  return (
    <div>
      <div style={S.toolbar}>
        <div>
          <h3 style={S.heading}>WhatsApp Groups</h3>
          <p style={{ fontSize: '14px', color: '#667781', marginTop: '4px' }}>Manage the groups where scheduled messages will be sent.</p>
        </div>
        <button style={S.btn} onClick={openAdd}>+ Add Group</button>
      </div>

      {groups.length === 0
        ? <div style={S.empty}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <p>No groups found. Add your first WhatsApp group to get started.</p>
            <button style={{ ...S.btnSm, marginTop: '16px', padding: '10px 20px' }} onClick={openAdd}>Add Your First Group</button>
          </div>
        : (
          <div style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead>
                <tr>
                  {['Friendly Name', 'WhatsApp Group ID/Name', 'Status', 'Actions'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <tr key={g.id} style={S.tr}>
                    <td style={{ ...S.td, fontWeight: '600' }}>{g.name}</td>
                    <td style={S.td}><code style={S.code}>{g.whatsapp_group_name}</code></td>
                    <td style={S.td}>
                      <span style={g.is_active ? S.badgeOn : S.badgeOff}>
                        {g.is_active ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={S.btnSm} onClick={() => openEdit(g)}>Edit</button>
                        <button style={S.btnDanger} onClick={() => handleDelete(g.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {modal && (
        <Modal title={editing ? 'Edit WhatsApp Group' : 'Connect New Group'} onClose={() => setModal(false)}>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: '#667781', lineHeight: '1.5' }}>
              Enter a friendly name for your reference and the <strong>exact</strong> name of the group as it appears in WhatsApp.
            </p>
          </div>
          
          {error && <div style={S.error}>{error}</div>}
          
          <form onSubmit={handleSave}>
            <label style={S.label}>Friendly Name</label>
            <input style={S.input} placeholder="e.g. Surat Weight Loss Batch 1" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />

            <label style={S.label}>WhatsApp Group Name</label>
            <input style={S.input} placeholder="Exact name as shown in WhatsApp" value={form.whatsapp_group_name}
              onChange={(e) => setForm({ ...form, whatsapp_group_name: e.target.value })} required />
            <p style={S.hint}>⚠️ This is case-sensitive and must be letter-for-letter identical to the WhatsApp group name.</p>

            <div style={{ ...S.row, justifyContent: 'flex-end', marginTop: '24px' }}>
              <button style={S.btnSecondary} type="button" onClick={() => setModal(false)}>Cancel</button>
              <button style={S.btn} type="submit" disabled={saving}>
                {saving ? 'Saving...' : (editing ? 'Update Group' : 'Add Group')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

