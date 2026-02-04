"use client"

import * as React from "react"
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, Line, ComposedChart } from "recharts"
import { cn } from "@/lib/utils"

interface CandlestickData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

interface CandlestickChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: CandlestickData[]
  height?: number
  showVolume?: boolean
  showMA?: boolean
  className?: string
}

export function CandlestickChart({
  data,
  height = 400,
  showVolume = true,
  showMA = true,
  className,
  ...props
}: CandlestickChartProps) {
  // 生成渐变色
  const getColor = (index: number) => {
    const prevClose = index > 0 ? data[index - 1].close : data[index].open
    return data[index].close >= prevClose ? '#10b981' : '#ef4444'
  }

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      const isGreen = item.close >= item.open

      return (
        <div className="bg-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-xl p-4 shadow-2xl min-w-[280px]">
          <div className="mb-3 pb-3 border-b border-gray-700/50">
            <p className="text-lg font-bold text-white">{label}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">开盘</span>
              <span className="text-white font-medium">${item.open.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">最高</span>
              <span className="text-white font-medium">${item.high.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">最低</span>
              <span className="text-white font-medium">${item.low.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">收盘</span>
              <span className={`font-medium ${isGreen ? 'text-green-400' : 'text-red-400'}`}>
                ${item.close.toFixed(2)}
              </span>
            </div>
            {item.volume && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">成交量</span>
                <span className="text-white font-medium">{(item.volume / 1000000).toFixed(2)}M</span>
              </div>
            )}
            {item.ma20 !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">MA20</span>
                <span className="text-amber-400 font-medium">${item.ma20.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  // 计算可视区域
  const visibleData = data.slice(-60)

  return (
    <div className={cn("w-full", className)} {...props}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={visibleData}>
          {/* 渐变定义 */}
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
              <stop offset="50%" stopColor="#10b981" stopOpacity={0.08}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.15}/>
              <stop offset="50%" stopColor="#ef4444" stopOpacity={0.08}/>
            </linearGradient>
          </defs>

          {/* 价格走势线 */}
          <Area
            dataKey="close"
            stroke="none"
            fill="url(#priceGradient)"
            isAnimationActive={true}
            animationDuration={500}
          />

          {/* 蜡烛体 - 使用Line模拟 */}
          {visibleData.map((entry, index) => {
            const prevClose = index > 0 ? visibleData[index - 1].close : entry.open
            const isGreen = entry.close >= prevClose
            const color = isGreen ? '#10b981' : '#ef4444'

            return (
              <React.Fragment key={index}>
                {/* 上影线 */}
                <Line
                  type="linear"
                  dataKey={isGreen ? 'high' : 'low'}
                  stroke={color}
                  strokeWidth={1}
                  dot={false}
                  isAnimationActive={false}
                />

                {/* 实体 */}
                <Line
                  type="linear"
                  dataKey="close"
                  stroke={color}
                  strokeWidth={isGreen ? 3 : 3}
                  strokeOpacity={0.9}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={300}
                />

                {/* 下影线 */}
                <Line
                  type="linear"
                  dataKey={isGreen ? 'low' : 'high'}
                  stroke={color}
                  strokeWidth={1}
                  dot={false}
                  isAnimationActive={false}
                />
              </React.Fragment>
            )
          })}

          {/* MA20 线 */}
          {showMA && (
            <Line
              type="monotone"
              dataKey="ma20"
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={true}
              animationDuration={500}
            />
          )}

          {/* 坐标轴 */}
          <XAxis
            dataKey="date"
            stroke="#4B5563"
            strokeWidth={1}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            tickMargin={10}
            axisLine={true}
            tickLine={false}
            padding={{ left: 0, right: 10 }}
          />
          <YAxis
            stroke="#4B5563"
            strokeWidth={1}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            tickMargin={10}
            axisLine={true}
            tickLine={false}
            padding={{ top: 10, bottom: 0 }}
            domain={['auto', 'auto']}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />

          {/* 网格线 */}
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#374151"
            strokeOpacity={0.1}
          />

          {/* Tooltip */}
          <Tooltip content={<CustomTooltip />} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
