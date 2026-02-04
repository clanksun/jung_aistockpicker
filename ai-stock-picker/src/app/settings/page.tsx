"use client"

import { useState, useEffect } from "react"
import { Settings, Key, Check, Trash2, TestTube, AlertCircle, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AI_PROVIDERS, getRecommendedProviders } from "@/lib/ai-providers"
import { callAI } from "@/lib/ai-client"
import type { AIProvider, UserAIConfig } from "@/types/ai"

export default function SettingsPage() {
  const [configs, setConfigs] = useState<UserAIConfig[]>([])
  const [testProvider, setTestProvider] = useState<AIProvider | null>(null)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = () => {
    const stored = localStorage.getItem('ai_configs')
    if (stored) {
      setConfigs(JSON.parse(stored))
    }
  }

  const saveConfigs = (newConfigs: UserAIConfig[]) => {
    setConfigs(newConfigs)
    localStorage.setItem('ai_configs', JSON.stringify(newConfigs))
  }

  const addConfig = (provider: AIProvider) => {
    const providerConfig = AI_PROVIDERS[provider]
    if (!providerConfig) return

    const newConfig: UserAIConfig = {
      provider,
      apiKey: '',
      model: providerConfig.models[0],
      enabled: true,
      createdAt: new Date().toISOString()
    }

    saveConfigs([...configs, newConfig])
  }

  const updateConfig = (index: number, updates: Partial<UserAIConfig>) => {
    const newConfigs = [...configs]
    newConfigs[index] = { ...newConfigs[index], ...updates }
    saveConfigs(newConfigs)
  }

  const removeConfig = (index: number) => {
    const newConfigs = configs.filter((_, i) => i !== index)
    saveConfigs(newConfigs)
  }

  const testConnection = async (config: UserAIConfig) => {
    setIsTesting(true)
    setTestProvider(config.provider)
    setTestResult(null)

    try {
      const response = await callAI(
        config.provider,
        config.apiKey,
        config.model,
        [
          {
            role: 'user',
            content: '你好，请简要回复确认连接成功。'
          }
        ],
        { maxTokens: 50 }
      )

      setTestResult({
        success: response.success,
        message: response.success
          ? '✅ 连接成功！AI 已响应。'
          : `❌ 连接失败：${response.error}`
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ 错误：${error instanceof Error ? error.message : '未知错误'}`
      })
    } finally {
      setIsTesting(false)
    }
  }

  const getProviderStatus = (provider: AIProvider) => {
    const config = configs.find(c => c.provider === provider)
    if (!config) return 'not_configured'
    if (!config.apiKey) return 'no_api_key'
    if (!config.enabled) return 'disabled'
    return 'active'
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Settings className="h-8 w-8 mr-3 text-blue-400" />
            AI 配置
          </h1>
          <p className="text-gray-400">配置和管理 AI 模型提供商</p>
        </div>
      </div>

      {/* 提示信息 */}
      <Card className="bg-blue-600/10 border-blue-600/30">
        <CardContent className="p-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-white font-semibold mb-2">配置说明</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• 选择 AI 提供商并输入 API Key 即可使用</li>
                <li>• API Key 将安全保存在浏览器本地存储中</li>
                <li>• 可以配置多个提供商，系统会自动选择可用的</li>
                <li>• 推荐使用智谱 AI、DeepSeek 或通义千问（国内访问稳定）</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 已配置的提供商 */}
      {configs.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white">已配置的提供商</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {configs.map((config, index) => {
              const providerConfig = AI_PROVIDERS[config.provider]
              if (!providerConfig) return null

              const status = getProviderStatus(config.provider)
              const isTestingThis = isTesting && testProvider === config.provider

              return (
                <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{providerConfig.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{providerConfig.displayName}</h3>
                        <p className="text-sm text-gray-400">{providerConfig.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {status === 'active' && (
                        <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">已启用</span>
                      )}
                      {status === 'disabled' && (
                        <span className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-full">已禁用</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* API Key */}
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">API Key</label>
                      <div className="flex space-x-2">
                        <Input
                          type="password"
                          value={config.apiKey}
                          onChange={(e) => updateConfig(index, { apiKey: e.target.value })}
                          placeholder="输入 API Key"
                          className="flex-1 bg-gray-700/50 border-gray-600/50 text-white"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => testConnection(config)}
                          disabled={isTestingThis || !config.apiKey}
                          className="border-blue-600/50 text-blue-400 hover:bg-blue-600/10"
                        >
                          <TestTube className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* 模型选择 */}
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">模型</label>
                      <select
                        value={config.model}
                        onChange={(e) => updateConfig(index, { model: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      >
                        {providerConfig.models.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    </div>

                    {/* 启用开关 */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-400">启用此提供商</label>
                      <button
                        onClick={() => updateConfig(index, { enabled: !config.enabled })}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          config.enabled ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          config.enabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>

                    {/* 测试结果 */}
                    {isTestingThis && (
                      <div className="bg-blue-600/10 rounded-lg p-3 text-sm text-blue-400">
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                          测试连接中...
                        </div>
                      </div>
                    )}

                    {testResult && testProvider === config.provider && !isTesting && (
                      <div className={`rounded-lg p-3 text-sm ${
                        testResult.success ? 'bg-green-600/10 text-green-400' : 'bg-red-600/10 text-red-400'
                      }`}>
                        {testResult.message}
                      </div>
                    )}

                    {/* 删除按钮 */}
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeConfig(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除配置
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* 添加提供商 */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">添加 AI 提供商</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(AI_PROVIDERS).map((provider) => {
              const isConfigured = configs.some(c => c.provider === provider.id)
              const status = getProviderStatus(provider.id)

              return (
                <div
                  key={provider.id}
                  className={`bg-gray-700/30 rounded-lg p-4 border-2 transition-all ${
                    isConfigured
                      ? 'border-blue-600/50'
                      : 'border-gray-700/50 hover:border-gray-600/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{provider.icon}</span>
                      <div>
                        <h4 className="font-semibold text-white">{provider.displayName}</h4>
                        <p className="text-xs text-gray-400">{provider.name}</p>
                      </div>
                    </div>
                    {isConfigured && (
                      <Check className="h-5 w-5 text-green-400" />
                    )}
                  </div>

                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {provider.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      获取 API Key
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>

                    {!isConfigured ? (
                      <Button
                        size="sm"
                        onClick={() => addConfig(provider.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        添加
                      </Button>
                    ) : status === 'active' ? (
                      <span className="text-xs text-green-400">已配置</span>
                    ) : status === 'disabled' ? (
                      <span className="text-xs text-gray-400">已禁用</span>
                    ) : (
                      <span className="text-xs text-amber-400">未完善</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
