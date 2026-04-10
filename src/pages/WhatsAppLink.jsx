import { useState, useEffect, useRef } from 'react'
import { whatsappAPI, unwrap, unwrapError } from '../api'
import { useAuth } from '../context/AuthContext'
import S from '../components/styles'

export default function WhatsAppLink() {
  const { user }              = useAuth()
  // Seed from user.wa_linked so the UI doesn't flicker — confirmed by /status immediately
  const [linked, setLinked]   = useState(user?.wa_linked ?? null)
  const [qr, setQr]           = useState(null)
  const [waiting, setWaiting] = useState(false)
  const [msg, setMsg]         = useState('')
  const [unlinking, setUnlinking] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const pollRef               = useRef(null)
  const retryRef              = useRef(null)
  const qrRequestRef          = useRef(false)

  const clearRetry = () => {
    if (retryRef.current) {
      clearTimeout(retryRef.current)
      retryRef.current = null
    }
  }

  /* Always verify real-time status on mount — wa_linked in DB may lag */
  const fetchStatus = async () => {
    try {
      const d = unwrap(await whatsappAPI.status())
      setLinked(d.linked)
      if (!d.linked) fetchQR()
    } catch { setLinked(false) }
  }

  const fetchQR = async (manual = false) => {
    if (qrRequestRef.current) return
    qrRequestRef.current = true
    clearRetry()
    if (manual) setRefreshing(true)
    try {
      const d = unwrap(await whatsappAPI.qr())
      if (d.linked) {
        setLinked(true)
        setQr(null)
        clearRetry()
      } else {
        setLinked(false)
        setQr(d.qr ?? null)
        // If the backend is still generating the QR, retry sooner than the 30s poll
        if (!d.qr && d.info?.includes('Generating')) {
          retryRef.current = setTimeout(() => {
            retryRef.current = null
            fetchQR(false)
          }, 2000)
        }
      }
    } catch (err) {
      setMsg('QR load failed. ' + unwrapError(err))
    } finally {
      qrRequestRef.current = false
      if (manual) setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    pollRef.current = setInterval(fetchQR, 30_000)
    return () => {
      clearInterval(pollRef.current)
      clearRetry()
    }
  }, [])

  const handleWaitScan = async () => {
    setWaiting(true); setMsg('')
    try {
      const d = unwrap(await whatsappAPI.waitScan())
      if (d.linked) {
        setLinked(true); setQr(null)
        setMsg('✅ WhatsApp linked! Messages will now send automatically.')
      } else {
        setMsg('⏱ Timed out. Refresh the QR and try again.')
      }
    } catch (err) {
      setMsg('❌ ' + unwrapError(err))
      fetchQR()
    } finally {
      setWaiting(false)
    }
  }

  const handleUnlink = async () => {
    if (!window.confirm('Unlink WhatsApp? You will need to scan a QR code again to re-link.')) return
    setUnlinking(true); setMsg('')
    try {
      await whatsappAPI.unlink()
      setLinked(false); setQr(null)
      setMsg('')
      fetchQR()
    } catch (err) {
      setMsg('❌ ' + unwrapError(err))
    } finally {
      setUnlinking(false)
    }
  }

  return (
    <div style={pg.page}>
      <div style={pg.card}>
        <h2 style={pg.title}>📱 Link WhatsApp</h2>
        <p style={pg.sub}>
          Each account links its own WhatsApp number. Your session is isolated from other users.
        </p>

        {linked === null && <div style={S.empty}>Checking WhatsApp status…</div>}

        {linked === true && (
          <div style={pg.successBox}>
            <div style={{ fontSize: 56 }}>✅</div>
            <h3 style={pg.successTitle}>WhatsApp is Linked!</h3>
            <p style={pg.successText}>
              Your WhatsApp session is active for <strong>{user?.username}</strong>.
              Scheduled messages will send automatically from your number.
            </p>
            <button style={pg.unlinkBtn} onClick={handleUnlink} disabled={unlinking}>
              {unlinking ? 'Unlinking…' : '🔓 Unlink WhatsApp'}
            </button>
          </div>
        )}

        {linked === false && (
          <div>
            <div style={pg.infoBox}>
              <strong>⚠️ Account-specific session</strong>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: '#555' }}>
                You are linking WhatsApp for <strong>{user?.username}</strong>.
                Each account has its own WhatsApp session — groups and schedules belong only to you.
              </p>
            </div>

            <div style={pg.steps}>
              <p style={pg.step}><strong>1.</strong> Open WhatsApp on your phone.</p>
              <p style={pg.step}><strong>2.</strong> Go to <strong>Settings → Linked Devices → Link a Device</strong>.</p>
              <p style={pg.step}><strong>3.</strong> Scan the QR code below.</p>
            </div>

            {qr
              ? <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <img src={`data:image/png;base64,${qr}`} alt="WhatsApp QR Code" style={pg.qrImg} />
                  <p style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>QR refreshes every 30 seconds.</p>
                </div>
              : <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
                  ⏳ Loading QR code… (may take ~30 seconds on first load)
                </div>
            }

            {msg && <div style={msg.startsWith('✅') ? pg.msgOk : pg.msgErr}>{msg}</div>}

            <div style={pg.actions}>
              <button style={pg.scanBtn} onClick={handleWaitScan} disabled={waiting || !qr}>
                {waiting ? '⏳ Waiting for scan… (up to 2 min)' : '✔ I have scanned the QR'}
              </button>
              <button style={pg.refreshBtn} onClick={() => fetchQR(true)} disabled={refreshing}>
                {refreshing ? '🔄 Refreshing…' : '🔄 Refresh QR'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const pg = {
  page:         { maxWidth: 600, margin: '40px auto', padding: '0 20px' },
  card:         { background: '#fff', borderRadius: 16, padding: '36px 40px', boxShadow: '0 4px 24px rgba(0,0,0,.10)' },
  title:        { fontSize: 22, fontWeight: 700, color: '#075e54', marginBottom: 8 },
  sub:          { fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 1.5 },
  infoBox:      { background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#5d4037' },
  steps:        { background: '#f0f7f0', borderRadius: 10, padding: '16px 20px', marginBottom: 24 },
  step:         { fontSize: 14, color: '#333', marginBottom: 8, lineHeight: 1.5 },
  qrImg:        { width: 240, height: 240, border: '4px solid #075e54', borderRadius: 12, display: 'block', margin: '0 auto' },
  actions:      { display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' },
  scanBtn:      { flex: 1, background: '#075e54', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  refreshBtn:   { background: '#f0f0f0', color: '#333', border: 'none', borderRadius: 8, padding: '12px 18px', fontSize: 14, cursor: 'pointer' },
  successBox:   { textAlign: 'center', padding: '24px 0' },
  successTitle: { fontSize: 20, fontWeight: 700, color: '#1b7e40', marginBottom: 10 },
  successText:  { fontSize: 15, color: '#555', lineHeight: 1.6, marginBottom: 24 },
  unlinkBtn:    { background: '#fff', border: '1.5px solid #e53935', color: '#e53935', borderRadius: 8, padding: '9px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  msgOk:        { background: '#d4edda', color: '#155724', borderRadius: 8, padding: '10px 16px', fontSize: 14, marginTop: 12 },
  msgErr:       { background: '#f8d7da', color: '#721c24', borderRadius: 8, padding: '10px 16px', fontSize: 14, marginTop: 12 },
}
