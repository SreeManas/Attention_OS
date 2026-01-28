import { motion } from 'framer-motion'

// Focus DNA Helix - Visual representation of focus patterns over time
export default function FocusDNA({ sessions }) {
    if (!sessions || sessions.length === 0) return null

    // Take last 14 days of sessions
    const recentSessions = sessions.slice(0, 14)

    // Group by day and calculate daily averages
    const dailyData = {}
    recentSessions.forEach(session => {
        const dateObj = new Date(session.start_time)
        const dateKey = dateObj.toISOString().split('T')[0] // Use ISO date as key
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = { focusScores: [], activeTimes: [], switches: [] }
        }
        dailyData[dateKey].focusScores.push(session.focus_score)
        dailyData[dateKey].activeTimes.push(session.total_active_seconds)
        dailyData[dateKey].switches.push(session.app_switches)
    })

    const dnaStrands = Object.entries(dailyData).slice(0, 7).reverse().map(([dateKey, data]) => {
        const avgFocus = data.focusScores.reduce((a, b) => a + b, 0) / data.focusScores.length
        const avgActive = data.activeTimes.reduce((a, b) => a + b, 0) / data.activeTimes.length
        const avgSwitches = data.switches.reduce((a, b) => a + b, 0) / data.switches.length

        // Reconstruct date from the ISO date key
        const dateObj = new Date(dateKey + 'T12:00:00') // Add time to avoid timezone issues

        return {
            date: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
            fullDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            focus: Math.round(avgFocus),
            active: Math.round(avgActive / 60), // minutes
            switches: Math.round(avgSwitches),
            height: avgFocus, // Use for visual height
            // Apple aesthetic - use purple/indigo gradient for all states
            color: avgFocus >= 80 ? '#8b5cf6' : avgFocus >= 60 ? '#a78bfa' : '#c4b5fd'
        }
    })


    const maxHeight = Math.max(...dnaStrands.map(d => d.height), 1) // Ensure at least 1

    return (
        <motion.div
            className="focus-dna-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="focus-dna-header">
                <div className="dna-eyebrow">Your Focus Genome</div>
                <h3 className="dna-title">Focus DNA</h3>
                <p className="dna-subtitle">Visual sequencing of your productivity patterns</p>
            </div>

            <div className="dna-visualization">
                <div className="dna-strands">
                    {dnaStrands.map((strand, index) => {
                        // Calculate heights in pixels (max 200px)
                        const focusHeight = Math.max((strand.height / 100) * 200, 20) // Min 20px
                        const activityHeight = Math.max((strand.active / 120) * 150, 15) // Min 15px

                        return (
                            <motion.div
                                key={strand.date + index}
                                className="dna-strand-group"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                            >
                                {/* DNA Helix representation */}
                                <div className="dna-helix">
                                    {/* Top strand - Focus */}
                                    <motion.div
                                        className="dna-strand dna-strand-focus"
                                        style={{
                                            height: `${focusHeight}px`,
                                            background: `linear-gradient(180deg, ${strand.color}, ${strand.color}aa)`
                                        }}
                                        initial={{ scaleY: 0 }}
                                        animate={{ scaleY: 1 }}
                                        transition={{ delay: index * 0.1 + 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                    />

                                    {/* Bottom strand - Activity */}
                                    <motion.div
                                        className="dna-strand dna-strand-activity"
                                        style={{
                                            height: `${activityHeight}px`,
                                            background: 'linear-gradient(180deg, #8b5cf6, #8b5cf6aa)'
                                        }}
                                        initial={{ scaleY: 0 }}
                                        animate={{ scaleY: 1 }}
                                        transition={{ delay: index * 0.1 + 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                    />
                                </div>

                                {/* Connection line */}
                                {index < dnaStrands.length - 1 && (
                                    <div className="dna-connector" />
                                )}

                                {/* Labels */}
                                <div className="dna-label">
                                    <div className="dna-day">{strand.date}</div>
                                    <div className="dna-score">{strand.focus}%</div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Legend */}
                <div className="dna-legend">
                    <div className="dna-legend-item">
                        <div className="dna-legend-dot" style={{ background: '#8b5cf6' }} />
                        <span>High Focus (80%+)</span>
                    </div>
                    <div className="dna-legend-item">
                        <div className="dna-legend-dot" style={{ background: '#a78bfa' }} />
                        <span>Medium Focus (60-79%)</span>
                    </div>
                    <div className="dna-legend-item">
                        <div className="dna-legend-dot" style={{ background: '#c4b5fd' }} />
                        <span>Low Focus (&lt;60%)</span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
