import { motion } from 'framer-motion'
import { ACHIEVEMENTS, getAllUnlockedAchievements } from '../utils/achievements'

export default function AchievementShelf({ sessions }) {
    const unlockedAchievements = getAllUnlockedAchievements(sessions)
    const totalAchievements = ACHIEVEMENTS.length
    const progress = (unlockedAchievements.length / totalAchievements) * 100

    return (
        <motion.div
            className="achievement-shelf"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="achievement-header">
                <div>
                    <h3 className="achievement-title">Achievements</h3>
                    <p className="achievement-subtitle">
                        {unlockedAchievements.length} of {totalAchievements} unlocked
                    </p>
                </div>
                <div className="achievement-progress">
                    <div className="progress-circle">
                        <svg width="60" height="60">
                            <circle
                                cx="30"
                                cy="30"
                                r="26"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="4"
                                fill="none"
                            />
                            <motion.circle
                                cx="30"
                                cy="30"
                                r="26"
                                stroke="#6366f1"
                                strokeWidth="4"
                                fill="none"
                                strokeLinecap="round"
                                initial={{ strokeDashoffset: 163 }}
                                animate={{ strokeDashoffset: 163 - (163 * progress) / 100 }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                style={{
                                    strokeDasharray: 163,
                                    transform: 'rotate(-90deg)',
                                    transformOrigin: '50% 50%'
                                }}
                            />
                            <text
                                x="30"
                                y="35"
                                textAnchor="middle"
                                fontSize="14"
                                fontWeight="700"
                                fill="white"
                            >
                                {Math.round(progress)}%
                            </text>
                        </svg>
                    </div>
                </div>
            </div>

            <div className="achievement-grid">
                {ACHIEVEMENTS.map((achievement, index) => {
                    const isUnlocked = unlockedAchievements.some(a => a.id === achievement.id)

                    return (
                        <motion.div
                            key={achievement.id}
                            className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            whileHover={{ scale: isUnlocked ? 1.05 : 1, transition: { duration: 0.2 } }}
                        >
                            <div className="achievement-badge-large">{achievement.badge}</div>
                            <div className="achievement-info">
                                <div className="achievement-name">{achievement.name}</div>
                                <div className="achievement-desc">{achievement.description}</div>
                            </div>
                            {isUnlocked && (
                                <div className="achievement-checkmark">✓</div>
                            )}
                        </motion.div>
                    )
                })}
            </div>
        </motion.div>
    )
}
