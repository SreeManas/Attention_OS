import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { fetchSessions } from '../utils/api'
import { calculateStats, formatTime } from '../utils/helpers'
import ChartCard from '../components/ChartCard'
import LoadingSkeleton from '../components/LoadingSkeleton'

function Analytics() {
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSessions()
            .then(data => {
                setSessions(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">Analytics</h1>
                    <p className="page-subtitle">Insights and trends</p>
                </div>
                <LoadingSkeleton type="card" />
            </div>
        )
    }

    if (sessions.length === 0) {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">Analytics</h1>
                    <p className="page-subtitle">Insights and trends</p>
                </div>
                <div className="empty-state">
                    <div className="empty-state-icon">📈</div>
                    <div className="empty-state-text">No data for analytics yet</div>
                </div>
            </div>
        )
    }

    const stats = calculateStats(sessions)
    const recentSessions = sessions.slice(0, 10).reverse()

    const focusTrendData = recentSessions.map((session, index) => ({
        name: `${sessions.length - recentSessions.length + index + 1}`,
        score: session.focus_score
    }))

    const activeIdleTrendData = recentSessions.map((session, index) => ({
        name: `${sessions.length - recentSessions.length + index + 1}`,
        active: session.total_active_seconds,
        idle: session.total_idle_seconds
    }))

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Analytics</h1>
                <p className="page-subtitle">Insights and trends</p>
            </div>

            <div className="insights-grid">
                <div className="insight-card">
                    <div className="insight-label">Total Sessions</div>
                    <div className="insight-value">{stats.totalSessions}</div>
                </div>

                <div className="insight-card">
                    <div className="insight-label">Avg Focus Score</div>
                    <div className="insight-value">{stats.avgFocusScore.toFixed(0)}%</div>
                </div>

                <div className="insight-card">
                    <div className="insight-label">Avg Active Time</div>
                    <div className="insight-value">{formatTime(Math.round(stats.avgActiveTime))}</div>
                </div>

                <div className="insight-card">
                    <div className="insight-label">Best Session</div>
                    <div className="insight-value">
                        {stats.bestSession ? `${stats.bestSession.focus_score.toFixed(0)}%` : '—'}
                    </div>
                </div>
            </div>

            <ChartCard title="Focus Score Trend">
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={focusTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-tertiary)" style={{ fontSize: '12px' }} />
                        <YAxis stroke="var(--text-tertiary)" style={{ fontSize: '12px' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--bg-elevated)',
                                border: '1px solid var(--border-light)',
                                borderRadius: '8px',
                                fontSize: '13px'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#6366f1"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Active vs Idle Time">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={activeIdleTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-tertiary)" style={{ fontSize: '12px' }} />
                        <YAxis stroke="var(--text-tertiary)" style={{ fontSize: '12px' }} />
                        <Tooltip
                            formatter={(value) => formatTime(value)}
                            contentStyle={{
                                backgroundColor: 'var(--bg-elevated)',
                                border: '1px solid var(--border-light)',
                                borderRadius: '8px',
                                fontSize: '13px'
                            }}
                        />
                        <Bar dataKey="active" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="idle" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
    )
}

export default Analytics
