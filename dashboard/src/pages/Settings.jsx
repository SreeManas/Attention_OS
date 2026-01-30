import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

function Settings() {
    const { theme, toggleTheme } = useTheme()
    const [animations, setAnimations] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [message, setMessage] = useState(null)

    const generateDemoData = async () => {
        setGenerating(true)
        setMessage(null)

        try {
            const response = await fetch('http://localhost:8000/api/dev/generate-demo-data', {
                method: 'POST'
            })
            const data = await response.json()

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: `✅ Generated ${data.data.sessions} sessions, ${data.data.activity_logs} events`
                })
            } else {
                setMessage({
                    type: 'error',
                    text: `❌ Error: ${data.detail || 'Unknown error'}`
                })
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: `❌ Failed to connect to server: ${error.message}`
            })
        } finally {
            setGenerating(false)
        }
    }

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

            {/* Developer Tools Section */}
            <motion.div
                className="settings-section"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                style={{
                    background: 'rgba(251, 191, 36, 0.05)',
                    borderColor: 'rgba(251, 191, 36, 0.3)'
                }}
            >
                <h3 style={{ color: '#fbbf24' }}>🛠 Developer Tools</h3>

                <div className="setting-item">
                    <div className="setting-info">
                        <div className="setting-label">Generate Demo Data</div>
                        <div className="setting-description">
                            Create 25-45 fake focus sessions over the last 7 days for testing.
                            This will replace all existing data.
                        </div>
                    </div>
                    <motion.button
                        onClick={generateDemoData}
                        disabled={generating}
                        whileHover={{ scale: generating ? 1 : 1.02 }}
                        whileTap={{ scale: generating ? 1 : 0.98 }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: generating
                                ? 'rgba(139, 92, 246, 0.3)'
                                : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: generating ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            minWidth: '180px',
                            justifyContent: 'center',
                            boxShadow: generating ? 'none' : '0 4px 15px rgba(139, 92, 246, 0.3)'
                        }}
                    >
                        {generating ? (
                            <>
                                <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    style={{ display: 'inline-block' }}
                                >
                                    ⏳
                                </motion.span>
                                Generating...
                            </>
                        ) : (
                            <>🎲 Generate Data</>
                        )}
                    </motion.button>
                </div>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            background: message.type === 'success'
                                ? 'rgba(34, 197, 94, 0.1)'
                                : 'rgba(239, 68, 68, 0.1)',
                            border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                            color: message.type === 'success' ? '#22c55e' : '#ef4444',
                            fontSize: '0.875rem',
                            marginTop: '0.5rem'
                        }}
                    >
                        {message.text}
                    </motion.div>
                )}
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
