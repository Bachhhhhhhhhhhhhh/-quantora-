import './lib/bootstrap'
import { createRoot } from 'react-dom/client'
import { showFatalError } from './lib/bootstrap'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

async function boot(mount: HTMLElement) {
  try {
    const [{ default: App }, { ErrorBoundary }] = await Promise.all([
      import('./App.tsx'),
      import('./components/ui/ErrorBoundary.tsx'),
    ])
    createRoot(mount).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>,
    )
  } catch (err) {
    console.error('Quantora boot failed:', err)
    showFatalError(mount, err)
  }
}

boot(root)