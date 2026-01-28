import { NextResponse } from 'next/server'

interface StockData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  ma20?: number
}

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
}

// 调用 Python 后端获取股票数据
async function fetchFromBackend(url: string) {
  try {
    const response = await fetch(`http://localhost:5001${url}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('API error:', error)
    // 如果后端不可用，返回模拟数据
    return getMockData(url)
  }
}

// 模拟数据（后备方案）
function getMockData(url: string) {
  if (url.includes('/AAPL/history')) {
    return generateMockHistory('AAPL', 185.92)
  } else if (url.includes('/info')) {
    return generateMockInfo()
  } else if (url.includes('/search')) {
    return generateMockSearch()
  }
  return { success: false, error: 'Mock data' }
}

// 生成模拟历史数据
function generateMockHistory(symbol: string, basePrice: number) {
  const history: StockData[] = []
  let price = basePrice

  for (let i = 90; i >= 0; i--) {
    const change = (Math.random() - 0.5) * price * 0.02
    price = Math.max(1, price + change)

    const open = price
    const high = price * (1 + Math.random() * 0.01)
    const low = price * (1 - Math.random() * 0.01)
    const close = price * (1 + (Math.random() - 0.5) * 0.01)

    const ma20 = i >= 19 ? history.slice(i - 19).reduce((acc, h) => acc + h.close, 0) / 20 : close

    history.push({
      date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.floor(Math.random() * 50000000) + 10000000,
      ma20: ma20
    })
  }

  const currentChange = history[history.length - 1].close - history[history.length - 2].close
  const changePercent = (currentChange / history[history.length - 2].close) * 100

  return {
    success: true,
    data: {
      symbol: symbol,
      currentPrice: history[history.length - 1].close,
      change: currentChange,
      changePercent: changePercent,
      history
    }
  }
}

// 生成模拟股票信息
function generateMockInfo() {
  return {
    success: true,
    data: {
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
      beta: 1.28
    }
  }
}

// 生成模拟搜索结果
function generateMockSearch() {
  return {
    success: true,
    data: [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 185.92,
        change: 2.34,
        changePercent: 1.28,
        marketCap: 2890000000000
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        price: 378.85,
        change: 4.12,
        changePercent: 1.10,
        marketCap: 2810000000000
      },
      {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        price: 140.87,
        change: -1.23,
        changePercent: -0.87,
        marketCap: 1770000000000
      },
      {
        symbol: 'AMZN',
        name: 'Amazon.com Inc.',
        price: 155.33,
        change: 3.45,
        changePercent: 2.27,
        marketCap: 1590000000000
      }
    ]
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
): Promise<NextResponse> {
  const { symbol } = await params
  const symbolUpper = symbol.toUpperCase()

  try {
    // 获取历史数据
    const historyResponse = await fetchFromBackend(`/api/stock/${symbolUpper}/history?days=90`)

    if (historyResponse.success) {
      return NextResponse.json(historyResponse)
    } else {
      // 使用模拟数据
      const mockData = generateMockHistory(symbolUpper, 185.92)
      return NextResponse.json(mockData)
    }
  } catch (error) {
    console.error('Stock data error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock data' },
      { status: 500 }
    )
  }
}
