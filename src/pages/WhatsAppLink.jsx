import { useState, useEffect, useRef, useCallback } from 'react'
import { whatsappAPI, unwrap, unwrapError } from '../api'
import { useAuth } from '../context/AuthContext'
import S from '../components/styles'

/*
  QR loading flow:
  1. On mount → call /status (fast, no Chrome)
  2. If not linked → call /qr (starts Chrome if needed — can take 30-75s on first load)
  3. If /qr returns qr=null with info="Generating" → retry every 5s until QR arrives
  4. Once QR is shown → poll /qr every 25s to keep it fresh (QR expires in ~60s)
  5. "I have scanned" button → POST /wait-scan (long-polls 120s server-side)
*/

const GENERATING_RETRY_MS = 5_000   // retry while Chrome is still loading
const QR_REFRESH_MS       = 25_000  // refresh QR before it expires (60s)

export default function WhatsAppLink() {
  const { user }              = useAuth()
  const [linked, setLinked]   = useState(null)   // null=loading true=linked false=not linked
  const [qr, setQr]           = useState(null)
  const [phase, setPhase]     = useState('idle') // idle | starting | qr_ready | error
  const [errorMsg, setErrorMsg] = useState('')
  const [statusMsg, setStatusMsg] = useState('')
  const [waiting, setWaiting] = useState(false)
  const [unlinking, setUnlinking] = useState(false)

  const pollRef   = useRef(null)
  const retryRef  = useRef(null)
  const mountedRef = useRef(true)

  const clearTimers = () => {
    clearInterval(pollRef.current)
    clearTimeout(retryRef.current)
  }

  // ── Fetch QR ────────────────────────────────────────────────────────────────

  const fetchQR = useCallback(async () => {
    if (!mountedRef.current) return
    try {
      const d = unwrap(await whatsappAPI.qr())

      if (!mountedRef.current) return

      if (d.linked) {
        setLinked(true)
        setQr(null)
        setPhase('idle')
        clearTimers()
        return
      }

      if (d.qr) {
        // QR arrived
        setQr(d.qr)
        setPhase('qr_ready')
        setLinked(false)
        setErrorMsg('')
        // Start refresh poll — keep QR fresh every 25s
        clearInterval(pollRef.current)
        pollRef.current = setInterval(fetchQR, QR_REFRESH_MS)
      } else {
        // Chrome still loading — keep retrying every 5s
        setPhase('starting')
        setQr(null)
        clearTimeout(retryRef.current)
        retryRef.current = setTimeout(fetchQR, GENERATING_RETRY_MS)
      }
    } catch (err) {
      if (!mountedRef.current) return
      setPhase('error')
      setErrorMsg(unwrapError(err))
    }
  }, [])

  // ── Initial status check ────────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true

    const init = async () => {
      try {
        const d = unwrap(await whatsappAPI.status())
        if (!mountedRef.current) return
        if (d.linked) {
          setLinked(true)
          setPhase('idle')
        } else {
          setLinked(false)
          setPhase('starting')
          fetchQR()
        }
      } catch {
        if (!mountedRef.current) return
        setLinked(false)
        setPhase('starting')
        fetchQR()
      }
    }

    init()

    return () => {
      mountedRef.current = false
      clearTimers()
    }
  }, [fetchQR])

  // ── Scan confirmation ───────────────────────────────────────────────────────

  const handleWaitScan = async () => {
    setWaiting(true)
    setStatusMsg('')
    try {
      const d = unwrap(await whatsappAPI.waitScan())
      if (d.linked) {
        clearTimers()
        setLinked(true)
        setQr(null)
        setPhase('idle')
        setStatusMsg('✅ WhatsApp linked! Messages will now send automatically.')
      } else {
        setStatusMsg('⏱ Timed out. Refresh the QR and try again.')
        fetchQR()
      }
    } catch (err) {
      setStatusMsg('❌ ' + unwrapError(err))
      fetchQR()
    } finally {
      setWaiting(false)
    }
  }

  // ── Unlink ──────────────────────────────────────────────────────────────────

  const handleUnlink = async () => {
    if (!window.confirm('Unlink WhatsApp? You will need to scan a QR code again.')) return
    setUnlinking(true)
    setStatusMsg('')
    try {
      await whatsappAPI.unlink()
      clearTimers()
      setLinked(false)
      setQr(null)
      setPhase('starting')
      fetchQR()
    } catch (err) {
      setStatusMsg('❌ ' + unwrapError(err))
    } finally {
      setUnlinking(false)
    }
  }

  // ── Manual refresh ──────────────────────────────────────────────────────────

  const handleRefresh = () => {
    clearTimers()
    setPhase('starting')
    setQr(null)
    fetchQR()
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={pg.page}>
      <div style={pg.card}>
        <h2 style={pg.title}>📱 Link WhatsApp</h2>
        <p style={pg.sub}>
          Each account links its own WhatsApp number — sessions are fully isolated.
        </p>

        {/* ── Loading / checking ── */}
        {linked === null && (
          <div style={pg.loadingBox}>
            <div style={pg.spinner}>⏳</div>
            <p>Checking WhatsApp status…</p>
          </div>
        )}

        {/* ── Already linked ── */}
        {linked === true && (
          <div style={pg.successBox}>
            <div style={{ fontSize: 56 }}>✅</div>
            <h3 style={pg.successTitle}>WhatsApp is Linked!</h3>
            <p style={pg.successText}>
              Active session for <strong>{user?.username}</strong>.
              Scheduled messages will send automatically.
            </p>
            {statusMsg && (
              <div style={statusMsg.startsWith('✅') ? pg.msgOk : pg.msgErr}>
                {statusMsg}
              </div>
            )}
            <button style={pg.unlinkBtn} onClick={handleUnlink} disabled={unlinking}>
              {unlinking ? 'Unlinking…' : '🔓 Unlink WhatsApp'}
            </button>
          </div>
        )}

        {/* ── Not linked ── */}
        {linked === false && (
          <div>
            <div style={pg.infoBox}>
              <strong>⚠️ Account-specific session</strong>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: '#555' }}>
                Linking WhatsApp for <strong>{user?.username}</strong>.
                Your groups and schedules are private to your account.
              </p>
            </div>

            <div style={pg.steps}>
              <p style={pg.step}><strong>1.</strong> Open WhatsApp on your phone.</p>
              <p style={pg.step}><strong>2.</strong> Go to <strong>Settings → Linked Devices → Link a Device</strong>.</p>
              <p style={pg.step}><strong>3.</strong> Scan the QR code that appears below.</p>
            </div>

            {/* QR area */}
            {phase === 'error' ? (
              <div style={pg.errorBox}>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>⚠️ Could not start WhatsApp browser</p>
                <p style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>{errorMsg}</p>
                <button style={pg.refreshBtn} onClick={handleRefresh}>🔄 Try Again</button>
              </div>
            ) : phase === 'starting' ? (
              <div style={pg.qrWaiting}>
                <div style={pg.qrSpinner}>⏳</div>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>Starting WhatsApp browser…</p>
                <p style={{ fontSize: 13, color: '#888' }}>
                  This takes 30–60 seconds on first load. Please wait.
                </p>
                <div style={pg.progressBar}>
                  <div style={pg.progressFill} />
                </div>
              </div>
            ) : qr ? (
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <img
                  src={`data:image/png;base64,${qr}`}
                  alt="WhatsApp QR Code"
                  style={pg.qrImg}
                />
                <p style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>
                  QR refreshes automatically every 25 seconds.
                </p>
              </div>
            ) : (
              <div style={pg.qrWaiting}>
                <div style={pg.qrSpinner}>⏳</div>
                <p>Loading QR code…</p>
              </div>
            )}

            {statusMsg && (
              <div style={statusMsg.startsWith('✅') ? pg.msgOk : pg.msgErr}>
                {statusMsg}
              </div>
            )}

            <div style={pg.actions}>
              <button
                style={{ ...pg.scanBtn, opacity: (waiting || !qr) ? 0.6 : 1 }}
                onClick={handleWaitScan}
                disabled={waiting || !qr}
              >
                {waiting ? '⏳ Waiting for scan… (up to 2 min)' : '✔ I have scanned the QR'}
              </button>
              <button style={pg.refreshBtn} onClick={handleRefresh} disabled={phase === 'starting'}>
                🔄 Refresh
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
  qrWaiting:    { textAlign: 'center', padding: '32px 20px', color: '#555', background: '#f9f9f9', borderRadius: 10, marginBottom: 20 },
  qrSpinner:    { fontSize: 36, marginBottom: 12 },
  progressBar:  { height: 4, background: '#e0e0e0', borderRadius: 4, margin: '16px auto 0', maxWidth: 200, overflow: 'hidden' },
  progressFill: {
    height: '100%', width: '40%', background: '#075e54', borderRadius: 4,
    animation: 'progress-slide 1.5s ease-in-out infinite',
  },
  errorBox:     { background: '#fff3f3', border: '1px solid #ffcdd2', borderRadius: 10, padding: '20px', marginBottom: 20, textAlign: 'center', color: '#c62828' },
  loadingBox:   { textAlign: 'center', padding: '40px 0', color: '#888' },
  spinner:      { fontSize: 36, marginBottom: 12 },
  actions:      { display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' },
  scanBtn:      { flex: 1, background: '#075e54', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' },
  refreshBtn:   { background: '#f0f0f0', color: '#333', border: 'none', borderRadius: 8, padding: '12px 18px', fontSize: 14, cursor: 'pointer' },
  successBox:   { textAlign: 'center', padding: '24px 0' },
  successTitle: { fontSize: 20, fontWeight: 700, color: '#1b7e40', marginBottom: 10 },
  successText:  { fontSize: 15, color: '#555', lineHeight: 1.6, marginBottom: 16 },
  unlinkBtn:    { background: '#fff', border: '1.5px solid #e53935', color: '#e53935', borderRadius: 8, padding: '9px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  msgOk:        { background: '#d4edda', color: '#155724', borderRadius: 8, padding: '10px 16px', fontSize: 14, marginBottom: 12 },
  msgErr:       { background: '#f8d7da', color: '#721c24', borderRadius: 8, padding: '10px 16px', fontSize: 14, marginBottom: 12 },
}
