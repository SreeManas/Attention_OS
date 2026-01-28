import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

function Settings() {
    const { theme, toggleTheme } = useTheme()
    const [animations, setAnimations] = useState(true)

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <motion.div
                className="page-header"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="page-eyebrow">Preferences</div>
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Customize your experience</p>
            </motion.div>

            <motion.div
                className="settings-section"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <h3>Appearance</h3>

                <div className="setting-item">
                    <div className="setting-info">
                        <div className="setting-label">Dark Mode</div>
                        <div className="setting-description">
                            Toggle between light and dark themes
                        </div>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={theme === 'dark'}
                            onChange={toggleTheme}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <div className="setting-label">Animations</div>
                        <div className="setting-description">
                            Enable smooth transitions and effects
                        </div>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={animations}
                            onChange={(e) => setAnimations(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </motion.div>

            <motion.div
                className="settings-section"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <h3>About</h3>

                <div className="setting-item">
                    <div className="setting-info">
                        <div className="setting-label">AttentionOS</div>
                        <div className="setting-description">
                            Version 2.0.0 — Premium Edition
                        </div>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <div className="setting-label">Database</div>
                        <div className="setting-description">
                            All data stored locally on your device
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="settings-section"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent)' }}
            >
                <h3 style={{ color: 'var(--color-accent)' }}>Your Privacy</h3>

                <div className="setting-item" style={{ borderBottom: 'none' }}>
                    <div className="setting-info">
                        <div className="setting-label">🔒 100% Local</div>
                        <div className="setting-description">
                            AttentionOS runs entirely on your machine. No data leaves your device.
                            No cloud. No tracking. No ads. Just you and your focus.
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default Settings
