import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SCREENS = [
    {
        id: 'welcome',
        emoji: '👋',
        title: 'Welcome to AttentionOS',
        description: 'Your personal focus coach that helps you build better productivity habits.',
        button: 'Get Started'
    },
    {
        id: 'tracking',
        emoji: '🧠',
        title: 'We Track Your Focus',
        description: 'Monitor which apps you use, how long you focus, and when you get distracted.',
        button: 'Next'
    },
    {
        id: 'insights',
        emoji: '📊',
        title: 'Get Powerful Insights',
        description: 'See your focus patterns, earn achievements, and improve your productivity over time.',
        button: 'Next'
    },
    {
        id: 'ready',
        emoji: '🚀',
        title: 'Ready to Begin?',
        description: 'Start tracking your first session and unlock your focus potential.',
        button: 'Let\'s Go!'
    }
]

export default function Onboarding({ onComplete }) {
    const [currentScreen, setCurrentScreen] = useState(0)
    const [show, setShow] = useState(false)

    useEffect(() => {
        // Check if onboarding has been completed
        const completed = localStorage.getItem('onboarding_completed')
        if (!completed) {
            setShow(true)
        }
    }, [])

    const handleNext = () => {
        if (currentScreen < SCREENS.length - 1) {
            setCurrentScreen(currentScreen + 1)
        } else {
            // Complete onboarding
            localStorage.setItem('onboarding_completed', 'true')
            setShow(false)
            if (onComplete) onComplete()
        }
    }

    const handleSkip = () => {
        localStorage.setItem('onboarding_completed', 'true')
        setShow(false)
        if (onComplete) onComplete()
    }

    if (!show) return null

    const screen = SCREENS[currentScreen]

    return (
        <AnimatePresence>
            <motion.div
                className="onboarding-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="onboarding-card"
                    initial={{ scale: 0.9, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 30 }}
                >
                    {/* Progress Dots */}
                    <div className="onboarding-progress">
                        {SCREENS.map((_, index) => (
                            <div
                                key={index}
                                className={`progress-dot ${index === currentScreen ? 'active' : ''} ${index < currentScreen ? 'completed' : ''}`}
                            />
                        ))}
                    </div>

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={screen.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="onboarding-content"
                        >
                            <div className="onboarding-emoji">{screen.emoji}</div>
                            <h2 className="onboarding-title">{screen.title}</h2>
                            <p className="onboarding-description">{screen.description}</p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Actions */}
                    <div className="onboarding-actions">
                        {currentScreen < SCREENS.length - 1 && (
                            <button
                                className="btn-secondary"
                                onClick={handleSkip}
                            >
                                Skip
                            </button>
                        )}
                        <button
                            className="btn-primary"
                            onClick={handleNext}
                        >
                            {screen.button}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
