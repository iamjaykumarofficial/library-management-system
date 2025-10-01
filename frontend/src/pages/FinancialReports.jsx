import { useState, useEffect, useRef } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import Alert from '../components/Alert'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

function FinancialReports() {
  const [reports, setReports] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const chartRef = useRef(null)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Please log in to view financial reports')
          setLoading(false)
          return
        }

        const response = await fetch('http://localhost:5000/api/financial-reports', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        const data = await response.json()
        
        if (response.ok) {
          setReports(data)
        } else {
          setError(data.error || `Failed to load financial reports (Status: ${response.status})`)
        }
      } catch (err) {
        console.error('Financial reports fetch error:', err)
        setError('An error occurred while fetching reports. Please check if the server is running.')
      } finally {
        setLoading(false)
      }
    }
    fetchReports()

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [])

  // Chart data configuration
  const chartData = {
    labels: reports.map(report => report.month),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: reports.map(report => report.revenue || 0),
        backgroundColor: '#007bff',
        borderColor: '#007bff',
        borderWidth: 1,
      },
      {
        label: 'Fines Collected (₹)',
        data: reports.map(report => report.fines || 0),
        backgroundColor: '#dc3545',
        borderColor: '#dc3545',
        borderWidth: 1,
      },
      {
        label: 'Membership Fees (₹)',
        data: reports.map(report => report.membership || 0),
        backgroundColor: '#28a745',
        borderColor: '#28a745',
        borderWidth: 1,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Amount (₹)'
        },
        beginAtZero: true,
        ticks: {
          callback: value => `₹${value.toLocaleString('en-IN')}`
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue Breakdown by Month'
      }
    }
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading financial reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5 fade-in">
      <h1 className="fw-bold mb-4">Financial Reports</h1>
      <p className="lead text-muted mb-4">View detailed financial performance</p>

      {error && <Alert type="danger" message={error} />}
      
      {reports.length === 0 && !error ? (
        <Alert type="info" message="No financial data available" />
      ) : (
        <>
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">
                <i className="fas fa-table me-2 text-primary"></i>
                Financial Performance
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped table-bordered table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Month</th>
                      <th>Revenue (₹)</th>
                      <th>Fines Collected (₹)</th>
                      <th>Membership Fees (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report, index) => (
                      <tr key={index}>
                        <td>{report.month}</td>
                        <td>₹{(report.revenue || 0).toLocaleString('en-IN')}</td>
                        <td>₹{(report.fines || 0).toLocaleString('en-IN')}</td>
                        <td>₹{(report.membership || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {reports.length > 0 && (
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="card-title mb-0">
                  <i className="fas fa-chart-bar me-2 text-success"></i>
                  Revenue Breakdown
                </h5>
              </div>
              <div className="card-body">
                <div style={{ height: '400px' }}>
                  <Bar 
                    data={chartData} 
                    options={chartOptions}
                    ref={chartRef}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default FinancialReports