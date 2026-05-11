"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { hrApi, staffApi } from "@/lib/api"
import { useAuth } from "@/providers/AuthContext"
import { Users, Calendar, Banknote, ShieldCheck, Zap, Briefcase, Award, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useToast } from "@/providers/ToastContext"

export default function HRDashboard() {
    const { user } = useAuth()
    const [staff, setStaff] = React.useState<any[]>([])
    const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0])
    const [shifts, setShifts] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const { success, error } = useToast()

    // Payroll state
    const [processingId, setProcessingId] = React.useState<number | null>(null)
    const [payrollResult, setPayrollResult] = React.useState<any>(null)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const staffList = await staffApi.getAll()
            setStaff(staffList || [])
            
            const shiftList = await hrApi.getShifts(selectedDate)
            setShifts(shiftList || [])
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchData()
    }, [selectedDate])

    const handleGeneratePayroll = async (staffUser: any) => {
        setProcessingId(staffUser.id)
        try {
            const date = new Date()
            const month = date.toLocaleString('default', { month: 'long' }).toUpperCase()
            const year = date.getFullYear()

            const result = await hrApi.generatePayroll({
                userId: staffUser.id,
                month,
                year,
                baseSalary: staffUser.baseSalary || 2000 // Default if not set
            })
            setPayrollResult(result)
            success(`Merits calculated for ${staffUser.username}.`, "Payroll Engine")
        } catch (err) {
            error("Failed to calculate merits.", "System Error")
        } finally {
            setProcessingId(null)
        }
    }

    const handlePay = async (id: number) => {
        try {
            await hrApi.pay(id, user?.name || "Admin")
            success("Payment Disbursed Successfully!", "Financial Sync")
            setPayrollResult(null)
        } catch (err) {
            error("Payment failed.", "Disbursement Error")
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Personnel & Payroll</h2>
                        <p className="text-slate-500 font-medium italic">Manage staff rotations and performance-based merit compensation.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Shift Roster */}
                    <Card className="lg:col-span-1 rounded-[40px] border-slate-100 shadow-xl overflow-hidden bg-white h-fit sticky top-6">
                        <CardHeader className="bg-slate-900 p-8 text-white">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xl font-black flex items-center gap-2">
                                    <Calendar className="text-indigo-400" /> Shift Roster
                                </CardTitle>
                                <input 
                                    type="date" 
                                    value={selectedDate} 
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="bg-white/10 border-none rounded-xl p-2 text-xs font-bold outline-none text-white"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            {shifts.length === 0 ? (
                                <p className="p-8 text-center text-slate-300 font-bold italic">No shifts assigned for this date.</p>
                            ) : (
                                shifts.map(s => (
                                    <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center font-black text-xs text-slate-400">
                                                {s.user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800">{s.user.username}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.user.role}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                            s.type === 'MORNING' ? 'bg-amber-100 text-amber-700' :
                                            s.type === 'AFTERNOON' ? 'bg-indigo-100 text-indigo-700' :
                                            'bg-slate-800 text-white'
                                        }`}>
                                            {s.type}
                                        </span>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Staff Performance & Payroll List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {staff.map((s) => (
                                 <Card key={s.id} className="rounded-[40px] border-slate-100 shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all border-b-4 border-indigo-500">
                                     <CardContent className="p-8 space-y-6">
                                         <div className="flex justify-between items-start">
                                             <div className="flex items-center gap-4">
                                                 <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                                                     <Briefcase size={24} />
                                                 </div>
                                                 <div>
                                                     <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{s.username}</h4>
                                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.role}</p>
                                                 </div>
                                             </div>
                                             {s.id === processingId ? (
                                                 <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                                             ) : (
                                                 <button 
                                                    disabled={processingId !== null}
                                                    onClick={() => handleGeneratePayroll(s)}
                                                    className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                                                 >
                                                     <Banknote size={20} />
                                                 </button>
                                             )}
                                         </div>

                                         <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                             <span>Performance Merits</span>
                                             <span className="text-indigo-600 flex items-center gap-1">
                                                 <Zap size={10} className="fill-current" /> Validated Actions
                                             </span>
                                         </div>
                                     </CardContent>
                                 </Card>
                             ))}
                        </div>

                        {/* Payroll Processor Modal / Section */}
                        {payrollResult && (
                            <Card className="rounded-[50px] bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-500 overflow-hidden relative border-none">
                                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
                                    <ShieldCheck size={200} />
                                </div>
                                <CardContent className="p-12 space-y-10 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-6">
                                            <div className="h-20 w-20 bg-white/20 rounded-[35px] flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-2xl">
                                                <Award size={40} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-white/60 text-xs font-black uppercase tracking-[0.3em]">Merit-Based Payroll</p>
                                                <h3 className="text-3xl font-black tracking-tighter uppercase">{payrollResult.user.username}'s Monthly Settlement</h3>
                                            </div>
                                        </div>
                                        <button onClick={() => setPayrollResult(null)} className="text-white/40 hover:text-white transition-colors"><Zap /></button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-y border-white/10 py-10">
                                        <div className="space-y-1">
                                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Base Salary</p>
                                            <p className="text-2xl font-black">GH₵ {payrollResult.baseSalary?.toFixed(2)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-amber-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <TrendingUp size={10} /> Clinical Performance Bonus
                                            </p>
                                            <p className="text-2xl font-black text-amber-300">+ GH₵ {payrollResult.performanceBonus?.toFixed(2)}</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Net Total Payable</p>
                                            <p className="text-4xl font-black tracking-tighter">GH₵ {payrollResult.totalPayable?.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/60">
                                            <ShieldCheck size={14} className="text-emerald-400" />
                                            Calculation Engine: DFH-Merit-V1
                                        </div>
                                        <Button 
                                            onClick={() => handlePay(payrollResult.id)}
                                            className="bg-white text-indigo-700 hover:bg-slate-50 font-black rounded-2xl h-14 px-12 shadow-2xl shadow-indigo-900/40 text-lg hover:scale-105 transition-all"
                                        >
                                            Authorize & Payout GH₵ {payrollResult.totalPayable?.toFixed(2)}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
