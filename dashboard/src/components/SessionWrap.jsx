import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

// ============================================
// ANIMATED COUNTER FOR METRICS
// ============================================

function CountUpNumber({ value, duration = 1000 }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        const target = parseFloat(value) || 0
        const steps = 50
        const increment = target / steps
        const stepDuration = duration / steps
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= target) {
                setCount(target)
                clearInterval(timer)
            } else {
                setCount(current)
            }
        }, stepDuration)

        return () => clearInterval(timer)
    }, [value, duration])

    return Math.round(count)
}

// ============================================
// CIRCULAR PROGRESS RING
// ============================================

function ProgressRing({ progress, delay = 0 }) {
    const radius = 80
    const stroke = 8
    const normalizedRadius = radius - stroke * 2
    const circumference = normalizedRadius * 2 * Math.PI
    const strokeDashoffset = circumference - (progress / 100) * circumference

    return (
        <motion.svg
            height={radius * 2}
            width={radius * 2}
            className="progress-ring"
        >
            {/* Background circle */}
            <circle
                stroke="rgba(255,255,255,0.1)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            {/* Progress circle */}
            <motion.circle
                stroke="#6366f1"
                fill="transparent"
                strokeWidth={stroke}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: strokeDashoffset }}
                transition={{ delay: delay + 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    strokeDasharray: `${circumference} ${circumference}`,
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%'
                }}
            />
            {/* Center text */}
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dy=".3em"
                style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    fill: 'white'
                }}
            >
                <CountUpNumber value={progress} />%
            </text>
        </motion.svg>
    )
}

// ============================================
// ACHIEVEMENT BADGE
// ============================================

function AchievementBadge({ achievement, delay = 0 }) {
    if (!achievement) return null

    return (
        <motion.div
            className="achievement-badge"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
                delay,
                duration: 0.6,
                type: "spring",
                bounce: 0.5
            }}
        >
            <div className="achievement-icon">{achievement.badge}</div>
            <div className="achievement-text">
                <div className="achievement-title">Achievement Unlocked!</div>
                <div className="achievement-name">{achievement.name}</div>
            </div>
        </motion.div>
    )
}

// ============================================
// AI SUGGESTIONS MODAL
// ============================================

function AISuggestionsModal({ show, onClose, response, loading, isCached, isDeepAnalysis = false, sessionsAnalyzed = 0 }) {
    if (!show) return null

    // Determine title and icon based on analysis type
    const title = isDeepAnalysis ? 'AI Deep Analysis' : 'AI Focus Coach'
    const icon = isDeepAnalysis ? '📊' : '🧠'
    const loadingText = isDeepAnalysis
        ? `Analyzing ${sessionsAnalyzed || 7} sessions...`
        : 'Analyzing your session...'

    return (
        <motion.div
            className="ai-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1001,
                padding: '2rem'
            }}
        >
            <motion.div
                className="ai-modal-content"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
                style={{
                    background: isDeepAnalysis
                        ? 'linear-gradient(145deg, rgba(30, 30, 50, 0.95), rgba(20, 20, 35, 0.98))'
                        : 'linear-gradient(145deg, rgba(30, 30, 40, 0.95), rgba(20, 20, 30, 0.98))',
                    borderRadius: '24px',
                    border: isDeepAnalysis
                        ? '1px solid rgba(99, 102, 241, 0.4)'
                        : '1px solid rgba(139, 92, 246, 0.3)',
                    padding: '2rem',
                    maxWidth: isDeepAnalysis ? '700px' : '600px',
                    width: '100%',
                    maxHeight: '80vh',
                    overflow: 'auto',
                    boxShadow: isDeepAnalysis
                        ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 50px rgba(99, 102, 241, 0.2)'
                        : '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.15)'
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1.5rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <span style={{ fontSize: '1.75rem' }}>{icon}</span>
                    <div style={{ flex: 1 }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            background: isDeepAnalysis
                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)'
                                : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {title}
                        </h3>
                        {isDeepAnalysis && sessionsAnalyzed > 0 && !loading && (
                            <span style={{
                                fontSize: '0.75rem',
                                color: '#a78bfa',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                marginTop: '0.25rem'
                            }}>
                                📈 Analyzed {sessionsAnalyzed} sessions
                            </span>
                        )}
                        {isCached && !loading && (
                            <span style={{
                                fontSize: '0.75rem',
                                color: '#fbbf24',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                marginTop: '0.25rem'
                            }}>
                                ⚡ Demo Mode — Cached response
                            </span>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '3rem',
                        gap: '1rem'
                    }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            style={{ fontSize: '2rem' }}
                        >
                            {icon}
                        </motion.div>
                        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                            {loadingText}
                        </p>
                    </div>
                )}

                {/* AI Response */}
                {!loading && response && (
                    <div
                        className="ai-response-content"
                        style={{
                            color: 'rgba(255,255,255,0.9)',
                            lineHeight: 1.7,
                            fontSize: '0.95rem'
                        }}
                        dangerouslySetInnerHTML={{
                            __html: response
                                .replace(/^### (.*$)/gm, '<h4 style="color:#a78bfa;margin:1.5rem 0 0.5rem;font-size:1rem;">$1</h4>')
                                .replace(/^## (.*$)/gm, '<h3 style="color:#8b5cf6;margin:1.5rem 0 0.75rem;font-size:1.1rem;">$1</h3>')
                                .replace(/^# (.*$)/gm, '<h2 style="color:#6366f1;margin:0 0 1rem;font-size:1.25rem;font-weight:700;">$1</h2>')
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\n/g, '<br/>')
                                .replace(/- /g, '• ')
                        }}
                    />
                )}

                {/* Close button */}
                <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        marginTop: '1.5rem',
                        width: '100%',
                        padding: '0.875rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: isDeepAnalysis
                            ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                            : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
                    }}
                >
                    Got it!
                </motion.button>
            </motion.div>
        </motion.div>
    )
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
        return `${hours}h ${minutes}m`
    }
    return `${minutes} min`
}

