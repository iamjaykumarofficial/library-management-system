import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from '../components/Table'
import Alert from '../components/Alert'

function UserStatistics() {
  const [stats, setStats] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Please log in to view user statistics')
          setTimeout(() => navigate('/login'), 2000)
          return
        }
        const response = await fetch('http://localhost:5000/api/user-statistics', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (response.ok) {
          setStats(data)
        } else {
          setError(data.error || 'Failed to load user statistics')
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('An error occurred. Please try again.')
      }
    }
    fetchStats()
  }, [navigate])

  const headers = ['Metric', 'Value']
  const rows = stats.map(stat => [stat.metric, stat.value])

  return (
    <div className="container py-5">
      <h1 className="mb-4">User Statistics</h1>
      <p>View membership statistics</p>
      {error && <Alert type="danger" message={error} />}
      {stats.length === 0 && !error && (
        <Alert type="info" message="No user statistics available." />
      )}
      {stats.length > 0 && <Table headers={headers} rows={rows} />}
    </div>
  )
}

export default UserStatistics