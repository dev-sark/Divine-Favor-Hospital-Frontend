"use client"

import * as React from "react"
import { Logo } from "@/components/ui/Logo"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/providers/AuthContext"
import { useTheme } from "@/providers/ThemeContext"
import { Button } from "./ui/Button"
import { Menu, X, LogOut, Sun, Moon } from "lucide-react"

interface DashboardLayoutProps {
    children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, logout, isLoading } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const pathname = usePathname()
    // Sidebar open by default on large screens, closed on mobile
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)

    const isDarkMode = theme === 'dark'

    // Handle initial mobile state
    React.useEffect(() => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false)
        }
    }, [])

    if (isLoading) return null
    if (!user) return null

    const role = user.role
    const userName = user.name

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 z-50 h-screen w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="h-full flex flex-col px-4 py-8">
                    <div className="flex items-center justify-between px-2 mb-10">
                        <Logo />
                        <button 
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2 overflow-y-auto pb-4 pr-1 custom-scrollbar">
                        {/* Common Items */}
                        <NavItem href="/dashboard/overview" label="Overview" active={pathname === '/dashboard/overview'} onClick={() => setIsSidebarOpen(false)} />

                        {/* Core Staff Workflows */}
                        {(role === 'ADMIN' || role === 'RECEPTIONIST' || role === 'NURSE') && (
                            <>
                                <NavItem href="/dashboard/registration" label="Registration Flow" active={pathname === '/dashboard/registration'} onClick={() => setIsSidebarOpen(false)} />
                                <NavItem href="/dashboard/appointments" label="Clinic Schedule" active={pathname === '/dashboard/appointments'} onClick={() => setIsSidebarOpen(false)} />
                            </>
                        )}

                        <NavItem href="/dashboard/history" label="All Patients" active={pathname === '/dashboard/history'} onClick={() => setIsSidebarOpen(false)} />

                        {(role === 'ADMIN' || role === 'NURSE') && (
                            <NavItem href="/dashboard/queue" label="Visits & Triage" active={pathname === '/dashboard/queue'} onClick={() => setIsSidebarOpen(false)} />
                        )}

                        {(role === 'ADMIN' || role === 'DOCTOR') && (
                            <NavItem href="/dashboard/consultation" label="Doctor Consultation" active={pathname === '/dashboard/consultation'} onClick={() => setIsSidebarOpen(false)} />
                        )}

                        {(role === 'ADMIN' || role === 'PHARMACIST') && (
                            <NavItem href="/dashboard/pharmacy" label="Pharmacy Portal" active={pathname === '/dashboard/pharmacy'} onClick={() => setIsSidebarOpen(false)} />
                        )}

                        {(role === 'ADMIN' || role === 'DOCTOR' || role === 'LAB_TECH') && (
                            <NavItem href="/dashboard/lab" label="Laboratory" active={pathname === '/dashboard/lab'} onClick={() => setIsSidebarOpen(false)} />
                        )}

                        {(role === 'ADMIN' || role === 'NURSE' || role === 'DOCTOR') && (
                            <NavItem href="/dashboard/ward" label="Wards & Admissions" active={pathname === '/dashboard/ward'} onClick={() => setIsSidebarOpen(false)} />
                        )}

                        {(role === 'ADMIN' || role === 'ACCOUNTANT' || role === 'CASHIER') && (
                            <NavItem href="/dashboard/billing" label="Billing" active={pathname === '/dashboard/billing'} onClick={() => setIsSidebarOpen(false)} />
                        )}

                        {role === 'ADMIN' && (
                            <>
                                <NavItem href="/dashboard/analytics/revenue" label="Revenue Analysis" active={pathname === '/dashboard/analytics/revenue'} onClick={() => setIsSidebarOpen(false)} />
                                <NavItem href="/dashboard/performance" label="Performance Board" active={pathname === '/dashboard/performance'} onClick={() => setIsSidebarOpen(false)} />
                                <NavItem href="/dashboard/staff" label="Staff Overview" active={pathname === '/dashboard/staff'} onClick={() => setIsSidebarOpen(false)} />
                                <NavItem href="/dashboard/staff/hr" label="HR & Payroll" active={pathname === '/dashboard/staff/hr'} onClick={() => setIsSidebarOpen(false)} />
                                <NavItem href="/dashboard/settings/pricing" label="Price List" active={pathname === '/dashboard/settings/pricing'} onClick={() => setIsSidebarOpen(false)} />
                                <NavItem href="/dashboard/audit" label="Audit Log" active={pathname === '/dashboard/audit'} onClick={() => setIsSidebarOpen(false)} />
                            </>
                        )}

                        <NavItem href="/dashboard/my-report" label="My Work Log" active={pathname === '/dashboard/my-report'} onClick={() => setIsSidebarOpen(false)} />
                        <NavItem href="/dashboard/settings" label="Account Settings" active={pathname === '/dashboard/settings'} onClick={() => setIsSidebarOpen(false)} />
                    </nav>

                    <div className="mt-auto space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{role}</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{userName}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold"
                                onClick={() => {
                                    localStorage.removeItem('token')
                                    localStorage.removeItem('username')
                                    localStorage.removeItem('roles')
                                    window.location.href = '/login'
                                }}
                            >
                                <LogOut size={16} />
                            </Button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 min-h-screen transition-all duration-300 ${
                isSidebarOpen ? 'lg:ml-72' : 'ml-0'
            }`}>
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 px-4 md:px-8 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        {!isSidebarOpen && (
                            <button 
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-3 text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
                            >
                                <Menu size={24} />
                            </button>
                        )}
                        <h1 className="text-sm md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Divine Favor <span className="text-primary">Hospital Management</span></h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={toggleTheme}
                            className="p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </header>
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main >
        </div >
    )
}

function NavItem({ href, label, active = false, onClick }: { href: string; label: string; active?: boolean; onClick?: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-bold transition-all ${active
                ? "bg-slate-900 dark:bg-primary text-white dark:text-primary-foreground shadow-xl shadow-slate-200 dark:shadow-none translate-x-1"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                }`}
        >
            <span className="text-[10px] uppercase tracking-[0.2em]">{label}</span>
        </Link>
    )
}
