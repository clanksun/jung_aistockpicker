"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Card } from "./card"
import { Button } from "./button"

interface ConfirmDialogProps {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  type?: 'danger' | 'warning' | 'info'
}

export function ConfirmDialog({
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  type = 'info'
}: ConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(true)

  const handleConfirm = () => {
    setIsOpen(false)
    setTimeout(() => onConfirm(), 150)
  }

  const handleCancel = () => {
    setIsOpen(false)
    setTimeout(() => onCancel(), 150)
  }

  // ESC 键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  if (!isOpen) return null

  const typeStyles = {
    danger: {
      confirmClass: 'bg-red-600 hover:bg-red-700',
      icon: '⚠️'
    },
    warning: {
      confirmClass: 'bg-amber-600 hover:bg-amber-700',
      icon: '⚠️'
    },
    info: {
      confirmClass: 'bg-blue-600 hover:bg-blue-700',
      icon: 'ℹ️'
    }
  }

  const styles = typeStyles[type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleCancel}
      />

      {/* 对话框内容 */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
        <Card className="bg-gray-800 border-gray-700 shadow-2xl">
          <div className="p-6">
            {/* 标题 */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{styles.icon}</span>
                <h3 className="text-xl font-semibold text-white">{title}</h3>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 消息内容 */}
            <p className="text-gray-300 mb-6 leading-relaxed">
              {message}
            </p>

            {/* 按钮组 */}
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                {cancelText}
              </Button>
              <Button
                onClick={handleConfirm}
                className={`${styles.confirmClass} text-white`}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// 简化的 confirm 函数，返回 Promise
export function confirm(options: {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}): Promise<boolean> {
  return new Promise((resolve) => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const onConfirm = () => {
      resolve(true)
      document.body.removeChild(container)
    }

    const onCancel = () => {
      resolve(false)
      document.body.removeChild(container)
    }

    const root = (window as any).ReactDOM.createRoot(container)
    root.render(
      <ConfirmDialog
        {...options}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
  })
}
