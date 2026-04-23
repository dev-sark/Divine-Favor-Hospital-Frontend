"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { analyticsApi } from "@/lib/api"
import { Trophy, Award, TrendingUp, User } from "lucide-react"
import { useAuth } from "@/providers/AuthContext"
import { useRouter } from "next/navigation"

export default function PerformancePage() {
    const { user } = useAuth()
    const router = useRouter()
    const [performanceData, setPerformanceData] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            router.push("/dashboard")
        }
    }, [user, router])

    const fetchPerformance = async () => {
        setIsLoading(true)
        try {
            const data = await analyticsApi.getStaffPerformance()
            // Sort by action count descending
            const sortedData = data.sort((a: any, b: any) => b.actionCount - a.actionCount)
            setPerformanceData(sortedData)
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchPerformance()
    }, [])

    const getTrophyColor = (index: number) => {
        if (index === 0) return "text-yellow-500" // Gold
        if (index === 1) return "text-slate-400"  // Silver
        if (index === 2) return "text-amber-600"  // Bronze
        return "text-slate-200"
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Staff Performance Board</h2>
                        <p className="text-slate-500">Track and reward clinical productivity based on validated transactions.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Top Performer Ribbon */}
                    {!isLoading && performanceData.length > 0 && (
                         <Card className="lg:col-span-4 bg-primary text-primary-foreground overflow-hidden relative">
                            <div className="p-8 flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-widest opacity-80">Employee of the Month</p>
                                    <h3 className="text-5xl font-bold mt-2">{performanceData[0].username}</h3>
                                    <div className="flex items-center gap-2 mt-4">
                                        <Award className="w-5 h-5" />
                                        <span className="font-bold">{performanceData[0].actionCount} Completed Actions</span>
                                    </div>
                                </div>
                                <Trophy className="w-32 h-32 opacity-20 absolute -right-4 -bottom-4 rotate-12" />
                                <div className="hidden md:block">
                                    <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/30">
                                        <p className="text-xs font-bold uppercase">Role Achievement</p>
                                        <p className="text-2xl font-bold">{performanceData[0].role}</p>
                                    </div>
                                </div>
                            </div>
                         </Card>
                    )}

                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Productivity Rankings</CardTitle>
                            <CardDescription>Number of Triage/Consultations completed per staff member.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {isLoading ? (
                                    <p className="text-center py-8 text-slate-400">Calculating performance metrics...</p>
                                ) : (
                                    performanceData.map((staff, idx) => (
                                        <div key={staff.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/50">
                                            <div className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-white border border-slate-100`}>
                                                <Trophy className={`w-5 h-5 ${getTrophyColor(idx)}`} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-900">{staff.username}</p>
                                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{staff.role}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-slate-900">{staff.actionCount}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Points</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-1 border-none shadow-none bg-transparent">
                         <div className="space-y-4">
                            <PerformanceMetricCard icon={<TrendingUp />} label="High Performers" value={performanceData.filter(d => d.actionCount > 5).length} color="bg-emerald-500" />
                            <PerformanceMetricCard icon={<User />} label="Active Staff" value={performanceData.length} color="bg-blue-500" />
                         </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}

function PerformanceMetricCard({ icon, label, value, color }: any) {
    return (
        <Card className="p-6">
            <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white ${color}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                </div>
            </div>
        </Card>
    )
}
