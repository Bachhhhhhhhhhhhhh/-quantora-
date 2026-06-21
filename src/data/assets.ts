import type { AssetInfo } from '../types'

export const ASSETS: AssetInfo[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', color: '#A2AAAD' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', color: '#E82127' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'stock', color: '#76B900' },
  { symbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto', color: '#F7931A', coingeckoId: 'bitcoin' },
  { symbol: 'ETH-USD', name: 'Ethereum', type: 'crypto', color: '#627EEA', coingeckoId: 'ethereum' },
  { symbol: 'SOL-USD', name: 'Solana', type: 'crypto', color: '#9945FF', coingeckoId: 'solana' },
  { symbol: 'MSFT', name: 'Microsoft', type: 'stock', color: '#00A4EF' },
  { symbol: 'GOOGL', name: 'Alphabet', type: 'stock', color: '#4285F4' },
  { symbol: 'AMZN', name: 'Amazon', type: 'stock', color: '#FF9900' },
  { symbol: 'META', name: 'Meta Platforms', type: 'stock', color: '#0668E1' },
]

export const BACKTEST_ASSETS = ASSETS.filter(
  (a) => ['AAPL', 'TSLA', 'NVDA', 'BTC-USD'].includes(a.symbol)
)

export function getAsset(symbol: string): AssetInfo | undefined {
  return ASSETS.find((a) => a.symbol === symbol)
}