import { Component } from 'react'
import Alert from './Alert'

class ErrorBoundary extends Component {
  state = { hasError: false, errorMessage: '' }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5">
          <Alert type="danger" message={`Something went wrong: ${this.state.errorMessage}`} />
          <p className="text-center">
            Please try refreshing the page or <a href="/">return to the homepage</a>.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary