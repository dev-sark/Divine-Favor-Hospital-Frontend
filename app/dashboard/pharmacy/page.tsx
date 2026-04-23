"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { analyticsApi, patientsApi, visitsApi, recordsApi } from "@/lib/api"
import { Pill, User, ClipboardList, Search } from "lucide-react"

export default function PharmacyPage() {
    const [visits, setVisits] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [selectedRecord, setSelectedRecord] = React.useState<any>(null)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            // Fetch only those waiting specifically for the pharmacy
            const queuedVisits = await visitsApi.getQueuedVisits("WAITING_FOR_PHARMACY")
            
            let prescriptionRecords: any[] = []
            
            for (const visit of queuedVisits) {
                try {
                    // Check for record for this visit
                    const record = await apiRequest(`/medical-records/visit/${visit.id}`).catch(() => null)
                    if (record) {
                        prescriptionRecords.push({
                            ...record,
                            patientName: visit.patient?.fullName || "Unknown",
                            folderNumber: visit.patient?.folderNumber || "N/A",
                            visitDate: visit.visitDate
                        })
                    }
                } catch (e) {}
            }
            
            setVisits(prescriptionRecords)
        } catch (err) {
            console.error("Failed to fetch prescriptions", err)
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
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pharmacy Portal</h2>
                    <p className="text-sm text-slate-500">View and dispense medications prescribed by doctors.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Recent Prescriptions</CardTitle>
                                <Button variant="ghost" size="sm" onClick={fetchData} className="text-xs">Refresh</Button>
                            </div>
                            <div className="relative mt-2">
                                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                <input 
                                    className="pl-8 flex h-8 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs focus:ring-1 focus:ring-primary outline-none" 
                                    placeholder="Search patient..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {isLoading ? (
                                <p className="text-center text-slate-400 text-xs py-4">Checking records...</p>
                            ) : filteredVisits.length === 0 ? (
                                <p className="text-center text-slate-400 text-xs py-4 italic">No pending prescriptions found.</p>
                            ) : (
                                filteredVisits.map((v) => (
                                    <div 
                                        key={v.id} 
                                        onClick={() => setSelectedRecord(v)}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedRecord?.id === v.id ? "bg-emerald-50 border-emerald-200 shadow-sm" : "bg-white border-slate-100 hover:border-slate-300"}`}
                                    >
                                        <p className="text-sm font-bold text-slate-900">{v.patientName}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-[10px] text-slate-500 font-mono uppercase">{v.folderNumber}</p>
                                            <p className="text-[10px] text-slate-400">{new Date(v.visitDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 border-emerald-100 bg-emerald-50/10 shadow-lg">
                        {selectedRecord ? (
                            <>
                                <CardHeader className="border-b border-emerald-100 p-6 flex flex-row items-center gap-4">
                                    <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                                        <Pill size={24} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">{selectedRecord.patientName}</CardTitle>
                                        <CardDescription>Prescription Details | Assigned by Doctor</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diagnosis</p>
                                            <p className="text-sm font-medium text-slate-900">{selectedRecord.diagnosis}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Issued</p>
                                            <p className="text-sm font-medium text-slate-900">{new Date(selectedRecord.visitDate).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                                        <div className="flex items-center gap-2 text-emerald-700">
                                            <ClipboardList size={18} />
                                            <p className="text-xs font-bold uppercase tracking-wider">Prescribed Medication & Dosage</p>
                                        </div>
                                        <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-50 min-h-[150px]">
                                            <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{selectedRecord.prescription}</p>
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="p-6 border-t border-emerald-100 bg-white flex justify-end gap-3">
                                    <Button variant="outline" onClick={() => setSelectedRecord(null)}>Close Window</Button>
                                    <Button className="bg-emerald-600 hover:bg-emerald-700">Dispense & Mark Complete</Button>
                                </div>
                            </>
                        ) : (
                            <div className="h-96 flex flex-col items-center justify-center text-center p-12">
                                <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                                    <Pill size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Select a Prescription</h3>
                                <p className="text-sm text-slate-500 max-w-xs mt-1">Pick a patient record from the list to view their medication details.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}

// Add a dummy apiRequest if it's not imported globally
import { apiRequest } from "@/lib/api";
