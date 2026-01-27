import { useEffect, useState } from 'react'
import { fetchTimeline } from '../utils/api'
import { formatDateTime, formatTime, getAppIcon } from '../utils/helpers'
import LoadingSkeleton from '../components/LoadingSkeleton'

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
            <div>
                <div className="page-header">
                    <h1 className="page-title">Timeline</h1>
                    <p className="page-subtitle">Your activity history</p>
                </div>
                <LoadingSkeleton type="table" />
            </div>
        )
    }

    if (activities.length === 0) {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">Timeline</h1>
                    <p className="page-subtitle">Your activity history</p>
                </div>
                <div className="empty-state">
                    <div className="empty-state-icon">🕒</div>
                    <div className="empty-state-text">No activity logged yet</div>
                </div>
            </div>
        )
    }

    const uniqueApps = [...new Set(activities.map(a => a.app_name))].sort()

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Timeline</h1>
                <p className="page-subtitle">Your activity history</p>
            </div>

            <div className="timeline-filters">
                <input
                    type="text"
                    placeholder="Search activities..."
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
            </div>

            {filteredActivities.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <div className="empty-state-text">No matching activities</div>
                </div>
            ) : (
                <div className="timeline-list">
                    {filteredActivities.map(activity => (
                        <div key={activity.id} className="timeline-item">
                            <div className="timeline-icon">
                                {getAppIcon(activity.app_name)}
                            </div>
                            <div className="timeline-details">
                                <div className="timeline-app">{activity.app_name}</div>
                                <div className="timeline-time">
                                    {formatDateTime(activity.start_time)} → {formatDateTime(activity.end_time)}
                                </div>
                            </div>
                            <div className="timeline-duration">
                                {formatTime(activity.duration_seconds)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Timeline
