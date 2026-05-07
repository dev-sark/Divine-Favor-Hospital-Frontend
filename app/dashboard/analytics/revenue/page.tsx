"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { analyticsApi } from "@/lib/api"
import { useAuth } from "@/providers/AuthContext"
import { Printer, Calendar, Banknote, TrendingUp, ShieldCheck, HeartPulse, Pill, FlaskConical, Stethoscope } from "lucide-react"

export default function RevenueDashboard() {
    const { user } = useAuth()
    const [startDate, setStartDate] = React.useState(new Date().toISOString().split('T')[0])
    const [endDate, setEndDate] = React.useState(new Date().toISOString().split('T')[0])
    const [report, setReport] = React.useState<any>(null)
    const [isLoading, setIsLoading] = React.useState(false)

    const fetchRevenue = async () => {
        setIsLoading(true)
        try {
            const s = `${startDate}T00:00:00`
            const e = `${endDate}T23:59:59`
            const data = await analyticsApi.getRevenueReport(s, e)
            setReport(data)
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchRevenue()
    }, [startDate, endDate])

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex justify-between items-end print:hidden">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Revenue Analysis</h2>
                        <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full inline-block">Hospital Financial Intelligence</p>
                    </div>
                    <div className="flex gap-4 items-center bg-white p-3 rounded-[25px] border border-slate-100 shadow-sm">
                        <div className="flex gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Start Date</label>
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-slate-50 border-none rounded-xl p-2 text-xs font-black outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">End Date</label>
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-slate-50 border-none rounded-xl p-2 text-xs font-black outline-none" />
                            </div>
                        </div>
                        <button onClick={() => window.print()} className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:scale-105 transition-all"><Printer size={20} /></button>
                    </div>
                </div>

                {report && (
                    <div className="space-y-8">
                        {/* Main Highlights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FinancialCard 
                                label="Grand Total Revenue" 
                                value={`GH₵ ${report.grandTotal?.toFixed(2)}`} 
                                subtext={`${report.transactionCount} Settle Payments`}
                                icon={<Banknote className="text-white" />}
                                color="bg-indigo-600"
                            />
                            <FinancialCard 
                                label="Cash / Private Revenue" 
                                value={`GH₵ ${report.cashRevenue?.toFixed(2)}`} 
                                subtext="Immediate Liquidity"
                                icon={<TrendingUp className="text-white" />}
                                color="bg-emerald-600"
                            />
                            <FinancialCard 
                                label="Insurance Claims" 
                                value={`GH₵ ${report.insuranceRevenue?.toFixed(2)}`} 
                                subtext="Pending Reimbursement"
                                icon={<ShieldCheck className="text-white" />}
                                color="bg-amber-600"
                            />
                        </div>

                        {/* Departmental breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <CategoryCard 
                                label="Consultation Fees" 
                                value={report.consultationRevenue} 
                                total={report.grandTotal} 
                                icon={<Stethoscope className="text-blue-500" />}
                                color="bg-blue-500"
                            />
                            <CategoryCard 
                                label="Laboratory & Radiology" 
                                value={report.labRevenue} 
                                total={report.grandTotal} 
                                icon={<FlaskConical className="text-purple-500" />}
                                color="bg-purple-500"
                            />
                            <CategoryCard 
                                label="Pharmacy Sales" 
                                value={report.pharmacyRevenue} 
                                total={report.grandTotal} 
                                icon={<Pill className="text-pink-500" />}
                                color="bg-pink-500"
                            />
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

function FinancialCard({ label, value, subtext, icon, color }: any) {
    return (
        <Card className={`${color} border-none rounded-[40px] shadow-2xl shadow-slate-200 overflow-hidden relative`}>
            <div className="absolute top-0 right-0 p-8 text-white opacity-10">
                {React.cloneElement(icon, { size: 120 })}
            </div>
            <CardContent className="p-8 space-y-6 relative z-10">
                <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    {icon}
                </div>
                <div>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">{label}</p>
                    <h3 className="text-4xl font-black text-white tracking-tighter mt-1">{value}</h3>
                    <p className="text-white/40 text-[10px] font-bold mt-2 italic uppercase">{subtext}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function CategoryCard({ label, value, total, icon, color }: any) {
    const percentage = total > 0 ? (value / total) * 100 : 0
    return (
        <Card className="rounded-[40px] border-slate-100 shadow-sm bg-white p-8 space-y-6">
            <div className="flex justify-between items-start">
                <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner">
                    {icon}
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                    <h4 className="text-2xl font-black text-slate-900 mt-1">GH₵ {value?.toFixed(2)}</h4>
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase">
                    <span className="text-slate-400">contribution</span>
                    <span className="text-slate-900">{percentage.toFixed(1)}%</span>
                </div>
                <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
                </div>
            </div>
        </Card>
    )
}
