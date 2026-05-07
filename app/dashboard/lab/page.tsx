"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { labApi } from "@/lib/api"
import { FlaskConical, Search, CheckCircle, Clock, FileText, User, Calendar } from "lucide-react"

export default function LaboratoryPage() {
    const [pendingOrders, setPendingOrders] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [selectedOrder, setSelectedOrder] = React.useState<any>(null)
    const [results, setResults] = React.useState("")
    const [isSaving, setIsSaving] = React.useState(false)

    const fetchPending = async () => {
        setIsLoading(true)
        try {
            const data = await labApi.getPending()
            setPendingOrders(data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchPending()
    }, [])

    const handleSaveResults = async () => {
        if (!selectedOrder || !results.trim()) return
        setIsSaving(true)
        try {
            await labApi.recordResults(selectedOrder.id, results)
            setSelectedOrder(null)
            setResults("")
            fetchPending()
        } catch (err) {
            alert("Failed to save results")
        } finally {
            setIsSaving(false)
        }
    }

    const filtered = pendingOrders.filter(o => 
        o.patient?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.patient?.folderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Laboratory Dashboard</h2>
                        <p className="text-slate-500 mt-1">Manage pending lab requests and record results.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-xl text-amber-700 font-bold text-sm">
                            <Clock className="w-4 h-4" /> {pendingOrders.length} Pending
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Orders List */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="border-b border-slate-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by patient name or folder number..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="p-12 text-center text-slate-400 italic">Searching for orders...</div>
                            ) : filtered.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FlaskConical className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No pending requests found.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {filtered.map(order => (
                                        <div 
                                            key={order.id}
                                            onClick={() => setSelectedOrder(order)}
                                            className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group ${selectedOrder?.id === order.id ? 'bg-primary/5' : ''}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-primary font-bold">
                                                    {order.patient?.fullName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{order.patient?.fullName}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{order.patient?.folderNumber} · {order.category}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-slate-700">{order.testNames}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Requested by {order.doctor?.username}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Result Entry Form */}
                    <div className="space-y-6">
                        {selectedOrder ? (
                            <Card className="border-primary/20 shadow-lg shadow-primary/5 sticky top-6">
                                <CardHeader className="bg-primary/5 border-b border-primary/10">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-primary" />
                                        <CardTitle className="text-lg">Record Results</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="bg-slate-50 p-3 rounded-xl space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <User className="w-3.5 h-3.5" /> PATIENT DETAILS
                                        </div>
                                        <p className="font-black text-slate-900">{selectedOrder.patient?.fullName}</p>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 pt-2 border-t border-slate-200">
                                            <FlaskConical className="w-3.5 h-3.5" /> TESTS REQUESTED
                                        </div>
                                        <p className="text-sm text-slate-700 font-bold">{selectedOrder.testNames}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Findings & Results</label>
                                        <textarea
                                            rows={6}
                                            className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                                            placeholder="Enter test findings here..."
                                            value={results}
                                            onChange={(e) => setResults(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        onClick={handleSaveResults}
                                        disabled={isSaving || !results.trim()}
                                        className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:translate-y-0"
                                    >
                                        {isSaving ? "Finalizing..." : "Complete & Finalize Result"}
                                    </button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <FlaskConical className="w-12 h-12 text-slate-300 mb-4" />
                                <p className="text-slate-500 font-bold">Select a request from the list to record results.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
