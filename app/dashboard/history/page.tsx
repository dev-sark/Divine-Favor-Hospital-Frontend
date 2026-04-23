"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { patientsApi, visitsApi } from "@/lib/api"
import { Search, User, Phone, Calendar, Activity } from "lucide-react"

export default function HistoryPage() {
    const [patients, setPatients] = React.useState<any[]>([])
    const [searchTerm, setSearchTerm] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(true)

    // For expanded view (modal or inline)
    const [expandedPatient, setExpandedPatient] = React.useState<any>(null)
    const [activeHistory, setActiveHistory] = React.useState<any[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = React.useState(false)

    const fetchPatients = async () => {
        setIsLoading(true)
        try {
            const data = await patientsApi.getAllPatients()
            if (Array.isArray(data)) {
                setPatients(data)
            } else {
                console.error("Non-array data received:", data)
                setPatients([])
            }
        } catch (error: any) {
            console.error("Failed to fetch patients", error)
            alert("Error loading directory: " + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchPatients()
    }, [])

    const handleViewHistory = async (patient: any) => {
        setExpandedPatient(patient)
        setIsLoadingHistory(true)
        try {
            const history = await visitsApi.getVisitHistory(patient.id)
            setActiveHistory(history || [])
        } catch (err) {
            console.error("Failed to load history", err)
            setActiveHistory([])
        } finally {
            setIsLoadingHistory(false)
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
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Directory</h2>
                        <p className="text-sm text-slate-500">View a complete list of all patients and their historical hospital visits.</p>
                    </div>
                    <Button size="sm" onClick={fetchPatients} disabled={isLoading} variant="outline" className="border-slate-200">
                        {isLoading ? "Refreshing..." : "Refresh Patients"}
                    </Button>
                </div>

                <Card className="border-slate-200">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg">Registered Patients</CardTitle>
                            <CardDescription>Click 'View Visits' to see medical encounters or log new vitals.</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                placeholder="Search Name or Folder Number..."
                                className="pl-9 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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
                                        <th className="pb-3">Birth Year</th>
                                        <th className="pb-3 text-right pr-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredPatients.length === 0 && !isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-slate-400 italic">No patients found in directory.</td>
                                        </tr>
                                    ) : (
                                        filteredPatients.map((patient) => (
                                            <React.Fragment key={patient.id}>
                                                <tr className={`group transition-colors ${expandedPatient?.id === patient.id ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}>
                                                    <td className="py-4 pl-2 font-bold text-slate-900">{patient.fullName}</td>
                                                    <td className="py-4 font-mono text-[10px] text-slate-500 uppercase">{patient.folderNumber}</td>
                                                    <td className="py-4 text-slate-500">{patient.telephone || 'N/A'}</td>
                                                    <td className="py-4 text-slate-500">{patient.dateOfBirth ? new Date(patient.dateOfBirth).getFullYear() : 'Unknown'}</td>
                                                    <td className="py-4 text-right pr-2">
                                                        <Button
                                                            variant={expandedPatient?.id === patient.id ? "primary" : "outline"}
                                                            size="sm"
                                                            className="hover:shadow-md transition-shadow"
                                                            onClick={() => expandedPatient?.id === patient.id ? setExpandedPatient(null) : handleViewHistory(patient)}
                                                        >
                                                            {expandedPatient?.id === patient.id ? "Close" : "View History"}
                                                        </Button>
                                                    </td>
                                                </tr>

                                                {expandedPatient?.id === patient.id && (
                                                    <tr>
                                                        <td colSpan={5} className="p-0 border-b border-slate-100">
                                                            <div className="bg-slate-50 p-6 shadow-inner border-l-4 border-l-primary flex flex-col lg:flex-row gap-6">
                                                                <div className="flex-1">
                                                                    <h4 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2 uppercase tracking-wide">
                                                                        <Calendar className="w-4 h-4 text-primary" /> Encounter History for {patient.fullName}
                                                                    </h4>
                                                                    {isLoadingHistory ? (
                                                                        <p className="text-sm text-slate-400 italic bg-white p-4 rounded-xl border border-dashed text-center">Loading visits...</p>
                                                                    ) : activeHistory.length === 0 ? (
                                                                        <p className="text-sm text-slate-400 italic bg-white p-4 rounded-xl border border-dashed text-center">No historical visits found.</p>
                                                                    ) : (
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            {activeHistory.map((visit: any, index: number) => (
                                                                                <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative hover:border-primary transition-colors">
                                                                                    <div className="absolute top-4 right-4 h-2 w-2 bg-teal-400 rounded-full"></div>
                                                                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">
                                                                                        {new Date(visit.visitDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                                                                    </p>
                                                                                    <p className="font-bold text-slate-800 text-xs mb-3 border-b pb-1 border-slate-50">CLINICAL VITALS</p>
                                                                                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                                                                                        <div><span className="text-slate-400 font-medium">BP:</span> <span className="font-bold">{visit.bloodPressure || '-'}</span></div>
                                                                                        <div><span className="text-slate-400 font-medium">Temp:</span> <span className="font-bold text-teal-600">{visit.temperature}°C</span></div>
                                                                                        <div><span className="text-slate-400 font-medium">Weight:</span> <span className="font-bold">{visit.weight}kg</span></div>
                                                                                        <div><span className="text-slate-400 font-medium">Status:</span> <span className="text-[10px] py-0.5 px-1 bg-slate-100 rounded text-slate-500">{visit.status}</span></div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="w-full lg:w-96 space-y-4">
                                                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                                                        <h4 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                                                                            <Activity className="w-4 h-4 text-primary" /> Log New Visit (Triage)
                                                                        </h4>
                                                                        <form className="space-y-4" onSubmit={async (e) => {
                                                                            e.preventDefault();
                                                                            const target = e.target as any;
                                                                            try {
                                                                                await visitsApi.saveVitals(patient.id, {
                                                                                    temperature: target.temp.value,
                                                                                    bloodPressure: target.bp.value,
                                                                                    weight: target.weight.value,
                                                                                    status: "WAITING_FOR_DOCTOR"
                                                                                });
                                                                                alert("Success: Patient checked in and sent to doctor queue.");
                                                                                handleViewHistory(patient); // Refresh list
                                                                                e.currentTarget.reset();
                                                                            } catch (err) {
                                                                                alert("Failed to log visit. Connect to IT support.");
                                                                            }
                                                                        }}>
                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                <div className="space-y-1">
                                                                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Temp (°C)</label>
                                                                                    <input name="temp" placeholder="36.5" className="flex h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-sm focus:ring-1 focus:ring-primary outline-none" required />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Weight (kg)</label>
                                                                                    <input name="weight" placeholder="70" className="flex h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-sm focus:ring-1 focus:ring-primary outline-none" required />
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Blood Pressure</label>
                                                                                <input name="bp" placeholder="120/80" className="flex h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-sm focus:ring-1 focus:ring-primary outline-none" required />
                                                                            </div>
                                                                            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5" type="submit">
                                                                                Confirm Check-in
                                                                            </Button>
                                                                        </form>
                                                                    </div>

                                                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                                                        <h4 className="font-bold text-slate-800 mb-4 text-xs flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-default">
                                                                            <User className="w-4 h-4 text-slate-400" /> Edit Demographics
                                                                        </h4>
                                                                        <div className="space-y-3">
                                                                            <input
                                                                                type="text"
                                                                                className="flex h-9 w-full rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                                                                defaultValue={patient.fullName}
                                                                                onChange={(e) => patient.fullName = e.target.value}
                                                                                placeholder="Full Name"
                                                                            />
                                                                            <input
                                                                                type="text"
                                                                                className="flex h-9 w-full rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                                                                defaultValue={patient.telephone}
                                                                                onChange={(e) => patient.telephone = e.target.value}
                                                                                placeholder="Phone Number"
                                                                            />
                                                                            <Button
                                                                                variant="outline"
                                                                                className="w-full text-xs h-9 border-slate-100 hover:bg-slate-50"
                                                                                onClick={async () => {
                                                                                    try {
                                                                                        await patientsApi.updatePatient(patient.id, {
                                                                                            fullName: patient.fullName,
                                                                                            telephone: patient.telephone
                                                                                        })
                                                                                        alert("Profile updated!")
                                                                                    } catch (err) {
                                                                                        alert("Failed to update.")
                                                                                    }
                                                                                }}
                                                                            >
                                                                                Update Basic Info
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
