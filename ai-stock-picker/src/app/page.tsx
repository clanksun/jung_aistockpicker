"use client"

import { useState } from "react"
import { TrendingUp, Brain, BarChart3, Heart } from "lucide-react"
import { StockSearch } from "@/components/dashboard/stock-search"
import { PopularStocks } from "@/components/dashboard/popular-stocks"
import { StockDetail } from "@/components/dashboard/stock-detail"

interface MarketCardProps {
  name: string
  value: string
  change: number
  changePercent: number
  trend: "up" | "down"
}

function MarketCard({ name, value, change, changePercent, trend }: MarketCardProps) {
  return (
    <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200 group">
      <h4 className="text-gray-400 text-sm mb-2 group-hover:text-gray-300 transition-colors">
        {name}
      </h4>
      <p className="text-xl font-semibold text-white mb-1">
        {value}
      </p>
      <div className={`flex items-center space-x-1 text-sm ${
        trend === "up" ? "text-green-400" : "text-red-400"
      }`}>
        {trend === "up" ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingUp className="h-3 w-3 rotate-180" />
        )}
        <span>
          {change >= 0 ? "+" : ""}{change.toFixed(2)}
          ({changePercent >= 0 ? "+" : ""}{changePercent.toFixed(2)}%)
        </span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [selectedStock, setSelectedStock] = useState<string | null>(null)

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol)
  }

  return (
    <div className="space-y-6">
      {!selectedStock && (
        <>
          {/* 欢迎区域 */}
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  孙铮的AI Stock Picker
                </h1>
                <p className="text-gray-300 text-lg">
                  智能选股 · 策略回测 · 深度分析
                </p>
                <div className="mt-4 flex items-center space-x-6 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>实时数据</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span>AI驱动</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span>专业量化</span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full flex items-center justify-center">
                  <div className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    孙
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 主要功能区域 */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* 左侧搜索区域 */}
            <div className="xl:col-span-2">
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
                  股票搜索
                </h2>
                <StockSearch onStockSelect={handleStockSelect} />
              </div>
            </div>

            {/* 右侧热门股票 */}
            <div>
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
                  热门股票
                </h2>
                <PopularStocks onStockSelect={handleStockSelect} />
              </div>
            </div>
          </div>

          {/* 功能操作卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-br from-blue-600/10 to-blue-700/10 p-6 hover:border-blue-500/50 transition-all duration-300 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-blue-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                    <Brain className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">AI深度分析</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  基本面分析 · 技术指标 · 市场情绪 · 风险评估
                </p>
                <button className="text-blue-400 hover:text-blue-300 font-medium text-sm flex items-center group-hover:translate-x-1 transition-transform">
                  立即分析
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-br from-purple-600/10 to-purple-700/10 p-6 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-purple-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">策略回测</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  MA交叉 · RSI策略 · 均值回归 · 绩效分析
                </p>
                <button className="text-purple-400 hover:text-purple-300 font-medium text-sm flex items-center group-hover:translate-x-1 transition-transform">
                  开始回测
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-br from-green-600/10 to-green-700/10 p-6 hover:border-green-500/50 transition-all duration-300 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-green-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                    <Heart className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">收藏管理</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  关注股票 · 回测结果 · 价格提醒 · 投组合计
                </p>
                <button className="text-green-400 hover:text-green-300 font-medium text-sm flex items-center group-hover:translate-x-1 transition-transform">
                  查看收藏
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* 市场概览 */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                市场概览
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">实时更新</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MarketCard
                name="上证指数"
                value="3,086.24"
                change={12.45}
                changePercent={0.40}
                trend="up"
              />
              <MarketCard
                name="深证成指"
                value="9,876.23"
                change={-23.56}
                changePercent={-0.24}
                trend="down"
              />
              <MarketCard
                name="创业板指"
                value="1,789.45"
                change={15.67}
                changePercent={0.88}
                trend="up"
              />
              <MarketCard
                name="恒生指数"
                value="16,456.78"
                change={89.23}
                changePercent={0.54}
                trend="up"
              />
            </div>
          </div>
        </>
      )}

      {selectedStock && (
        // 股票详情页面
        <StockDetail
          symbol={selectedStock}
          onBack={() => setSelectedStock(null)}
        />
      )}
    </div>
  )
}