import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchTimeline } from '../utils/api'
import { formatDateTime, formatTime, getAppIcon } from '../utils/helpers'
import EmptyState from '../components/EmptyState'

function Timeline() {
    const [activities, setActivities] = useState([])
    const [filteredActivities, setFilteredActivities] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterApp, setFilterApp] = useState('all')

    useEffect(() => {
        fetchTimeline()
            .then(data => {
                setActivities(data)
                setFilteredActivities(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    useEffect(() => {
        let filtered = activities

        if (filterApp !== 'all') {
            filtered = filtered.filter(a => a.app_name === filterApp)
        }

        if (searchTerm) {
            filtered = filtered.filter(a =>
                a.app_name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        setFilteredActivities(filtered)
    }, [searchTerm, filterApp, activities])

    if (loading) {
        return (
            <motion.div
                className="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="loading-spinner" />
                <p>Loading activity timeline...</p>
            </motion.div>
        )
    }

    if (activities.length === 0) {
        return (
            <EmptyState
                icon="🕒"
                title="No activity logged yet"
                description="Start tracking your sessions to see a detailed timeline of which apps you use and when."
            />
        )
    }

    const uniqueApps = [...new Set(activities.map(a => a.app_name))].sort()

    // Get color for app
    const getAppColor = (appName) => {
        const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#10b981', '#3b82f6']
        const index = appName.charCodeAt(0) % colors.length
        return colors[index]
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
                    <div className="page-eyebrow">Activity Log</div>
                    <h1 className="page-title">Timeline</h1>
                    <p className="page-subtitle">Your application usage history</p>
                </motion.div>

                <motion.div
                    className="search-bar"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <input
                        type="text"
                        placeholder="Search applications..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="filter-select"
                        value={filterApp}
                        onChange={(e) => setFilterApp(e.target.value)}
                    >
                        <option value="all">All Apps</option>
                        {uniqueApps.map(app => (
                            <option key={app} value={app}>{app}</option>
                        ))}
                    </select>
                </motion.div>

                {filteredActivities.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <div className="empty-state-text">No matching activities</div>
                    </div>
                ) : (
                    <div className="timeline-container">
                        {filteredActivities.slice(0, 50).map((activity, index) => (
                            <motion.div
                                key={activity.id}
                                className="timeline-block"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.03, duration: 0.3 }}
                                whileHover={{ x: 4 }}
                            >
                                <div
                                    className="timeline-bar"
                                    style={{ background: getAppColor(activity.app_name) }}
                                />
                                <div className="timeline-icon">
                                    {getAppIcon(activity.app_name)}
                                </div>
                                <div className="timeline-info">
                                    <div className="timeline-app">{activity.app_name}</div>
                                    <div className="timeline-time">
                                        {formatDateTime(activity.start_time)} → {formatDateTime(activity.end_time)}
                                    </div>
                                </div>
                                <div className="timeline-duration">
                                    {formatTime(activity.duration_seconds)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    )
}

export default Timeline
