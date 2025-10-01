import { useState } from 'react'

function Alert({ type, message, onClose }) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  const handleClose = () => {
    setVisible(false)
    if (onClose) onClose()
  }

  const alertClasses = {
    success: 'alert alert-success alert-dismissible fade show',
    danger: 'alert alert-danger alert-dismissible fade show',
    warning: 'alert alert-warning alert-dismissible fade show',
    info: 'alert alert-info alert-dismissible fade show'
  }

  return (
    <div className={alertClasses[type] || alertClasses.info} role="alert">
      <strong>{type === 'success' ? 'Success!' : type === 'danger' ? 'Error!' : 'Notice!'}</strong> {message}
      <button 
        type="button" 
        className="btn-close" 
        onClick={handleClose}
        aria-label="Close"
      ></button>
    </div>
  )
}

export default Alert