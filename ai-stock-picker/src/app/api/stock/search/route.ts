import { NextRequest, NextResponse } from 'next/server'

interface StockSearchResult {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  marketCap: number
}

// 调用 Python 后端
async function fetchFromBackend(url: string, query?: string) {
  try {
    const response = await fetch(`http://localhost:5001${url}${query ? `?q=${query}` : ''}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('API error:', error)
    return getMockData(query || '')
  }
}

// 模拟数据（后备方案）
function getMockData(query: string) {
  const allStocks = [
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
    },
    {
      symbol: 'TSLA',
      name: 'Tesla, Inc.',
      price: 238.45,
      change: -5.23,
      changePercent: -2.15,
      marketCap: 756000000000
    },
    {
      symbol: 'META',
      name: 'Meta Platforms, Inc.',
      price: 497.63,
      change: 8.91,
      changePercent: 1.82,
      marketCap: 1270000000000
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      price: 495.22,
      change: 12.45,
      changePercent: 2.58,
      marketCap: 1220000000000
    },
    {
      symbol: 'NFLX',
      name: 'Netflix, Inc.',
      price: 485.23,
      change: -7.89,
      changePercent: -1.60,
      marketCap: 210000000000
    }
  ]

  const filtered = allStocks.filter(stock =>
    stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
    stock.name.toLowerCase().includes(query.toLowerCase())
  )

  return {
    success: true,
    data: filtered
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''

  if (query.length < 2) {
    return NextResponse.json(
      { success: false, error: 'Query too short' },
      { status: 400 }
    )
  }

  try {
    const response = await fetchFromBackend('/api/stock/search', query)

    if (response.success) {
      return NextResponse.json(response)
    } else {
      const mockData = getMockData(query)
      return NextResponse.json(mockData)
    }
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search stocks' },
      { status: 500 }
    )
  }
}
