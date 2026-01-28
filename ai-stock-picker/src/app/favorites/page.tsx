"use client"

import { useState, useEffect } from "react"
import { Trash2, TrendingUp, TrendingDown, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface FavoriteStock {
  symbol: string
  name: string
  currentPrice: number
  change: number
  changePercent: number
  addedAt: string
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteStock[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = () => {
    setIsLoading(true)
    // 从 localStorage 加载收藏
    const stored = localStorage.getItem('favorites')
    if (stored) {
      setFavorites(JSON.parse(stored))
    } else {
      // 默认示例数据
      const defaultFavorites: FavoriteStock[] = [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          currentPrice: 185.92,
          change: 2.34,
          changePercent: 1.28,
          addedAt: new Date().toISOString()
        },
        {
          symbol: 'NVDA',
          name: 'NVIDIA Corporation',
          currentPrice: 495.22,
          change: 8.92,
          changePercent: 1.83,
          addedAt: new Date().toISOString()
        }
      ]
      setFavorites(defaultFavorites)
      localStorage.setItem('favorites', JSON.stringify(defaultFavorites))
    }
    setIsLoading(false)
  }

  const removeFavorite = (symbol: string) => {
    const updated = favorites.filter(f => f.symbol !== symbol)
    setFavorites(updated)
    localStorage.setItem('favorites', JSON.stringify(updated))
  }

  const removeAllFavorites = () => {
    if (confirm('确定要清空所有收藏吗？')) {
      setFavorites([])
      localStorage.removeItem('favorites')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">收藏管理</h1>
          <p className="text-gray-400">管理您关注的股票</p>
        </div>
        {favorites.length > 0 && (
          <Button
            variant="outline"
            onClick={removeAllFavorites}
            className="border-red-600 text-red-400 hover:bg-red-600/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            清空收藏
          </Button>
        )}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">收藏数量</p>
                <p className="text-3xl font-bold text-white">{favorites.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">今日涨幅</p>
                <p className="text-3xl font-bold text-green-400">
                  {favorites.length > 0
                    ? (favorites.reduce((acc, f) => acc + f.changePercent, 0) / favorites.length).toFixed(2)
                    : '0.00'}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">涨跌分布</p>
                <p className="text-3xl font-bold text-white">
                  {favorites.filter(f => f.change > 0).length}/{favorites.filter(f => f.change <= 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 收藏列表 */}
      {favorites.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">暂无收藏</h3>
            <p className="text-gray-400 mb-6">
              前往首页搜索并添加您关注的股票
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              去添加股票
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {favorites.map((stock) => (
            <Card
              key={stock.symbol}
              className="bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 transition-all duration-200"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{stock.symbol}</h3>
                      <span className={`text-sm font-semibold ${
                        stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-gray-400 mb-3">{stock.name}</p>
                    <div className="flex items-center space-x-6">
                      <div>
                        <p className="text-sm text-gray-400">当前价格</p>
                        <p className="text-lg font-semibold text-white">
                          ${stock.currentPrice.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">涨跌额</p>
                        <p className={`text-lg font-semibold ${
                          stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFavorite(stock.symbol)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
