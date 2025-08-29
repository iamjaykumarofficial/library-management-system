function Alert({ type, message }) {
  return (
    <div className={`alert alert-${type}`} role="alert">
      {message}
    </div>
  )
}

export default Alert;