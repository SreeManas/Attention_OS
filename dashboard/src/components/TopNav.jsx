import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

function TopNav() {
    const { theme, toggleTheme } = useTheme()

    return (
        <nav className="top-nav">
            <motion.div
                className="top-nav-inner"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="nav-logo">
                    <span>🧠</span>
                    <span>AttentionOS</span>
                </div>

                <ul className="nav-links">
                    <li>
                        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                            Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/timeline" className={({ isActive }) => isActive ? 'active' : ''}>
                            Timeline
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/sessions" className={({ isActive }) => isActive ? 'active' : ''}>
                            Sessions
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/analytics" className={({ isActive }) => isActive ? 'active' : ''}>
                            Analytics
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
                            Settings
                        </NavLink>
                    </li>
                </ul>

                <motion.button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </motion.button>
            </motion.div>
        </nav>
    )
}

export default TopNav