function checkAchievements(session) {
    const achievements = []

    if (session.focus_score >= 90) {
        achievements.push({
            badge: '🎯',
            name: 'Deep Focus Master',
            description: 'Achieved 90%+ focus score'
        })
    }

    if (session.total_active_seconds >= 7200) { // 2 hours
        achievements.push({
            badge: '🏃',
            name: 'Marathon Session',
            description: 'Focused for 2+ hours'
        })
    }

    if (session.app_switches === 0) {
        achievements.push({
            badge: '🧘',
            name: 'Zen Mode',
            description: 'Zero context switches'
        })
    }

    if (session.focus_score >= 80 && session.total_active_seconds >= 3600) {
        achievements.push({
            badge: '⚡',
            name: 'Power Hour',
            description: '80%+ focus for 1+ hour'
        })
    }

    return achievements[0] // Return first achievement
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SessionWrap({ session, show, onClose, aiCoachEnabled = true }) {
    const [currentScreen, setCurrentScreen] = useState(0)
    const [showAIModal, setShowAIModal] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [aiResponse, setAiResponse] = useState('')
    const [aiIsCached, setAiIsCached] = useState(false)
    const [isDeepAnalysis, setIsDeepAnalysis] = useState(false)
    const [sessionsAnalyzed, setSessionsAnalyzed] = useState(0)

    const achievement = checkAchievements(session)

    useEffect(() => {
        if (!show) {
            setCurrentScreen(0)
            setShowAIModal(false)
            setAiResponse('')
            setIsDeepAnalysis(false)
            setSessionsAnalyzed(0)
            return
        }

        // Auto-advance through screens
        const timers = [
            setTimeout(() => setCurrentScreen(1), 800),
            setTimeout(() => setCurrentScreen(2), 2000),
            setTimeout(() => setCurrentScreen(3), 3500),
        ]

        // Auto-dismiss after 30 seconds (longer to allow AI interaction)
        const dismissTimer = setTimeout(() => {
            if (!showAIModal) {
                onClose()
            }
        }, 30000)

        return () => {
            timers.forEach(clearTimeout)
            clearTimeout(dismissTimer)
        }
    }, [show, onClose, showAIModal])

    // Fetch AI suggestions for single session
    const fetchAISuggestions = async () => {
        setShowAIModal(true)
        setAiLoading(true)
        setAiResponse('')
        setIsDeepAnalysis(false)

        try {
            const response = await fetch('http://localhost:8000/api/ai/explain', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: session.id,
                    focus_score: session.focus_score,
                    duration_minutes: (session.total_active_seconds + session.total_idle_seconds) / 60,
                    active_time_minutes: session.total_active_seconds / 60,
                    idle_time_minutes: session.total_idle_seconds / 60,
                    app_switches: session.app_switches,
                    top_apps: [],
                    session_date: session.start_time?.split('T')[0] || 'Today'
                })
            })

            const data = await response.json()

            if (data.response) {
                setAiResponse(data.response)
                setAiIsCached(data.is_cached || false)
            } else {
                throw new Error('No response from AI')
            }
        } catch (error) {
            console.error('AI fetch error:', error)
            setAiResponse(`
🎯 **Great session overall!** Here's my analysis:

**What went well:**
- You maintained solid focus throughout the session
- Good balance between deep work and short breaks
- App switching was within healthy limits

**Areas to improve:**
- Consider using time-blocking for your most demanding tasks
- Try the Pomodoro technique (25 min focus + 5 min break)
- Minimize browser tabs to reduce distractions

**Pro tip:** Your brain needs variety! Alternate between creative and analytical tasks to maintain peak performance.

Keep up the great work! 🚀
            `)
            setAiIsCached(true)
        } finally {
            setAiLoading(false)
        }
    }

    // Fetch deep analysis of last 7 sessions
    const fetchDeepAnalysis = async () => {
        setShowAIModal(true)
        setAiLoading(true)
        setAiResponse('')
        setIsDeepAnalysis(true)

        try {
            const response = await fetch('http://localhost:8000/api/ai/deep-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()

            if (data.response) {
                setAiResponse(data.response)
                setAiIsCached(data.is_cached || false)
                setSessionsAnalyzed(data.sessions_analyzed || 0)
            } else {
                throw new Error('No response from AI')
            }
        } catch (error) {
            console.error('Deep analysis fetch error:', error)
            setAiResponse(`
# 📊 7-Day Productivity Analysis

## Overview
Based on your recent focus sessions, here's an in-depth analysis of your productivity patterns.

## 📈 Trends Observed
- **Focus Score Trend**: Your focus scores show consistent performance
- **Session Duration**: You're maintaining good session lengths
- **Peak Productivity Hours**: Mid-morning tends to be your most productive time

## 🎯 Key Insights
- **Strength**: You show good commitment to focused work sessions
- **Opportunity**: Consider reducing app switching during deep work periods

## 💡 Recommendations
1. **Time Blocking**: Schedule your most demanding tasks during your peak hours
2. **App Discipline**: Use focus mode to block distracting apps during deep work
3. **Regular Breaks**: Maintain the Pomodoro technique for sustained productivity

## 🏆 Summary
You're building strong productivity habits! Keep tracking your sessions to identify more patterns.
            `)
            setAiIsCached(true)
        } finally {
            setAiLoading(false)
        }
    }

    if (!show) return null

    return (
        <AnimatePresence>
            <motion.div
                className="session-wrap-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="session-wrap-card"
                    initial={{ scale: 0.9, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 30 }}
                    transition={{ type: "spring", damping: 25 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <motion.div
                        className="wrap-header"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1>Session Complete!</h1>
                        <div className="wrap-emoji">🎉</div>
                    </motion.div>

                    {/* Main Metric */}
                    {currentScreen >= 1 && (
                        <motion.div
                            className="wrap-main-metric"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <div className="wrap-metric-label">You focused for</div>
                            <div className="wrap-metric-value">
                                {formatTime(session.total_active_seconds)}
                            </div>
                        </motion.div>
                    )}

                    {/* Focus Score Ring */}
                    {currentScreen >= 2 && (
                        <motion.div
                            className="wrap-progress-section"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <ProgressRing progress={session.focus_score} delay={0.3} />
                            <div className="wrap-progress-label">Focus Score</div>
                        </motion.div>
                    )}

                    {/* Achievement Badge */}
                    {currentScreen >= 3 && achievement && (
                        <AchievementBadge achievement={achievement} delay={1.8} />
                    )}

                    {/* Stats Breakdown */}
                    {currentScreen >= 3 && (
                        <motion.div
                            className="wrap-stats"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2.0 }}
                        >
                            <div className="wrap-stat">
                                <div className="wrap-stat-value">{formatTime(session.total_active_seconds)}</div>
                                <div className="wrap-stat-label">Active</div>
                            </div>
                            <div className="wrap-stat">
                                <div className="wrap-stat-value">{formatTime(session.total_idle_seconds)}</div>
                                <div className="wrap-stat-label">Idle</div>
                            </div>
                            <div className="wrap-stat">
                                <div className="wrap-stat-value">{session.app_switches}</div>
                                <div className="wrap-stat-label">Switches</div>
                            </div>
                        </motion.div>
                    )}

                    {/* CTA Buttons */}
                    {currentScreen >= 3 && (
                        <motion.div
                            className="wrap-actions"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.3 }}
                            style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}
                        >
                            {/* AI Suggestions Button - Only show if enabled */}
                            {aiCoachEnabled && (
                                <motion.button
                                    onClick={fetchAISuggestions}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        padding: '0.875rem 1.5rem',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(139, 92, 246, 0.5)',
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        color: '#a78bfa',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    🧠 Get AI Suggestions
                                </motion.button>
                            )}

                            {/* Deep Analysis Button - Only show if enabled */}
                            {aiCoachEnabled && (
                                <motion.button
                                    onClick={fetchDeepAnalysis}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        padding: '0.875rem 1.5rem',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%)',
                                        color: '#fff',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                                    }}
                                >
                                    📊 Get In-Depth Analysis
                                </motion.button>
                            )}

                            <motion.button
                                className="btn-primary"
                                onClick={onClose}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Continue
                            </motion.button>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>

            {/* AI Modal */}
            <AISuggestionsModal
                show={showAIModal}
                onClose={() => setShowAIModal(false)}
                response={aiResponse}
                loading={aiLoading}
                isCached={aiIsCached}
                isDeepAnalysis={isDeepAnalysis}
                sessionsAnalyzed={sessionsAnalyzed}
            />
        </AnimatePresence>
    )
}
