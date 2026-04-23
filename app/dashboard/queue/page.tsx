"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { patientsApi, visitsApi } from "@/lib/api"
import { Search } from "lucide-react"
import { useAuth } from "@/providers/AuthContext"
import { useRouter } from "next/navigation"
import { VitalsModal } from "@/components/VitalsModal"

export default function QueuePage() {
    const { user } = useAuth()
    const router = useRouter()

    const [selectedPatient, setSelectedPatient] = React.useState<any>(null)
    const [isModalOpen, setIsModalOpen] = React.useState(false)

    React.useEffect(() => {
        if (user && user.role !== 'NURSE' && user.role !== 'DOCTOR' && user.role !== 'ADMIN') {
            router.push("/dashboard")
        }
    }, [user, router])

    const [patients, setPatients] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [submittingId, setSubmittingId] = React.useState<number | null>(null)

    const fetchPatients = async () => {
        setIsLoading(true)
        try {
            const data = await patientsApi.getAllPatients()
            if (Array.isArray(data)) {
                setPatients(data)
            } else {
                console.error("Non-array patient data:", data)
                setPatients([])
            }
        } catch (err: any) {
            console.error("Failed to fetch patients", err)
            alert("Error loading patients: " + (err.message || "Unknown error"))
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchPatients()
    }, [])

    const handleOpenModal = (patient: any) => {
        setSelectedPatient(patient)
        setIsModalOpen(true)
    }

    const handleSaveVitals = async (vitals: any) => {
        if (!selectedPatient) return
        setSubmittingId(selectedPatient.id)
        try {
            await visitsApi.saveVitals(selectedPatient.id, vitals)
            alert(`${selectedPatient.fullName} checked in successfully! Patient moved to Doctor queue.`)
            fetchPatients()
        } catch (err) {
            console.error(err)
            alert("Failed to log vitals.")
            throw err
        } finally {
            setSubmittingId(null)
        }
    }

    const filteredPatients = patients.filter(p =>
        p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.folderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Directory (Triage)</h2>
                        <p className="text-sm text-slate-500">Select arriving patients and log their vitals to generate a visit.</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={fetchPatients} disabled={isLoading}>
                        {isLoading ? "Refreshing..." : "Refresh Patients"}
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg">Registered Patients</CardTitle>
                            <CardDescription>Click to begin a new visit encounter.</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                placeholder="Search by name or folder..."
                                className="pl-9 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400 font-medium">
                                        <th className="pb-3 pl-2">Patient Name</th>
                                        <th className="pb-3">Folder #</th>
                                        <th className="pb-3">Phone</th>
                                        <th className="pb-3 text-right pr-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredPatients.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-slate-400 italic">No patients found.</td>
                                        </tr>
                                    ) : (
                                        filteredPatients.map((patient) => (
                                            <tr key={patient.id} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 pl-2 font-medium text-slate-900">{patient.fullName}</td>
                                                <td className="py-4 text-slate-500 font-mono text-xs">{patient.folderNumber}</td>
                                                <td className="py-4 text-slate-500">{patient.telephone || 'N/A'}</td>
                                                <td className="py-4 text-right pr-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-primary hover:text-accent font-bold"
                                                        disabled={submittingId === patient.id}
                                                        onClick={() => handleOpenModal(patient)}
                                                    >
                                                        {submittingId === patient.id ? "Working..." : "Log Vitals & Check-in"}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {isModalOpen && selectedPatient && (
                    <VitalsModal 
                        patient={selectedPatient}
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleSaveVitals}
                    />
                )}
            </div>
        </DashboardLayout>
    )
}
