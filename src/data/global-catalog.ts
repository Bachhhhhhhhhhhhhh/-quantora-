/**
 * Global stock catalog for instant fuzzy search — supplements Yahoo API.
 */

export interface GlobalEntry {
  symbol: string
  name: string
  exchange: string
  country: string
  sector: string
}

export const GLOBAL_CATALOG: GlobalEntry[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', country: 'US', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', country: 'US', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', country: 'US', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', country: 'US', sector: 'Consumer' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', country: 'US', sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', country: 'US', sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', country: 'US', sector: 'Automotive' },
  { symbol: 'BRK-B', name: 'Berkshire Hathaway', exchange: 'NYSE', country: 'US', sector: 'Financials' },
  { symbol: 'JPM', name: 'JPMorgan Chase', exchange: 'NYSE', country: 'US', sector: 'Financials' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', country: 'US', sector: 'Financials' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', country: 'US', sector: 'Healthcare' },
  { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', country: 'US', sector: 'Consumer' },
  { symbol: 'MA', name: 'Mastercard Inc.', exchange: 'NYSE', country: 'US', sector: 'Financials' },
  { symbol: 'PG', name: 'Procter & Gamble', exchange: 'NYSE', country: 'US', sector: 'Consumer' },
  { symbol: 'UNH', name: 'UnitedHealth Group', exchange: 'NYSE', country: 'US', sector: 'Healthcare' },
  { symbol: 'HD', name: 'Home Depot', exchange: 'NYSE', country: 'US', sector: 'Consumer' },
  { symbol: 'DIS', name: 'Walt Disney', exchange: 'NYSE', country: 'US', sector: 'Media' },
  { symbol: 'BAC', name: 'Bank of America', exchange: 'NYSE', country: 'US', sector: 'Financials' },
  { symbol: 'XOM', name: 'Exxon Mobil', exchange: 'NYSE', country: 'US', sector: 'Energy' },
  { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ', country: 'US', sector: 'Media' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', exchange: 'NASDAQ', country: 'US', sector: 'Technology' },
  { symbol: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ', country: 'US', sector: 'Technology' },
  { symbol: 'CRM', name: 'Salesforce Inc.', exchange: 'NYSE', country: 'US', sector: 'Technology' },
  { symbol: 'ORCL', name: 'Oracle Corporation', exchange: 'NYSE', country: 'US', sector: 'Technology' },
  { symbol: 'COST', name: 'Costco Wholesale', exchange: 'NASDAQ', country: 'US', sector: 'Consumer' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', exchange: 'NYSE', country: 'US', sector: 'ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', exchange: 'NASDAQ', country: 'US', sector: 'ETF' },
  { symbol: 'BTC-USD', name: 'Bitcoin USD', exchange: 'Crypto', country: 'Global', sector: 'Crypto' },
  { symbol: 'ETH-USD', name: 'Ethereum USD', exchange: 'Crypto', country: 'Global', sector: 'Crypto' },
  { symbol: 'SOL-USD', name: 'Solana USD', exchange: 'Crypto', country: 'Global', sector: 'Crypto' },
  { symbol: 'BABA', name: 'Alibaba Group', exchange: 'NYSE', country: 'CN', sector: 'Technology' },
  { symbol: 'TSM', name: 'Taiwan Semiconductor', exchange: 'NYSE', country: 'TW', sector: 'Technology' },
  { symbol: '005930.KS', name: 'Samsung Electronics', exchange: 'KRX', country: 'KR', sector: 'Technology' },
  { symbol: '7203.T', name: 'Toyota Motor', exchange: 'TSE', country: 'JP', sector: 'Automotive' },
  { symbol: 'NESN.SW', name: 'Nestle SA', exchange: 'SIX', country: 'CH', sector: 'Consumer' },
  { symbol: 'SHEL.L', name: 'Shell plc', exchange: 'LSE', country: 'UK', sector: 'Energy' },
  { symbol: 'MC.PA', name: 'LVMH', exchange: 'Euronext', country: 'FR', sector: 'Luxury' },
]

export function searchGlobalCatalog(query: string): GlobalEntry[] {
  if (!query) return []
  const q = query.trim().toLowerCase()
  if (!q) return []
  return GLOBAL_CATALOG
    .filter((e) =>
      e.symbol.toLowerCase().includes(q) ||
      e.name.toLowerCase().includes(q) ||
      e.sector.toLowerCase().includes(q)
    )
    .slice(0, 12)
}