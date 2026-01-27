import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

function Settings() {
    const { theme, toggleTheme } = useTheme()
    const [timeFormat, setTimeFormat] = useState('24h')
    const [animations, setAnimations] = useState(true)

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Preferences and configuration</p>
            </div>

            <div className="settings-section">
                <h3>Appearance</h3>

                <div className="setting-item">
                    <div className="setting-info">
                        <div className="setting-label">Dark Mode</div>
                        <div className="setting-description">
                            Switch between light and dark themes
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
                            Enable smooth transitions
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
            </div>

            <div className="settings-section">
                <h3>Data & Display</h3>

                <div className="setting-item">
                    <div className="setting-info">
                        <div className="setting-label">Time Format</div>
                        <div className="setting-description">
                            12-hour or 24-hour time display
                        </div>
                    </div>
                    <select
                        className="filter-select"
                        value={timeFormat}
                        onChange={(e) => setTimeFormat(e.target.value)}
                    >
                        <option value="12h">12-Hour</option>
                        <option value="24h">24-Hour</option>
                    </select>
                </div>
            </div>

            <div className="settings-section">
                <h3>About</h3>

                <div className="setting-item">
                    <div className="setting-info">
                        <div className="setting-label">Version</div>
                        <div className="setting-description">AttentionOS 1.0.0</div>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <div className="setting-label">Database</div>
                        <div className="setting-description">
                            miniproject/data/attentionos.db
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings
