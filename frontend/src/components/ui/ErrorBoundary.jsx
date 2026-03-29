import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2 style={{ marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ marginBottom: 12, opacity: 0.8 }}>
            The page crashed unexpectedly. You can reload or go back to
            dashboard.
          </p>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={this.handleReload}>Reload</button>
            <button onClick={this.handleGoHome}>Dashboard</button>
          </div>

          <details style={{ marginTop: 16 }}>
            <summary>Details</summary>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {String(this.state.error)}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
