"use client"

import { useState } from "react"
import { Brain, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AnalysisData {
  symbol: string
  fundamental: {
    overall: 'bullish' | 'bearish' | 'neutral'
    score: number
    factors: {
      name: string
      status: 'positive' | 'negative' | 'neutral'
      description: string
    }[]
  }
  technical: {
    overall: 'bullish' | 'bearish' | 'neutral'
    score: number
    indicators: {
      name: string
      value: number
      signal: 'buy' | 'sell' | 'neutral'
    }[]
  }
  sentiment: {
    overall: 'bullish' | 'bearish' | 'neutral'
    score: number
    sources: {
      name: string
      sentiment: 'positive' | 'negative' | 'neutral'
      confidence: number
    }[]
  }
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell'
  confidence: number
  reasoning: string[]
}

export default function AnalysisPage() {
  const [symbol, setSymbol] = useState('AAPL')
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)

  const runAnalysis = async () => {
    setIsLoading(true)

    // 模拟 AI 分析
    await new Promise(resolve => setTimeout(resolve, 2500))

    const mockAnalysis: AnalysisData = {
      symbol: symbol,
      fundamental: {
        overall: 'bullish',
        score: 75,
        factors: [
          {
            name: '盈利能力',
            status: 'positive',
            description: 'ROE 45.2%，远高于行业平均'
          },
          {
            name: '估值水平',
            status: 'neutral',
            description: 'PE 28.5，略高于行业中位数'
          },
          {
            name: '成长性',
            status: 'positive',
            description: '营收同比增长 8.5%，保持稳定'
          },
          {
            name: '财务健康',
            status: 'positive',
            description: '现金储备充裕，负债率低'
          }
        ]
      },
      technical: {
        overall: 'bullish',
        score: 68,
        indicators: [
          { name: 'RSI(14)', value: 58.3, signal: 'neutral' },
          { name: 'MACD', value: 2.34, signal: 'buy' },
          { name: 'MA5', value: 186.12, signal: 'buy' },
          { name: 'MA20', value: 182.45, signal: 'buy' }
        ]
      },
      sentiment: {
        overall: 'bullish',
        score: 72,
        sources: [
          { name: '分析师评级', sentiment: 'positive', confidence: 85 },
          { name: '社交媒体', sentiment: 'positive', confidence: 65 },
          { name: '新闻情绪', sentiment: 'neutral', confidence: 70 },
          { name: '机构持仓', sentiment: 'positive', confidence: 80 }
        ]
      },
      recommendation: 'buy',
      confidence: 78,
      reasoning: [
        '基本面强劲，盈利能力行业领先',
        '技术指标显示上升趋势',
        '市场情绪整体乐观',
        '短期波动风险可控',
        '适合中长期持有'
      ]
    }

    setAnalysis(mockAnalysis)
    setIsLoading(false)
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'strong_buy': return 'text-green-400'
      case 'buy': return 'text-green-300'
      case 'hold': return 'text-amber-400'
      case 'sell': return 'text-red-300'
      case 'strong_sell': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getRecommendationText = (rec: string) => {
    switch (rec) {
      case 'strong_buy': return '强烈买入'
      case 'buy': return '买入'
      case 'hold': return '持有'
      case 'sell': return '卖出'
      case 'strong_sell': return '强烈卖出'
      default: return '观望'
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Brain className="h-8 w-8 mr-3 text-blue-400" />
            AI 深度分析
          </h1>
          <p className="text-gray-400">基于多维度数据的智能投资建议</p>
        </div>
      </div>

      {/* 股票输入 */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-lg focus:border-blue-500 focus:outline-none"
              placeholder="输入股票代码，如 AAPL"
            />
            <Button
              onClick={runAnalysis}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  分析中...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  开始分析
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-blue-600/30"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
                <Brain className="absolute inset-0 m-auto h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI 正在分析...</h3>
              <p className="text-gray-400">综合评估基本面、技术面和市场情绪</p>
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && !isLoading && (
        <>
          {/* 总体评级 */}
          <Card className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-600/30">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {analysis.symbol} 综合评级
                  </h2>
                  <p className="text-gray-300">基于 AI 多维度分析模型</p>
                </div>
                <div className="text-right">
                  <div className={`text-5xl font-bold ${getRecommendationColor(analysis.recommendation)} mb-2`}>
                    {getRecommendationText(analysis.recommendation)}
                  </div>
                  <p className="text-gray-300">
                    AI 置信度: <span className="text-blue-400 font-semibold">{analysis.confidence}%</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 三维分析 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 基本面分析 */}
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
                  基本面分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">综合得分</span>
                    <span className={`text-2xl font-bold ${
                      analysis.fundamental.overall === 'bullish' ? 'text-green-400' :
                      analysis.fundamental.overall === 'bearish' ? 'text-red-400' :
                      'text-amber-400'
                    }`}>
                      {analysis.fundamental.score}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        analysis.fundamental.overall === 'bullish' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                        analysis.fundamental.overall === 'bearish' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        'bg-gradient-to-r from-amber-500 to-amber-600'
                      }`}
                      style={{ width: `${analysis.fundamental.score}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {analysis.fundamental.factors.map((factor, index) => (
                    <div key={index} className="flex items-start">
                      {factor.status === 'positive' ? (
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      ) : factor.status === 'negative' ? (
                        <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                      ) : (
                        <div className="h-5 w-5 text-amber-400 mr-2 mt-0.5 flex-shrink-0">•</div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{factor.name}</p>
                        <p className="text-xs text-gray-400">{factor.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 技术面分析 */}
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-purple-400" />
                  技术面分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">综合得分</span>
                    <span className={`text-2xl font-bold ${
                      analysis.technical.overall === 'bullish' ? 'text-green-400' :
                      analysis.technical.overall === 'bearish' ? 'text-red-400' :
                      'text-amber-400'
                    }`}>
                      {analysis.technical.score}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        analysis.technical.overall === 'bullish' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                        analysis.technical.overall === 'bearish' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        'bg-gradient-to-r from-amber-500 to-amber-600'
                      }`}
                      style={{ width: `${analysis.technical.score}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {analysis.technical.indicators.map((indicator, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{indicator.name}</span>
                      <span className={`text-sm font-semibold px-2 py-1 rounded ${
                        indicator.signal === 'buy' ? 'bg-green-600/20 text-green-400' :
                        indicator.signal === 'sell' ? 'bg-red-600/20 text-red-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {indicator.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 市场情绪 */}
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-amber-400" />
                  市场情绪
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">综合得分</span>
                    <span className={`text-2xl font-bold ${
                      analysis.sentiment.overall === 'bullish' ? 'text-green-400' :
                      analysis.sentiment.overall === 'bearish' ? 'text-red-400' :
                      'text-amber-400'
                    }`}>
                      {analysis.sentiment.score}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        analysis.sentiment.overall === 'bullish' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                        analysis.sentiment.overall === 'bearish' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        'bg-gradient-to-r from-amber-500 to-amber-600'
                      }`}
                      style={{ width: `${analysis.sentiment.score}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {analysis.sentiment.sources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{source.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              source.sentiment === 'positive' ? 'bg-green-500' :
                              source.sentiment === 'negative' ? 'bg-red-500' :
                              'bg-amber-500'
                            }`}
                            style={{ width: `${source.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{source.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI 推理过程 */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">AI 推理过程</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.reasoning.map((reason, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-xs text-blue-400 font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-300">{reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 风险提示 */}
          <Card className="bg-amber-600/10 border-amber-600/30">
            <CardContent className="p-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold mb-2">风险提示</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• 本分析仅供参考，不构成投资建议</li>
                    <li>• 股票投资存在风险，历史表现不代表未来收益</li>
                    <li>• 请根据自身风险承受能力做出投资决策</li>
                    <li>• 建议结合多方面信息进行综合判断</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
