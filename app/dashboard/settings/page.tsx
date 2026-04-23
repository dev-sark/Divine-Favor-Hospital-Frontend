"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { authApi } from "@/lib/api"
import { KeyRound } from "lucide-react"

export default function SettingsPage() {
    const [isLoading, setIsLoading] = React.useState(false)
    const [message, setMessage] = React.useState({ type: '', text: '' })
    const [formData, setFormData] = React.useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage({ type: '', text: '' })

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: "New passwords do not match." })
            setIsLoading(false)
            return
        }

        try {
            await authApi.changePassword({
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            })
            setMessage({ type: 'success', text: "Password updated securely." })
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' })
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "Failed to update password." })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h2>
                    <p className="text-sm text-slate-500">Manage your personal security profile.</p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit}>
                        <CardHeader className="flex flex-row items-center gap-4 border-b border-slate-100 bg-slate-50/50 pb-6 rounded-t-xl">
                            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                                <KeyRound className="w-6 h-6 text-slate-700" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Change Password</CardTitle>
                                <CardDescription>Update your login credentials securely.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            {message.text && (
                                <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Current Password</label>
                                <Input
                                    type="password"
                                    name="oldPassword"
                                    required
                                    value={formData.oldPassword}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">New Password</label>
                                    <Input
                                        type="password"
                                        name="newPassword"
                                        required
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Confirm New Password</label>
                                    <Input
                                        type="password"
                                        name="confirmPassword"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2 pb-6 flex justify-end">
                            <Button type="submit" disabled={isLoading || !formData.oldPassword || !formData.newPassword}>
                                {isLoading ? "Updating..." : "Save Password"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    )
}
