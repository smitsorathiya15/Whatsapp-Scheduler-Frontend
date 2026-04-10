import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { unwrapError } from '../api'
import S from '../components/styles'
import WhatsappLogo from '../components/WhatsappLogo'

export default function Login() {
  const { login }              = useAuth()
  const navigate               = useNavigate()
  const [form, setForm]        = useState({ username: '', password: '' })
  const [error, setError]      = useState('')
  const [loading, setLoading]  = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(unwrapError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brandBox}>
          <div style={styles.logo}><WhatsappLogo size={64} style={{ color: '#25D366' }} /></div>
          <h2 style={styles.title}>Whatsapp Scheduler</h2>
          <p style={styles.sub}>An Automation Platform</p>
        </div>

        {error && <div style={S.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={S.label}>Email</label>
            <input 
              style={S.input} 
              type="email" 
              placeholder="Email" 
              value={form.username} 
              onChange={set('username')} 
              required 
            />
          </div>

          <div style={styles.field}>
            <label style={S.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                style={{ ...S.input, paddingRight: '48px' }} 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={form.password} 
                onChange={set('password')} 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.6,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0.6'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button 
            style={{ ...S.btn, width: '100%', marginTop: '12px', padding: '14px' }} 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account? <Link to="/register" style={styles.link}>Create one now</Link>
          </p>
        </div>
      </div>
      
      <div style={styles.copyright}>
        &copy; 2026 WhatsApp Scheduler. All rights reserved.
      </div>
    </div>
  )
}

const styles = {
  page: { 
    minHeight: '100vh', 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    background: 'linear-gradient(135deg, #075e54 0%, #128c7e 100%)',
    padding: '24px'
  },
  card: { 
    background: '#fff', 
    borderRadius: '24px', 
    padding: '56px 48px', 
    width: '100%',
    maxWidth: '420px', 
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    position: 'relative',
    overflow: 'hidden'
  },
  brandBox: { textAlign: 'center', marginBottom: '40px' },
  logo: { fontSize: '56px', marginBottom: '16px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#111b21', marginBottom: '4px', letterSpacing: '-0.02em' },
  sub: { color: '#667781', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
  field: { marginBottom: '4px' },
  footer: { marginTop: '32px', textAlign: 'center', borderTop: '1px solid #f0f2f5', paddingTop: '24px' },
  footerText: { fontSize: '14px', color: '#667781' },
  link: { color: '#075e54', fontWeight: '700', textDecoration: 'none' },
  copyright: { marginTop: '32px', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }
}

