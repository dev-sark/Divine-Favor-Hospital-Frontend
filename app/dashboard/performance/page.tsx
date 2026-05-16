"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { analyticsApi } from "@/lib/api"
import { Trophy, Award, TrendingUp, Users, Stethoscope, Pill, FlaskConical, ClipboardList, ShieldCheck, User } from "lucide-react"
import { useAuth } from "@/providers/AuthContext"
import { useRouter } from "next/navigation"

// ── Role config: color + icon + label ────────────────────────────────────────
const ROLE_CONFIG: Record<string, { color: string; bar: string; icon: React.ReactNode; label: string }> = {
    DOCTOR:       { color: "text-blue-600",   bar: "bg-blue-500",   icon: <Stethoscope className="w-4 h-4" />, label: "Doctor" },
    NURSE:        { color: "text-emerald-600", bar: "bg-emerald-500", icon: <ClipboardList className="w-4 h-4" />, label: "Nurse" },
    PHARMACIST:   { color: "text-purple-600",  bar: "bg-purple-500",  icon: <Pill className="w-4 h-4" />, label: "Pharmacist" },
    LAB_TECH:     { color: "text-orange-600",  bar: "bg-orange-500",  icon: <FlaskConical className="w-4 h-4" />, label: "Lab Tech" },
    ACCOUNTANT:   { color: "text-yellow-600",  bar: "bg-yellow-500",  icon: <Trophy className="w-4 h-4" />, label: "Accountant" },
    RECEPTIONIST: { color: "text-pink-600",    bar: "bg-pink-500",    icon: <Users className="w-4 h-4" />, label: "Receptionist" },
    ADMIN:        { color: "text-slate-600",   bar: "bg-slate-500",   icon: <ShieldCheck className="w-4 h-4" />, label: "Admin" },
}

const DEFAULT_CONFIG = { color: "text-slate-500", bar: "bg-slate-400", icon: <User className="w-4 h-4" />, label: "Staff" }

function getRoleConfig(role: string) {
    return ROLE_CONFIG[role?.toUpperCase()] ?? DEFAULT_CONFIG
}

// ── Bar Chart (pure CSS/SVG, no library) ─────────────────────────────────────
function PerformanceBarChart({ data }: { data: any[] }) {
    if (!data.length) return (
        <div className="h-64 flex items-center justify-center text-slate-400 italic text-sm">
            No performance data yet. Actions will appear here once staff begin working.
        </div>
    )

    const max = Math.max(...data.map(d => d.actionCount), 1)

    return (
        <div className="w-full overflow-x-auto">
            <div className="min-w-[500px]">
                {/* Y-axis labels */}
                <div className="flex gap-2 items-end" style={{ height: "220px" }}>
                    {/* Y-axis */}
                    <div className="flex flex-col justify-between h-full text-right pr-2 shrink-0 w-8">
                        {[max, Math.ceil(max * 0.5), 0].map((v, i) => (
                            <span key={i} className="text-[10px] text-slate-400 font-mono leading-none">{v} pts</span>
                        ))}
                    </div>

                    {/* Bars */}
                    <div className="flex-1 flex items-end gap-3 h-full border-b border-l border-slate-200 dark:border-slate-700 pb-0 relative">
                        {/* Gridlines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            {[0, 0.5, 1].map((_, i) => (
                                <div key={i} className="border-t border-slate-100 dark:border-slate-800 w-full" />
                            ))}
                        </div>

                        {data.map((staff) => {
                            const cfg = getRoleConfig(staff.role)
                            const heightPct = max > 0 ? (staff.actionCount / max) * 100 : 0
                            return (
                                <div key={staff.id} className="flex-1 flex flex-col items-center gap-1.5 group relative z-10">
                                    {/* Value label on hover */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-black text-slate-700 dark:text-white absolute -top-6">
                                        {staff.performanceScore} pts
                                    </div>
                                    {/* Bar */}
                                    <div className="w-full flex items-end justify-center" style={{ height: "200px" }}>
                                        <div
                                            className={`w-full max-w-[40px] rounded-t-lg transition-all duration-700 ${cfg.bar} opacity-90 group-hover:opacity-100 group-hover:scale-105`}
                                            style={{ height: `${Math.max(heightPct, staff.performanceScore > 0 ? 2 : 0)}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* X-axis labels */}
                <div className="flex gap-2 mt-2 pl-10">
                    {data.map((staff) => {
                        const cfg = getRoleConfig(staff.role)
                        return (
                            <div key={staff.id} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                                <div className={`p-1.5 rounded-lg ${cfg.bar} bg-opacity-10 ${cfg.color}`}>
                                    {cfg.icon}
                                </div>
                                <p className="text-[10px] font-bold text-slate-600 text-center truncate w-full px-1">
                                    {staff.username}
                                </p>
                                <p className={`text-[9px] font-bold uppercase tracking-wider ${cfg.color}`}>
                                    {cfg.label}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

// ── Role Legend ───────────────────────────────────────────────────────────────
function RoleLegend() {
    return (
        <div className="flex flex-wrap gap-3">
            {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                <div key={role} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-sm ${cfg.bar}`} />
                    <span className="text-xs font-bold text-slate-500">{cfg.label}</span>
                </div>
            ))}
        </div>
    )
}

// ── Role Group Summary Cards ──────────────────────────────────────────────────
function RoleGroupCard({ role, staffList }: { role: string; staffList: any[] }) {
    const cfg = getRoleConfig(role)
    const top = staffList.reduce((a, b) => (a.performanceScore >= b.performanceScore ? a : b), staffList[0])
    const total = staffList.reduce((sum, s) => sum + s.performanceScore, 0)

    return (
        <Card className="p-5">
            <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${cfg.bar} text-white`}>
                    {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-xs font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}s</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{total}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Total points · {staffList.length} staff
                    </p>
                    <p className="text-xs text-slate-600 font-bold mt-2 truncate">
                        🏆 {top.username} ({top.performanceScore})
                    </p>
                </div>
            </div>
        </Card>
    )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PerformancePage() {
    const { user } = useAuth()
    const router = useRouter()
    const [performanceData, setPerformanceData] = React.useState<any[]>([])
    const [diseaseTrends, setDiseaseTrends] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [activeRoleFilter, setActiveRoleFilter] = React.useState("ALL")
    const [timePeriod, setTimePeriod] = React.useState("ALL")

    React.useEffect(() => {
        if (user && user.role !== "ADMIN") router.push("/dashboard")
    }, [user, router])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            let start = "ALL"
            let end = "ALL"

            if (timePeriod === "MONTH") {
                const now = new Date()
                start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
                end = now.toISOString().split('T')[0]
            }

            const [perf, trends] = await Promise.all([
                analyticsApi.getStaffPerformance(start, end),
                analyticsApi.getDiseaseTrends(),
            ])
            setPerformanceData(perf || [])
            setDiseaseTrends(trends || [])
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => { fetchData() }, [timePeriod])

    // Group by role
    const byRole = React.useMemo(() => {
        const map: Record<string, any[]> = {}
        performanceData.forEach(s => {
            const r = s.role?.toUpperCase() ?? "OTHER"
            if (!map[r]) map[r] = []
            map[r].push(s)
        })
        return map
    }, [performanceData])

    const roles = Object.keys(byRole)

    // Filtered data for chart
    const chartData = React.useMemo(() => {
        const base = activeRoleFilter === "ALL"
            ? performanceData
            : performanceData.filter(s => s.role?.toUpperCase() === activeRoleFilter)
        return [...base].sort((a, b) => b.performanceScore - a.performanceScore)
    }, [performanceData, activeRoleFilter])

    const topPerformer = performanceData.length > 0
        ? performanceData.reduce((a, b) => (a.performanceScore >= b.performanceScore ? a : b))
        : null

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Staff Performance Board</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Weighted performance scoring based on clinical impact.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {/* Period Selector */}
                        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
                            <button
                                onClick={() => setTimePeriod("ALL")}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${timePeriod === "ALL" ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"}`}
                            >
                                All Time
                            </button>
                            <button
                                onClick={() => setTimePeriod("MONTH")}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${timePeriod === "MONTH" ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"}`}
                            >
                                This Month
                            </button>
                        </div>

                        <button
                            onClick={fetchData}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-bold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors dark:text-white"
                        >
                            {isLoading ? "Loading..." : "Refresh"}
                        </button>
                    </div>
                </div>

                {/* Top Performer Banner */}
                {!isLoading && topPerformer && (
                    <Card className="bg-primary text-primary-foreground overflow-hidden relative">
                        <div className="p-8 flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-widest opacity-80">🏆 Top Performer {timePeriod === "MONTH" ? "This Month" : ""}</p>
                                <h3 className="text-5xl font-black mt-2">{topPerformer.username}</h3>
                                <div className="flex items-center gap-3 mt-4">
                                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase">
                                        {getRoleConfig(topPerformer.role).label}
                                    </span>
                                    <span className="flex items-center gap-1 font-bold">
                                        <Award className="w-4 h-4" /> {topPerformer.performanceScore} Points Earned
                                    </span>
                                </div>
                            </div>
                            <Trophy className="w-32 h-32 opacity-10 absolute right-4 bottom-0" />
                        </div>
                    </Card>
                )}

                {/* Role Group Summary */}
                {!isLoading && roles.length > 0 && (
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Performance By Role</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {roles.map(role => (
                                <RoleGroupCard key={role} role={role} staffList={byRole[role]} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Bar Chart */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <CardTitle>Activity Bar Chart</CardTitle>
                                <CardDescription className="mt-1">
                                    Each bar = total audit log actions for that staff member.
                                </CardDescription>
                            </div>
                            {/* Role filter pills */}
                            <div className="flex gap-2 flex-wrap">
                                {["ALL", ...roles].map(role => {
                                    const cfg = getRoleConfig(role)
                                    return (
                                        <button
                                            key={role}
                                            onClick={() => setActiveRoleFilter(role)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                                                ${activeRoleFilter === role
                                                    ? "bg-slate-900 text-white border-slate-900"
                                                    : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                                                }`}
                                        >
                                            {role === "ALL" ? <TrendingUp className="w-3 h-3" /> : cfg.icon}
                                            {role === "ALL" ? "All Staff" : cfg.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                        <RoleLegend />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="h-64 flex items-center justify-center text-slate-400 italic text-sm">
                                Calculating performance metrics...
                            </div>
                        ) : (
                            <PerformanceBarChart data={chartData} />
                        )}
                    </CardContent>
                </Card>

                {/* Leaderboard + Disease Trends */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Leaderboard */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Full Leaderboard</CardTitle>
                            <CardDescription>All staff ranked by total verified actions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {isLoading ? (
                                    <p className="text-center py-8 text-slate-400">Loading...</p>
                                ) : performanceData.length === 0 ? (
                                    <p className="text-center py-8 text-slate-400 italic">No data yet.</p>
                                ) : (
                                    performanceData.map((staff, idx) => {
                                        const cfg = getRoleConfig(staff.role)
                                        return (
                                            <div key={staff.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-50 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                {/* Rank */}
                                                <div className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full bg-white border border-slate-100 text-xs font-black text-slate-400">
                                                    {idx + 1}
                                                </div>
                                                {/* Role icon */}
                                                <div className={`p-1.5 rounded-lg ${cfg.bar} text-white shrink-0`}>
                                                    {cfg.icon}
                                                </div>
                                                {/* Name */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{staff.username}</p>
                                                        <div className="flex gap-1">
                                                            {staff.rewards?.map((reward: string) => (
                                                                <span key={reward} className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-tighter flex items-center gap-1">
                                                                    <Award className="w-2 h-2" /> {reward}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className={`text-[10px] font-black uppercase tracking-wider ${cfg.color}`}>{cfg.label}</p>
                                                </div>
                                                {/* Score */}
                                                <div className="text-right shrink-0">
                                                    <p className="text-xl font-black text-slate-900 dark:text-white">{staff.performanceScore}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Impact Score</p>
                                                </div>
                                                <div className="text-right shrink-0 px-4 border-l border-slate-100">
                                                    <p className="text-lg font-black text-indigo-600">{staff.actionCount}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Patients/Actions</p>
                                                </div>
                                                {/* Mini bar */}
                                                <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden shrink-0">
                                                    <div
                                                        className={`h-full ${cfg.bar} rounded-full`}
                                                        style={{
                                                            width: `${performanceData[0]?.performanceScore > 0
                                                                ? (staff.performanceScore / performanceData[0].performanceScore) * 100
                                                                : 0}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Disease Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Disease Burden</CardTitle>
                            <CardDescription className="text-[10px]">Top conditions treated.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {diseaseTrends.length === 0 ? (
                                    <p className="text-center text-xs text-slate-400 py-4 italic">No clinical data.</p>
                                ) : (
                                    diseaseTrends.slice(0, 8).map((trend, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-slate-700 truncate mr-2">{trend.name}</span>
                                                <span className="font-black text-indigo-600 shrink-0">{trend.count}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full"
                                                    style={{ width: `${Math.min(100, (trend.count / (diseaseTrends[0]?.count || 1)) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
