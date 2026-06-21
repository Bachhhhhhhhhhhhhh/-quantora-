/**
 * News sentiment engine — lexical scoring on Yahoo Finance headlines.
 */

import type { NewsItem } from '../../types'

export interface SentimentArticle {
  title: string
  publisher: string
  score: number
  label: 'bullish' | 'bearish' | 'neutral'
}

export interface SentimentResult {
  score: number
  label: 'Very Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Very Bearish'
  articles: SentimentArticle[]
  bullishCount: number
  bearishCount: number
  neutralCount: number
  confidence: number
}

const BULLISH = [
  'surge', 'rally', 'gain', 'gains', 'profit', 'profits', 'beat', 'beats', 'upgrade', 'upgraded',
  'growth', 'record', 'strong', 'buy', 'outperform', 'bullish', 'soar', 'soars', 'jump', 'jumps',
  'rise', 'rises', 'rising', 'high', 'higher', 'boost', 'boosts', 'expand', 'expands', 'positive',
  'optimistic', 'breakout', 'momentum', 'recovery', 'rebound', 'tăng', 'lợi nhuận', 'kỷ lục', 'mua',
]

const BEARISH = [
  'fall', 'falls', 'drop', 'drops', 'loss', 'losses', 'miss', 'misses', 'downgrade', 'downgraded',
  'weak', 'sell', 'underperform', 'bearish', 'crash', 'decline', 'declines', 'plunge', 'plunges',
  'slump', 'slumps', 'cut', 'cuts', 'warning', 'risk', 'concern', 'concerns', 'lawsuit', 'fraud',
  'negative', 'pessimistic', 'recession', 'layoff', 'layoffs', 'giảm', 'lỗ', 'bán', 'cảnh báo',
]

export function analyzeNewsSentiment(news: NewsItem[]): SentimentResult {
  if (!news.length) {
    return {
      score: 0,
      label: 'Neutral',
      articles: [],
      bullishCount: 0,
      bearishCount: 0,
      neutralCount: 0,
      confidence: 0,
    }
  }

  const articles: SentimentArticle[] = news.map((n) => {
    const score = scoreHeadline(n.title)
    return {
      title: n.title,
      publisher: n.publisher,
      score,
      label: score > 0.15 ? 'bullish' : score < -0.15 ? 'bearish' : 'neutral',
    }
  })

  const bullishCount = articles.filter((a) => a.label === 'bullish').length
  const bearishCount = articles.filter((a) => a.label === 'bearish').length
  const neutralCount = articles.filter((a) => a.label === 'neutral').length

  const avg = articles.reduce((s, a) => s + a.score, 0) / articles.length
  const score = Math.round(avg * 100)
  const confidence = Math.min(100, Math.round((articles.length / 8) * 60 + Math.abs(score) * 0.4))

  return {
    score,
    label: scoreToLabel(score),
    articles,
    bullishCount,
    bearishCount,
    neutralCount,
    confidence,
  }
}

function scoreHeadline(title: string): number {
  const words = title.toLowerCase().replace(/[^a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s-]/g, ' ').split(/\s+/)
  let bull = 0
  let bear = 0
  for (const w of words) {
    if (BULLISH.includes(w)) bull++
    if (BEARISH.includes(w)) bear++
  }
  const total = bull + bear
  if (total === 0) return 0
  return (bull - bear) / total
}

function scoreToLabel(s: number): SentimentResult['label'] {
  if (s >= 40) return 'Very Bullish'
  if (s >= 15) return 'Bullish'
  if (s <= -40) return 'Very Bearish'
  if (s <= -15) return 'Bearish'
  return 'Neutral'
}