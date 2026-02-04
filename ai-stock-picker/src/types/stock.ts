/**
 * 股票相关类型定义
 * 统一管理所有股票相关的 TypeScript 接口
 */

// 股票搜索结果
export interface StockSearchResult {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  marketCap: number
}

// 股票历史数据点
export interface StockHistoryData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  ma5?: number
  ma10?: number
  ma20?: number
  rsi?: number
  macd?: number
}

// 股票基本信息
export interface StockInfo {
  symbol: string
  name: string
  sector: string
  industry: string
  currentPrice: number
  marketCap: number
  peRatio: number
  pbRatio: number
  dividendYield: number
  '52WeekHigh': number
  '52WeekLow': number
  avgVolume: number
  beta: number
  change?: number
  changePercent?: number
}

// 股票完整数据（包含历史和当前价格）
export interface StockData {
  symbol: string
  currentPrice: number
  change: number
  changePercent: number
  history?: StockHistoryData[]
}

// API 响应基础类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  source?: 'mock' | 'api'
}

// 收藏的股票
export interface FavoriteStock {
  symbol: string
  name: string
  currentPrice: number
  change: number
  changePercent: number
  addedAt: string
}

// 回测结果
export interface BacktestResult {
  totalReturn: number
  annualizedReturn: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
  totalTrades: number
}

// AI 分析数据
export interface AnalysisData {
  symbol: string
  fundamental: {
    overall: 'bullish' | 'bearish' | 'neutral'
    score: number
    factors: {
      name: string
      status: 'positive' | 'negative' | 'neutral'
      description: string
    }[]
  }
  technical: {
    overall: 'bullish' | 'bearish' | 'neutral'
    score: number
    indicators: {
      name: string
      value: number
      signal: 'buy' | 'sell' | 'neutral'
    }[]
  }
  sentiment: {
    overall: 'bullish' | 'bearish' | 'neutral'
    score: number
    sources: {
      name: string
      sentiment: 'positive' | 'negative' | 'neutral'
      confidence: number
    }[]
  }
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell'
  confidence: number
  reasoning: string[]
}

// 分析历史记录
export interface AnalysisHistory {
  id: string
  timestamp: string
  symbol: string
  stockName: string
  currentPrice: number
  analysis: AnalysisData
  aiProvider?: string
}

// 热门股票
export interface PopularStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  marketCap: number
  views: number
}
