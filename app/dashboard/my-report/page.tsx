"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { analyticsApi } from "@/lib/api"
import { useAuth } from "@/providers/AuthContext"
import { Printer, Calendar, FileText, Activity, Layers } from "lucide-react"

export default function MyReportPage() {
    const { user } = useAuth()
    const [startDate, setStartDate] = React.useState(new Date().toISOString().split('T')[0])
    const [endDate, setEndDate] = React.useState(new Date().toISOString().split('T')[0])
    const [activities, setActivities] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(false)

    const fetchReport = async () => {
        if (!user?.id) return
        setIsLoading(true)
        try {
            // Convert dates to ISO format for backend
            const s = `${startDate}T00:00:00`
            const e = `${endDate}T23:59:59`
            const data = await analyticsApi.getMyActivity(user.id, s, e)
            setActivities(data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchReport()
    }, [user, startDate, endDate])

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center print:hidden">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Personal Work Log</h2>
                        <p className="text-slate-500 font-medium italic">Role-based accountability and activity tracking.</p>
                    </div>
                    <button 
                        onClick={() => window.print()}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Printer size={18} /> Export / Print Report
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:hidden">
                    <Card className="md:col-span-1 rounded-[30px] border-slate-100 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-indigo-500" /> Date Range
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">From</label>
                                <input 
                                    type="date" 
                                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold outline-none"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">To</label>
                                <input 
                                    type="date" 
                                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold outline-none"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-3 rounded-[30px] border-indigo-50 shadow-xl overflow-hidden bg-white">
                        <CardHeader className="bg-indigo-50 p-6 flex flex-row justify-between items-center">
                            <div className="flex gap-4 items-center">
                                <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                                    <Activity className="text-indigo-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-black text-slate-800 uppercase tracking-tighter">Activity Summary</CardTitle>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Professional Actions Recorded</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h3 className="text-3xl font-black text-indigo-600 tracking-tighter">{activities.length}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Sessions Completed</p>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                {/* Print Branding Header */}
                <div className="hidden print:block text-center border-b-2 border-slate-900 pb-6 mb-8">
                    <h1 className="text-2xl font-black uppercase">DIVINE FAVOR HOSPITAL</h1>
                    <p className="text-sm font-bold mt-1">SAY NO TO FRAUD. YES TO ACCOUNTABILITY.</p>
                    <div className="mt-4 text-left grid grid-cols-2 text-[10px] font-bold uppercase">
                        <p>Staff Name: {user?.name}</p>
                        <p className="text-right">Period: {startDate} TO {endDate}</p>
                        <p>Role: {user?.role}</p>
                        <p className="text-right">Generated: {new Date().toLocaleString()}</p>
                    </div>
                </div>

                {/* Data Section */}
                <Card className="rounded-[40px] border-slate-100 shadow-sm overflow-hidden print:border-none print:shadow-none">
                    <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Layers className="w-5 h-5 text-indigo-500" />
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">Validated Work History</CardTitle>
                        </div>
                        <div className="hidden print:block text-[10px] font-black text-slate-400 italic">Official Record of Divine Favor Hospital Management System</div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-20 text-center italic text-slate-300 font-medium">Validating clinical records...</div>
                        ) : activities.length === 0 ? (
                            <div className="p-20 text-center space-y-4">
                                <FileText className="w-16 h-16 text-slate-100 mx-auto" />
                                <p className="text-slate-400 font-bold italic text-sm">No activity records found for this period.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {activities.map((log: any) => (
                                    <div key={log.id} className="p-6 hover:bg-slate-50/30 transition-all flex items-start justify-between group">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    log.action.includes("CREATE") ? "bg-emerald-100 text-emerald-700" :
                                                    log.action.includes("PROCESS") ? "bg-amber-100 text-amber-700" :
                                                    "bg-indigo-100 text-indigo-700"
                                                }`}>
                                                    {log.action.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-300">
                                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm font-black text-slate-800 leading-tight">
                                                {log.details}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{log.module}</p>
                                            <p className="text-[10px] font-black text-slate-300 group-hover:text-slate-500 transition-colors uppercase tracking-widest">Validated</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="hidden print:block mt-12 pt-8 border-t border-slate-200 text-center text-[10px] font-bold text-slate-400 italic">
                    This is a digitally signed clinical performance report. Any alteration of this record is a criminal offense under the Divine Favor Hospital IT Policy.
                </div>
            </div>
        </DashboardLayout>
    )
}
