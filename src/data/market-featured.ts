export type MarketCategory = 'all' | 'us' | 'vn' | 'crypto' | 'etf'

export interface FeaturedTicker {
  symbol: string
  name: string
  nameVi: string
  category: Exclude<MarketCategory, 'all'>
  color: string
  flag?: string
}

export const FEATURED_TICKERS: FeaturedTicker[] = [
  { symbol: 'NVDA', name: 'NVIDIA', nameVi: 'NVIDIA', category: 'us', color: '#76B900', flag: '🇺🇸' },
  { symbol: 'AAPL', name: 'Apple', nameVi: 'Apple', category: 'us', color: '#A2AAAD', flag: '🇺🇸' },
  { symbol: 'MSFT', name: 'Microsoft', nameVi: 'Microsoft', category: 'us', color: '#00A4EF', flag: '🇺🇸' },
  { symbol: 'GOOGL', name: 'Alphabet', nameVi: 'Alphabet', category: 'us', color: '#4285F4', flag: '🇺🇸' },
  { symbol: 'TSLA', name: 'Tesla', nameVi: 'Tesla', category: 'us', color: '#E82127', flag: '🇺🇸' },
  { symbol: 'META', name: 'Meta', nameVi: 'Meta', category: 'us', color: '#0668E1', flag: '🇺🇸' },
  { symbol: 'AMD', name: 'AMD', nameVi: 'AMD', category: 'us', color: '#ED1C24', flag: '🇺🇸' },
  { symbol: 'JPM', name: 'JPMorgan', nameVi: 'JPMorgan', category: 'us', color: '#006747', flag: '🇺🇸' },
  { symbol: 'VNM.VN', name: 'Vinamilk', nameVi: 'Vinamilk', category: 'vn', color: '#1E88E5', flag: '🇻🇳' },
  { symbol: 'HPG.VN', name: 'Hoa Phat Group', nameVi: 'Hòa Phát', category: 'vn', color: '#FF6F00', flag: '🇻🇳' },
  { symbol: 'FPT.VN', name: 'FPT Corporation', nameVi: 'FPT', category: 'vn', color: '#F57C00', flag: '🇻🇳' },
  { symbol: 'VCB.VN', name: 'Vietcombank', nameVi: 'Vietcombank', category: 'vn', color: '#00897B', flag: '🇻🇳' },
  { symbol: 'VIC.VN', name: 'Vingroup', nameVi: 'Vingroup', category: 'vn', color: '#1565C0', flag: '🇻🇳' },
  { symbol: 'MWG.VN', name: 'Mobile World', nameVi: 'Thế Giới Di Động', category: 'vn', color: '#D32F2F', flag: '🇻🇳' },
  { symbol: 'SSI.VN', name: 'SSI Securities', nameVi: 'SSI', category: 'vn', color: '#7B1FA2', flag: '🇻🇳' },
  { symbol: 'TCB.VN', name: 'Techcombank', nameVi: 'Techcombank', category: 'vn', color: '#C62828', flag: '🇻🇳' },
  { symbol: 'VHM.VN', name: 'Vinhomes', nameVi: 'Vinhomes', category: 'vn', color: '#283593', flag: '🇻🇳' },
  { symbol: 'PLX.VN', name: 'Petrolimex', nameVi: 'Petrolimex', category: 'vn', color: '#F9A825', flag: '🇻🇳' },
  { symbol: 'BTC-USD', name: 'Bitcoin', nameVi: 'Bitcoin', category: 'crypto', color: '#F7931A', flag: '₿' },
  { symbol: 'ETH-USD', name: 'Ethereum', nameVi: 'Ethereum', category: 'crypto', color: '#627EEA', flag: 'Ξ' },
  { symbol: 'SOL-USD', name: 'Solana', nameVi: 'Solana', category: 'crypto', color: '#9945FF', flag: '◎' },
  { symbol: 'SPY', name: 'S&P 500 ETF', nameVi: 'SPY ETF', category: 'etf', color: '#22D3EE', flag: '🇺🇸' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', nameVi: 'QQQ ETF', category: 'etf', color: '#34D399', flag: '🇺🇸' },
  { symbol: 'VOO', name: 'Vanguard S&P 500', nameVi: 'VOO ETF', category: 'etf', color: '#A78BFA', flag: '🇺🇸' },
  { symbol: 'AMZN', name: 'Amazon', nameVi: 'Amazon', category: 'us', color: '#FF9900', flag: '🇺🇸' },
  { symbol: 'NFLX', name: 'Netflix', nameVi: 'Netflix', category: 'us', color: '#E50914', flag: '🇺🇸' },
  { symbol: 'AVGO', name: 'Broadcom', nameVi: 'Broadcom', category: 'us', color: '#CC092F', flag: '🇺🇸' },
  { symbol: 'COIN', name: 'Coinbase', nameVi: 'Coinbase', category: 'us', color: '#0052FF', flag: '🇺🇸' },
  { symbol: 'BID.VN', name: 'BIDV', nameVi: 'BIDV', category: 'vn', color: '#00695C', flag: '🇻🇳' },
  { symbol: 'CTG.VN', name: 'VietinBank', nameVi: 'VietinBank', category: 'vn', color: '#0277BD', flag: '🇻🇳' },
  { symbol: 'MBB.VN', name: 'MB Bank', nameVi: 'MB Bank', category: 'vn', color: '#1565C0', flag: '🇻🇳' },
  { symbol: 'GAS.VN', name: 'PV Gas', nameVi: 'PV Gas', category: 'vn', color: '#EF6C00', flag: '🇻🇳' },
  { symbol: 'REE.VN', name: 'REE', nameVi: 'REE', category: 'vn', color: '#5C6BC0', flag: '🇻🇳' },
  { symbol: 'DXG.VN', name: 'Dat Xanh', nameVi: 'Đất Xanh', category: 'vn', color: '#43A047', flag: '🇻🇳' },
  { symbol: 'PNJ.VN', name: 'PNJ', nameVi: 'PNJ', category: 'vn', color: '#8E24AA', flag: '🇻🇳' },
  { symbol: 'VNINDEX.VN', name: 'VN-Index', nameVi: 'VN-Index', category: 'vn', color: '#22D3EE', flag: '🇻🇳' },
  { symbol: 'IWM', name: 'Russell 2000 ETF', nameVi: 'IWM ETF', category: 'etf', color: '#FBBF24', flag: '🇺🇸' },
  { symbol: 'GLD', name: 'Gold ETF', nameVi: 'Vàng ETF', category: 'etf', color: '#FFD700', flag: '🥇' },
]

export function getFeaturedTicker(symbol: string): FeaturedTicker | undefined {
  return FEATURED_TICKERS.find((t) => t.symbol === symbol)
}