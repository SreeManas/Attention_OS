function LoadingSkeleton({ type = 'card' }) {
    if (type === 'card') {
        return (
            <div className="stat-card">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
            </div>
        )
    }

    if (type === 'table') {
        return (
            <div className="table-container">
                <div className="skeleton skeleton-title" style={{ margin: '1rem' }}></div>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="skeleton skeleton-text" style={{ margin: '1rem', height: '3rem' }}></div>
                ))}
            </div>
        )
    }

    return (
        <div className="loading">
            <div className="loading-spinner"></div>
            <div>Loading...</div>
        </div>
    )
}

export default LoadingSkeleton
