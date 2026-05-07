"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { authApi, auditApi } from "@/lib/api"
import { KeyRound, ShieldCheck, History, User, Activity, Clock } from "lucide-react"
import { useAuth } from "@/providers/AuthContext"

export default function SettingsPage() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = React.useState(false)
    const [auditLogs, setAuditLogs] = React.useState<any[]>([])
    const [isAuditLoading, setIsAuditLoading] = React.useState(false)
    const [message, setMessage] = React.useState({ type: '', text: '' })
    const [activeTab, setActiveTab] = React.useState('password')
    const [formData, setFormData] = React.useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const fetchAuditLogs = async () => {
        setIsAuditLoading(true)
        try {
            const logs = await auditApi.getAll()
            setAuditLogs(logs || [])
        } catch (err) {
            console.error("Failed to fetch logs", err)
        } finally {
            setIsAuditLoading(false)
        }
    }

    React.useEffect(() => {
        if (user?.role === 'ADMIN' && activeTab === 'audit') {
            fetchAuditLogs()
        }
    }, [user, activeTab])

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
            <div className="max-w-4xl mx-auto space-y-8 py-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h2>
                        <p className="text-slate-500">Manage your profile, security credentials, and preferences.</p>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                                ${activeTab === 'password'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }
                            `}
                        >
                            <KeyRound size={16} />
                            Password Reset
                        </button>
                        
                        {user?.role === 'ADMIN' && (
                            <button
                                onClick={() => setActiveTab('audit')}
                                className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                                    ${activeTab === 'audit'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }
                                `}
                            >
                                <History size={16} />
                                Audit Trail
                            </button>
                        )}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="pt-4">
                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <div className="max-w-md">
                            <Card className="h-fit shadow-md border-slate-100">
                                <form onSubmit={handleSubmit}>
                                    <CardHeader className="flex flex-row items-center gap-4 border-b border-slate-100 bg-slate-50/50 pb-6 rounded-t-xl">
                                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                                            <KeyRound className="w-5 h-5 text-slate-700" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">Password Reset</CardTitle>
                                            <CardDescription className="text-xs">Update your credentials to stay secure.</CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-6">
                                        {message.text && (
                                            <div className={`p-3 rounded-lg text-[11px] font-bold ${message.type === 'success' ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'}`}>
                                                {message.text}
                                            </div>
                                        )}

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Password</label>
                                            <Input
                                                type="password"
                                                name="oldPassword"
                                                required
                                                className="h-10 text-sm"
                                                value={formData.oldPassword}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
                                            <Input
                                                type="password"
                                                name="newPassword"
                                                required
                                                className="h-10 text-sm"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm New</label>
                                            <Input
                                                type="password"
                                                name="confirmPassword"
                                                required
                                                className="h-10 text-sm"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-2 pb-6">
                                        <Button type="submit" className="w-full h-11 font-bold" disabled={isLoading || !formData.oldPassword || !formData.newPassword}>
                                            {isLoading ? "Encrypting..." : "Update Password"}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </div>
                    )}

                    {/* Audit Trail Tab */}
                    {activeTab === 'audit' && user?.role === 'ADMIN' && (
                        <Card className="border-slate-100 shadow-xl rounded-3xl overflow-hidden min-h-[500px]">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                                        <History size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-black text-slate-800">Clinical Audit Trail</CardTitle>
                                        <CardDescription className="text-xs">Immutable log of clinical and dispensing actions.</CardDescription>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={fetchAuditLogs} className="h-8 text-[10px] font-bold uppercase gap-2 bg-white">
                                    <Activity className={`w-3 h-3 ${isAuditLoading ? 'animate-spin' : ''}`} />
                                    Live Sync
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                                {isAuditLoading ? (
                                    <p className="text-center py-20 text-slate-400 italic text-sm">Accessing encrypted archives...</p>
                                ) : auditLogs.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-50/20">
                                        <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                        <p className="text-slate-400 text-xs italic font-medium">No activity logged yet.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {auditLogs.map((log) => (
                                            <div key={log.id} className="p-4 hover:bg-slate-50/80 transition-colors flex gap-4">
                                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                    log.action?.includes('CREATE') ? 'bg-emerald-100 text-emerald-600' : 
                                                    log.action?.includes('UPDATE') ? 'bg-blue-100 text-blue-600' :
                                                    'bg-amber-100 text-amber-600'
                                                }`}>
                                                    <Activity size={16} />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-xs font-black text-slate-800 truncate mr-2">{log.action}</p>
                                                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                            <Clock size={10} />
                                                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 font-medium">{log.details}</p>
                                                    <div className="flex items-center gap-4 pt-1">
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                                            <User size={10} />
                                                            {log.user?.username || 'System'}
                                                        </div>
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                                                            ID: {log.resourceType} #{log.resourceId}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
