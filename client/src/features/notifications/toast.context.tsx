import React, { createContext, useCallback, useContext, useState } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'hand'

export interface ToastItem {
  id: string
  title: string
  message?: string
  type: ToastType
  duration?: number
}

interface ToastContextValue {
  toasts: ToastItem[]
  addToast: (toast: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void
  info: (title: string, message?: string) => void
  success: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  handRaised: (studentName: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const duration = toast.duration ?? 4000
    const newItem: ToastItem = { ...toast, id }

    setToasts((prev) => [newItem, ...prev].slice(0, 5))

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  const info = useCallback((title: string, message?: string) => {
    addToast({ title, message, type: 'info' })
  }, [addToast])

  const success = useCallback((title: string, message?: string) => {
    addToast({ title, message, type: 'success' })
  }, [addToast])

  const warning = useCallback((title: string, message?: string) => {
    addToast({ title, message, type: 'warning' })
  }, [addToast])

  const error = useCallback((title: string, message?: string) => {
    addToast({ title, message, type: 'error' })
  }, [addToast])

  const handRaised = useCallback((studentName: string) => {
    addToast({ title: `${studentName} raised a hand ✋`, type: 'hand', duration: 5000 })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, info, success, warning, error, handRaised }}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl p-4 shadow-2xl border backdrop-blur-xl transition-all duration-300 ${
              toast.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-950/80 text-emerald-100'
                : toast.type === 'warning'
                ? 'border-amber-500/30 bg-amber-950/80 text-amber-100'
                : toast.type === 'error'
                ? 'border-red-500/30 bg-red-950/80 text-red-100'
                : toast.type === 'hand'
                ? 'border-fuchsia-500/30 bg-fuchsia-950/80 text-fuchsia-100'
                : 'border-sky-500/30 bg-slate-900/90 text-sky-100'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="size-5 text-emerald-400" />}
              {toast.type === 'warning' && <AlertCircle className="size-5 text-amber-400" />}
              {toast.type === 'error' && <AlertCircle className="size-5 text-red-400" />}
              {toast.type === 'hand' && <span className="text-lg leading-none">✋</span>}
              {toast.type === 'info' && <Info className="size-5 text-sky-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold tracking-wide">{toast.title}</p>
              {toast.message && <p className="mt-0.5 text-xs opacity-80 leading-relaxed">{toast.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
