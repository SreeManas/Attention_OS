import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { fetchSessions } from '../utils/api'
import { formatTime } from '../utils/helpers'
import StatCard from '../components/StatCard'
import ChartCard from '../components/ChartCard'
import LoadingSkeleton from '../components/LoadingSkeleton'

function Dashboard() {
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
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Your productivity overview</p>
                </div>
                <div className="stats-grid">
                    <LoadingSkeleton type="card" />
                    <LoadingSkeleton type="card" />
                    <LoadingSkeleton type="card" />
                </div>
            </div>
        )
    }

    if (sessions.length === 0) {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Your productivity overview</p>
                </div>
                <div className="empty-state">
                    <div className="empty-state-icon">📊</div>
                    <div className="empty-state-text">No sessions yet. Start the agent to track your activity.</div>
                </div>
            </div>
        )
    }

    const latestSession = sessions[0]
    const recentSessions = sessions.slice(0, 7).reverse()

    const focusScoreData = recentSessions.map((session, index) => ({
        name: `${sessions.length - recentSessions.length + index + 1}`,
        score: session.focus_score
    }))

    const activeVsIdleData = [
        { name: 'Active', value: latestSession.total_active_seconds, color: '#6366f1' },
        { name: 'Idle', value: latestSession.total_idle_seconds, color: '#e5e7eb' }
    ]

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Your productivity overview</p>
            </div>

            <div className="stats-grid">
                <StatCard
                    label="Focus Score"
                    value={`${latestSession.focus_score.toFixed(0)}%`}
                    isHero
                />

                <StatCard
                    label="Active Time"
                    value={formatTime(latestSession.total_active_seconds)}
                />

                <StatCard
                    label="Idle Time"
                    value={formatTime(latestSession.total_idle_seconds)}
                />

                <StatCard
                    label="App Switches"
                    value={latestSession.app_switches}
                />
            </div>

            <ChartCard title="Focus Score Trend">
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={focusScoreData}>
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
                            dot={{ r: 4, fill: '#6366f1' }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <ChartCard title="Time Distribution">
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie
                                data={activeVsIdleData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {activeVsIdleData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => formatTime(value)}
                                contentStyle={{
                                    backgroundColor: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: '8px',
                                    fontSize: '13px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Recent App Switches">
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={recentSessions.map((s, i) => ({
                            name: `${sessions.length - recentSessions.length + i + 1}`,
                            switches: s.app_switches
                        }))}>
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
                            <Bar dataKey="switches" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    )
}

export default Dashboard
