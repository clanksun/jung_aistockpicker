/**
 * AI API 调用工具
 * 统一处理多个 AI 提供商的 API 调用
 */

import type { AIProvider, AIMessage, AIRequest, AIResponse, StockAnalysisRequest } from '@/types/ai'
import { AI_PROVIDERS } from './ai-providers'

// 默认超时时间（毫秒）
const DEFAULT_TIMEOUT = 60000 // 60秒

/**
 * 带重试机制的 AI API 调用
 */
export async function callAI(
  provider: AIProvider,
  apiKey: string,
  model: string,
  messages: AIMessage[],
  options?: {
    temperature?: number
    maxTokens?: number
    timeout?: number
    maxRetries?: number
  }
): Promise<AIResponse> {
  const providerConfig = AI_PROVIDERS[provider]
  const maxRetries = options?.maxRetries || 2
  const timeout = options?.timeout || DEFAULT_TIMEOUT

  if (!providerConfig) {
    return {
      success: false,
      error: `Unknown provider: ${provider}`
    }
  }

  if (!apiKey) {
    return {
      success: false,
      error: 'API Key is required'
    }
  }

  // 重试逻辑
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // 根据不同提供商构建请求
      if (provider === 'anthropic') {
        return await callAnthropic(apiKey, model, messages, { ...options, timeout })
      } else {
        return await callOpenAICompatible(providerConfig.baseUrl, apiKey, model, messages, { ...options, timeout })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'

      // 最后一次尝试失败，直接抛出错误
      if (attempt === maxRetries - 1) {
        console.error(`AI API Error (attempt ${attempt + 1}/${maxRetries}):`, errorMsg)
        return {
          success: false,
          error: errorMsg
        }
      }

      // 等待后重试（指数退避）
      const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000)
      console.log(`Retrying in ${waitTime}ms...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  // 不应该到达这里
  return {
    success: false,
    error: 'Max retries exceeded'
  }
}

/**
 * 调用 OpenAI 兼容的 API（智谱、DeepSeek、OpenAI、通义等）
 */
async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: AIMessage[],
  options?: { temperature?: number; maxTokens?: number; timeout?: number }
): Promise<AIResponse> {
  const timeout = options?.timeout || DEFAULT_TIMEOUT
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 2000
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error: ${response.status} - ${error}`)
    }

    const data = await response.json()

    return {
      success: true,
      content: data.choices[0]?.message?.content || '',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      }
    }
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * 调用 Anthropic Claude API
 */
async function callAnthropic(
  apiKey: string,
  model: string,
  messages: AIMessage[],
  options?: { temperature?: number; maxTokens?: number; timeout?: number }
): Promise<AIResponse> {
  const timeout = options?.timeout || DEFAULT_TIMEOUT
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        max_tokens: options?.maxTokens || 2000,
        temperature: options?.temperature || 0.7
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error: ${response.status} - ${error}`)
    }

    const data = await response.json()

    return {
      success: true,
      content: data.content[0]?.text || '',
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
      }
    }
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * 股票分析提示词模板
 */
export function getStockAnalysisPrompt(params: StockAnalysisRequest): string {
  const { symbol, stockName, currentPrice, includeFundamental, includeTechnical, includeSentiment } = params

  let prompt = `你是一位专业的股票分析师。请分析股票 ${symbol} (${stockName})，当前价格为 ${currentPrice}。

请从以下维度进行分析：

`

  if (includeFundamental) {
    prompt += `1. 基本面分析（盈利能力、估值水平、成长性、财务健康度）
`
  }

  if (includeTechnical) {
    prompt += `2. 技术面分析（价格趋势、技术指标信号、支撑阻力位）
`
  }

  if (includeSentiment) {
    prompt += `3. 市场情绪（分析师评级、新闻情绪、机构动向）
`
  }

  prompt += `请提供：
- 综合评级（强烈买入/买入/持有/卖出/强烈卖出）
- 置信度（0-100）
- 关键论据（3-5条）
- 风险提示

请以JSON格式返回分析结果，格式如下：
{
  "fundamental": {
    "overall": "bullish/bearish/neutral",
    "score": 0-100,
    "factors": [...]
  },
  "technical": {
    "overall": "bullish/bearish/neutral",
    "score": 0-100,
    "indicators": [...]
  },
  "sentiment": {
    "overall": "bullish/bearish/neutral",
    "score": 0-100,
    "sources": [...]
  },
  "recommendation": "strong_buy/buy/hold/sell/strong_sell",
  "confidence": 0-100,
  "reasoning": ["理由1", "理由2", ...]
}`

  return prompt
}

/**
 * 股票问答提示词
 */
export function getStockQuestionPrompt(symbol: string, question: string, context?: string): AIMessage[] {
  return [
    {
      role: 'system',
      content: '你是一位资深的股票投资顾问，擅长分析股票市场、财务报表和技术分析。请用专业、客观的语言回答用户的问题。'
    },
    {
      role: 'user',
      content: `关于股票 ${symbol}${context ? `（参考信息：${context}）` : ''}，我的问题是：${question}

请提供详细、专业的分析和建议。`
    }
  ]
}
