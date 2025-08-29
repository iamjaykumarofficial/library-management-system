function Card({ title, value, label, change, changeClass }) {
  return (
    <div className="card text-center shadow-sm">
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <h2 className="card-subtitle mb-2 text-muted">{value}</h2>
        <p className="card-text">{label}</p>
        {change && <p className={`card-text ${changeClass}`}>{change}</p>}
      </div>
    </div>
  )
}

export default Card