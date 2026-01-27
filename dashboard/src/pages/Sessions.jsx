import { useEffect, useState } from 'react'
import { fetchSessions } from '../utils/api'
import { formatTime, getFocusColor } from '../utils/helpers'
import Modal from '../components/Modal'
import LoadingSkeleton from '../components/LoadingSkeleton'

function Sessions() {
    const [sessions, setSessions] = useState([])
    const [filteredSessions, setFilteredSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortKey, setSortKey] = useState('id')
    const [sortOrder, setSortOrder] = useState('desc')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedSession, setSelectedSession] = useState(null)
    const itemsPerPage = 10

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
        let filtered = [...sessions]

        if (searchTerm) {
            filtered = filtered.filter(s =>
                s.start_time.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.end_time.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        filtered.sort((a, b) => {
            const aVal = a[sortKey]
            const bVal = b[sortKey]

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1
            } else {
                return aVal < bVal ? 1 : -1
            }
        })

        setFilteredSessions(filtered)
        setCurrentPage(1)
    }, [searchTerm, sortKey, sortOrder, sessions])

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortOrder('desc')
        }
    }

    if (loading) {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">Sessions</h1>
                    <p className="page-subtitle">Your work sessions</p>
                </div>
                <LoadingSkeleton type="table" />
            </div>
        )
    }

    if (sessions.length === 0) {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">Sessions</h1>
                    <p className="page-subtitle">Your work sessions</p>
                </div>
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <div className="empty-state-text">No sessions recorded yet</div>
                </div>
            </div>
        )
    }

    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedSessions = filteredSessions.slice(startIndex, startIndex + itemsPerPage)

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Sessions</h1>
                <p className="page-subtitle">Your work sessions</p>
            </div>

            <div className="table-container">
                <div className="table-actions">
                    <input
                        type="text"
                        placeholder="Search sessions..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <table>
                    <thead>
                        <tr>
                            <th className="sortable" onClick={() => handleSort('id')}>
                                ID {sortKey === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="sortable" onClick={() => handleSort('start_time')}>
                                Start {sortKey === 'start_time' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="sortable" onClick={() => handleSort('end_time')}>
                                End {sortKey === 'end_time' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="sortable" onClick={() => handleSort('total_active_seconds')}>
                                Active {sortKey === 'total_active_seconds' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="sortable" onClick={() => handleSort('total_idle_seconds')}>
                                Idle {sortKey === 'total_idle_seconds' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="sortable" onClick={() => handleSort('app_switches')}>
                                Switches {sortKey === 'app_switches' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="sortable" onClick={() => handleSort('focus_score')}>
                                Focus {sortKey === 'focus_score' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedSessions.map(session => (
                            <tr key={session.id} onClick={() => setSelectedSession(session)}>
                                <td>{session.id}</td>
                                <td>{session.start_time}</td>
                                <td>{session.end_time}</td>
                                <td>{formatTime(session.total_active_seconds)}</td>
                                <td>{formatTime(session.total_idle_seconds)}</td>
                                <td>{session.app_switches}</td>
                                <td>
                                    <strong style={{ color: getFocusColor(session.focus_score) }}>
                                        {session.focus_score.toFixed(1)}%
                                    </strong>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="pagination">
                        <div className="pagination-info">
                            {startIndex + 1}—{Math.min(startIndex + itemsPerPage, filteredSessions.length)} of {filteredSessions.length}
                        </div>
                        <div className="pagination-buttons">
                            <button
                                className="pagination-button"
                                onClick={() => setCurrentPage(p => p - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <button
                                className="pagination-button"
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={selectedSession !== null}
                onClose={() => setSelectedSession(null)}
                title={`Session #${selectedSession?.id}`}
            >
                {selectedSession && (
                    <div className="modal-stats">
                        <div className="modal-stat">
                            <div className="modal-stat-label">Start</div>
                            <div className="modal-stat-value" style={{ fontSize: '14px' }}>{selectedSession.start_time}</div>
                        </div>
                        <div className="modal-stat">
                            <div className="modal-stat-label">End</div>
                            <div className="modal-stat-value" style={{ fontSize: '14px' }}>{selectedSession.end_time}</div>
                        </div>
                        <div className="modal-stat">
                            <div className="modal-stat-label">Active</div>
                            <div className="modal-stat-value">{formatTime(selectedSession.total_active_seconds)}</div>
                        </div>
                        <div className="modal-stat">
                            <div className="modal-stat-label">Idle</div>
                            <div className="modal-stat-value">{formatTime(selectedSession.total_idle_seconds)}</div>
                        </div>
                        <div className="modal-stat">
                            <div className="modal-stat-label">Switches</div>
                            <div className="modal-stat-value">{selectedSession.app_switches}</div>
                        </div>
                        <div className="modal-stat">
                            <div className="modal-stat-label">Focus</div>
                            <div className="modal-stat-value" style={{ color: getFocusColor(selectedSession.focus_score) }}>
                                {selectedSession.focus_score.toFixed(1)}%
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default Sessions
