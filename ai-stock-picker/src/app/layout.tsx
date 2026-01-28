import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Search, Bell, User } from "lucide-react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "孙铮的AI Stock Picker",
  description: "AI驱动的智能选股和回测平台",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen bg-background">
            {/* 主内容区 */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* 顶部导航 */}
              <header className="bg-white/5 border-b border-gray-800/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="px-6 py-3">
                  <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">孙</span>
                      </div>
                      <div>
                        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                          孙铮的AI Stock Picker
                        </h1>
                        <p className="text-xs text-gray-400">智能量化投资平台</p>
                      </div>
                    </div>

                    {/* 搜索框 */}
                    <div className="flex-1 max-w-xl mx-8">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="搜索股票代码或名称 (如: AAPL, Apple)"
                          className="pl-10 pr-4 py-2 bg-gray-800/60 border-gray-700/50 hover:border-gray-600 focus:border-blue-500 focus:bg-gray-800/80 transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* 右侧操作区 */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg"
                      >
                        <Bell className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg"
                      >
                        <User className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </header>

              {/* 导航菜单 */}
              <Navigation />

              {/* 页面内容 */}
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900/50 p-6">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}