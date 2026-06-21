import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Quantora render error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', background: '#0B1120', color: '#F8FAFC',
          padding: 32, fontFamily: 'monospace',
        }}>
          <h1 style={{ color: '#F87171', marginBottom: 16 }}>Quantora — Lỗi khởi động</h1>
          <p style={{ color: '#94A3B8', marginBottom: 12 }}>Ứng dụng gặp lỗi JavaScript. Chi tiết:</p>
          <pre style={{
            background: '#111827', padding: 16, borderRadius: 8,
            border: '1px solid rgba(248,113,113,0.3)', overflow: 'auto',
            color: '#F87171', fontSize: 13,
          }}>
            {this.state.error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 20, padding: '10px 20px', background: '#22D3EE',
              color: '#0B1120', border: 'none', borderRadius: 8,
              fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Tải lại trang
          </button>
        </div>
      )
    }
    return this.props.children
  }
}