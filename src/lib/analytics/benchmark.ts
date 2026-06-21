/** Benchmark mapping — accurate beta vs relevant index. */

export function getBenchmarkSymbol(symbol: string): string {
  if (symbol.endsWith('.VN') && symbol !== 'VNINDEX.VN') return 'VNINDEX.VN'
  if (symbol === 'VNINDEX.VN' || symbol === 'HNXINDEX.VN') return '^GSPC'
  const crypto = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD', 'XRP-USD']
  if (crypto.includes(symbol)) return 'BTC-USD'
  const etfs = ['SPY', 'QQQ', 'VOO', 'IWM', 'GLD']
  if (etfs.includes(symbol)) return '^GSPC'
  return 'SPY'
}

export function getBenchmarkLabel(symbol: string): string {
  const bench = getBenchmarkSymbol(symbol)
  const labels: Record<string, string> = {
    'VNINDEX.VN': 'VN-Index',
    SPY: 'S&P 500 (SPY)',
    '^GSPC': 'S&P 500',
    'BTC-USD': 'Bitcoin',
  }
  return labels[bench] ?? bench
}