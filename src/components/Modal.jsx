export default function Modal({ title, onClose, children }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
  },
  modal: {
    background: '#fff', borderRadius: 12, minWidth: 380, maxWidth: 520, width: '90%',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '18px 24px 12px', borderBottom: '1px solid #eee',
  },
  title: { fontSize: 17, fontWeight: 600, color: '#075e54' },
  closeBtn: {
    background: 'none', border: 'none', fontSize: 18, color: '#888',
    cursor: 'pointer', padding: '2px 6px', borderRadius: 4,
  },
  body: { padding: '20px 24px 24px' },
}
