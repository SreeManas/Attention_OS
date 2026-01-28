// Achievement definitions
export const ACHIEVEMENTS = [
    {
        id: 'deep_focus',
        name: 'Deep Focus Master',
        description: 'Achieved 90%+ focus score',
        badge: '🎯',
        condition: (session) => session.focus_score >= 90
    },
    {
        id: 'marathon',
        name: 'Marathon Session',
        description: 'Focused for 2+ hours',
        badge: '🏃',
        condition: (session) => session.total_active_seconds >= 7200
    },
    {
        id: 'zen_mode',
        name: 'Zen Mode',
        description: 'Zero context switches',
        badge: '🧘',
        condition: (session) => session.app_switches === 0
    },
    {
        id: 'power_hour',
        name: 'Power Hour',
        description: '80%+ focus for 1+ hour',
        badge: '⚡',
        condition: (session) => session.focus_score >= 80 && session.total_active_seconds >= 3600
    },
    {
        id: 'streak_3',
        name: '3-Day Streak',
        description: 'Focused 3 days in a row',
        badge: '🔥',
        condition: (session, streak) => streak >= 3
    },
    {
        id: 'streak_7',
        name: 'Week Warrior',
        description: '7-day focus streak',
        badge: '🌟',
        condition: (session, streak) => streak >= 7
    },
    {
        id: 'streak_14',
        name: 'Fortnight Force',
        description: '14-day streak',
        badge: '💎',
        condition: (session, streak) => streak >= 14
    },
    {
        id: 'streak_30',
        name: 'Monthly Master',
        description: '30-day streak!',
        badge: '👑',
        condition: (session, streak) => streak >= 30
    },
    {
        id: 'perfect_day',
        name: 'Perfect Day',
        description: 'All sessions >80% focus',
        badge: '✨',
        condition: (session, streak, dailySessions) => {
            return dailySessions.every(s => s.focus_score >= 80)
        }
    },
    {
        id: 'improvement_king',
        name: 'Improvement King',
        description: '+20% vs last week',
        badge: '📈',
        condition: (session, streak, dailySessions, weeklyImprovement) => {
            return weeklyImprovement >= 20
        }
    }
]

// Check which achievements are unlocked
export function checkAchievements(session, allSessions = []) {
    const unlocked = []

    // Calculate streak
    const streak = calculateStreak(allSessions)

    // Get today's sessions
    const today = new Date().toDateString()
    const dailySessions = allSessions.filter(s =>
        new Date(s.start_time).toDateString() === today
    )

    // Calculate weekly improvement
    const weeklyImprovement = calculateWeeklyImprovement(allSessions)

    ACHIEVEMENTS.forEach(achievement => {
        if (achievement.condition(session, streak, dailySessions, weeklyImprovement)) {
            unlocked.push(achievement)
        }
    })

    return unlocked
}

// Calculate consecutive day streak
function calculateStreak(sessions) {
    if (sessions.length === 0) return 0

    let streak = 1
    const sortedSessions = [...sessions].sort((a, b) =>
        new Date(b.start_time) - new Date(a.start_time)
    )

    for (let i = 0; i < sortedSessions.length - 1; i++) {
        const current = new Date(sortedSessions[i].start_time).setHours(0, 0, 0, 0)
        const next = new Date(sortedSessions[i + 1].start_time).setHours(0, 0, 0, 0)
        const dayDiff = (current - next) / (1000 * 60 * 60 * 24)

        if (dayDiff === 1) {
            streak++
        } else if (dayDiff > 1) {
            break
        }
    }

    return streak
}

// Calculate improvement vs last week
function calculateWeeklyImprovement(sessions) {
    if (sessions.length < 7) return 0

    const now = Date.now()
    const oneWeek = 7 * 24 * 60 * 60 * 1000

    const thisWeek = sessions.filter(s =>
        now - new Date(s.start_time).getTime() <= oneWeek
    )
    const lastWeek = sessions.filter(s => {
        const age = now - new Date(s.start_time).getTime()
        return age > oneWeek && age <= oneWeek * 2
    })

    if (thisWeek.length === 0 || lastWeek.length === 0) return 0

    const thisWeekAvg = thisWeek.reduce((sum, s) => sum + s.focus_score, 0) / thisWeek.length
    const lastWeekAvg = lastWeek.reduce((sum, s) => sum + s.focus_score, 0) / lastWeek.length

    return ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100
}

// Get all unlocked achievements for a user
export function getAllUnlockedAchievements(sessions) {
    const allUnlocked = new Set()

    sessions.forEach(session => {
        const unlocked = checkAchievements(session, sessions)
        unlocked.forEach(achievement => allUnlocked.add(achievement.id))
    })

    return Array.from(allUnlocked).map(id =>
        ACHIEVEMENTS.find(a => a.id === id)
    )
}
