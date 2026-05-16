"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { auditApi } from "@/lib/api"
import { ShieldAlert, RefreshCw, User, Clock, FileText, Tag } from "lucide-react"
import { useAuth } from "@/providers/AuthContext"
import { useRouter } from "next/navigation"

const ACTION_COLORS: Record<string, string> = {
    // Medical
    CREATE_MEDICAL_RECORD: "bg-emerald-50 text-emerald-700",
    UPDATE_MEDICAL_RECORD: "bg-blue-50 text-blue-700",
    DISPENSE_MEDICATION:   "bg-purple-50 text-purple-700",
    // Nursing
    TRIAGE_PATIENT:        "bg-orange-50 text-orange-700",
    UPDATE_VISIT_STATUS:   "bg-sky-50 text-sky-700",
    // Patient
    REGISTER_PATIENT:      "bg-teal-50 text-teal-700",
    UPDATE_PATIENT:        "bg-yellow-50 text-yellow-700",
    // Admin / Auth
    APPROVE_STAFF:         "bg-green-50 text-green-700",
    DELETE_STAFF:          "bg-red-50 text-red-700",
    STAFF_REGISTERED:      "bg-indigo-50 text-indigo-700",
    CHANGE_PASSWORD:       "bg-pink-50 text-pink-700",
}

const ACTION_LABELS: Record<string, string> = {
    // Medical
    CREATE_MEDICAL_RECORD: "Created Record",
    UPDATE_MEDICAL_RECORD: "Updated Record",
    DISPENSE_MEDICATION:   "Dispensed Meds",
    // Nursing
    TRIAGE_PATIENT:        "Triage / Vitals",
    UPDATE_VISIT_STATUS:   "Status Updated",
    // Patient
    REGISTER_PATIENT:      "Patient Registered",
    UPDATE_PATIENT:        "Patient Updated",
    // Admin / Auth
    APPROVE_STAFF:         "Staff Approved",
    DELETE_STAFF:          "Staff Deleted",
    STAFF_REGISTERED:      "Staff Registered",
    CHANGE_PASSWORD:       "Password Changed",
}

function formatTimestamp(ts: string): string {
    if (!ts) return "—"
    const d = new Date(ts)
    return d.toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    })
}

export default function AuditLogPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [logs, setLogs] = React.useState<any[]>([])
    const [filtered, setFiltered] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [filter, setFilter] = React.useState("ALL")
    const [search, setSearch] = React.useState("")

    // Admin guard
    React.useEffect(() => {
        if (user && user.role !== "ADMIN") {
            router.push("/dashboard")
        }
    }, [user, router])

    const fetchLogs = async () => {
        setIsLoading(true)
        try {
            const data = await auditApi.getAll()
            setLogs(data || [])
            setFiltered(data || [])
        } catch (err: any) {
            console.error("Failed to fetch audit logs", err)
            if (err.message?.includes("403")) {
                router.push("/dashboard")
            }
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchLogs()
    }, [])

    // Filter whenever action filter OR search term changes
    React.useEffect(() => {
        let result = logs
        if (filter !== "ALL") {
            result = result.filter((l) => l.action === filter)
        }
        if (search.trim() !== "") {
            const q = search.toLowerCase()
            result = result.filter((l) =>
                (l.user?.username ?? "").toLowerCase().includes(q) ||
                (l.details ?? "").toLowerCase().includes(q) ||
                (l.resourceType ?? "").toLowerCase().includes(q)
            )
        }
        setFiltered(result)
    }, [filter, search, logs])

    const uniqueActions = ["ALL", ...Array.from(new Set(logs.map((l) => l.action)))]

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <ShieldAlert className="w-6 h-6 text-primary" />
                            System Audit Log
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Full history of every staff action recorded in the system.
                        </p>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={fetchLogs}
                        disabled={isLoading}
                        className="flex items-center gap-1.5"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                        {isLoading ? "Loading..." : "Refresh"}
                    </Button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Total Events"       value={logs.length}                                                        color="bg-slate-700" />
                    <StatCard label="Patient Events"     value={logs.filter(l => l.action === 'REGISTER_PATIENT' || l.action === 'UPDATE_PATIENT' || l.action === 'TRIAGE_PATIENT').length} color="bg-teal-500" />
                    <StatCard label="Clinical Events"    value={logs.filter(l => ['CREATE_MEDICAL_RECORD','UPDATE_MEDICAL_RECORD','DISPENSE_MEDICATION','UPDATE_VISIT_STATUS'].includes(l.action)).length} color="bg-blue-500" />
                    <StatCard label="Admin Events"       value={logs.filter(l => ['APPROVE_STAFF','DELETE_STAFF','STAFF_REGISTERED','CHANGE_PASSWORD'].includes(l.action)).length} color="bg-purple-500" />
                </div>

                {/* Search + Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by staff name, patient name, or folder number..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all dark:text-white"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Action Filter Pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {uniqueActions.map((action) => (
                            <button
                                key={action}
                                onClick={() => setFilter(action)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border
                                    ${filter === action
                                        ? "bg-slate-900 text-white border-slate-900"
                                        : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:text-slate-800"
                                    }`}
                            >
                                {action === "ALL" ? "All Events" : (ACTION_LABELS[action] || action)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Audit Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Activity Timeline</CardTitle>
                        <CardDescription>
                            {filtered.length} event{filtered.length !== 1 ? "s" : ""} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium text-xs uppercase tracking-wider">
                                        <th className="pb-3 pl-2">
                                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> Staff</span>
                                        </th>
                                        <th className="pb-3">
                                            <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Action</span>
                                        </th>
                                        <th className="pb-3">
                                            <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Resource</span>
                                        </th>
                                        <th className="pb-3">Details</th>
                                        <th className="pb-3 text-right pr-2">
                                            <span className="flex items-center gap-1 justify-end"><Clock className="w-3 h-3" /> Timestamp</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                                                Loading audit records...
                                            </td>
                                        </tr>
                                    ) : filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                                                No audit events found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((log) => (
                                            <tr key={log.id} className="group hover:bg-slate-50/60 transition-colors">
                                                {/* Staff */}
                                                <td className="py-4 pl-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs uppercase shrink-0">
                                                            {log.user?.username?.charAt(0) ?? "?"}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 dark:text-white text-sm">
                                                                {log.user?.username ?? "System"}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                {log.user?.role ?? "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Action Badge */}
                                                <td className="py-4">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${ACTION_COLORS[log.action] ?? "bg-slate-100 text-slate-600"}`}>
                                                        {ACTION_LABELS[log.action] ?? log.action}
                                                    </span>
                                                </td>

                                                {/* Resource */}
                                                <td className="py-4">
                                                    <p className="text-sm font-semibold text-slate-700">{log.resourceType}</p>
                                                    <p className="text-xs text-slate-400 font-mono">ID: {log.resourceId}</p>
                                                </td>

                                                {/* Details */}
                                                <td className="py-4 max-w-xs">
                                                    <p className="text-xs text-slate-500 truncate" title={log.details}>
                                                        {log.details ?? "—"}
                                                    </p>
                                                </td>

                                                {/* Timestamp */}
                                                <td className="py-4 text-right pr-2">
                                                    <p className="text-xs text-slate-500 font-medium whitespace-nowrap">
                                                        {formatTimestamp(log.timestamp)}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <Card className="p-5">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-10 rounded-full ${color}`} />
                <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                </div>
            </div>
        </Card>
    )
}
