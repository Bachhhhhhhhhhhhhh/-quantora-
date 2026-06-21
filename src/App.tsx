import { Toaster } from 'sonner'
import { LanguageProvider } from './lib/i18n/LanguageContext'
import { SimulatorProvider } from './lib/SimulatorContext'
import { DataProvider } from './lib/DataContext'
import { Navbar } from './components/layout/Navbar'
import { Hero } from './components/sections/Hero'
import { Education } from './components/sections/Education'
import { QuantTerminal } from './components/terminal/QuantTerminal'
import { SimulatorSection } from './components/sections/SimulatorSection'
import { MarketSection } from './components/sections/MarketSection'
import { StrategiesSection } from './components/sections/StrategiesSection'
import { AboutSection } from './components/sections/AboutSection'
import { GlobalCommandPalette } from './components/terminal/GlobalCommandPalette'

function App() {
  return (
    <LanguageProvider>
      <DataProvider>
        <SimulatorProvider>
          <div className="min-h-screen bg-bg-primary text-text-primary">
            <div
              role="status"
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
                background: 'linear-gradient(90deg,#22D3EE,#34D399)',
                color: '#0B1120', padding: '6px 12px', textAlign: 'center',
                fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
              }}
            >
              QUANTORA v5.0 — Dang chay | Cuon xuong de xem Terminal
            </div>
            <GlobalCommandPalette />
            <Navbar />
            <main>
              <Hero />
              <QuantTerminal />
              <Education />
              <SimulatorSection />
              <MarketSection />
              <StrategiesSection />
              <AboutSection />
            </main>
            <footer className="border-t border-white/5 py-8 text-center text-sm text-text-secondary font-mono">
              <p>© 2026 Quantora Terminal v5.0 — Institutional Quantitative Analytics Engine</p>
              <p className="text-xs mt-1 text-text-secondary/60">Built by Truong The Bach · Client-side · Zero backend</p>
            </footer>
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#111827',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#F8FAFC',
                  fontFamily: 'monospace',
                },
              }}
            />
          </div>
        </SimulatorProvider>
      </DataProvider>
    </LanguageProvider>
  )
}

export default App