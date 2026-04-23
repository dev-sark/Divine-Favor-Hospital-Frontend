"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { analyticsApi } from "@/lib/api"
import { Users, UserCheck, Stethoscope, Activity } from "lucide-react"

export default function DashboardOverview() {
    const [stats, setStats] = React.useState({ totalPatients: 0, totalStaff: 0, totalVisits: 0 })
    const [isLoading, setIsLoading] = React.useState(true)

    const fetchStats = async () => {
        try {
            const data = await analyticsApi.getSummary()
            setStats(data)
        } catch (err) {
            console.error("Failed to fetch stats", err)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchStats()
    }, [])

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Hospital Overview</h2>
                    <p className="text-slate-500">Welcome to the Divine Favor Digital Portal. Here is your live summary.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Total Patients"
                        value={stats.totalPatients}
                        description="Lifeline registered patients"
                        icon={<Users className="w-6 h-6 text-blue-600" />}
                        color="bg-blue-50"
                    />
                    <StatCard
                        title="Today's Visits"
                        value={stats.totalVisits}
                        description="Active triage records"
                        icon={<Activity className="w-6 h-6 text-teal-600" />}
                        color="bg-teal-50"
                    />
                    <StatCard
                        title="Staff Directory"
                        value={stats.totalStaff}
                        description="Approved medical team"
                        icon={<UserCheck className="w-6 h-6 text-indigo-600" />}
                        color="bg-indigo-50"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Visit Activity</CardTitle>
                            <CardDescription>Recent patient volume trends</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-end justify-between gap-2 px-2">
                                {/* Simple SVG/CSS Bar Chart Mock */}
                                {[45, 60, 32, 70, 85, 40, 55].map((val, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div 
                                            className="w-full bg-primary/20 hover:bg-primary transition-all rounded-t-lg relative"
                                            style={{ height: `${val}%` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                {val}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Day {i+1}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Disease Distribution</CardTitle>
                            <CardDescription>Frequency of common cases</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center gap-8">
                           <div className="relative h-48 w-48 shrink-0">
                                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="#2563eb" strokeWidth="4" strokeDasharray="40 100" />
                                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="#0d9488" strokeWidth="4" strokeDasharray="30 100" strokeDashoffset="-40" />
                                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="#ea580c" strokeWidth="4" strokeDasharray="20 100" strokeDashoffset="-70" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-2xl font-bold text-slate-900">100%</span>
                                    <span className="text-[8px] uppercase tracking-widest text-slate-400">Total Cases</span>
                                </div>
                           </div>
                           <div className="space-y-3 flex-1">
                                <LegendItem color="bg-blue-600" label="Malaria" value="40%" />
                                <LegendItem color="bg-teal-600" label="Typhoid" value="30%" />
                                <LegendItem color="bg-orange-600" label="Infections" value="20%" />
                                <LegendItem color="bg-slate-300" label="Other" value="10%" />
                           </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-xl">Action Center</CardTitle>
                        <CardDescription>Shortcut to your most frequent tasks.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <QuickAction title="Register Patient" href="/dashboard/registration" icon="📝" />
                        <QuickAction title="Patient Queue" href="/dashboard/queue" icon="⏳" />
                        <QuickAction title="Consultations" href="/dashboard/consultation" icon="🩺" />
                        <QuickAction title="Pharmacy" href="/dashboard/pharmacy" icon="💊" />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

function StatCard({ title, value, description, icon, color }: any) {
    return (
        <Card className="overflow-hidden border-none shadow-md">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
                        <h3 className="text-4xl font-bold text-slate-900 mt-2">{value}</h3>
                        <p className="text-xs text-slate-400 mt-2 font-medium">{description}</p>
                    </div>
                    <div className={`p-4 rounded-2xl ${color}`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function QuickAction({ title, href, icon }: any) {
    return (
        <a
            href={href}
            className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all group"
        >
            <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{icon}</span>
            <span className="font-bold text-slate-700 group-hover:text-primary">{title}</span>
        </a>
    )
}

function LegendItem({ color, label, value }: any) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">{label}</span>
            </div>
            <span className="text-sm font-bold text-slate-900">{value}</span>
        </div>
    )
}
