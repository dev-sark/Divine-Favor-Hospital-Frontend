"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { patientsApi, visitsApi, recordsApi, labApi, billingApi, servicesApi, wardApi, analyticsApi } from "@/lib/api"
import { COMMON_DIAGNOSES, COMMON_DRUGS } from "@/lib/constants"
import { useAuth } from "@/providers/AuthContext"
import { useRouter } from "next/navigation"
import { ClipboardList, Pill, Stethoscope, Activity, Clock } from "lucide-react"

export default function ConsultationPage() {
    const { user } = useAuth()
    const router = useRouter()

    const [queue, setQueue] = React.useState<any[]>([])
    const [activePatient, setActivePatient] = React.useState<any>(null)
    const [activeVisit, setActiveVisit] = React.useState<any>(null)
    const [history, setHistory] = React.useState<any[]>([])
    const [timeline, setTimeline] = React.useState<any[]>([])
    const [activeTab, setActiveTab] = React.useState<"current" | "history" | "timeline">("current")

    React.useEffect(() => {
        if (user && user.role !== 'DOCTOR' && user.role !== 'ADMIN') {
            router.push("/dashboard")
        }
    }, [user, router])

    const [isLoading, setIsLoading] = React.useState(true)
    const [isHistoryLoading, setIsHistoryLoading] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [diagnosis, setDiagnosis] = React.useState("")
    const [symptoms, setSymptoms] = React.useState("")
    const [treatmentPlan, setTreatmentPlan] = React.useState("")
    const [prescription, setPrescription] = React.useState("")

    const [labCategory, setLabCategory] = React.useState("LABORATORY")
    const [labTests, setLabTests] = React.useState("")
    const [consultationFee, setConsultationFee] = React.useState("0")
    const [availableServices, setAvailableServices] = React.useState<any[]>([])
    const [selectedServiceId, setSelectedServiceId] = React.useState("")

    const [isAdmitting, setIsAdmitting] = React.useState(false)
    const [wards, setWards] = React.useState<any[]>([])
    const [selectedWard, setSelectedWard] = React.useState<any>(null)
    const [selectedBedId, setSelectedBedId] = React.useState("")
    const [admissionReason, setAdmissionReason] = React.useState("")

    const loadData = async () => {
        setIsLoading(true)
        try {
            const data = await visitsApi.getQueuedVisits("WAITING_FOR_DOCTOR")
            setQueue(data || [])
            
            const services = await servicesApi.getByCategory("CONSULTATION")
            setAvailableServices(services || [])
            if (services && services.length > 0) {
                setSelectedServiceId(services[0].id.toString())
                setConsultationFee(services[0].price.toString())
            }

            // Load Wards
            const wData = await wardApi.getAll()
            setWards(wData || [])
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAdmit = async () => {
        if (!activeVisit || !selectedBedId) return
        setIsSubmitting(true)
        try {
            await recordsApi.saveConsultationNotes({
                visitId: activeVisit.id,
                diagnosis, symptoms, treatmentPlan, prescription
            })

            await wardApi.admit({
                visitId: activeVisit.id,
                bedId: parseInt(selectedBedId),
                reason: admissionReason || diagnosis,
                username: user?.name
            })

            alert("Patient Admitted Successfully!")
            setIsAdmitting(false)
            loadData()
            setActiveVisit(null)
            setActivePatient(null)
        } catch (err) {
            alert("Admission failed. Bed might have been taken.")
        } finally {
            setIsSubmitting(false)
        }
    }

    React.useEffect(() => {
        loadData()
    }, [])

    const handleServiceChange = (id: string) => {
        const service = availableServices.find((s: any) => s.id.toString() === id);
        if (service) {
            setSelectedServiceId(id);
            setConsultationFee(service.price.toString());
        }
    }

    const handleSelectVisit = async (visit: any) => {
        setActivePatient(visit.patient)
        setActiveVisit(visit)
        setDiagnosis("")
        setSymptoms("")
        setTreatmentPlan("")
        setPrescription("")
        setLabTests("")
        setActiveTab("current")
        
        if (visit.patient?.id) {
            setIsHistoryLoading(true)
            try {
                const [historyData, timelineData] = await Promise.all([
                    recordsApi.getRecordsByPatient(visit.patient.id),
                    analyticsApi.getHandoverTimeline(visit.id)
                ])
                setHistory(historyData || [])
                setTimeline(timelineData || [])
            } catch (err) {
                console.error("Failed to load clinical context", err)
            } finally {
                setIsHistoryLoading(false)
            }
        }
    }

    const handleSubmit = async () => {
        if (!activeVisit || !diagnosis) return
        setIsSubmitting(true)
        try {
            await recordsApi.saveConsultationNotes({
                visitId: activeVisit.id,
                diagnosis,
                symptoms,
                treatmentPlan,
                prescription
            })

            if (labTests.trim()) {
                await labApi.requestTest(activeVisit.id, {
                    testNames: labTests,
                    category: labCategory
                })
            }

            await billingApi.createBill(activeVisit.id, {
                consultationFee: parseFloat(consultationFee),
                labFee: labTests.trim() ? 30 : 0, 
                items: `Consultation & ${labTests.trim() ? 'Lab Requests' : 'Direct Treatment'}`,
                insuranceNumber: "" 
            })

            alert("Consultation finalized! Lab requests and Billing generated.")

            setDiagnosis("")
            setSymptoms("")
            setTreatmentPlan("")
            setPrescription("")
            setLabTests("")
            setActiveVisit(null)
            setActivePatient(null)
            setHistory([])
            loadData()
        } catch (err) {
            console.error("Submission failed", err)
            alert("Failed to save consultation.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="h-[calc(100vh-140px)] overflow-hidden flex flex-col">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Clinical Queue</CardTitle>
                            <CardDescription>Patients awaiting doctor.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto px-4">
                            <div className="space-y-3">
                                {isLoading ? (
                                    <p className="text-center text-slate-400 text-sm py-4">Checking queue...</p>
                                ) : queue.length === 0 ? (
                                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed">
                                        <p className="text-slate-400 text-xs italic">Queue is empty.</p>
                                    </div>
                                ) : (
                                    queue.map((visit) => (
                                        <div
                                            key={visit.id}
                                            onClick={() => handleSelectVisit(visit)}
                                            className={`p-4 rounded-2xl cursor-pointer transition-all border-2 relative ${
                                                activeVisit?.id === visit.id 
                                                    ? "bg-indigo-50 border-indigo-500 shadow-md translate-x-1" 
                                                    : visit.priority === 'CRITICAL' 
                                                        ? "bg-red-50 border-red-200" 
                                                        : visit.priority === 'EMERGENCY'
                                                            ? "bg-amber-50 border-amber-200"
                                                            : "bg-white border-slate-100 hover:border-slate-300"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${activeVisit?.id === visit.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    {visit.patient?.fullName?.charAt(0)}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 leading-tight mb-1">{visit.patient?.fullName}</p>
                                                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">{visit.patient?.folderNumber}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    {activePatient ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 text-xl font-bold shadow-inner">
                                        {activePatient.fullName?.charAt(0)}
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-bold text-slate-900">{activePatient.fullName}</h2>
                                        <p className="text-sm text-slate-500 font-medium">
                                            Folder: <span className="text-slate-900 font-bold">{activePatient.folderNumber}</span> | {activePatient.gender}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    <button onClick={() => setActiveTab("current")} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'current' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>Consultation</button>
                                    <button onClick={() => setActiveTab("timeline")} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'timeline' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}>Handover Timeline</button>
                                    <button onClick={() => setActiveTab("history")} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>History ({history.length})</button>
                                </div>
                            </div>

                            {activeTab === 'current' ? (
                                <Card className="border-indigo-100 shadow-xl rounded-3xl overflow-hidden border-2">
                                    <CardContent className="p-8 space-y-8">
                                        <div className="grid grid-cols-4 gap-6 p-6 rounded-2xl bg-indigo-50 border border-indigo-100 italic">
                                            <VitalStat label="Temp" value={`${activeVisit.temperature || '--'} °C`} />
                                            <VitalStat label="BP" value={`${activeVisit.bloodPressure || '--/--'}`} />
                                            <VitalStat label="Weight" value={`${activeVisit.weight || '--'} kg`} />
                                            <VitalStat label="Urgency" value={activeVisit.priority} color="text-red-600" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Symptoms</label>
                                                    <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} className="w-full h-32 rounded-2xl border-2 border-slate-100 p-4 text-sm" placeholder="Patient complaints..." />
                                                </div>
                                                <div className="space-y-3 p-5 bg-slate-50 rounded-2xl">
                                                    <div className="flex justify-between items-center">
                                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Lab/Radiology Order</label>
                                                        <select value={labCategory} onChange={(e) => setLabCategory(e.target.value)} className="text-[10px] font-bold border-none bg-white p-1 rounded">
                                                            <option value="LABORATORY">Lab</option>
                                                            <option value="RADIOLOGY">Radiology</option>
                                                        </select>
                                                    </div>
                                                    <textarea value={labTests} onChange={(e) => setLabTests(e.target.value)} className="w-full h-20 bg-white border-none rounded-xl p-3 text-sm" placeholder="Tests..." />
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Diagnosis</label>
                                                    <Input list="diag" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="rounded-xl border-2" placeholder="Search diagnosis..." />
                                                    <datalist id="diag">{COMMON_DIAGNOSES.map(d => <option key={d} value={d}/>)}</datalist>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Treatment Plan</label>
                                                    <textarea value={treatmentPlan} onChange={(e) => setTreatmentPlan(e.target.value)} className="w-full h-32 rounded-2xl border-2 border-slate-100 p-4 text-sm" placeholder="Plan..." />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t">
                                            <div className="flex justify-between">
                                                <label className="text-xs font-black text-indigo-500 uppercase tracking-widest">Prescription</label>
                                                <select className="text-[10px] bg-slate-100 p-1" onChange={(e) => setPrescription(p => p + (p?"\n":"") + e.target.value)}>
                                                    <option value="">+ Add Drug</option>
                                                    {COMMON_DRUGS.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                            <textarea value={prescription} onChange={(e) => setPrescription(e.target.value)} className="w-full h-32 bg-indigo-50/20 border-2 border-indigo-100 rounded-2xl p-4 text-sm font-bold italic" />
                                        </div>
                                    </CardContent>

                                    <div className="px-8 pb-4 pt-1 bg-slate-50/50">
                                        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
                                            <div className="flex-1 mr-4">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultation Type (Auto-Pricing)</p>
                                                <select 
                                                    className="w-full mt-1 bg-slate-50 border-none p-2 rounded-lg text-sm font-bold"
                                                    value={selectedServiceId}
                                                    onChange={(e) => handleServiceChange(e.target.value)}
                                                >
                                                    {availableServices.length === 0 ? (
                                                        <option>No Services Configured</option>
                                                    ) : (
                                                        availableServices.map(s => <option key={s.id} value={s.id}>{s.name} — GH₵ {s.price.toFixed(2)}</option>)
                                                    )}
                                                </select>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Encounter Fee</p>
                                                <p className="text-lg font-black text-slate-900">GH₵ {parseFloat(consultationFee).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <CardFooter className="bg-slate-50 p-8 border-t flex flex-col gap-6">
                                        <div className="w-full bg-white p-6 rounded-3xl border border-slate-200">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Patient Disposition</h4>
                                                <div className="flex gap-2">
                                                    <Button variant={!isAdmitting ? "primary" : "outline"} size="sm" onClick={() => setIsAdmitting(false)}>Outpatient</Button>
                                                    <Button variant={isAdmitting ? "primary" : "outline"} size="sm" onClick={() => setIsAdmitting(true)}>In-Patient (Admit)</Button>
                                                </div>
                                            </div>

                                            {isAdmitting && (
                                                <div className="space-y-4 pt-4 border-t border-dashed animate-in fade-in slide-in-from-top-2">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-slate-400">Target Ward</label>
                                                            <select 
                                                                className="w-full p-2 bg-slate-50 rounded-lg text-xs font-bold outline-none"
                                                                onChange={(e) => {
                                                                    const ward = wards.find(w => w.id.toString() === e.target.value);
                                                                    setSelectedWard(ward);
                                                                    setSelectedBedId("");
                                                                }}
                                                            >
                                                                <option value="">Select Ward...</option>
                                                                {wards.map(w => <option key={w.id} value={w.id}>{w.name} ({w.type})</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-slate-400">Available Bed</label>
                                                            <select 
                                                                className="w-full p-2 bg-slate-50 rounded-lg text-xs font-bold outline-none"
                                                                value={selectedBedId}
                                                                onChange={(e) => setSelectedBedId(e.target.value)}
                                                                disabled={!selectedWard}
                                                            >
                                                                <option value="">Select Bed...</option>
                                                                {selectedWard?.beds?.filter((b: any) => b.status === 'AVAILABLE').map((b: any) => (
                                                                    <option key={b.id} value={b.id}>Bed {b.bedNumber}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-slate-400">Admission Reason / Instructions</label>
                                                        <input 
                                                            className="w-full p-2 bg-slate-50 rounded-lg text-xs font-bold outline-none"
                                                            placeholder="Why is this patient being admitted?"
                                                            value={admissionReason}
                                                            onChange={(e) => setAdmissionReason(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {isAdmitting ? (
                                            <Button className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black shadow-lg shadow-red-100" onClick={handleAdmit} disabled={isSubmitting || !selectedBedId}>
                                                {isSubmitting ? "Processing Admission..." : "Confirm Emergency Admission"}
                                            </Button>
                                        ) : (
                                            <Button className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-bold" onClick={handleSubmit} disabled={isSubmitting || !diagnosis}>
                                                {isSubmitting ? "Finalizing..." : "Submit & Finalize Encounter"}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ) : activeTab === 'timeline' ? (
                                <div className="p-10 bg-white rounded-[40px] border-2 border-emerald-50 min-h-[500px] shadow-sm">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="h-10 w-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                                            <ClipboardList className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 uppercase tracking-tighter">Visit Handover Timeline</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Live Clinical Activity Feed</p>
                                        </div>
                                    </div>
                                    
                                    <div className="relative pl-8 border-l-2 border-emerald-100 space-y-12">
                                        {timeline.length === 0 ? (
                                            <p className="text-center py-20 text-slate-400 italic text-xs">No clinical logs found for this visit yet.</p>
                                        ) : (
                                            timeline.map((log: any, idx: number) => (
                                                <div key={idx} className="relative">
                                                    <div className="absolute -left-[41px] top-0 h-4 w-4 rounded-full bg-white border-4 border-emerald-500 shadow-sm" />
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">
                                                                {log.action}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400">
                                                                {new Date(log.timestamp).toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-800 leading-tight">
                                                            {log.details}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 italic font-medium">
                                                            Recorded by: <span className="text-slate-900 font-bold">{log.user?.username || 'System'}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 bg-white rounded-3xl border min-h-[400px]">
                                    <h3 className="font-bold mb-4">Past Records</h3>
                                    <div className="space-y-4">
                                        {history.map(r => (
                                            <div key={r.id} className="p-4 border rounded-xl">
                                                <p className="text-xs text-slate-400">{new Date(r.visit?.visitDate).toDateString()}</p>
                                                <p className="font-bold text-indigo-600">{r.diagnosis}</p>
                                                <p className="text-sm">{r.prescription}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center p-20 text-slate-300 italic font-bold border-2 border-dashed rounded-[40px]">
                            Encounter focus mode: Select a patient from the queue.
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}

function VitalStat({ label, value, color = "text-slate-900" }: any) {
    return (
        <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase">{label}</p>
            <p className={`text-base font-black ${color}`}>{value}</p>
        </div>
    )
}
