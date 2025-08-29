import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from '../components/Table'
import Alert from '../components/Alert'

function SubjectWiseInventory() {
  const [inventory, setInventory] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Please log in to view inventory')
          setTimeout(() => navigate('/login'), 2000)
          return
        }
        const response = await fetch('http://localhost:5000/api/subject-wise-inventory', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (response.ok) {
          setInventory(data)
        } else {
          setError(data.error || 'Failed to load inventory')
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('An error occurred. Please try again.')
      }
    }
    fetchInventory()
  }, [navigate])

  const headers = ['Subject', 'Total Books', 'Available', 'Borrowed']
  const rows = inventory.map(item => [
    item.subject,
    item.total,
    item.available,
    item.borrowed
  ])

  return (
    <div className="container py-5">
      <h1 className="mb-4">Subject-Wise Inventory</h1>
      <p>View book inventory by subject</p>
      {error && <Alert type="danger" message={error} />}
      {inventory.length === 0 && !error && (
        <Alert type="info" message="No inventory data available." />
      )}
      {inventory.length > 0 && <Table headers={headers} rows={rows} />}
    </div>
  )
}

export default SubjectWiseInventory