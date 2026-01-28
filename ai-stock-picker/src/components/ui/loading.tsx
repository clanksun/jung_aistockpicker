"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
  className?: string
}

export function Loading({ size = "md", text, className }: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      {/* 脉冲圆点加载器 */}
      <div className="relative">
        <div className={cn("animate-pulse rounded-full bg-gradient-to-br from-blue-500 to-purple-600", sizeClasses[size])}></div>
        <div className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse",
          sizeClasses[size],
          "opacity-50"
        )}></div>
        <div className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse",
          sizeClasses[size],
          "opacity-30"
        )}></div>
      </div>

      {/* 加载文字 */}
      {text && (
        <div className="flex items-center space-x-2">
          <div className="space-y-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-sm text-gray-400">{text}</p>
        </div>
      )}
    </div>
  )
}

// 卡片骨架屏加载器
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 animate-pulse", className)}>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-700/50 rounded-xl"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700/30 rounded w-1/2"></div>
          </div>
        </div>
        <div className="h-32 bg-gray-700/30 rounded"></div>
      </div>
    </div>
  )
}

// 图表加载器
export function ChartLoader({ height = 400 }: { height?: number }) {
  return (
    <div className="relative" style={{ height }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-2 border-gray-700 rounded-full"></div>
            <div className="absolute inset-2 animate-ping opacity-20">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
            </div>
            <div className="absolute inset-4 animate-ping opacity-10" style={{ animationDelay: '0.5s' }}>
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-sm text-gray-400 mt-4">加载图表数据...</p>
        </div>
      </div>
    </div>
  )
}
