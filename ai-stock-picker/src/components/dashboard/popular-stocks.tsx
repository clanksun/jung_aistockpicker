"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Star, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// 模拟热门股票数据
const mockPopularStocks = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 185.92,
    change: 2.34,
    changePercent: 1.28,
    volume: "52.3M",
    marketCap: "2.89T",
    isFavorite: false,
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
    isFavorite: true,
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
  }
]

interface Stock {
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

interface PopularStocksProps {
  onStockSelect?: (symbol: string) => void
}

export function PopularStocks({ onStockSelect }: PopularStocksProps) {
  const [stocks, setStocks] = useState<Stock[]>(mockPopularStocks)

  // 切换收藏状态
  const toggleFavorite = (symbol: string) => {
    setStocks(prev =>
      prev.map(stock =>
        stock.symbol === symbol
          ? { ...stock, isFavorite: !stock.isFavorite }
          : stock
      )
    )
  }

  // 排序逻辑（按查看次数）
  const sortedStocks = [...stocks].sort((a, b) => b.viewCount - a.viewCount)

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>热门股票</span>
          <span className="text-sm text-gray-400 font-normal">24小时</span>
        </CardTitle>
        <p className="text-gray-400 text-sm">最受关注的股票实时行情</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedStocks.map((stock, index) => (
            <div
              key={stock.symbol}
              className="group relative cursor-pointer"
              onClick={() => onStockSelect?.(stock.symbol)}
            >
              <div className="flex items-center space-x-3">
                {/* 排名 */}
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-400">
                  {index + 1}
                </div>

                {/* 股票信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-white truncate">
                      {stock.symbol}
                    </h3>
                    {stock.isFavorite && (
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    {stock.name}
                  </p>
                </div>

                {/* 价格变化 */}
                <div className="flex items-center space-x-3 text-right">
                  <div className="text-right">
                    <p className="font-medium text-white">
                      ${stock.price.toFixed(2)}
                    </p>
                    <div className={cn(
                      "flex items-center justify-end space-x-1 text-xs",
                      stock.change >= 0 ? "text-green-400" : "text-red-400"
                    )}>
                      {stock.change >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>
                        {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}
                        ({stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>

                  {/* 收藏和查看次数 */}
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(stock.symbol)}
                      className={cn(
                        "h-8 w-8",
                        stock.isFavorite ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"
                      )}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Eye className="h-3 w-3" />
                      <span>{stock.viewCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 交易量信息 */}
              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                <span>成交量: {stock.volume}</span>
                <span>市值: {stock.marketCap}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 查看更多 */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            className="w-full bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
          >
            查看全部热门股票
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}