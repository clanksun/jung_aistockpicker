"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Brain, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Zap, Settings, Info, Activity, History, Trash2, Clock, MessageCircle, X, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { callAI, getStockAnalysisPrompt, getStockQuestionPrompt } from "@/lib/ai-client"
import type { UserAIConfig } from "@/types/ai"
import type { AnalysisData, StockInfo, AnalysisHistory } from "@/types/stock"

export default function AnalysisPage() {
  const router = useRouter()
  const [symbol, setSymbol] = useState('AAPL')
  const [stockName, setStockName] = useState('Apple Inc.')
  const [currentPrice, setCurrentPrice] = useState(185.92)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingStock, setIsLoadingStock] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [aiConfigs, setAiConfigs] = useState<UserAIConfig[]>([])
  const [useMock, setUseMock] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<AnalysisHistory[]>([])
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })
  const [toast, setToast] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error' | 'info'
  }>({
    show: false,
    message: '',
    type: 'info'
  })

  // AI 问答相关状态
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>>([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)

  useEffect(() => {
    loadAIConfigs()
    loadHistory()
    loadChatHistory()
  }, [])

  const loadChatHistory = () => {
    const stored = localStorage.getItem('chat_history')
    if (stored) {
      try {
        const history = JSON.parse(stored)
        setChatMessages(history)
      } catch (error) {
        console.error('Failed to load chat history:', error)
      }
    }
  }

  const saveChatHistory = (messages: typeof chatMessages) => {
    localStorage.setItem('chat_history', JSON.stringify(messages))
  }

  const clearChatHistory = () => {
    setChatMessages([])
    localStorage.removeItem('chat_history')
  }

  const sendQuestion = async () => {
    if (!currentQuestion.trim()) {
      showToast('请输入问题', 'error')
      return
    }

    const userMessage = {
      role: 'user' as const,
      content: currentQuestion,
      timestamp: new Date().toISOString()
    }

    // 添加用户消息
    const updatedMessages = [...chatMessages, userMessage]
    setChatMessages(updatedMessages)
    saveChatHistory(updatedMessages)
    setCurrentQuestion('')
    setIsChatLoading(true)

    try {
      let response

      if (useMock) {
        // 模拟回答
        await new Promise(resolve => setTimeout(resolve, 1500))
        response = {
          success: true,
          content: `关于 ${symbol} (${stockName}) 的回答：\n\n这是一个模拟的回答。在实际使用中，当您配置了AI API后，这里会显示AI的真实回答。\n\n您的问题：${currentQuestion}\n\n建议：请先在设置页面配置AI提供商，或勾选"使用模拟数据"选项。`
        }
      } else {
        // 使用真实AI API
        const enabledConfigs = aiConfigs.filter(c => c.enabled && c.apiKey)

        if (enabledConfigs.length === 0) {
          throw new Error('没有可用的 AI 配置')
        }

        const config = enabledConfigs[0]

        // 使用当前分析结果作为上下文
        const context = analysis ? JSON.stringify(analysis, null, 2) : undefined

        const messages = getStockQuestionPrompt(symbol, currentQuestion, context)

        response = await callAI(
          config.provider,
          config.apiKey,
          config.model,
          messages,
          { timeout: 60000, maxRetries: 2 }
        )
      }

      if (response.success && response.content) {
        const assistantMessage = {
          role: 'assistant' as const,
          content: response.content,
          timestamp: new Date().toISOString()
        }

        const finalMessages = [...updatedMessages, assistantMessage]
        setChatMessages(finalMessages)
        saveChatHistory(finalMessages)
      } else {
        throw new Error(response.error || '获取回答失败')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '获取回答失败'
      showToast(errorMsg, 'error')

      // 添加错误消息
      const errorMessage = {
        role: 'assistant' as const,
        content: `抱歉，获取回答时出错：${errorMsg}`,
        timestamp: new Date().toISOString()
      }

      const finalMessages = [...updatedMessages, errorMessage]
      setChatMessages(finalMessages)
      saveChatHistory(finalMessages)
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendQuestion()
    }
  }

  const loadAIConfigs = () => {
    const stored = localStorage.getItem('ai_configs')
    if (stored) {
      const configs = JSON.parse(stored)
      setAiConfigs(configs)
      // 检查是否有启用的配置
      const hasEnabledConfig = configs.some((c: UserAIConfig) => c.enabled && c.apiKey)
      if (!hasEnabledConfig) {
        setUseMock(true)
      }
    } else {
      setUseMock(true)
    }
  }

  const loadHistory = () => {
    const stored = localStorage.getItem('analysis_history')
    if (stored) {
      const historyData = JSON.parse(stored)
      setHistory(historyData)
    }
  }

  const saveToHistory = (analysisData: AnalysisData, provider?: string) => {
    const newRecord: AnalysisHistory = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      symbol: symbol,
      stockName: stockName,
      currentPrice: currentPrice,
      analysis: analysisData,
      aiProvider: provider
    }

    // 保持最近 50 条记录
    const updatedHistory = [newRecord, ...history].slice(0, 50)
    setHistory(updatedHistory)
    localStorage.setItem('analysis_history', JSON.stringify(updatedHistory))
  }

  const deleteHistoryItem = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id)
    setHistory(updatedHistory)
    localStorage.setItem('analysis_history', JSON.stringify(updatedHistory))
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('analysis_history')
  }

  const fetchStockInfo = async (symbol: string) => {
    if (!symbol || symbol.length < 1) return

    setIsLoadingStock(true)
    try {
      const response = await fetch(`/api/stock/${symbol}/info`)
      const data = await response.json()

      if (data.success && data.data) {
        setStockName(data.data.name || symbol)
        setCurrentPrice(data.data.currentPrice || 0)
      } else {
        // 无法获取股票信息，但不阻止用户继续
        console.warn('Could not fetch stock info, using default values')
      }
    } catch (error) {
      console.error('Failed to fetch stock info:', error)
      // 静默失败，保持用户可以继续操作
    } finally {
      setIsLoadingStock(false)
    }
  }

  // 当符号改变时获取股票信息
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (symbol.length >= 1) {
        fetchStockInfo(symbol)
      }
    }, 500) // 防抖 500ms

    return () => clearTimeout(delayDebounce)
  }, [symbol])

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ ...toast, show: false }), 3000)
  }

  const runAnalysis = async () => {
    // 验证输入
    if (!symbol || symbol.trim().length === 0) {
      showToast('请输入股票代码', 'error')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      let result: AnalysisData
      let provider: string | undefined

      if (useMock) {
        // 使用模拟数据
        await new Promise(resolve => setTimeout(resolve, 2000))
        result = generateMockAnalysis()
        provider = 'Mock Data'
        showToast('分析完成（模拟数据）', 'success')
      } else {
        // 使用真实 AI API
        const enabledConfigs = aiConfigs.filter(c => c.enabled && c.apiKey)

        if (enabledConfigs.length === 0) {
          throw new Error('没有可用的 AI 配置，请先在设置页面配置 AI 或勾选"使用模拟数据"')
        }

        // 尝试使用第一个可用的配置
        const config = enabledConfigs[0]
        provider = config.provider

        const prompt = getStockAnalysisPrompt({
          symbol,
          stockName,
          currentPrice,
          includeFundamental: true,
          includeTechnical: true,
          includeSentiment: true
        })

        const response = await callAI(
          config.provider,
          config.apiKey,
          config.model,
          [
            {
              role: 'system',
              content: '你是一位专业的股票分析师。请严格按照用户要求的JSON格式返回分析结果。'
            },
            {
              role: 'user',
              content: prompt + '\n\n请严格按照上面的JSON格式返回，不要包含其他文字。'
            }
          ],
          { timeout: 60000, maxRetries: 2 }
        )

        if (!response.success || !response.content) {
          throw new Error(response.error || 'AI 分析失败')
        }

        // 解析 AI 返回的 JSON
        try {
          // 提取 JSON（可能有 markdown 代码块）
          let jsonStr = response.content
          const codeBlockMatch = jsonStr.match(/```json\n([\s\S]*?)\n```/) ||
                           jsonStr.match(/```\n([\s\S]*?)\n```/) ||
                           jsonStr.match(/({[\s\S]*})/)

          if (codeBlockMatch) {
            jsonStr = codeBlockMatch[1] || codeBlockMatch[0]
          }

          result = JSON.parse(jsonStr)
          result.symbol = symbol
        } catch (parseError) {
          console.error('JSON parse error:', parseError)
          console.log('AI Response:', response.content)
          throw new Error('AI 返回的数据格式错误，请重试或使用模拟数据')
        }
      }

      setAnalysis(result)
      // 保存到历史记录
      saveToHistory(result, provider)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '分析失败'
      setErrorMessage(errorMsg)
      showToast(errorMsg, 'error')

      // 如果是 AI 调用失败，询问是否降级到模拟数据
      if (!useMock && (errorMsg.includes('API') || errorMsg.includes('超时') || errorMsg.includes('network'))) {
        setConfirmDialog({
          show: true,
          title: 'AI 调用失败',
          message: `${errorMsg}\n\n是否使用模拟数据继续？`,
          onConfirm: () => {
            setUseMock(true)
            const mockResult = generateMockAnalysis()
            setAnalysis(mockResult)
            saveToHistory(mockResult, 'Mock Data')
            setErrorMessage('')
            showToast('已切换到模拟数据', 'info')
          }
        })
      }
    } finally {
      setIsLoading(false)
    }
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

  // 生成模拟分析数据
  function generateMockAnalysis(): AnalysisData {
    return {
      symbol: symbol,
      fundamental: {
        overall: 'bullish',
        score: 75,
        factors: [
          { name: '盈利能力', status: 'positive', description: 'ROE 45.2%，远高于行业平均' },
          { name: '估值水平', status: 'neutral', description: 'PE 28.5，略高于行业中位数' },
          { name: '成长性', status: 'positive', description: '营收同比增长 8.5%，保持稳定' },
          { name: '财务健康', status: 'positive', description: '现金储备充裕，负债率低' }
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
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowChat(!showChat)}
            className="border-purple-600/50 text-purple-300 hover:bg-purple-600/10"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            AI 问答 {chatMessages.length > 0 && `(${chatMessages.length})`}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
            className="border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
          >
            <History className="h-4 w-4 mr-2" />
            历史记录 {history.length > 0 && `(${history.length})`}
          </Button>
        </div>
      </div>

      {/* AI 配置提示 */}
      <Card className="bg-blue-600/10 border-blue-600/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Info className="h-5 w-5 text-blue-400" />
              <div className="text-sm text-gray-300">
                {aiConfigs.filter(c => c.enabled && c.apiKey).length > 0 ? (
                  <span>已配置 {aiConfigs.filter(c => c.enabled && c.apiKey).length} 个 AI 提供商</span>
                ) : (
                  <span>未配置 AI API，将使用模拟数据</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={useMock}
                  onChange={(e) => setUseMock(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span>使用模拟数据</span>
              </label>
              {!useMock && aiConfigs.filter(c => c.enabled && c.apiKey).length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/settings')}
                  className="border-blue-600/50 text-blue-400 hover:bg-blue-600/10"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  去配置
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI 问答对话框 */}
      {showChat && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          {/* 背景遮罩 */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowChat(false)}
          />

          {/* 对话框内容 */}
          <div className="relative z-10 w-full max-w-3xl mx-4 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
            {/* 标题栏 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">AI 智能问答</h3>
                <span className="text-sm text-gray-400">关于 {symbol}</span>
              </div>
              <div className="flex items-center space-x-2">
                {chatMessages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChatHistory}
                    className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    清空
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* 聊天内容区域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[500px]">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageCircle className="h-16 w-16 mb-4 text-gray-600" />
                  <p className="text-lg mb-2">开始向 AI 提问</p>
                  <p className="text-sm">询问关于 {symbol} ({stockName}) 的任何问题</p>
                  <div className="mt-4 text-sm text-gray-500 space-y-1">
                    <p>• 技术指标解读</p>
                    <p>• 投资建议</p>
                    <p>• 风险分析</p>
                    <p>• 行业对比</p>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {msg.content}
                      </div>
                      <div className={`text-xs mt-2 ${
                        msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm text-gray-400">AI 正在思考...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 输入区域 */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`询问关于 ${symbol} 的问题...`}
                  className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  disabled={isChatLoading}
                />
                <Button
                  onClick={sendQuestion}
                  disabled={isChatLoading || !currentQuestion.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6"
                >
                  {isChatLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      发送
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 历史记录 */}
      {showHistory && (
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-400" />
                分析历史
              </CardTitle>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  清空历史
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-gray-400 text-center py-8">暂无分析历史</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="font-semibold text-white">{record.symbol}</span>
                          <span className="text-sm text-gray-400">{record.stockName}</span>
                          <span className="text-sm text-gray-400">${record.currentPrice.toFixed(2)}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            record.analysis.recommendation === 'strong_buy' ? 'bg-green-600/20 text-green-400' :
                            record.analysis.recommendation === 'buy' ? 'bg-green-600/10 text-green-300' :
                            record.analysis.recommendation === 'hold' ? 'bg-amber-600/20 text-amber-400' :
                            record.analysis.recommendation === 'sell' ? 'bg-red-600/10 text-red-300' :
                            'bg-red-600/20 text-red-400'
                          }`}>
                            {getRecommendationText(record.analysis.recommendation)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(record.timestamp).toLocaleString('zh-CN')}
                          {record.aiProvider && ` • ${record.aiProvider}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSymbol(record.symbol)
                            setAnalysis(record.analysis)
                            setShowHistory(false)
                          }}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-600/10"
                        >
                          查看详情
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteHistoryItem(record.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>基本面: {record.analysis.fundamental.score}</span>
                      <span>技术面: {record.analysis.technical.score}</span>
                      <span>情绪: {record.analysis.sentiment.score}</span>
                      <span>置信度: {record.analysis.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 错误提示 */}
      {errorMessage && (
        <Card className="bg-red-600/10 border-red-600/30">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">分析失败</h4>
                <p className="text-sm text-gray-300">{errorMessage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className="flex items-center space-x-2">
              {isLoadingStock && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
              )}
              {!isLoadingStock && stockName && (
                <span className="text-sm text-gray-400 mr-2">{stockName} - ${currentPrice.toFixed(2)}</span>
              )}
              <Button
                onClick={runAnalysis}
                disabled={isLoading || isLoadingStock}
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

      {/* 自定义确认对话框 */}
      {confirmDialog.show && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText="使用模拟数据"
          cancelText="取消"
          type="warning"
          onConfirm={() => {
            confirmDialog.onConfirm()
            setConfirmDialog({ ...confirmDialog, show: false })
          }}
          onCancel={() => setConfirmDialog({ ...confirmDialog, show: false })}
        />
      )}

      {/* Toast 通知 */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2 duration-300 ${
          toast.type === 'success' ? 'bg-green-600' :
          toast.type === 'error' ? 'bg-red-600' :
          'bg-blue-600'
        } text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3`}>
          {toast.type === 'success' && <CheckCircle className="h-5 w-5" />}
          {toast.type === 'error' && <AlertCircle className="h-5 w-5" />}
          {toast.type === 'info' && <Info className="h-5 w-5" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}
