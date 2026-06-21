/** Polyfills for older browsers */
if (typeof AbortSignal !== 'undefined' && !('timeout' in AbortSignal)) {
  Object.assign(AbortSignal, {
    timeout: (ms: number) => {
      const ctrl = new AbortController()
      setTimeout(() => ctrl.abort(), ms)
      return ctrl.signal
    },
  })
}

export function safeStorageGet(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

export function safeStorageSet(key: string, value: string): void {
  try { localStorage.setItem(key, value) } catch { /* private mode */ }
}

export function showFatalError(root: HTMLElement, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err)
  root.innerHTML = `
    <div style="min-height:100vh;background:#0B1120;color:#F8FAFC;padding:32px;font-family:monospace;">
      <h1 style="color:#F87171;">Quantora - Loi khoi dong</h1>
      <p style="color:#94A3B8;">Ung dung khong tai duoc. Chi tiet:</p>
      <pre style="background:#111827;padding:16px;border-radius:8px;color:#F87171;overflow:auto;">${msg}</pre>
      <p style="color:#94A3B8;margin-top:16px;">Thu: Ctrl+Shift+R hoac mo http://localhost:3000/ok.html</p>
    </div>`
}