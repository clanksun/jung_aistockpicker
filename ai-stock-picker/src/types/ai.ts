/**
 * AI 相关类型定义
 * 支持多个 AI 模型提供商
 */

// 支持的 AI 提供商
export type AIProvider =
  | 'zhipu'      // 智谱 AI (GLM-4)
  | 'deepseek'   // DeepSeek
  | 'openai'     // OpenAI (GPT-4)
  | 'anthropic'  // Anthropic (Claude)
  | 'qwen'       // 通义千问
  | 'baichuan'   // 百川智能
  | 'moonshot'   // Moonshot (Kimi)

// AI 提供商配置信息
export interface AIProviderConfig {
  id: AIProvider
  name: string
  displayName: string
  baseUrl: string
  models: string[]
  requiresApiKey: boolean
  description: string
  icon: string
  website: string
}

// 用户配置的 API Key
export interface UserAIConfig {
  provider: AIProvider
  apiKey: string
  model: string
  enabled: boolean
  createdAt: string
}

// AI 消息类型
export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// AI API 请求
export interface AIRequest {
  messages: AIMessage[]
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

// AI API 响应
export interface AIResponse {
  success: boolean
  content?: string
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// 股票分析请求参数
export interface StockAnalysisRequest {
  symbol: string
  stockName: string
  currentPrice: number
  includeFundamental: boolean
  includeTechnical: boolean
  includeSentiment: boolean
}
