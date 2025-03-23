import { Component } from "react";
import PropTypes from "prop-types";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback ? (
        this.props.fallback(this.state.error, this.state.errorInfo)
      ) : (
        <div className="error-boundary p-4 m-4 border border-red-500 rounded bg-red-50">
          <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong.</h2>
          <p className="text-gray-700 mb-2">
            The application encountered an error. Please try refreshing the page or contact support if the issue
            persists.
          </p>
          {this.props.showDetails && (
            <details className="mt-2 p-2 border border-gray-300 rounded bg-white">
              <summary className="cursor-pointer text-blue-600">Error Details</summary>
              <p className="mt-2 text-red-600">{this.state.error && this.state.error.toString()}</p>
              {this.state.errorInfo && (
                <pre className="mt-2 p-2 overflow-auto text-sm bg-gray-100 border border-gray-300 rounded">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
  showDetails: PropTypes.bool,
};

ErrorBoundary.defaultProps = {
  showDetails: process.env.NODE_ENV !== "production",
};

export default ErrorBoundary;