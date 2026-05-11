"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { appointmentApi, patientsApi, staffApi } from "@/lib/api"
import { Calendar, Clock, UserPlus, Search, CheckCircle, XCircle, MoreVertical, Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useToast } from "@/providers/ToastContext"

export default function AppointmentsPage() {
    const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0])
    const [appointments, setAppointments] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [showForm, setShowForm] = React.useState(false)
    const { success, error } = useToast()

    // Form inputs
    const [patientId, setPatientId] = React.useState("")
    const [doctorId, setDoctorId] = React.useState("")
    const [appDate, setAppDate] = React.useState("")
    const [appTime, setAppTime] = React.useState("")
    const [reason, setReason] = React.useState("")
    const [doctors, setDoctors] = React.useState<any[]>([])
    const [isSaving, setIsSaving] = React.useState(false)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const data = await appointmentApi.getByDate(selectedDate)
            setAppointments(data || [])

            const staff = await staffApi.getAll()
            setDoctors(staff.filter((s: any) => s.role === 'DOCTOR') || [])
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchData()
    }, [selectedDate])

    const handleSchedule = async () => {
        setIsSaving(true)
        try {
            const fullDateTime = `${appDate}T${appTime}:00`
            await appointmentApi.schedule({
                patient: { id: parseInt(patientId) },
                doctor: doctorId ? { id: parseInt(doctorId) } : null,
                appointmentDate: fullDateTime,
                reason,
                status: 'SCHEDULED'
            })
            success("Appointment Scheduled!", "Visit Confirmed")
            setShowForm(false)
            fetchData()
        } catch (err) {
            error("Booking failed. Please check patient ID.", "Access Denied")
        } finally {
            setIsSaving(false)
        }
    }

    const handleCheckIn = async (id: number) => {
        try {
            await appointmentApi.checkIn(id)
            success("Patient Checked In! They are now in the Triage queue.", "Clinical Arrival")
            fetchData()
        } catch (err) {
            error("Check-in failed.", "System Error")
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Clinic Schedule</h2>
                        <p className="text-slate-500 font-medium italic">Manage future patient bookings and doctor availability.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
                            <Calendar className="text-indigo-500 w-4 h-4 ml-2" />
                            <input
                                type="date"
                                className="border-none bg-transparent text-xs font-black outline-none"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-indigo-600 text-white rounded-2xl font-black px-6 hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <Plus size={18} /> Book Appointment
                        </Button>
                    </div>
                </div>

                {showForm && (
                    <Card className="rounded-[40px] border-2 border-indigo-100 shadow-2xl animate-in zoom-in-95 duration-200">
                        <CardHeader className="bg-indigo-50 p-8 rounded-t-[40px]">
                            <CardTitle className="text-xl font-black text-indigo-900">New Appointment Request</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Patient Folder ID</label>
                                <input className="w-full bg-slate-50 p-3 rounded-xl border-none outline-none font-bold text-sm" value={patientId} onChange={(e) => setPatientId(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Doctor</label>
                                <select className="w-full bg-slate-50 p-3 rounded-xl border-none outline-none font-bold text-sm" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
                                    <option value="">Any Available Doctor</option>
                                    {doctors.map(d => <option key={d.id} value={d.id}>{d.username}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Date</label>
                                <input type="date" className="w-full bg-slate-50 p-3 rounded-xl border-none outline-none font-bold text-sm" value={appDate} onChange={(e) => setAppDate(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Time</label>
                                <input type="time" className="w-full bg-slate-50 p-3 rounded-xl border-none outline-none font-bold text-sm" value={appTime} onChange={(e) => setAppTime(e.target.value)} />
                            </div>
                            <div className="md:col-span-3 space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Reason for Visit</label>
                                <input className="w-full bg-slate-50 p-3 rounded-xl border-none outline-none font-bold text-sm" placeholder="Symptoms or purpose..." value={reason} onChange={(e) => setReason(e.target.value)} />
                            </div>
                            <div className="flex items-end">
                                <Button className="w-full bg-indigo-600 h-12 rounded-xl font-black text-white" disabled={isSaving} onClick={handleSchedule}>
                                    {isSaving ? "Booking..." : "Confirm Schedule"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 gap-4">
                    {isLoading ? (
                        <div className="p-20 text-center italic text-slate-300 font-bold">Checking clinic schedule...</div>
                    ) : appointments.length === 0 ? (
                        <div className="p-20 text-center space-y-4 rounded-[40px] bg-slate-50 border-2 border-dashed border-slate-200">
                            <Calendar className="w-16 h-16 text-slate-200 mx-auto" />
                            <p className="text-slate-400 font-black">No appointments scheduled for this date.</p>
                        </div>
                    ) : (
                        appointments.map((app) => (
                            <Card key={app.id} className="rounded-[30px] border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white">
                                <div className="flex">
                                    <div className={`w-2 ${app.status === 'SCHEDULED' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
                                    <CardContent className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-16 bg-slate-50 rounded-[24px] flex flex-col items-center justify-center border border-slate-100">
                                                <span className="text-[8px] font-black uppercase text-slate-400">Time</span>
                                                <span className="text-sm font-black text-slate-900">{new Date(app.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-800">{app.patient.fullName}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-bold text-slate-400">Dr. {app.doctor?.username || "Unassigned"}</span>
                                                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{app.reason}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {app.status === 'SCHEDULED' && (
                                                <Button
                                                    className="bg-emerald-500 text-white font-black rounded-xl px-6 hover:bg-emerald-600 shadow-lg shadow-emerald-50"
                                                    onClick={() => handleCheckIn(app.id)}
                                                >
                                                    Process Check-In
                                                </Button>
                                            )}
                                            {app.status === 'COMPLETED' && (
                                                <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase bg-emerald-50 px-4 py-2 rounded-xl">
                                                    <CheckCircle size={14} /> Checked-In
                                                </div>
                                            )}
                                            <button className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" onClick={() => appointmentApi.cancel(app.id).then(fetchData)}>
                                                <XCircle size={20} />
                                            </button>
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
