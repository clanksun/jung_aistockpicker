"use client"

import { useState } from "react"
import { Play, TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type StrategyType = 'ma_crossover' | 'rsi' | 'mean_reversion'

interface BacktestResult {
  totalReturn: number
  annualizedReturn: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
  totalTrades: number
}

export default function BacktestPage() {
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>('ma_crossover')
  const [symbol, setSymbol] = useState('AAPL')
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<BacktestResult | null>(null)

  const strategies = [
    {
      id: 'ma_crossover' as StrategyType,
      name: 'MA 交叉策略',
      description: '当短期均线(5日)上穿长期均线(20日)时买入，反之卖出',
      params: ['短期均线周期', '长期均线周期']
    },
    {
      id: 'rsi' as StrategyType,
      name: 'RSI 策略',
      description: 'RSI低于30时买入，高于70时卖出',
      params: ['RSI周期', '超买线', '超卖线']
    },
    {
      id: 'mean_reversion' as StrategyType,
      name: '均值回归策略',
      description: '价格偏离均值一定程度时进行反向交易',
      params: ['均值周期', '偏离阈值']
    }
  ]

  const runBacktest = async () => {
    setIsRunning(true)

    // 模拟回测计算
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 生成模拟结果
    const mockResult: BacktestResult = {
      totalReturn: Math.random() * 40 + 10,
      annualizedReturn: Math.random() * 20 + 5,
      sharpeRatio: Math.random() * 2 + 0.5,
      maxDrawdown: -(Math.random() * 15 + 5),
      winRate: Math.random() * 20 + 45,
      totalTrades: Math.floor(Math.random() * 50 + 20)
    }

    setResult(mockResult)
    setIsRunning(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">策略回测</h1>
        <p className="text-gray-400">测试和优化您的交易策略</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：策略选择和参数设置 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 股票选择 */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">股票代码</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="输入股票代码，如 AAPL"
              />
            </CardContent>
          </Card>

          {/* 策略选择 */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">选择策略</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {strategies.map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(strategy.id)}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    selectedStrategy === strategy.id
                      ? 'bg-blue-600/20 border-2 border-blue-500'
                      : 'bg-gray-700/30 border-2 border-gray-700/50 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{strategy.name}</h4>
                    {selectedStrategy === strategy.id && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{strategy.description}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* 策略参数 */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">策略参数</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {strategies.find(s => s.id === selectedStrategy)?.params.map((param, index) => (
                <div key={index}>
                  <label className="text-sm text-gray-400 mb-2 block">{param}</label>
                  <input
                    type="number"
                    defaultValue={index === 0 ? 5 : index === 1 ? 20 : 14}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              ))}
              <Button
                onClick={runBacktest}
                disabled={isRunning}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    回测中...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    开始回测
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：回测结果 */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-800/50 border-gray-700/50 h-full">
            <CardHeader>
              <CardTitle className="text-white">回测结果</CardTitle>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="flex flex-col items-center justify-center h-96">
                  <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                    <Activity className="h-8 w-8 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">等待回测</h3>
                  <p className="text-gray-400 text-center">
                    选择策略和参数，点击"开始回测"查看结果
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 核心指标 */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-600/10 to-blue-700/10 rounded-xl p-4 border border-blue-600/20">
                      <div className="flex items-center justify-between mb-2">
                        <DollarSign className="h-5 w-5 text-blue-400" />
                        <span className={`text-sm font-semibold ${
                          result.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {result.totalReturn >= 0 ? '+' : ''}{result.totalReturn.toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">总收益率</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {result.totalReturn.toFixed(2)}%
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-600/10 to-green-700/10 rounded-xl p-4 border border-green-600/20">
                      <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                      </div>
                      <p className="text-sm text-gray-400">年化收益</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {result.annualizedReturn.toFixed(2)}%
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-600/10 to-purple-700/10 rounded-xl p-4 border border-purple-600/20">
                      <div className="flex items-center justify-between mb-2">
                        <Activity className="h-5 w-5 text-purple-400" />
                      </div>
                      <p className="text-sm text-gray-400">夏普比率</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {result.sharpeRatio.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-red-600/10 to-red-700/10 rounded-xl p-4 border border-red-600/20">
                      <div className="flex items-center justify-between mb-2">
                        <TrendingDown className="h-5 w-5 text-red-400" />
                        <span className="text-sm font-semibold text-red-400">
                          {result.maxDrawdown.toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">最大回撤</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {result.maxDrawdown.toFixed(2)}%
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-600/10 to-amber-700/10 rounded-xl p-4 border border-amber-600/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-xs text-black font-bold">
                          %
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">胜率</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {result.winRate.toFixed(1)}%
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-cyan-600/10 to-cyan-700/10 rounded-xl p-4 border border-cyan-600/20">
                      <div className="flex items-center justify-between mb-2">
                        <Activity className="h-5 w-5 text-cyan-400" />
                      </div>
                      <p className="text-sm text-gray-400">交易次数</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {result.totalTrades}
                      </p>
                    </div>
                  </div>

                  {/* 策略评估 */}
                  <div className="bg-gray-700/30 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">策略评估</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">风险等级</span>
                        <span className="text-white font-semibold">
                          {result.maxDrawdown < -10 ? '高风险' : result.maxDrawdown < -5 ? '中风险' : '低风险'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">策略评级</span>
                        <span className={`font-semibold ${
                          result.sharpeRatio > 1.5 ? 'text-green-400' : result.sharpeRatio > 1 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {result.sharpeRatio > 1.5 ? '优秀' : result.sharpeRatio > 1 ? '良好' : '一般'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">收益稳定性</span>
                        <span className={`font-semibold ${
                          result.winRate > 55 ? 'text-green-400' : result.winRate > 45 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {result.winRate > 55 ? '稳定' : result.winRate > 45 ? '一般' : '不稳定'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 建议 */}
                  <div className="bg-blue-600/10 rounded-xl p-6 border border-blue-600/20">
                    <h4 className="text-lg font-semibold text-white mb-3">优化建议</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      {result.winRate < 50 && (
                        <li className="flex items-start">
                          <span className="text-blue-400 mr-2">•</span>
                          胜率较低，建议优化入场时机或增加过滤条件
                        </li>
                      )}
                      {result.maxDrawdown < -10 && (
                        <li className="flex items-start">
                          <span className="text-blue-400 mr-2">•</span>
                          回撤较大，建议设置止损或降低仓位
                        </li>
                      )}
                      {result.sharpeRatio < 1 && (
                        <li className="flex items-start">
                          <span className="text-blue-400 mr-2">•</span>
                          夏普比率偏低，建议提高收益率或降低波动
                        </li>
                      )}
                      {result.totalTrades < 30 && (
                        <li className="flex items-start">
                          <span className="text-blue-400 mr-2">•</span>
                          交易次数较少，可能错过更多机会
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
