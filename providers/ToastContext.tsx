"use client"

import * as React from "react"
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react"

type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
    id: string
    message: string
    type: ToastType
    title?: string
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, title?: string) => void
    success: (message: string, title?: string) => void
    error: (message: string, title?: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([])

    const showToast = React.useCallback((message: string, type: ToastType = "info", title?: string) => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts((prev) => [...prev, { id, message, type, title }])
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 5000)
    }, [])

    const success = (message: string, title?: string) => showToast(message, "success", title)
    const error = (message: string, title?: string) => showToast(message, "error", title)

    return (
        <ToastContext.Provider value={{ showToast, success, error }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-4 w-full max-w-[400px]">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const icons = {
        success: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
        error: <AlertCircle className="w-6 h-6 text-rose-500" />,
        info: <Info className="w-6 h-6 text-blue-500" />,
        warning: <AlertCircle className="w-6 h-6 text-amber-500" />
    }

    const bgColors = {
        success: "bg-emerald-50/90 border-emerald-100",
        error: "bg-rose-50/90 border-rose-100",
        info: "bg-blue-50/90 border-blue-100",
        warning: "bg-amber-50/90 border-amber-100"
    }

    return (
        <div 
            className={`flex items-start gap-4 p-5 rounded-[24px] border-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-right-10 duration-500 ${bgColors[toast.type]}`}
            role="alert"
        >
            <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
                {toast.title && <p className="font-black text-slate-900 text-sm uppercase tracking-tight mb-1">{toast.title}</p>}
                <p className="text-sm font-bold text-slate-700 leading-tight">{toast.message}</p>
            </div>
            <button 
                onClick={onClose}
                className="shrink-0 text-slate-400 hover:text-slate-900 transition-colors p-1"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}

export function useToast() {
    const context = React.useContext(ToastContext)
    if (!context) throw new Error("useToast must be used within a ToastProvider")
    return context
}
