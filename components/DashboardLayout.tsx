"use client"

import * as React from "react"
import { Logo } from "@/components/ui/Logo"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/providers/AuthContext"
import { Button } from "./ui/Button"

interface DashboardLayoutProps {
    children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, logout, isLoading } = useAuth()
    const pathname = usePathname()

    if (isLoading) return null
    if (!user) return null

    const role = user.role
    const userName = user.name

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white shadow-sm transition-transform lg:translate-x-0">
                <div className="h-full flex flex-col px-4 py-8">
                    <Logo className="px-2 mb-10" />

                    <nav className="flex-1 space-y-2">
                        {/* Common Items */}
                        <NavItem href="/dashboard/overview" label="Overview" active={pathname === '/dashboard/overview'} />

                        {/* Core Staff Workflows */}
                        {(role === 'ADMIN' || role === 'RECEPTIONIST' || role === 'NURSE') && (
                            <NavItem href="/dashboard/registration" label="Registration Flow" active={pathname === '/dashboard/registration'} />
                        )}

                        <NavItem href="/dashboard/history" label="All Patients" active={pathname === '/dashboard/history'} />

                        {(role === 'ADMIN' || role === 'NURSE') && (
                            <NavItem href="/dashboard/queue" label="Visits & Triage" active={pathname === '/dashboard/queue'} />
                        )}

                        {(role === 'ADMIN' || role === 'DOCTOR') && (
                            <NavItem href="/dashboard/consultation" label="Doctor Consultation" active={pathname === '/dashboard/consultation'} />
                        )}

                        {(role === 'ADMIN' || role === 'PHARMACIST') && (
                            <NavItem href="/dashboard/pharmacy" label="Pharmacy Portal" active={pathname === '/dashboard/pharmacy'} />
                        )}

                        {role === 'ADMIN' && (
                            <>
                                <NavItem href="/dashboard/performance" label="Performance Board" active={pathname === '/dashboard/performance'} />
                                <NavItem href="/dashboard/staff" label="Staff Management" active={pathname === '/dashboard/staff'} />
                            </>
                        )}

                        <NavItem href="/dashboard/settings" label="Account Settings" active={pathname === '/dashboard/settings'} />
                    </nav>

                    <div className="mt-auto space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{role}</p>
                                <p className="text-sm font-bold text-slate-900 mt-0.5">{userName}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 font-bold"
                                onClick={() => {
                                    localStorage.removeItem('token')
                                    localStorage.removeItem('username')
                                    localStorage.removeItem('roles')
                                    window.location.href = '/login'
                                }}
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 min-h-screen transition-all duration-300">
                <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md">
                    <h1 className="text-lg font-semibold text-slate-800 uppercase tracking-tight">Divine Favor Hospital Management</h1>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main >
        </div >
    )
}

function NavItem({ href, label, active = false }: { href: string; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${active
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100"
                }`}
        >
            <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
        </Link>
    )
}
