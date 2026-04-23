"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/AuthContext"

export default function DashboardRedirector() {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    React.useEffect(() => {
        if (isLoading) return

        if (!user) {
            router.push('/login')
            return
        }

        // Redirect everyone to the Overview first so they see the stats
        router.push('/dashboard/overview')
    }, [user, isLoading, router])

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Entering Digital Portal...</p>
            </div>
        </div>
    )
}
