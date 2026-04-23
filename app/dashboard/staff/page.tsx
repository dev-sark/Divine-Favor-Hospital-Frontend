"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { usersApi } from "@/lib/api"
import { ShieldCheck, UserX, UserPlus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/Input"

import { useAuth } from "@/providers/AuthContext"

export default function StaffManagementPage() {
    const { user } = useAuth()
    const [staff, setStaff] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [isAddingStaff, setIsAddingStaff] = React.useState(false)
    const [newStaff, setNewStaff] = React.useState({ username: '', password: '', role: 'DOCTOR' })
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const router = useRouter()

    const fetchStaff = async () => {
        setIsLoading(true)
        try {
            // Role Guard: double verification on frontend (backend also verifies)
            if (user && user.role !== 'ADMIN') {
                router.push("/dashboard")
                return
            }
            const data = await usersApi.getAllUsers()
            setStaff(data || [])
        } catch (err: any) {
            console.error("Failed to fetch staff", err)
            if (err.message && err.message.includes("403")) {
                alert("Unauthorized. Only ADMIN can manage staff.")
                router.push("/dashboard")
            }
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchStaff()
    }, [])

    const handleApprove = async (id: number) => {
        try {
            await usersApi.approveUser(id)
            alert("Staff approved successfully.")
            fetchStaff()
        } catch (err) {
            alert("Failed to approve staff.")
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this staff member?")) return
        try {
            await usersApi.deleteUser(id)
            alert("Staff deleted.")
            fetchStaff()
        } catch (err) {
            alert("Failed to delete staff.")
        }
    }

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await usersApi.createStaff(newStaff)
            alert("Staff registration submitted! Please click 'Approve' below to activate their account.")
            setNewStaff({ username: '', password: '', role: 'DOCTOR' })
            setIsAddingStaff(false)
            fetchStaff()
        } catch (err: any) {
            alert(err.message || "Failed to create staff member.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 flex flex-col">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Management</h2>
                        <p className="text-sm text-slate-500">Approve new staff registrations or revoke access.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant={isAddingStaff ? "outline" : "primary"}
                            onClick={() => setIsAddingStaff(!isAddingStaff)}
                            className="flex gap-1"
                        >
                            {isAddingStaff ? <><X className="w-4 h-4" /> Cancel</> : <><UserPlus className="w-4 h-4" /> Add Staff</>}
                        </Button>
                        <Button size="sm" variant="outline" onClick={fetchStaff} disabled={isLoading}>
                            {isLoading ? "Loading..." : "Refresh Staff"}
                        </Button>
                    </div>
                </div>

                {isAddingStaff && (
                    <Card className="border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-4 duration-300">
                        <CardHeader>
                            <CardTitle className="text-lg">Create New Staff Member</CardTitle>
                            <CardDescription>This account will be pre-approved and active immediately.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <Input
                                    label="Username"
                                    placeholder="e.g. j.doe"
                                    value={newStaff.username}
                                    onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={newStaff.password}
                                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                    required
                                />
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">System Role</label>
                                    <select
                                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                        value={newStaff.role}
                                        onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                                    >
                                        <option value="DOCTOR">Doctor</option>
                                        <option value="NURSE">Nurse</option>
                                        <option value="RECEPTIONIST">Receptionist</option>
                                        <option value="ADMIN">Administrator</option>
                                    </select>
                                </div>
                                <Button type="submit" disabled={isSubmitting} className="h-11">
                                    {isSubmitting ? "Creating..." : "Create Account"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Registered Staff Directory</CardTitle>
                        <CardDescription>Accounts pending approval cannot access the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400 font-medium">
                                        <th className="pb-3 pl-2">Username</th>
                                        <th className="pb-3">Role</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3 text-right pr-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {staff.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-slate-400 italic">No staff found.</td>
                                        </tr>
                                    ) : (
                                        staff.map((user) => (
                                            <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 pl-2 font-bold text-slate-900">{user.username}</td>
                                                <td className="py-4 font-mono text-[10px] uppercase font-bold text-slate-500">
                                                    {user.role}
                                                </td>
                                                <td className="py-4">
                                                    {user.approval ? (
                                                        <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 mx-0 flex items-center justify-center w-24">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 flex items-center justify-center w-24">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 text-right pr-2 flex justify-end gap-2">
                                                    {!user.approval && (
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            onClick={() => handleApprove(user.id)}
                                                            className="flex gap-1"
                                                        >
                                                            <ShieldCheck className="w-4 h-4" /> Approve
                                                        </Button>
                                                    )}
                                                    {user.role !== 'ADMIN' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDelete(user.id)}
                                                            className="flex gap-1 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            <UserX className="w-4 h-4" /> Delete
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
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
