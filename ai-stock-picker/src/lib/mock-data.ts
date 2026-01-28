// 生成随机股票数据
export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: string
  marketCap: string
  isFavorite: boolean
  viewCount: number
}

export interface PriceData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// 模拟热门股票数据
export const mockStocks: StockData[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 185.92,
    change: 2.34,
    changePercent: 1.28,
    volume: "52.3M",
    marketCap: "2.89T",
    isFavorite: true,
    viewCount: 1250
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 238.45,
    change: -5.23,
    changePercent: -2.15,
    volume: "48.7M",
    marketCap: "756.2B",
    isFavorite: false,
    viewCount: 2100
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 378.85,
    change: 4.12,
    changePercent: 1.10,
    volume: "28.9M",
    marketCap: "2.81T",
    isFavorite: false,
    viewCount: 980
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 495.22,
    change: 12.45,
    changePercent: 2.58,
    volume: "45.2M",
    marketCap: "1.22T",
    isFavorite: false,
    viewCount: 3200
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 140.87,
    change: -1.23,
    changePercent: -0.87,
    volume: "22.1M",
    marketCap: "1.77T",
    isFavorite: false,
    viewCount: 750
  },
  {
    symbol: "META",
    name: "Meta Platforms",
    price: 497.63,
    change: 8.91,
    changePercent: 1.82,
    volume: "35.6M",
    marketCap: "1.27T",
    isFavorite: true,
    viewCount: 1560
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 155.33,
    change: 3.45,
    changePercent: 2.27,
    volume: "41.2M",
    marketCap: "1.59T",
    isFavorite: false,
    viewCount: 890
  },
  {
    symbol: "NFLX",
    name: "Netflix Inc.",
    price: 485.23,
    change: -7.89,
    changePercent: -1.60,
    volume: "18.7M",
    marketCap: "210.5B",
    isFavorite: false,
    viewCount: 670
  }
]

// 生成历史价格数据
export function generatePriceData(symbol: string, days: number = 30): PriceData[] {
  const data: PriceData[] = []
  let basePrice = mockStocks.find(s => s.symbol === symbol)?.price || 100

  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // 生成每日价格波动
    const volatility = 0.02 // 2% 日波动率
    const change = (Math.random() - 0.5) * volatility * basePrice
    const trend = i === 0 ? 0 : (Math.random() - 0.5) * 0.01 // 趋势

    const open = basePrice
    const close = Math.max(0.01, basePrice + change + trend * basePrice)
    const high = Math.max(open, close) * (1 + Math.random() * 0.01)
    const low = Math.min(open, close) * (1 - Math.random() * 0.01)
    const volume = Math.floor(Math.random() * 50000000) + 10000000 // 10M - 60M

    data.push({
      date: date.toISOString().split('T')[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: volume
    })

    basePrice = close
  }

  return data
}

// 生成技术指标数据
export interface TechnicalData {
  date: string
  price: number
  ma5: number
  ma10: number
  ma20: number
  rsi: number
  macd: number
  macdSignal: number
  volume: number
}

export function generateTechnicalData(symbol: string, days: number = 30): TechnicalData[] {
  const priceData = generatePriceData(symbol, days)
  const result: TechnicalData[] = []

  for (let i = 0; i < priceData.length; i++) {
    const price = priceData[i].close
    const date = priceData[i].date

    // 计算 MA
    const calculateMA = (period: number) => {
      if (i < period - 1) return price
      const sum = priceData.slice(i - period + 1, i + 1).reduce((acc, p) => acc + p.close, 0)
      return Number((sum / period).toFixed(2))
    }

    // 计算 RSI
    const calculateRSI = (period: number = 14) => {
      if (i < period) return 50
      const gains = []
      const losses = []

      for (let j = 1; j <= period; j++) {
        const change = priceData[i - j + 1].close - priceData[i - j].close
        gains.push(change > 0 ? change : 0)
        losses.push(change < 0 ? Math.abs(change) : 0)
      }

      const avgGain = gains.reduce((a, b) => a + b, 0) / period
      const avgLoss = losses.reduce((a, b) => a + b, 0) / period

      if (avgLoss === 0) return 100
      const rs = avgGain / avgLoss
      return Number((100 - (100 / (1 + rs))).toFixed(2))
    }

    // 计算 MACD
    const calculateMACD = () => {
      const ema12 = calculateEMA(12, i)
      const ema26 = calculateEMA(26, i)
      return Number((ema12 - ema26).toFixed(4))
    }

    const calculateEMA = (period: number, index: number) => {
      if (index === 0) return price
      const multiplier = 2 / (period + 1)
      const prevEMA = index > 0 ? result[index - 1].macdSignal || price : price
      return Number((price * multiplier + prevEMA * (1 - multiplier)).toFixed(4))
    }

    result.push({
      date,
      price,
      ma5: calculateMA(5),
      ma10: calculateMA(10),
      ma20: calculateMA(20),
      rsi: calculateRSI(),
      macd: calculateMACD(),
      macdSignal: i > 0 ? Number((result[i - 1].macd || 0).toFixed(4)) : 0,
      volume: priceData[i].volume
    })
  }

  return result
}

// 搜索股票
export function searchStocks(query: string): StockData[] {
  return mockStocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
  )
}

// 获取股票详情
export function getStockDetail(symbol: string): StockData | null {
  return mockStocks.find(stock => stock.symbol === symbol) || null
}

// 更新股票数据（模拟实时更新）
export function updateStockPrice(symbol: string, change: number): StockData | null {
  const stockIndex = mockStocks.findIndex(stock => stock.symbol === symbol)
  if (stockIndex === -1) return null

  const stock = mockStocks[stockIndex]
  const newPrice = Math.max(0.01, stock.price + change)
  const changePercent = ((newPrice - stock.price) / stock.price) * 100

  mockStocks[stockIndex] = {
    ...stock,
    price: Number(newPrice.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2))
  }

  return mockStocks[stockIndex]
}