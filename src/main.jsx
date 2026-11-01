import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ToastProvider } from './components/common/Toast';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Cineverse Runtime Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#07070b', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff1a53', marginBottom: '12px' }}>CINEVERSE</h1>
          <p style={{ fontSize: '14px', color: '#a1a1aa', maxWidth: '420px', marginBottom: '24px', lineHeight: '1.6' }}>
            A temporary display error occurred. Tap below to reset and reload the platform smoothly.
          </p>
          <button
            onClick={() => {
              sessionStorage.clear();
              window.location.reload();
            }}
            style={{
              padding: '12px 28px',
              borderRadius: '9999px',
              background: 'linear-gradient(to right, #ff1a53, #a855f7)',
              color: '#fff',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 0 20px rgba(255, 26, 83, 0.4)'
            }}
          >
            Reload CINEVERSE
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
