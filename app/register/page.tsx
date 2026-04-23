"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card"
import { authApi } from "@/lib/api"
import { Stethoscope } from "lucide-react"

export default function RegisterStaffPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [message, setMessage] = React.useState({ type: '', text: '' })

    const [formData, setFormData] = React.useState({
        username: '',
        password: '',
        role: 'DOCTOR'
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage({ type: '', text: '' })

        try {
            const data = await authApi.register(formData)
            setMessage({ type: 'success', text: data.message || "Registration successful! Pending Admin approval." })
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "Registration failed. Username might be taken." })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Stethoscope className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Staff Registration</h1>
                    <p className="text-slate-500">Apply for access to the clinical core network.</p>
                </div>

                <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40">
                    <form onSubmit={handleSubmit}>
                        <CardContent className="pt-6 space-y-4">
                            {message.text && (
                                <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Username</label>
                                <Input
                                    name="username"
                                    placeholder="e.g. dr_smith"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Password</label>
                                <Input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                                >
                                    <option value="DOCTOR">Doctor</option>
                                    <option value="NURSE">Nurse</option>
                                    <option value="PHARMACIST">Pharmacist</option>
                                    <option value="RECEPTIONIST">Receptionist</option>
                                    <option value="ADMIN">System Administrator</option>
                                </select>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4 pb-6">
                            <Button className="w-full h-11 rounded-xl" type="submit" disabled={isLoading}>
                                {isLoading ? "Submitting..." : "Submit Application"}
                            </Button>
                            <p className="text-center text-sm text-slate-500">
                                Already have an account? <a href="/login" className="text-primary font-bold hover:underline">Log in here</a>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
