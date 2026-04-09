const S = {
  // ── Colors & Tokens ──────────────────────────────────────────
  colors: {
    primary: '#075e54',
    secondary: '#128c7e',
    accent: '#25d366',
    bg: '#f0f2f5',
    card: '#ffffff',
    text: '#111b21',
    textMuted: '#667781',
    error: '#f15c6d',
    success: '#00a884',
    warning: '#ffbc2c',
    border: '#e9edef',
  },

  // ── Typography ───────────────────────────────────────────────
  font: {
    base: '"Segoe UI", "Inter", -apple-system, sans-serif',
  },

  // ── Components ───────────────────────────────────────────────
  
  // Inputs
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #e9edef',
    borderRadius: '12px',
    fontSize: '15px',
    marginBottom: '16px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
    backgroundColor: '#f9f9f9',
    '&:focus': {
      border: '1px solid #128c7e',
      backgroundColor: '#fff',
      boxShadow: '0 0 0 4px rgba(18, 140, 126, 0.1)',
    }
  },
  label: { 
    display: 'block', 
    marginBottom: '6px', 
    fontWeight: '600', 
    fontSize: '14px', 
    color: '#111b21' 
  },

  // Buttons
  btn: {
    background: 'linear-gradient(180deg, #128c7e 0%, #075e54 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(7, 94, 84, 0.2)',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 16px rgba(7, 94, 84, 0.3)',
    },
    '&:active': {
      transform: 'translateY(0)',
    }
  },
  btnSecondary: {
    background: '#ffffff',
    color: '#075e54',
    border: '1px solid #e9edef',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnSm: {
    background: '#f0f2f5',
    color: '#075e54',
    border: 'none',
    borderRadius: '10px',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnDanger: {
    background: '#fff',
    color: '#f15c6d',
    border: '1px solid #feeaea',
    borderRadius: '10px',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Status & Alerts
  error: { 
    background: '#feeaea', 
    color: '#d32f2f', 
    fontSize: '14px', 
    padding: '12px 16px', 
    borderRadius: '10px', 
    marginBottom: '16px',
    border: '1px solid #f9dada'
  },
  success: { 
    background: '#e7f8f2', 
    color: '#00a884', 
    fontSize: '14px', 
    padding: '12px 16px', 
    borderRadius: '10px', 
    marginBottom: '16px',
    border: '1px solid #d1f1e6'
  },
  hint: { fontSize: '12px', color: '#667781', marginTop: '-10px', marginBottom: '16px', lineHeight: '1.4' },
  empty: { textAlign: 'center', color: '#667781', padding: '60px 0', fontSize: '15px' },

  // Layout components
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  heading: { fontSize: '20px', fontWeight: '700', color: '#111b21' },
  row: { display: 'flex', gap: '12px', marginTop: '12px' },

  // Tables
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
    background: '#fff',
  },
  th: {
    background: '#fff',
    padding: '16px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '13px',
    color: '#667781',
    borderBottom: '1px solid #e9edef',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tr: { 
    transition: 'background 0.15s',
    '&:hover': {
      background: '#f9f9f9',
    }
  },
  td: { 
    padding: '16px', 
    fontSize: '15px', 
    color: '#111b21', 
    borderBottom: '1px solid #f9f9f9' 
  },
  code: { 
    background: '#f0f2f5', 
    borderRadius: '6px', 
    padding: '4px 8px', 
    fontSize: '13px', 
    fontFamily: 'monospace', 
    color: '#075e54',
    fontWeight: '600'
  },

  // Interactive Elements
  badgeOn: { 
    background: '#e7f8f2', 
    color: '#00a884', 
    borderRadius: '20px', 
    padding: '4px 12px', 
    fontSize: '12px', 
    fontWeight: '700' 
  },
  badgeOff: { 
    background: '#f9f9f9', 
    color: '#667781', 
    borderRadius: '20px', 
    padding: '4px 12px', 
    fontSize: '12px', 
    fontWeight: '700' 
  },
  dayBadge: { 
    background: '#075e54', 
    color: '#fff', 
    borderRadius: '6px', 
    padding: '2px 8px', 
    fontSize: '11px', 
    fontWeight: '700' 
  },
  toggleOn: { 
    background: '#e7f8f2', color: '#00a884', border: 'none', borderRadius: '20px', 
    padding: '4px 14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
    transition: 'all 0.2s'
  },
  toggleOff: { 
    background: '#feeaea', color: '#f15c6d', border: 'none', borderRadius: '20px', 
    padding: '4px 14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
    transition: 'all 0.2s'
  },

  // Custom Day Selector
  dayBtnOn: { 
    background: '#25d366', 
    border: '2px solid #25d366', 
    borderRadius: '10px', 
    padding: '8px 12px', 
    fontSize: '12px', 
    fontWeight: '700', 
    color: '#fff', 
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)'
  },
  dayBtnOff: { 
    background: '#fff', 
    border: '2px solid #e9edef', 
    borderRadius: '10px', 
    padding: '8px 12px', 
    fontSize: '12px', 
    fontWeight: '700', 
    color: '#667781', 
    cursor: 'pointer' 
  },

  // Grid & Cards
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
    gap: '24px' 
  },
  card: { 
    background: '#ffffff', 
    borderRadius: '16px', 
    padding: '24px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
    border: '1px solid #e9edef',
    display: 'flex', 
    flexDirection: 'column', 
    gap: '16px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardTitle: { fontWeight: '700', fontSize: '18px', color: '#111b21' },
  cardContent: { 
    fontSize: '15px', 
    color: '#667781', 
    lineHeight: '1.6', 
    flex: 1, 
    whiteSpace: 'pre-wrap',
    background: '#f9f9f9',
    padding: '12px',
    borderRadius: '10px',
    borderLeft: '4px solid #075e54'
  },
  cardFooter: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: '8px',
    paddingTop: '16px',
    borderTop: '1px solid #f0f2f5'
  },
  dateText: { fontSize: '12px', color: '#667781' },
}


export default S
