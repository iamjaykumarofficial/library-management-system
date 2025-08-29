function UtilizationBar({ percentage, className }) {
  return (
    <div className="progress">
      <div
        className={`progress-bar ${className}`}
        role="progressbar"
        style={{ width: `${percentage}%` }}
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        {percentage}%
      </div>
    </div>
  )
}

export default UtilizationBar