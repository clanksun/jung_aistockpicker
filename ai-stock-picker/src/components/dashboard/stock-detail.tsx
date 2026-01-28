"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Loader, ArrowLeft, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CandlestickChart } from "@/components/ui/chart/candlestick-chart"
import { Loading, ChartLoader } from "@/components/ui/loading"

interface StockDetailProps {
  symbol: string
  onBack?: () => void
}

interface StockData {
  currentPrice: number
  change: number
  changePercent: number
}

interface StockHistory {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  ma20?: number
}

export function StockDetail({ symbol, onBack }: StockDetailProps) {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick')
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y'>('3M')

  useEffect(() => {
    loadStockData()
  }, [symbol, timeRange])

  const loadStockData = async () => {
    setIsLoading(true)
    try {
      // 并行获取股票信息和历史数据
      const [dataRes, historyRes] = await Promise.all([
        fetch(`/api/stock/${symbol}/history?days=${timeRange === '1M' ? 30 : timeRange === '3M' ? 90 : timeRange === '6M' ? 180 : 365}`),
        fetch(`/api/stock/${symbol}/info`)
      ])

      if (dataRes.ok) {
        const data = await dataRes.json()
        if (data.success) {
          setStockData(data.data)
        }
      }

      if (historyRes.ok) {
        const history = await historyRes.json()
        if (history.success) {
          setStockHistory(history.data.history)
        }
      }
    } catch (error) {
      console.error('Failed to load stock data:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadStockData()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* 返回按钮 */}
        {onBack && (
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-400 hover:text-white hover:bg-gray-700/50"
              disabled
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        )}

        {/* 图表加载 */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
          <ChartLoader height={500} />
        </div>

        {/* 信息卡片加载 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 animate-pulse">
            <div className="h-8 bg-gray-700/50 rounded"></div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 animate-pulse">
            <div className="h-32 bg-gray-700/30 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const isPositive = stockData?.change && stockData.change >= 0
  const volume = stockData?.change && stockData.changePercent
    ? (stockData.currentPrice * 50000000).toLocaleString()
    : '-'

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 返回和刷新按钮 */}
      <div className="flex items-center justify-between">
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-400 hover:text-white hover:bg-gray-700/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          刷新数据
        </Button>
      </div>

      {/* 股票基本信息 */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center space-x-3">
                <span className="text-2xl">{symbol}</span>
                {stockData && (
                  <span className={`text-lg ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}
                    {stockData.changePercent?.toFixed(2)}%
                  </span>
                )}
              </CardTitle>
              {stockData && (
                <p className="text-gray-400">
                  {stockData.name || symbol}
                </p>
              )}
            </div>
            {stockData && (
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2l3.09 6.26L22 9.27l-1 4.87h-2.31v8.88c0-1.32.27-2.35.69-2.35h8.88v8.88c0 1.32-.27 2.35-.69 2.35h-2.31z" clipRule="evenodd" className={isPositive ? 'text-green-400' : 'text-red-400'} />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-400">当前价格</p>
              <p className="text-3xl font-bold text-white">
                ${stockData?.currentPrice?.toFixed(2) || '--'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-400">涨跌幅</p>
              <p className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}
                {stockData?.change?.toFixed(2)}
                ({stockData?.changePercent?.toFixed(2) || '0.00'}%)
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-400">成交量</p>
              <p className="text-xl font-semibold text-white">
                {volume}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-400">52周最高</p>
              <p className="text-lg font-semibold text-white">
                ${stockData?.['52WeekHigh']?.toFixed(2) || '--'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-400">52周最低</p>
              <p className="text-lg font-semibold text-white">
                ${stockData?.['52WeekLow']?.toFixed(2) || '--'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-400">P/E比率</p>
              <p className="text-lg font-semibold text-white">
                {stockData?.peRatio?.toFixed(2) || '--'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-400">P/B比率</p>
              <p className="text-lg font-semibold text-white">
                {stockData?.pbRatio?.toFixed(2) || '--'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 时间范围选择器 */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">时间范围:</span>
            {(['1M', '3M', '6M', '1Y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  timeRange === range
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 价格图表 */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">价格走势</CardTitle>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setChartType('candlestick')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  chartType === 'candlestick'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                }`}
              >
                K线
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  chartType === 'line'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                }`}
              >
                趋势线
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CandlestickChart
            data={stockHistory}
            height={500}
            showMA={chartType === 'candlestick'}
            className="transition-all duration-300"
          />
        </CardContent>
      </Card>

      {/* 技术指标 */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">技术指标</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700/30 rounded-xl p-4">
              <h4 className="text-white font-semibold mb-3">RSI 指标</h4>
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-400">
                  {stockHistory.length > 0 && stockHistory[stockHistory.length - 1].rsi
                    ? Math.round(stockHistory[stockHistory.length - 1].rsi)
                    : '--'
                }
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {stockHistory.length > 0 && stockHistory[stockHistory.length - 1].rsi
                    ? stockHistory[stockHistory.length - 1].rsi > 70
                      ? '超买区域'
                      : stockHistory[stockHistory.length - 1].rsi < 30
                      ? '超卖区域'
                      : '正常区域'
                    : '--'
                  }
                </p>
              </div>
              <div className="mt-3 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    stockHistory.length > 0 && stockHistory[stockHistory.length - 1].rsi
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                      : 'bg-gray-600'
                  }`}
                  style={{
                    width: stockHistory.length > 0
                      ? `${Math.min(100, Math.max(0, stockHistory[stockHistory.length - 1].rsi))}%`
                      : '0%'
                  }}
                />
              </div>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-4">
              <h4 className="text-white font-semibold mb-3">移动平均线</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">MA5</span>
                  <span className="text-white font-medium">
                    {stockHistory.length > 0 && stockHistory[stockHistory.length - 1].ma5
                      ? stockHistory[stockHistory.length - 1].ma5.toFixed(2)
                      : '--'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">MA10</span>
                  <span className="text-white font-medium">
                    {stockHistory.length > 0 && stockHistory[stockHistory.length - 1].ma10
                      ? stockHistory[stockHistory.length - 1].ma10.toFixed(2)
                      : '--'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">MA20</span>
                  <span className="text-amber-400 font-medium">
                    {stockHistory.length > 0 && stockHistory[stockHistory.length - 1].ma20
                      ? stockHistory[stockHistory.length - 1].ma20.toFixed(2)
                      : '--'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 快捷操作 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 text-base font-medium shadow-lg shadow-blue-500/20 transition-all"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 3h4.673M12 20a4 4 0 00-4-4 4 4v4c0 2.21-1.79 4-4h4a2 2 0 002-2 4v4c0 2.21 1.79 4 4z" />
            </svg>
            AI深度分析
          </div>
        </Button>
        <Button
          variant="outline"
          className="bg-gray-800/50 border-gray-600 hover:bg-gray-700 hover:text-white py-4 text-base font-medium transition-all"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18v-18H3zM16.95 5.65a2 2 0 01-2.1 2h-.95l-1.79 4.3-2.12 2.12h3.47v7.23c0 1.08.91 1.99 2.03 2.03h3.47v-5.02c0-1.08.91-1.99-2.03-2.03z" />
            </svg>
            策略回测
          </div>
        </Button>
        <Button
          variant="outline"
          className="bg-gray-800/50 border-gray-600 hover:bg-gray-700 hover:text-white py-4 text-base font-medium transition-all"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 00-7.78 0-15.75 15.75-4.26A9.5 9.5 0 004.26.03 15.5 9.5 9.5-4.26-4.26-15.75 15.75zm-1.75.5a.75.75 0 00-1.06 0-1.5.5.5.5.5 0 00-.75.75.75v.79c0-.53.14-.94-.46-1.14.43-.73.7-1.4l-4.03 2.03 2.03 2.03c0 .54.46 1.04.96 1.54 2.03 2.03 2.03-4.04-4.04zm2.75 4.5a.75.75 0 011.06.75.75.75 0 01-.75-.75-.75v.79c0-.53-.14-.94-.46-1.14-.43-.73-.7-1.4L15.6 16.86l4.03 2.03 2.03 2.03c0 .54-.46 1.04-.96 1.54-2.03 2.03 2.03 4.04 4.04z" />
            </svg>
            添加到自选
          </div>
        </Button>
      </div>
    </div>
  )
}
