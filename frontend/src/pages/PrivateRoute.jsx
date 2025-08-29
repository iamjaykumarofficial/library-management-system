import { Navigate } from 'react-router-dom'
import jwtDecode from 'jwt-decode'

function PrivateRoute({  roles }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" />
  }
  try {
    const user = jwtDecode(token)
    if (roles && !roles.includes(user.role)) {
      return <Navigate to="/" />
    }
    return <Component />
  // eslint-disable-next-line no-unused-vars
  } catch (err) {
    localStorage.removeItem('token')
    return <Navigate to="/login" />
  }
}

export default PrivateRoute