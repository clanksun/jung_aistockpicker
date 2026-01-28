import { NextRequest, NextResponse } from 'next/server'

interface StockHistoryData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  ma20?: number
  ma5?: number
  ma10?: number
  rsi?: number
}

// 调用 Python 后端获取股票历史数据
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

// 生成模拟历史数据
function generateMockHistory(symbol: string, basePrice: number, days: number) {
  const history: StockHistoryData[] = []
  let price = basePrice
  const now = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 86400000)
    const change = (Math.random() - 0.5) * price * 0.02
    price = Math.max(1, price + change)

    const open = price
    const high = price * (1 + Math.random() * 0.01)
    const low = price * (1 - Math.random() * 0.01)
    const close = price * (1 + (Math.random() - 0.5) * 0.01)

    history.push({
      date: date.toISOString().split('T')[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.floor(Math.random() * 50000000) + 10000000,
    })
  }

  // 计算 MA5, MA10, MA20
  for (let i = 4; i < history.length; i++) {
    history[i].ma5 = history.slice(i - 4, i + 1).reduce((acc, h) => acc + h.close, 0) / 5
  }
  for (let i = 9; i < history.length; i++) {
    history[i].ma10 = history.slice(i - 9, i + 1).reduce((acc, h) => acc + h.close, 0) / 10
  }
  for (let i = 19; i < history.length; i++) {
    history[i].ma20 = history.slice(i - 19, i + 1).reduce((acc, h) => acc + h.close, 0) / 20
  }

  // 计算简单的 RSI
  const rsiPeriod = 14
  for (let i = rsiPeriod; i < history.length; i++) {
    let gains = 0
    let losses = 0
    for (let j = i - rsiPeriod + 1; j <= i; j++) {
      const change = history[j].close - history[j - 1].close
      if (change > 0) gains += change
      else losses -= change
    }
    const avgGain = gains / rsiPeriod
    const avgLoss = losses / rsiPeriod
    const rs = avgGain / (avgLoss || 0.001)
    history[i].rsi = 100 - (100 / (1 + rs))
  }

  return history
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
): Promise<NextResponse> {
  const { symbol } = await params
  const symbolUpper = symbol.toUpperCase()
  const searchParams = request.nextUrl.searchParams
  const days = parseInt(searchParams.get('days') || '90')

  try {
    // 尝试从后端获取数据
    const backendData = await fetchFromBackend(`/api/stock/${symbolUpper}/history?days=${days}`)

    if (backendData && backendData.success) {
      return NextResponse.json(backendData)
    }

    // 使用模拟数据
    const basePrice = symbolUpper === 'AAPL' ? 185.92 :
                     symbolUpper === 'MSFT' ? 378.85 :
                     symbolUpper === 'GOOGL' ? 140.87 :
                     symbolUpper === 'AMZN' ? 155.33 :
                     symbolUpper === 'TSLA' ? 248.50 :
                     symbolUpper === 'NVDA' ? 495.22 : 150.00

    const history = generateMockHistory(symbolUpper, basePrice, days)

    return NextResponse.json({
      success: true,
      data: {
        symbol: symbolUpper,
        history,
        currentPrice: history[history.length - 1].close,
        change: history[history.length - 1].close - history[history.length - 2].close,
        changePercent: ((history[history.length - 1].close - history[history.length - 2].close) / history[history.length - 2].close) * 100
      }
    })
  } catch (error) {
    console.error('Stock history error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock history' },
      { status: 500 }
    )
  }
}
