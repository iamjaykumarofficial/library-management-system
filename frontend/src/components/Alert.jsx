function Alert({ type, message }) {
  return (
    <div className={`alert alert-${type} fade-in theme-alert`} role="alert">
      <i className={`fas fa-${getIcon(type)} me-2`}></i>
      {message}
    </div>
  )
}

function getIcon(type) {
  switch (type) {
    case 'success': return 'check-circle'
    case 'danger': return 'exclamation-triangle'
    case 'warning': return 'exclamation-circle'
    case 'info': return 'info-circle'
    default: return 'info-circle'
  }
}

export default Alert