export interface OHLCBar {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Trade {
  id: number
  entryDate: string
  exitDate: string
  side: 'long' | 'short'
  entryPrice: number
  exitPrice: number
  pnl: number
  pnlPct: number
  returnPct: number
}

export interface BacktestMetrics {
  totalReturn: number
  cagr: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
  profitFactor: number
  numTrades: number
  finalEquity: number
  buyHoldReturn: number
  sortinoRatio?: number
  calmarRatio?: number
}

export interface EquityPoint {
  date: string
  equity: number
  buyHold: number
}

export interface DrawdownPoint {
  date: string
  drawdown: number
}

export interface BacktestResult {
  trades: Trade[]
  equityCurve: EquityPoint[]
  drawdownCurve: DrawdownPoint[]
  metrics: BacktestMetrics
}

export type StrategyType =
  | 'sma_crossover'
  | 'rsi_mean_reversion'
  | 'bollinger_rsi'
  | 'macd_crossover'
  | 'atr_breakout'
  | 'zscore_mean_reversion'
  | 'dual_momentum'
  | 'keltner_breakout'
  | 'adx_trend'

export interface StrategyParams {
  smaFast?: number
  smaSlow?: number
  rsiPeriod?: number
  rsiOversold?: number
  rsiOverbought?: number
  bbPeriod?: number
  bbStdDev?: number
  bbRsiThreshold?: number
  macdFast?: number
  macdSlow?: number
  macdSignal?: number
  atrPeriod?: number
  atrMultiplier?: number
  zscorePeriod?: number
  zscoreEntry?: number
  momentumPeriod?: number
  keltnerPeriod?: number
  keltnerMult?: number
  adxPeriod?: number
  adxThreshold?: number
}

export interface BacktestConfig {
  asset: string
  strategy: StrategyType
  params: StrategyParams
  initialCapital: number
  commission: number
  startDate: string
  endDate: string
  allowShort?: boolean
  positionSize?: 'full' | 'half' | 'kelly'
}

export interface MonteCarloParams {
  initialPrice: number
  drift: number
  volatility: number
  timeHorizon: number
  numPaths: number
  stepsPerYear: number
  model?: 'gbm' | 'jump_diffusion' | 'heston_simplified'
  jumpIntensity?: number
  jumpMean?: number
  jumpVol?: number
}

export interface MonteCarloResult {
  paths: number[][]
  percentiles: { p5: number[]; p50: number[]; p95: number[] }
  timeSteps: number[]
  kpis: {
    expectedValue: number
    probProfit: number
    worstCase: number
    bestCase: number
    medianReturn: number
    var95: number
    cvar95: number
  }
}

export interface SearchResult {
  symbol: string
  name: string
  nameEn?: string
  type: 'equity' | 'etf' | 'crypto' | 'index' | 'forex'
  exchange: string
  country?: string
  sector?: string
  sectorVi?: string
  price?: number
  changePct?: number
  flag?: string
}

export type DataSource = 'yahoo' | 'cached' | 'synthetic'

export interface TickerQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePct: number
  currency: string
  exchange: string
  fetchedAt: number
  dataSource?: DataSource
  volume?: number
  dayHigh?: number
  dayLow?: number
  fiftyTwoWeekHigh?: number
  fiftyTwoWeekLow?: number
  marketCap?: number
  pe?: number
  country?: string
  sector?: string
}

export interface CompanyFundamentals {
  symbol: string
  name: string
  sector?: string
  industry?: string
  country?: string
  website?: string
  description?: string
  employees?: number
  marketCap?: number
  marketCapFmt?: string
  pe?: number
  forwardPe?: number
  peg?: number
  pb?: number
  eps?: number
  forwardEps?: number
  dividendYield?: number
  beta?: number
  fiftyTwoWeekHigh?: number
  fiftyTwoWeekLow?: number
  fiftyTwoWeekChange?: number
  volume?: number
  revenue?: number
  revenueFmt?: string
  revenueGrowth?: number
  grossMargin?: number
  operatingMargin?: number
  profitMargin?: number
  roe?: number
  roa?: number
  totalCash?: string
  totalDebt?: string
  freeCashflow?: string
  targetPrice?: number
  recommendation?: string
  sharesOutstanding?: string
  enterpriseValue?: string
  fetchedAt: number
}

export interface AssetInfo {
  symbol: string
  name: string
  type: 'stock' | 'crypto'
  color: string
  coingeckoId?: string
}

export interface MarketPrice {
  symbol: string
  price: number
  change24h: number
  changePct: number
  high24h?: number
  low24h?: number
  marketCap?: number
  volume24h?: number
}

export interface SimulatorPrefill {
  tab: 'monte_carlo' | 'backtest' | 'analytics' | 'portfolio' | 'risk'
  asset?: string
  strategy?: StrategyType
  params?: StrategyParams
  monteCarlo?: Partial<MonteCarloParams>
}

export type Language = 'en' | 'vi'
export type PresetType = 'conservative' | 'balanced' | 'aggressive'

export type IndicatorOverlay =
  | 'sma20'
  | 'sma50'
  | 'ema12'
  | 'bollinger'
  | 'rsi'
  | 'macd'
  | 'volume'

export interface PortfolioAsset {
  symbol: string
  weight: number
}

export interface EarningsRecord {
  period: string
  actual?: number
  estimate?: number
  surprise?: number
}

export interface AnalystRating {
  strongBuy: number
  buy: number
  hold: number
  sell: number
  strongSell: number
  total: number
}

export interface HolderBreakdown {
  name: string
  percent: number
  date?: string
}

export interface InsiderTrade {
  name: string
  action: string
  date?: string
  value?: string
  shares?: string
}

export interface FinancialRow {
  date: string
  values: Record<string, string>
}

export interface NewsItem {
  title: string
  publisher: string
  url: string
  time: string
  tickers?: string[]
}

export interface TickerDeepData {
  symbol: string
  earnings: EarningsRecord[]
  analyst: AnalystRating
  holders: HolderBreakdown[]
  insiders: InsiderTrade[]
  incomeStatement: FinancialRow[]
  balanceSheet: FinancialRow[]
  cashflow: FinancialRow[]
  nextEarningsDate?: string
  epsEstimate?: number
  revenueEstimate?: string
  evToEbitda?: number
  evToRevenue?: number
  priceToSales?: number
  currentRatio?: number
  quickRatio?: number
  debtToEquity?: number
  ebitda?: string
  operatingCashflow?: string
  payoutRatio?: number
  bookValue?: number
  floatShares?: string
  shortRatio?: number
  shortPercent?: number
  avgVolume10d?: string
  avgVolume3m?: string
  dividendRate?: number
  exDividendDate?: string
  news: NewsItem[]
  fetchedAt: number
}

export interface PerformanceMetrics {
  d1: number
  w1: number
  m1: number
  m3: number
  m6: number
  ytd: number
  y1: number
  y3: number
  y5: number
  max: number
  avgVolume: number
  volatility30d: number
}

export interface WalkForwardResult {
  windows: Array<{
    trainStart: string
    trainEnd: string
    testStart: string
    testEnd: string
    inSampleReturn: number
    outSampleReturn: number
    sharpe: number
  }>
  avgOutSample: number
  consistency: number
}