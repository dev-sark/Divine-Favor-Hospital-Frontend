"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { patientsApi, visitsApi, recordsApi } from "@/lib/api"
import { useAuth } from "@/providers/AuthContext"
import { useRouter } from "next/navigation"

export default function ConsultationPage() {
    const { user } = useAuth()
    const router = useRouter()

    const [queue, setQueue] = React.useState<any[]>([])
    const [activePatient, setActivePatient] = React.useState<any>(null)
    const [activeVisit, setActiveVisit] = React.useState<any>(null)

    React.useEffect(() => {
        if (user && user.role !== 'DOCTOR' && user.role !== 'ADMIN') {
            router.push("/dashboard")
        }
    }, [user, router])

    const [isLoading, setIsLoading] = React.useState(true)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [diagnosis, setDiagnosis] = React.useState("")
    const [symptoms, setSymptoms] = React.useState("")
    const [treatmentPlan, setTreatmentPlan] = React.useState("")
    const [prescription, setPrescription] = React.useState("")

    const loadData = async () => {
        setIsLoading(true)
        try {
            // Fetch the queue of patients specifically waiting for doctors
            const data = await visitsApi.getQueuedVisits("WAITING_FOR_DOCTOR")
            setQueue(data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        loadData()
    }, [])

    const handleSelectVisit = async (visit: any) => {
        setActivePatient(visit.patient)
        setActiveVisit(visit)
        setDiagnosis("")
        setSymptoms("")
        setTreatmentPlan("")
        setPrescription("")
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
            alert("Consultation finalized successfully! Record sent to Pharmacy.")

            setDiagnosis("")
            setSymptoms("")
            setTreatmentPlan("")
            setPrescription("")
            setActiveVisit(null)
            setActivePatient(null)
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Waiting Queue</CardTitle>
                            <CardDescription>Patients logged by Nurse and waiting.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {isLoading ? (
                                    <p className="text-center text-slate-400 text-sm py-4">Checking queue...</p>
                                ) : queue.length === 0 ? (
                                    <p className="text-center text-slate-400 text-sm py-4 italic">No patients in queue.</p>
                                ) : (
                                    queue.map((visit) => (
                                        <div
                                            key={visit.id}
                                            onClick={() => handleSelectVisit(visit)}
                                            className={`p-3 rounded-xl cursor-pointer transition-all border relative ${
                                                activeVisit?.id === visit.id 
                                                    ? "bg-primary/10 border-primary shadow-sm" 
                                                    : visit.priority === 'CRITICAL' 
                                                        ? "bg-red-50 border-red-200 animate-pulse" 
                                                        : visit.priority === 'EMERGENCY'
                                                            ? "bg-amber-50 border-amber-200"
                                                            : "bg-white border-slate-100 hover:border-slate-300"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 leading-none mb-1">{visit.patient?.fullName}</p>
                                                    <p className="text-[10px] text-slate-500 font-monouppercase uppercase">{visit.patient?.folderNumber}</p>
                                                </div>
                                                {visit.priority !== 'NORMAL' && (
                                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${visit.priority === 'CRITICAL' ? "bg-red-500 text-white" : "bg-amber-500 text-white"}`}>
                                                        {visit.priority}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {activePatient ? (
                        <Card className="border-primary/20 shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-6">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl">Consultation: {activePatient.fullName}</CardTitle>
                                    <CardDescription>
                                        Folder: {activePatient.folderNumber} | {activePatient.gender || 'Unknown'} | {activePatient.telephone || 'N/A'}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                {activeVisit ? (
                                    <>
                                        <div className="flex gap-4 p-4 rounded-xl bg-teal-50 border border-teal-100 items-center justify-between">
                                            <div className="flex gap-6">
                                                <VitalStat label="Temp" value={`${activeVisit.temperature || '--'}°C`} />
                                                <div className="w-[1px] bg-teal-200 self-stretch" />
                                                <VitalStat label="BP" value={`${activeVisit.bloodPressure || '--/--'}`} />
                                                <div className="w-[1px] bg-teal-200 self-stretch" />
                                                <VitalStat label="Weight" value={`${activeVisit.weight || '--'} kg`} />
                                            </div>
                                            <div className="text-[10px] font-bold text-teal-600 bg-teal-100 px-3 py-1 rounded-full uppercase">
                                                Active Visit loaded
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Presenting Symptoms</label>
                                                <textarea
                                                    value={symptoms}
                                                    onChange={(e) => setSymptoms(e.target.value)}
                                                    className="flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                    placeholder="Enter symptoms reported by patient..."
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Primary Diagnosis</label>
                                                <Input
                                                    value={diagnosis}
                                                    onChange={(e) => setDiagnosis(e.target.value)}
                                                    placeholder="Enter final diagnosis (e.g. Malaria)"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Treatment Plan</label>
                                                <textarea
                                                    value={treatmentPlan}
                                                    onChange={(e) => setTreatmentPlan(e.target.value)}
                                                    className="flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                    placeholder="Enter medications or treatment required..."
                                                />
                                            </div>

                                            <div className="space-y-1.5 pt-2">
                                                <label className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Requested Prescription</label>
                                                <textarea
                                                    value={prescription}
                                                    onChange={(e) => setPrescription(e.target.value)}
                                                    className="flex min-h-[100px] w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                                    placeholder="Enter drugs and dosage for the pharmacist..."
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-4">⚠️</div>
                                        <h3 className="font-bold text-slate-800">No active visits found for this patient</h3>
                                        <p className="text-sm text-slate-500 mt-2">The patient must first be triaged by the Nurse to create an active visit encounter in the system.</p>
                                    </div>
                                )}
                            </CardContent>
                            {activeVisit && (
                                <CardFooter className="border-t border-slate-100 pt-6">
                                    <Button className="w-full h-12" onClick={handleSubmit} disabled={isSubmitting || !diagnosis}>
                                        {isSubmitting ? "Submitting..." : "Submit Medical Record"}
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <span className="text-2xl">📋</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No Patient Selected</h3>
                            <p className="text-sm text-slate-500 max-w-xs mt-1">Select a patient from the directory on the left to begin compiling their medical record.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}

function VitalStat({ label, value }: any) {
    return (
        <div className="min-w-[70px]">
            <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest leading-none">{label}</p>
            <p className="text-[15px] font-bold text-slate-900 mt-1">{value}</p>
        </div>
    )
}
