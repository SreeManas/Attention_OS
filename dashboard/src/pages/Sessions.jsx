import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchSessions } from '../utils/api'
import { formatTime, getFocusColor } from '../utils/helpers'
import EmptyState from '../components/EmptyState'

function Sessions() {
    const [sessions, setSessions] = useState([])
    const [filteredSessions, setFilteredSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedSession, setSelectedSession] = useState(null)

    useEffect(() => {
        fetchSessions()
            .then(data => {
                setSessions(data)
                setFilteredSessions(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    useEffect(() => {
        let filtered = sessions

        if (searchTerm) {
            filtered = filtered.filter(s =>
                s.start_time.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.end_time.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        setFilteredSessions(filtered)
    }, [searchTerm, sessions])

    if (loading) {
        return (
            <motion.div
                className="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="loading-spinner" />
                <p>Loading sessions...</p>
            </motion.div>
        )
    }

    if (sessions.length === 0) {
        return (
            <EmptyState
                icon="📋"
                title="No sessions recorded yet"
                description="Your completed sessions will appear here. Start your first session to begin building your focus history."
            />
        )
    }

    const formatSessionDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="page-header"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <div className="page-eyebrow">Session History</div>
                    <h1 className="page-title">Sessions</h1>
                    <p className="page-subtitle">Review your past work sessions</p>
                </motion.div>

                <motion.div
                    className="search-bar"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <input
                        type="text"
                        placeholder="Search sessions..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </motion.div>

                <div className="sessions-grid">
                    {filteredSessions.map((session, index) => (
                        <motion.div
                            key={session.id}
                            className="session-card"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.05, duration: 0.4 }}
                            whileHover={{ y: -4, scale: 1.01 }}
                            onClick={() => setSelectedSession(session)}
                        >
                            <div className="session-header">
                                <div className="session-date">
                                    Session #{session.id} • {formatSessionDate(session.start_time)}
                                </div>
                                <div className="session-score">
                                    {session.focus_score.toFixed(0)}%
                                </div>
                            </div>

                            <div className="session-stats">
                                <div>
                                    <div className="session-stat-value">{formatTime(session.total_active_seconds)}</div>
                                    <div className="session-stat-label">Active</div>
                                </div>
                                <div>
                                    <div className="session-stat-value">{formatTime(session.total_idle_seconds)}</div>
                                    <div className="session-stat-label">Idle</div>
                                </div>
                                <div>
                                    <div className="session-stat-value">{session.app_switches}</div>
                                    <div className="session-stat-label">Switches</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Modal */}
                <AnimatePresence>
                    {selectedSession && (
                        <motion.div
                            className="modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedSession(null)}
                        >
                            <motion.div
                                className="modal"
                                initial={{ scale: 0.95, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.95, y: 20 }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="modal-header">
                                    <div>
                                        <div className="modal-title">Session #{selectedSession.id}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                                            {formatSessionDate(selectedSession.start_time)}
                                        </div>
                                    </div>
                                    <button className="modal-close" onClick={() => setSelectedSession(null)}>
                                        ×
                                    </button>
                                </div>

                                <div className="modal-body">
                                    <div style={{
                                        textAlign: 'center',
                                        marginBottom: '2rem',
                                        padding: '2rem',
                                        background: 'var(--color-accent-subtle)',
                                        borderRadius: 'var(--radius-lg)'
                                    }}>
                                        <div style={{
                                            fontSize: '4rem',
                                            fontWeight: 800,
                                            background: 'var(--gradient-hero)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                            {selectedSession.focus_score.toFixed(0)}%
                                        </div>
                                        <div style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                                            Focus Score
                                        </div>
                                    </div>

                                    <div className="modal-stats">
                                        <div className="modal-stat">
                                            <div className="modal-stat-value">{formatTime(selectedSession.total_active_seconds)}</div>
                                            <div className="modal-stat-label">Active Time</div>
                                        </div>
                                        <div className="modal-stat">
                                            <div className="modal-stat-value">{formatTime(selectedSession.total_idle_seconds)}</div>
                                            <div className="modal-stat-label">Idle Time</div>
                                        </div>
                                        <div className="modal-stat">
                                            <div className="modal-stat-value">{selectedSession.app_switches}</div>
                                            <div className="modal-stat-label">App Switches</div>
                                        </div>
                                        <div className="modal-stat">
                                            <div className="modal-stat-value">
                                                {Math.round((selectedSession.total_active_seconds / (selectedSession.total_active_seconds + selectedSession.total_idle_seconds)) * 100)}%
                                            </div>
                                            <div className="modal-stat-label">Efficiency</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    )
}

export default Sessions
