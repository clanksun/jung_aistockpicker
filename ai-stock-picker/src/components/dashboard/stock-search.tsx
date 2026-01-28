"use client"

import { useState, useEffect, useRef } from "react"
import { Search, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// 模拟股票数据
const mockStocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: 185.92, change: 2.34, changePercent: 1.28 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 238.45, change: -5.23, changePercent: -2.15 },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 378.85, change: 4.12, changePercent: 1.10 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 140.87, change: -1.23, changePercent: -0.87 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 155.33, change: 3.45, changePercent: 2.27 },
  { symbol: "META", name: "Meta Platforms", price: 497.63, change: 8.91, changePercent: 1.82 },
]

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface StockSearchProps {
  onStockSelect?: (symbol: string) => void
}

export function StockSearch({ onStockSelect }: StockSearchProps) {
  const [query, setQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchResults, setSearchResults] = useState<Stock[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // 搜索股票
  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults([])
      setShowSuggestions(false)
      return
    }

    const filtered = mockStocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
    )
    setSearchResults(filtered)
    setShowSuggestions(true)
    setSelectedIndex(-1)
  }, [query])

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleSelectStock(searchResults[selectedIndex])
        } else if (searchResults.length > 0) {
          handleSelectStock(searchResults[0])
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // 选择股票
  const handleSelectStock = (stock: Stock) => {
    setQuery(stock.symbol)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    // 调用回调函数通知父组件
    if (onStockSelect) {
      onStockSelect(stock.symbol)
    }
    console.log("Selected stock:", stock)
  }

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        suggestionsRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">搜索股票</CardTitle>
        <p className="text-gray-400 text-sm">输入股票代码或公司名称开始搜索</p>
      </CardHeader>
      <CardContent>
        <div className="relative" ref={suggestionsRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="例如: AAPL, Apple"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (searchResults.length > 0) setShowSuggestions(true)
              }}
              className="pl-10 bg-gray-700/50 border-gray-600 focus:border-blue-500 text-white"
            />
          </div>

          {/* 搜索建议 */}
          {showSuggestions && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {searchResults.map((stock, index) => (
                <div
                  key={`${stock.symbol}-${index}`}
                  className={cn(
                    "px-4 py-3 hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0",
                    selectedIndex === index && "bg-gray-700"
                  )}
                  onClick={() => handleSelectStock(stock)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">{stock.symbol}</span>
                        <span className="text-sm text-gray-400">{stock.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-right">
                      <span className="font-medium text-white">${stock.price.toFixed(2)}</span>
                      <div className={`flex items-center space-x-1 text-sm ${
                        stock.change >= 0 ? "text-green-400" : "text-red-400"
                      }`}>
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
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 无搜索结果 */}
          {showSuggestions && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 p-4">
              <p className="text-gray-400 text-center">未找到相关股票</p>
            </div>
          )}

          {/* 快速搜索提示 */}
          <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-2">
            {["AAPL", "TSLA", "MSFT", "GOOGL", "AMZN", "META"].map((symbol) => (
              <Button
                key={symbol}
                variant="outline"
                size="sm"
                onClick={() => setQuery(symbol)}
                className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
              >
                {symbol}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}