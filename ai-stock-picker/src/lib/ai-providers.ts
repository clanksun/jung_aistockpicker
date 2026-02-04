/**
 * AI 提供商配置数据
 */

import type { AIProviderConfig } from '@/types/ai'

export const AI_PROVIDERS: Record<string, AIProviderConfig> = {
  zhipu: {
    id: 'zhipu',
    name: 'Zhipu AI',
    displayName: '智谱 AI',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    models: ['glm-4-plus', 'glm-4-air', 'glm-4-flash', 'glm-3-turbo'],
    requiresApiKey: true,
    description: '智谱 AI 开放平台，提供 GLM-4 系列大模型',
    icon: '🧠',
    website: 'https://open.bigmodel.cn'
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    displayName: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    models: ['deepseek-chat', 'deepseek-coder'],
    requiresApiKey: true,
    description: 'DeepSeek 开放平台，专注于代码和推理',
    icon: '🔍',
    website: 'https://platform.deepseek.com'
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    displayName: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    requiresApiKey: true,
    description: 'OpenAI 官方 API，提供 GPT-4 系列模型',
    icon: '🤖',
    website: 'https://platform.openai.com'
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    displayName: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1/messages',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
    requiresApiKey: true,
    description: 'Anthropic Claude 系列，安全可靠的 AI 助手',
    icon: '🎭',
    website: 'https://console.anthropic.com'
  },
  qwen: {
    id: 'qwen',
    name: 'Qwen',
    displayName: '通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    models: ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen-long'],
    requiresApiKey: true,
    description: '阿里云通义千问，中文理解能力强',
    icon: '☁️',
    website: 'https://dashscope.aliyun.com'
  },
  baichuan: {
    id: 'baichuan',
    name: 'Baichuan',
    displayName: '百川智能',
    baseUrl: 'https://api.baichuan-ai.com/v1/chat/completions',
    models: ['Baichuan4', 'Baichuan3-Turbo', 'Baichuan2-Turbo'],
    requiresApiKey: true,
    description: '百川智能大模型，专注中文场景',
    icon: '🌊',
    website: 'https://platform.baichuan-ai.com'
  },
  moonshot: {
    id: 'moonshot',
    name: 'Moonshot',
    displayName: 'Moonshot (Kimi)',
    baseUrl: 'https://api.moonshot.cn/v1/chat/completions',
    models: ['moonshot-v1-128k', 'moonshot-v1-32k', 'moonshot-v1-8k'],
    requiresApiKey: true,
    description: 'Moonshot AI，支持超长上下文',
    icon: '🌙',
    website: 'https://platform.moonshot.cn'
  }
}

// 获取推荐的提供商列表
export function getRecommendedProviders(): AIProviderConfig[] {
  return [
    AI_PROVIDERS.zhipu,
    AI_PROVIDERS.deepseek,
    AI_PROVIDERS.qwen
  ]
}

// 根据 ID 获取提供商配置
export function getProviderConfig(id: string): AIProviderConfig | undefined {
  return AI_PROVIDERS[id]
}
