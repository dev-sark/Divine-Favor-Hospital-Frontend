"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { wardApi } from "@/lib/api"
import { Bed, Home, UserPlus, Users, LogOut, CheckCircle2, MoreVertical, Building2 } from "lucide-react"

export default function WardDashboard() {
    const [wards, setWards] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    const fetchWards = async () => {
        setIsLoading(true)
        try {
            const data = await wardApi.getAll()
            setWards(data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchWards()
    }, [])

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">In-Patient Ward Management</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium italic">Monitor occupancy and manage hospital bed distribution.</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-20 text-center italic text-slate-300 font-bold">Querying ward status...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {wards.map((ward) => (
                            <Card key={ward.id} className="rounded-[40px] border-2 border-slate-50 dark:border-slate-800 shadow-xl overflow-hidden hover:shadow-2xl transition-all group">
                                <CardHeader className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white">
                                    <div className="flex justify-between items-start">
                                        <div className="h-16 w-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md">
                                            <Building2 size={32} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Ward Type</p>
                                            <p className="text-sm font-bold">{ward.type}</p>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <CardTitle className="text-2xl font-black">{ward.name}</CardTitle>
                                        <p className="text-indigo-100 font-semibold opacity-80 mt-1">{ward.capacity} Total Beds Configured</p>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                                        {ward.beds?.map((bed: any) => (
                                            <div 
                                                key={bed.id}
                                                className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all border-2 group/bed ${
                                                    bed.status === 'AVAILABLE' 
                                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600 cursor-pointer hover:bg-emerald-100' 
                                                        : 'bg-red-50 border-red-100 text-red-400'
                                                }`}
                                            >
                                                <Bed size={20} className={bed.status === 'OCCUPIED' ? 'animate-pulse' : ''} />
                                                <span className="text-[9px] font-black mt-2 uppercase tracking-tighter">B-{bed.bedNumber}</span>
                                                
                                                {/* Tooltip on hover */}
                                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bed:opacity-100 bg-slate-900 text-white text-[8px] px-2 py-1 rounded-lg pointer-events-none transition-all z-10 whitespace-nowrap">
                                                    Slot {bed.bedNumber} • {bed.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex gap-4">
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-slate-400 uppercase">Occupied</p>
                                                <p className="text-sm font-black text-red-500">{ward.beds?.filter((b: any) => b.status === 'OCCUPIED').length}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-slate-400 uppercase">Available</p>
                                                <p className="text-sm font-black text-emerald-500">{ward.beds?.filter((b: any) => b.status === 'AVAILABLE').length}</p>
                                            </div>
                                        </div>
                                        <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-400">
                                            <Users size={20} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="bg-amber-50 p-8 rounded-[40px] border-2 border-amber-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <UserPlus size={160} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-black text-amber-900">Hospital Inventory Sync Required</h3>
                        <p className="text-amber-800/80 font-medium max-w-2xl mt-2 leading-relaxed">
                            Ward admissions are currently handled by medical officers during consultations. If you need to manually reserve beds for maintenance or emergencies, please use the Bed Management panel in Settings.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
