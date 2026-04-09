import { useState } from 'react'
import GroupsTab from '../components/GroupsTab'
import TemplatesTab from '../components/TemplatesTab'
import SchedulesTab from '../components/SchedulesTab'
import { useAuth } from '../context/AuthContext'

const TABS = [
  { id: 'Groups', label: 'Groups', icon: '👥' },
  { id: 'Templates', label: 'Templates', icon: '📝' },
  { id: 'Schedules', label: 'Schedules', icon: '🕐' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('Groups')

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.welcome}>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>Welcome back, <span style={styles.userName}>{user?.username}</span> 👋</p>
        </div>
        <div style={styles.headerStats}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Status:</span>
            <span style={styles.statValue}>Online</span>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.tabsContainer}>
          <div style={styles.tabs}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                style={activeTab === tab.id ? styles.tabActive : styles.tab}
                onClick={() => setActiveTab(tab.id)}
              >
                <span style={styles.tabIcon}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.innerContent}>
            {activeTab === 'Groups' && <GroupsTab />}
            {activeTab === 'Templates' && <TemplatesTab />}
            {activeTab === 'Schedules' && <SchedulesTab />}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { 
    minHeight: 'calc(100vh - 64px)',
    backgroundColor: '#f0f2f5',
    padding: '40px 24px'
  },
  header: { 
    maxWidth: '1100px',
    margin: '0 auto 32px auto',
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end' 
  },
  welcome: { flex: 1 },
  title: { fontSize: '28px', fontWeight: '800', color: '#111b21', marginBottom: '4px' },
  subtitle: { fontSize: '15px', color: '#667781', fontWeight: '500' },
  userName: { color: '#075e54', fontWeight: '700' },
  headerStats: { display: 'flex', gap: '24px' },
  statItem: { textAlign: 'right' },
  statLabel: { fontSize: '12px', color: '#667781', fontWeight: '600', textTransform: 'uppercase', display: 'block' },
  statValue: { fontSize: '14px', color: '#00a884', fontWeight: '700' },
  
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
  },
  tabsContainer: {
    marginBottom: '2px',
  },
  tabs: { 
    display: 'flex', 
    gap: '8px', 
    borderBottom: '1px solid #e9edef', 
    paddingBottom: '0' 
  },
  tab: {
    background: 'none', border: 'none', padding: '12px 24px', fontSize: '15px',
    color: '#667781', cursor: 'pointer', fontWeight: '600', borderBottom: '3px solid transparent',
    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
  },
  tabActive: {
    background: 'none', border: 'none', padding: '12px 24px', fontSize: '15px',
    color: '#075e54', cursor: 'pointer', fontWeight: '700', borderBottom: '3px solid #075e54',
    display: 'flex', alignItems: 'center', gap: '8px'
  },
  tabIcon: { fontSize: '18px' },
  
  content: { 
    background: '#fff', 
    borderRadius: '0 0 16px 16px', 
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    border: '1px solid #e9edef',
    borderTop: 'none'
  },
  innerContent: {
    padding: '32px'
  }
}

