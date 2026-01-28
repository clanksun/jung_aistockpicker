import { NextRequest, NextResponse } from 'next/server'

interface StockInfo {
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

// 调用 Python 后端获取股票信息
async function fetchFromBackend(url: string) {
  try {
    const response = await fetch(`http://localhost:5001${url}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('API error:', error)
    return null
  }
}

// 生成模拟股票信息
function generateMockInfo(symbol: string): StockInfo {
  const stockData: Record<string, StockInfo> = {
    'AAPL': {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      currentPrice: 185.92,
      marketCap: 2890000000000,
      peRatio: 28.5,
      pbRatio: 45.2,
      dividendYield: 0.5,
      '52WeekHigh': 198.23,
      '52WeekLow': 124.17,
      avgVolume: 52000000,
      beta: 1.28,
      change: 2.34,
      changePercent: 1.28
    },
    'MSFT': {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      sector: 'Technology',
      industry: 'Software',
      currentPrice: 378.85,
      marketCap: 2810000000000,
      peRatio: 35.2,
      pbRatio: 12.8,
      dividendYield: 0.8,
      '52WeekHigh': 384.30,
      '52WeekLow': 213.43,
      avgVolume: 22000000,
      beta: 0.92,
      change: 4.12,
      changePercent: 1.10
    },
    'GOOGL': {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      sector: 'Technology',
      industry: 'Internet Services',
      currentPrice: 140.87,
      marketCap: 1770000000000,
      peRatio: 24.5,
      pbRatio: 5.8,
      dividendYield: 0.0,
      '52WeekHigh': 151.55,
      '52WeekLow': 83.34,
      avgVolume: 18000000,
      beta: 1.05,
      change: -1.23,
      changePercent: -0.87
    },
    'AMZN': {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      sector: 'Consumer Cyclical',
      industry: 'Internet Retail',
      currentPrice: 155.33,
      marketCap: 1590000000000,
      peRatio: 62.3,
      pbRatio: 8.9,
      dividendYield: 0.0,
      '52WeekHigh': 178.35,
      '52WeekLow': 81.43,
      avgVolume: 45000000,
      beta: 1.18,
      change: 3.45,
      changePercent: 2.27
    },
    'TSLA': {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      sector: 'Consumer Cyclical',
      industry: 'Auto Manufacturers',
      currentPrice: 248.50,
      marketCap: 789000000000,
      peRatio: 72.5,
      pbRatio: 10.2,
      dividendYield: 0.0,
      '52WeekHigh': 299.29,
      '52WeekLow': 101.81,
      avgVolume: 95000000,
      beta: 2.05,
      change: 5.67,
      changePercent: 2.34
    },
    'NVDA': {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      sector: 'Technology',
      industry: 'Semiconductors',
      currentPrice: 495.22,
      marketCap: 1220000000000,
      peRatio: 65.3,
      pbRatio: 38.5,
      dividendYield: 0.04,
      '52WeekHigh': 502.66,
      '52WeekLow': 108.13,
      avgVolume: 42000000,
      beta: 1.75,
      change: 8.92,
      changePercent: 1.83
    },
    'META': {
      symbol: 'META',
      name: 'Meta Platforms Inc.',
      sector: 'Technology',
      industry: 'Internet Services',
      currentPrice: 474.99,
      marketCap: 1220000000000,
      peRatio: 33.2,
      pbRatio: 6.8,
      dividendYield: 0.0,
      '52WeekHigh': 483.67,
      '52WeekLow': 88.09,
      avgVolume: 15000000,
      beta: 1.21,
      change: -2.15,
      changePercent: -0.45
    }
  }

  return stockData[symbol] || {
    symbol: symbol,
    name: `${symbol} Corporation`,
    sector: 'Technology',
    industry: 'General',
    currentPrice: 150.00,
    marketCap: 50000000000,
    peRatio: 25.0,
    pbRatio: 3.5,
    dividendYield: 1.5,
    '52WeekHigh': 180.00,
    '52WeekLow': 80.00,
    avgVolume: 10000000,
    beta: 1.0,
    change: 1.5,
    changePercent: 1.0
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
): Promise<NextResponse> {
  const { symbol } = await params
  const symbolUpper = symbol.toUpperCase()

  try {
    // 尝试从后端获取数据
    const backendData = await fetchFromBackend(`/api/stock/${symbolUpper}/info`)

    if (backendData && backendData.success) {
      return NextResponse.json(backendData)
    }

    // 使用模拟数据
    const stockInfo = generateMockInfo(symbolUpper)

    return NextResponse.json({
      success: true,
      data: stockInfo
    })
  } catch (error) {
    console.error('Stock info error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock info' },
      { status: 500 }
    )
  }
}
