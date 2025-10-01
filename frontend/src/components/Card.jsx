function Card({ title, value, label, icon, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-primary text-white',
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    info: 'bg-info text-white',
    secondary: 'bg-secondary text-white'
  }

  return (
    <div className="card dashboard-card h-100">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h6 className="card-subtitle text-muted mb-1">{title}</h6>
            <h2 className="card-title fw-bold display-6">{value}</h2>
          </div>
          <div className={`rounded-circle p-3 ${colorClasses[color]}`}>
            <i className={`${icon} fa-lg`}></i>
          </div>
        </div>
        <p className="card-text text-muted mt-auto">{label}</p>
      </div>
    </div>
  )
}

export default Card