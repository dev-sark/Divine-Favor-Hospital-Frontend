"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { patientsApi } from "@/lib/api"
import { useAuth } from "@/providers/AuthContext"
import { useRouter } from "next/navigation"

export default function RegistrationPage() {
    const { user } = useAuth()
    const router = useRouter()

    React.useEffect(() => {
        if (user && user.role !== 'RECEPTIONIST' && user.role !== 'NURSE' && user.role !== 'ADMIN') {
            router.push("/dashboard")
        }
    }, [user, router])

    const [isLoading, setIsLoading] = React.useState(false)
    const [message, setMessage] = React.useState({ type: '', text: '' })
    const [formData, setFormData] = React.useState({
        fullName: '',
        telephone: '',
        dateOfBirth: '',
        gender: 'Male',
        hasInsurance: false,
        insuranceProvider: '',
        insuranceNumber: ''
    })

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage({ type: '', text: '' })

        try {
            const response = await patientsApi.registerPatient(formData)
            setMessage({
                type: 'success',
                text: `Patient registered successfully! Folder Number: ${response.folderNumber}`
            })
            // Reset form
            setFormData({
                fullName: '',
                telephone: '',
                dateOfBirth: '',
                gender: 'Male',
                hasInsurance: false,
                insuranceProvider: '',
                insuranceNumber: ''
            })
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "Failed to register patient." })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Registration</h2>
                        <p className="text-sm text-slate-500">Register a new patient and assign a digital medical folder.</p>
                    </div>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-xl border font-bold text-sm ${message.type === 'success' ? 'bg-teal-50 border-teal-100 text-teal-700' : 'bg-red-50 border-red-100 text-red-700'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Bio-Data & Identification</CardTitle>
                            <CardDescription>Basic patient identification details.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Full Name"
                                name="fullName"
                                placeholder="e.g. John Doe"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                            <Input
                                label="Telephone"
                                name="telephone"
                                placeholder="024XXXXXXX"
                                required
                                value={formData.telephone}
                                onChange={handleChange}
                            />
                            <Input
                                label="Date of Birth"
                                name="dateOfBirth"
                                type="date"
                                required
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                            />
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                                >
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Insurance & Billing</CardTitle>
                            <CardDescription>Optional insurance details for automated billing.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                                <input
                                    type="checkbox"
                                    name="hasInsurance"
                                    checked={formData.hasInsurance}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-slate-700">Patient has Insurance (NHIS / Private)</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Insurance Provider"
                                    name="insuranceProvider"
                                    placeholder="e.g. NHIS"
                                    value={formData.insuranceProvider}
                                    onChange={handleChange}
                                    disabled={!formData.hasInsurance}
                                />
                                <Input
                                    label="Insurance Number"
                                    name="insuranceNumber"
                                    placeholder="XXXXXXXXX"
                                    value={formData.insuranceNumber}
                                    onChange={handleChange}
                                    disabled={!formData.hasInsurance}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" type="button" onClick={() => window.history.back()}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Registering..." : "Complete Registration"}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    )
}
