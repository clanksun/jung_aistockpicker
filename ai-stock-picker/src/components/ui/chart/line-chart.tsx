"use client"

import * as React from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  LineProps,
} from "recharts"

import { cn } from "@/lib/utils"

interface ChartData {
  [key: string]: any
}

interface LineChartComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  data: ChartData[]
  xDataKey: string
  lines: Array<{
    dataKey: string
    stroke: string
    strokeWidth?: number
    dot?: boolean
    activeDot?: boolean
    strokeDasharray?: string
  }>
  showGrid?: boolean
  showTooltip?: boolean
  height?: number
  className?: string
}

export function LineChartComponent({
  data,
  xDataKey,
  lines,
  showGrid = true,
  showTooltip = true,
  height = 300,
  className,
  ...props
}: LineChartComponentProps) {
  const chartData = data

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
          <XAxis
            dataKey={xDataKey}
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            tickMargin={10}
            tickFormatter={(value) => value.toFixed(2)}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth || 2}
              strokeDasharray={line.strokeDasharray}
              dot={line.dot === false ? false : { strokeWidth: 2, r: 3, fill: line.stroke }}
              activeDot={line.activeDot === false ? false : { r: 6, stroke: line.stroke, strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}