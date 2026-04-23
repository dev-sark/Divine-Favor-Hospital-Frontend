"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { visitsApi, apiRequest } from "@/lib/api"
import { Pill, User, ClipboardList, Search, RefreshCcw } from "lucide-react"

export default function PharmacyPage() {
    const [visits, setVisits] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [selectedRecord, setSelectedRecord] = React.useState<any>(null)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            console.log("Fetching prescriptions for status: WAITING_FOR_PHARMACY")
            // Fetch only those waiting specifically for the pharmacy
            const queuedVisits = await visitsApi.getQueuedVisits("WAITING_FOR_PHARMACY")
            console.log("Found queued visits:", queuedVisits)
            
            let prescriptionRecords: any[] = []
            
            for (const visit of (queuedVisits || [])) {
                try {
                    // Check for record for this visit
                    const record = await apiRequest(`/medical-records/visit/${visit.id}`)
                    if (record) {
                        prescriptionRecords.push({
                            ...record,
                            visitId: visit.id,
                            patientName: visit.patient?.fullName || "Unknown Patient",
                            folderNumber: visit.patient?.folderNumber || "N/A",
                            visitDate: visit.visitDate
                        })
                    }
                } catch (e) {
                    console.warn(`No medical record found for visit ${visit.id}`, e)
                }
            }
            
            setVisits(prescriptionRecords)
        } catch (err: any) {
            console.error("Pharmacy Fetch Error:", err)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchData()
    }, [])

    const filteredVisits = visits.filter(v => 
        v.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.folderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pharmacy Portal</h2>
                        <p className="text-sm text-slate-500">View and dispense medications prescribed by doctors.</p>
                    </div>
                    <Button variant="outline" onClick={fetchData} className="flex gap-2">
                        <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh List
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg">Pending Dispensing</CardTitle>
                            <div className="relative mt-2">
                                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                <input 
                                    className="pl-8 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs shadow-sm focus:ring-1 focus:ring-primary outline-none" 
                                    placeholder="Search by name or folder..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {isLoading ? (
                                <p className="text-center text-slate-400 text-xs py-10 italic">Connecting to pharmacy vault...</p>
                            ) : filteredVisits.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed">
                                    <p className="text-slate-400 text-xs italic">No prescriptions waiting.</p>
                                    <p className="text-[10px] text-slate-300 mt-1">Status: WAITING_FOR_PHARMACY</p>
                                </div>
                            ) : (
                                filteredVisits.map((v) => (
                                    <div 
                                        key={v.id} 
                                        onClick={() => setSelectedRecord(v)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${selectedRecord?.id === v.id ? "bg-emerald-50 border-emerald-300 shadow-md translate-x-1" : "bg-white border-slate-100 hover:border-slate-300"}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold ${selectedRecord?.id === v.id ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {v.patientName.charAt(0)}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-sm font-bold text-slate-900 truncate">{v.patientName}</p>
                                                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">{v.folderNumber}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 border-emerald-100 bg-emerald-50/10 shadow-lg min-h-[500px]">
                        {selectedRecord ? (
                            <div className="flex flex-col h-full">
                                <CardHeader className="border-b border-emerald-100 p-6 flex flex-row items-center gap-4 bg-white/50">
                                    <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                                        <Pill size={24} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">{selectedRecord.patientName}</CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            <User className="w-3 h-3" /> Attending Physician: {selectedRecord.doctor?.username || 'Hospital Doctor'}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8 flex-1">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Diagnosis</p>
                                            <div className="bg-slate-100/50 p-3 rounded-lg border border-slate-100">
                                                <p className="text-sm font-bold text-slate-700">{selectedRecord.diagnosis}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Ordered</p>
                                            <p className="text-sm font-medium text-slate-900 border-b border-slate-100 pb-1 w-fit">
                                                {new Date(selectedRecord.visitDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-emerald-700">
                                            <ClipboardList size={18} />
                                            <p className="text-xs font-bold uppercase tracking-wider">Prescribed Medication & Instructions</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border-2 border-emerald-200 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-2 bg-emerald-50 text-emerald-600 rounded-bl-xl opacity-50">
                                                <Pill size={16} />
                                            </div>
                                            <p className="text-slate-800 whitespace-pre-wrap leading-relaxed font-medium text-base italic">
                                                "{selectedRecord.prescription}"
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="p-6 border-t border-emerald-100 bg-white flex justify-end gap-3 mt-auto">
                                    <Button variant="outline" onClick={() => setSelectedRecord(null)}>Close</Button>
                                    <Button 
                                        className="bg-emerald-600 hover:bg-emerald-700 px-8 font-bold text-white shadow-lg shadow-emerald-200"
                                        onClick={async () => {
                                            try {
                                                await visitsApi.updateStatus(selectedRecord.visitId, "COMPLETED");
                                                alert("Action Success: Medications dispensed and record archived.");
                                                setSelectedRecord(null);
                                                fetchData();
                                            } catch (err) {
                                                alert("Error: Database update failed.");
                                            }
                                        }}
                                    >
                                        Confirm Dispensed
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                                <div className="h-20 w-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-2 text-emerald-600 shadow-sm rotate-3 animate-pulse">
                                    <Pill size={40} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Pharmacy Queue Ready</h3>
                                    <p className="text-sm text-slate-500 max-w-xs mt-2 mx-auto leading-relaxed">
                                        Please select a patient from the left column to view their prescription details and fulfill the order.
                                    </p>
                                </div>
                                <div className="pt-4 flex gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-300"></div>
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-300 opacity-50"></div>
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-300 opacity-25"></div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
