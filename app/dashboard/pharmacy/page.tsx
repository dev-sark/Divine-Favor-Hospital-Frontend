"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { visitsApi, recordsApi, billingApi } from "@/lib/api"
import { Pill, User, ClipboardList, Search, RefreshCcw, ShieldCheck } from "lucide-react"
import { useToast } from "@/providers/ToastContext"

export default function PharmacyPage() {
    const [visits, setVisits] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [selectedRecord, setSelectedRecord] = React.useState<any>(null)
    const [dispensingNotes, setDispensingNotes] = React.useState("")
    const [isConfirming, setIsConfirming] = React.useState(false)
    const [drugAmount, setDrugAmount] = React.useState("")
    const [isUpdatingBill, setIsUpdatingBill] = React.useState(false)
    const { success, error } = useToast()

    const fetchData = async () => {
        setIsLoading(true)
        try {
            console.log("Fetching prescriptions for status: WAITING_FOR_PHARMACY")
            const queuedVisits = await visitsApi.getQueuedVisits("WAITING_FOR_PHARMACY")
            
            let prescriptionRecords: any[] = []
            for (const visit of (queuedVisits || [])) {
                try {
                    const record = await recordsApi.getRecordForVisit(visit.id)
                    const bills = await billingApi.getByVisit(visit.id)
                    const isPaid = bills.length > 0 && bills.every((b: any) => b.status === 'PAID')
                    const hasBill = bills.length > 0

                    if (record) {
                        prescriptionRecords.push({
                            ...record,
                            visitId: visit.id,
                            patientName: visit.patient?.fullName || "Unknown Patient",
                            folderNumber: visit.patient?.folderNumber || "N/A",
                            visitDate: visit.visitDate,
                            paymentStatus: !hasBill ? 'NO_BILL' : (isPaid ? 'PAID' : 'UNPAID')
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

    const handleSelectRecord = (record: any) => {
        setSelectedRecord(record)
        setDispensingNotes("")
        setDrugAmount("")
    }

    const handleUpdateBill = async () => {
        if (!selectedRecord || !drugAmount) return
        setIsUpdatingBill(true)
        try {
            await billingApi.addCharge(selectedRecord.visitId, "PHARMACY", parseFloat(drugAmount))
            success("Bill Updated! Patient can now pay at the Cashier.", "Accounts Sync")
        } catch (err) {
            error("Failed to update bill. Check if a bill exists for this visit.", "System Error")
        } finally {
            setIsUpdatingBill(false)
        }
    }

    const handleDispense = async () => {
        if (isConfirming) return;
        setIsConfirming(true);
        try {
            // 1. Save dispensing notes
            await recordsApi.finalizeDispensing(selectedRecord.visitId, dispensingNotes);
            // 2. Mark visit as completed
            await visitsApi.updateStatus(selectedRecord.visitId, "COMPLETED");
            
            success("Medication Dispensed & Transaction Finalized.", "Inventory Cleared");
            setSelectedRecord(null);
            fetchData();
        } catch (err) {
            console.error(err);
            error("Error: Status could not be updated.", "Clinical Error");
        } finally {
            setIsConfirming(false);
        }
    }

    const filteredVisits = visits.filter(v => 
        v.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.folderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Pharmacy Portal</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Professional Medication Dispensing & Financial Integration.</p>
                    </div>
                    <Button variant="outline" onClick={fetchData} className="flex gap-2 bg-indigo-50 dark:bg-indigo-950 border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900">
                        <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Sync Pharmacy Queue
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-1 border-slate-100 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-indigo-500" />
                                Prescriptions Waiting
                            </CardTitle>
                            <div className="relative mt-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <input 
                                    className="pl-9 flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white px-3 py-1 text-xs shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                    placeholder="Search patient or folder..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 p-4">
                            {isLoading ? (
                                <p className="text-center text-slate-400 text-xs py-10 italic">Querying clinical records...</p>
                            ) : filteredVisits.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                    <p className="text-slate-400 text-xs italic font-medium">No prescriptions pending.</p>
                                    <p className="text-[10px] text-slate-300 mt-2 uppercase tracking-widest">Vault Secure</p>
                                </div>
                            ) : (
                                filteredVisits.map((v) => (
                                    <div 
                                        key={v.id} 
                                        onClick={() => handleSelectRecord(v)}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative group ${selectedRecord?.id === v.id ? "bg-indigo-50 dark:bg-indigo-950 border-indigo-400 shadow-md translate-x-1" : "bg-white dark:bg-slate-950 border-slate-50 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-colors ${selectedRecord?.id === v.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'}`}>
                                                {v.patientName.charAt(0)}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{v.patientName}</p>
                                                    {v.paymentStatus === 'PAID' ? (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Paid" />
                                                    ) : (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" title="Unpaid" />
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter mt-0.5">{v.folderNumber}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 border-indigo-100 dark:border-indigo-900 bg-white dark:bg-slate-950 shadow-xl rounded-[40px] overflow-hidden min-h-[600px] border-2">
                        {selectedRecord ? (
                            <div className="flex flex-col h-full">
                                <CardHeader className="border-b border-indigo-50 dark:border-indigo-900 p-8 flex flex-row items-center gap-6 bg-slate-50/30 dark:bg-slate-900/30">
                                    <div className="h-16 w-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                        <Pill size={32} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">{selectedRecord.patientName}</CardTitle>
                                        <CardDescription className="flex items-center gap-3 mt-1 font-medium italic">
                                            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold not-italic">PHYSICIAN ORDER</span>
                                            {selectedRecord.paymentStatus === 'PAID' ? (
                                                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold not-italic flex items-center gap-1">
                                                    <ShieldCheck className="w-3 h-3" /> PAYMENT VERIFIED
                                                </span>
                                            ) : (
                                                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold not-italic">AWAITING PAYMENT</span>
                                            )}
                                            Dr. {selectedRecord.doctor?.username || 'Medical Officer'}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-10 space-y-8 flex-1">
                                    <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Pharmacist Billing Control</p>
                                            <p className="text-sm font-bold text-amber-900 mb-2">Set drug costs for the cashier</p>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="number"
                                                    placeholder="GHS amount"
                                                    className="w-32 p-2 bg-white rounded-lg border border-amber-200 outline-none font-bold text-sm"
                                                    value={drugAmount}
                                                    onChange={(e) => setDrugAmount(e.target.value)}
                                                />
                                                <Button size="sm" className="bg-amber-600" onClick={handleUpdateBill} disabled={isUpdatingBill}>
                                                    Update Patient Bill
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Instructions</p>
                                            <p className="text-xs text-amber-800 font-medium max-w-[200px]">Update the bill first so the patient can pay at the cashier before collection.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 text-indigo-700">
                                            <ClipboardList size={22} className="opacity-50" />
                                            <p className="text-xs font-black uppercase tracking-[0.1em]">Doctor's Prescription Details</p>
                                        </div>
                                        <div className="bg-indigo-50/30 p-8 rounded-[30px] border-2 border-indigo-100 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 text-indigo-100">
                                                <Pill size={48} className="opacity-10 rotate-12" />
                                            </div>
                                            <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-bold text-lg italic relative z-10">
                                                {selectedRecord.prescription}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4">
                                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Pharmacist Dispensing Notes</label>
                                        <textarea 
                                            className="w-full min-h-[100px] rounded-3xl border-2 border-emerald-50 dark:border-emerald-900 bg-white dark:bg-slate-900 p-5 text-sm focus:border-emerald-500 focus:bg-emerald-50/10 transition-all outline-none italic font-medium text-slate-700 dark:text-slate-200"
                                            placeholder="Record actual quantities dispensed or specific advice..."
                                            value={dispensingNotes}
                                            onChange={(e) => setDispensingNotes(e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                                <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-end gap-4 mt-auto">
                                    <Button variant="outline" className="h-12 px-8 rounded-2xl font-bold" onClick={() => handleSelectRecord(null)}>Close</Button>
                                    <Button 
                                        className={`h-12 px-12 font-black text-white shadow-xl rounded-2xl transition-all ${selectedRecord.paymentStatus === 'PAID' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-slate-300 cursor-not-allowed shadow-none'}`}
                                        disabled={isConfirming || selectedRecord.paymentStatus !== 'PAID'}
                                        onClick={handleDispense}
                                    >
                                        {isConfirming ? "Securing Transaction..." : selectedRecord.paymentStatus === 'PAID' ? "Authorize & Dispense" : "Awaiting Cashier Clearance"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                                <div className="h-24 w-24 bg-indigo-50 rounded-[35px] flex items-center justify-center mb-2 text-indigo-600 shadow-sm rotate-3 animate-pulse">
                                    <Pill size={48} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">Pharmacy Queue Ready</h3>
                                    <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">
                                        Select a clinical case from the pendings queue to begin the medication dispensing and verification process.
                                    </p>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                                    <div className="h-2 w-2 rounded-full bg-indigo-300"></div>
                                    <div className="h-2 w-2 rounded-full bg-indigo-100"></div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
