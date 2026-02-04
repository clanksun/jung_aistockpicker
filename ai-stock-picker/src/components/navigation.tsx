"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Brain, BarChart3, Heart, Settings } from "lucide-react"

const navItems = [
  {
    href: "/",
    label: "首页",
    icon: Home,
  },
  {
    href: "/analysis",
    label: "AI分析",
    icon: Brain,
  },
  {
    href: "/backtest",
    label: "策略回测",
    icon: BarChart3,
  },
  {
    href: "/favorites",
    label: "收藏管理",
    icon: Heart,
  },
  {
    href: "/settings",
    label: "设置",
    icon: Settings,
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-sm">
      <div className="px-6">
        <div className="flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
