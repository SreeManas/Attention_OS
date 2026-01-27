function StatCard({ label, value, icon, isHero = false }) {
    return (
        <div className={`stat-card ${isHero ? 'hero' : ''}`}>
            {icon && <div className="stat-icon">{icon}</div>}
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
        </div>
    )
}

export default StatCard
