/**
 * 模拟数据生成工具
 * 当后端 API 不可用时使用的备用数据
 */

import type { StockHistoryData, StockInfo, StockSearchResult } from '@/types/stock'

// 热门股票价格映射
const STOCK_PRICES: Record<string, number> = {
  'AAPL': 185.92,
  'MSFT': 378.85,
  'GOOGL': 140.87,
  'AMZN': 155.33,
  'TSLA': 248.50,
  'NVDA': 495.22,
  'META': 474.99,
  'NFLX': 485.23,
  'AMD': 125.43,
  'INTC': 45.67
}

// 股票详细信息映射
const STOCK_INFO: Record<string, {
  name: string
  sector: string
  industry: string
  pe: number
  pb: number
}> = {
  'AAPL': { name: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics', pe: 28.5, pb: 45.2 },
  'MSFT': { name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software', pe: 35.2, pb: 12.8 },
  'GOOGL': { name: 'Alphabet Inc.', sector: 'Technology', industry: 'Internet Services', pe: 24.5, pb: 5.8 },
  'AMZN': { name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', industry: 'Internet Retail', pe: 62.3, pb: 8.9 },
  'TSLA': { name: 'Tesla Inc.', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', pe: 72.5, pb: 10.2 },
  'NVDA': { name: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors', pe: 65.3, pb: 38.5 },
  'META': { name: 'Meta Platforms Inc.', sector: 'Technology', industry: 'Internet Services', pe: 33.2, pb: 6.8 },
  'NFLX': { name: 'Netflix Inc.', sector: 'Communication', industry: 'Entertainment', pe: 45.0, pb: 12.5 },
  'AMD': { name: 'Advanced Micro Devices', sector: 'Technology', industry: 'Semiconductors', pe: 35.0, pb: 8.5 },
  'INTC': { name: 'Intel Corporation', sector: 'Technology', industry: 'Semiconductors', pe: 15.0, pb: 1.5 }
}

/**
 * 生成模拟股票历史数据
 */
export function generateMockHistory(symbol: string, days: number, basePrice?: number): StockHistoryData[] {
  const price = basePrice ?? STOCK_PRICES[symbol.toUpperCase()] ?? 150.00
  const now = new Date()
  const history: StockHistoryData[] = []
  let currentPrice = price * 0.95

  // 生成工作日数据
  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 86400000)

    // 跳过周末
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue
    }

    // 随机价格变动
    const changePercent = (Math.random() - 0.5) * 0.02
    currentPrice = currentPrice * (1 + changePercent)

    const open = currentPrice
    const high = Math.max(open, currentPrice) * (1 + Math.random() * 0.01)
    const low = Math.min(open, currentPrice) * (1 - Math.random() * 0.01)
    const close = currentPrice
    const volume = Math.floor(Math.random() * 50000000) + 10000000

    history.push({
      date: date.toISOString().split('T')[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume
    })
  }

  // 计算技术指标
  calculateIndicators(history)

  return history
}

/**
 * 计算技术指标（MA5, MA10, MA20, RSI）
 */
function calculateIndicators(history: StockHistoryData[]): void {
  for (let i = 0; i < history.length; i++) {
    // MA5
    if (i >= 4) {
      history[i].ma5 = Number(history.slice(i - 4, i + 1)
        .reduce((acc, h) => acc + h.close, 0) / 5
        .toFixed(2))
    }

    // MA10
    if (i >= 9) {
      history[i].ma10 = Number(history.slice(i - 9, i + 1)
        .reduce((acc, h) => acc + h.close, 0) / 10
        .toFixed(2))
    }

    // MA20
    if (i >= 19) {
      history[i].ma20 = Number(history.slice(i - 19, i + 1)
        .reduce((acc, h) => acc + h.close, 0) / 20
        .toFixed(2))
    }

    // RSI
    if (i >= 14) {
      const rsi = calculateRSI(history, i)
      history[i].rsi = Number(rsi.toFixed(2))
    }
  }
}

/**
 * 计算 RSI 指标
 */
function calculateRSI(history: StockHistoryData[], index: number): number {
  const period = 14
  let gains = 0
  let losses = 0

  for (let i = index - period + 1; i <= index; i++) {
    const change = history[i].close - history[i - 1].close
    if (change > 0) {
      gains += change
    } else {
      losses -= change
    }
  }

  const avgGain = gains / period
  const avgLoss = losses / period
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss

  return 100 - (100 / (1 + rs))
}

/**
 * 生成模拟股票信息
 */
export function generateMockInfo(symbol: string): StockInfo {
  const symbolUpper = symbol.toUpperCase()
  const info = STOCK_INFO[symbolUpper] || {
    name: `${symbol} Corporation`,
    sector: 'Technology',
    industry: 'General',
    pe: 25.0,
    pb: 3.5
  }

  const currentPrice = STOCK_PRICES[symbolUpper] || 150.00

  return {
    symbol: symbolUpper,
    name: info.name,
    sector: info.sector,
    industry: info.industry,
    currentPrice,
    marketCap: currentPrice * Math.floor(Math.random() * 50 + 1) * 1000000000,
    peRatio: info.pe,
    pbRatio: info.pb,
    dividendYield: Math.random() * 2,
    '52WeekHigh': currentPrice * (1 + Math.random() * 0.3),
    '52WeekLow': currentPrice * (1 - Math.random() * 0.3),
    avgVolume: Math.floor(Math.random() * 40000000) + 10000000,
    beta: Number((Math.random() * 1.5 + 0.5).toFixed(2)),
    change: Number((Math.random() * 10 - 5).toFixed(2)),
    changePercent: Number((Math.random() * 4 - 2).toFixed(2))
  }
}

/**
 * 获取热门股票列表
 */
export function getPopularStocks(query: string): StockSearchResult[] {
  const allStocks = Object.keys(STOCK_PRICES).map(symbol => {
    const info = STOCK_INFO[symbol]
    const price = STOCK_PRICES[symbol]
    const change = Math.random() * 10 - 5
    const changePercent = (change / price) * 100

    return {
      symbol,
      name: info.name,
      price,
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      marketCap: price * Math.floor(Math.random() * 50 + 1) * 1000000000
    }
  })

  // 根据查询过滤
  if (query) {
    const queryUpper = query.toUpperCase()
    return allStocks.filter(stock =>
      stock.symbol.includes(queryUpper) ||
      stock.name.toUpperCase().includes(queryUpper)
    )
  }

  return allStocks
}

/**
 * 获取单个股票的搜索结果
 */
export function getSearchResult(symbol: string): StockSearchResult | null {
  const info = STOCK_INFO[symbol.toUpperCase()]
  if (!info) return null

  const price = STOCK_PRICES[symbol.toUpperCase()]
  if (!price) return null

  const change = Math.random() * 10 - 5
  const changePercent = (change / price) * 100

  return {
    symbol: symbol.toUpperCase(),
    name: info.name,
    price,
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    marketCap: price * Math.floor(Math.random() * 50 + 1) * 1000000000
  }
}
