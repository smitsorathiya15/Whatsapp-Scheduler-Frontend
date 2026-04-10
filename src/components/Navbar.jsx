import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import WhatsappLogo from './WhatsappLogo'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const location         = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }
  const active = (path) => location.pathname === path ? styles.activeLink : styles.link

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <WhatsappLogo size={28} style={{ color: '#fff' }} />
        <span style={styles.brandText}>Whatsapp Scheduler</span>
      </div>

      <div style={styles.links}>
        <Link to="/" style={active('/')}>Dashboard</Link>
        <Link to="/whatsapp-link" style={active('/whatsapp-link')}>
          WhatsApp Link
          {/* Live per-user status dot — green = linked, red = not linked */}
          <span style={{ ...styles.dot, background: user?.wa_linked ? '#25d366' : '#e53935' }}
                title={user?.wa_linked ? 'WhatsApp linked' : 'WhatsApp not linked'} />
        </Link>
      </div>

      <div style={styles.right}>
        <span style={styles.username}>👤 {user?.username}</span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  )
}

const styles = {
  nav:        { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#075e54', color: '#fff', padding: '0 24px', height: 56, boxShadow: '0 2px 8px rgba(0,0,0,.2)', position: 'sticky', top: 0, zIndex: 100 },
  brand:      { display: 'flex', alignItems: 'center', gap: 8 },
  brandText:  { fontWeight: 700, fontSize: 18, letterSpacing: 0.5 },
  links:      { display: 'flex', gap: 24 },
  link:       { color: '#cce8e5', textDecoration: 'none', fontWeight: 500, fontSize: 15, padding: '4px 0', borderBottom: '2px solid transparent', display: 'flex', alignItems: 'center', gap: 6 },
  activeLink: { color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 15, padding: '4px 0', borderBottom: '2px solid #25d366', display: 'flex', alignItems: 'center', gap: 6 },
  dot:        { width: 8, height: 8, borderRadius: '50%', display: 'inline-block', marginLeft: 2 },
  right:      { display: 'flex', alignItems: 'center', gap: 16 },
  username:   { fontSize: 14, color: '#cce8e5' },
  logoutBtn:  { background: 'transparent', border: '1px solid #cce8e5', color: '#cce8e5', borderRadius: 6, padding: '4px 14px', fontSize: 14, cursor: 'pointer' },
}
