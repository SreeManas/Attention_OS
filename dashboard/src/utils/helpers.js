export function formatTime(seconds) {
    if (!seconds) return '0s'

    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
        return `${hours}h ${mins}m`
    }
    if (mins > 0) {
        return `${mins}m ${secs}s`
    }
    return `${secs}s`
}

export function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '-'
    const [date, time] = dateTimeStr.split(' ')
    return time ? time.substring(0, 5) : dateTimeStr
}

export function formatDate(dateTimeStr) {
    if (!dateTimeStr) return '-'
    const [date] = dateTimeStr.split(' ')
    return date
}

export function getAppIcon(appName) {
    if (!appName) return '📦'
    if (appName === 'IDLE') return '💤'
    if (appName.includes('Chrome')) return '🌐'
    if (appName.includes('Brave')) return '🦁'
    if (appName.includes('Safari')) return '🧭'
    if (appName.includes('Code') || appName.includes('VS')) return '💻'
    if (appName.includes('Terminal')) return '⌨️'
    if (appName.includes('Slack')) return '💬'
    if (appName.includes('Zoom')) return '📹'
    if (appName.includes('Music') || appName.includes('Spotify')) return '🎵'
    if (appName.includes('WhatsApp')) return '📱'
    if (appName.includes('Notes')) return '📝'
    if (appName.includes('Antigravity')) return '🤖'
    return '📦'
}

export function getFocusColor(score) {
    if (score >= 80) return 'var(--success)'
    if (score >= 60) return 'var(--warning)'
    return 'var(--danger)'
}

export function calculateStats(sessions) {
    if (!sessions || sessions.length === 0) {
        return {
            avgFocusScore: 0,
            avgActiveTime: 0,
            totalSessions: 0,
            bestSession: null,
            worstSession: null
        }
    }

    const totalFocusScore = sessions.reduce((sum, s) => sum + s.focus_score, 0)
    const totalActiveTime = sessions.reduce((sum, s) => sum + s.total_active_seconds, 0)

    const sorted = [...sessions].sort((a, b) => b.focus_score - a.focus_score)

    return {
        avgFocusScore: totalFocusScore / sessions.length,
        avgActiveTime: totalActiveTime / sessions.length,
        totalSessions: sessions.length,
        bestSession: sorted[0],
        worstSession: sorted[sorted.length - 1]
    }
}
