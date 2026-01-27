import { NavLink } from 'react-router-dom'

function Sidebar() {
    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <span>🧠</span>
                <span>AttentionOS</span>
            </div>
            <nav>
                <ul className="sidebar-nav">
                    <li>
                        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="nav-icon">📊</span>
                            <span>Dashboard</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/timeline" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="nav-icon">🕒</span>
                            <span>Timeline</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/sessions" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="nav-icon">📋</span>
                            <span>Sessions</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/analytics" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="nav-icon">📈</span>
                            <span>Analytics</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="nav-icon">⚙️</span>
                            <span>Settings</span>
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export default Sidebar
