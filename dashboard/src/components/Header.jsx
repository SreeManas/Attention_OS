import { useTheme } from '../context/ThemeContext'

function Header() {
    const { theme, toggleTheme } = useTheme()

    return (
        <header className="header">
            <h1>AttentionOS</h1>
            <div className="header-actions">
                <button className="theme-toggle" onClick={toggleTheme}>
                    {theme === 'light' ? '🌙' : '☀️'}
                    <span style={{ fontSize: '0.875rem' }}>
                        {theme === 'light' ? 'Dark' : 'Light'}
                    </span>
                </button>
            </div>
        </header>
    )
}

export default Header
