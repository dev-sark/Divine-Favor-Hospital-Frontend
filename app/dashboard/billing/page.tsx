"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { billingApi } from "@/lib/api"
import { Banknote, Search, CreditCard, Receipt, Clock, User, CheckCircle2, ShieldCheck } from "lucide-react"
import { useToast } from "@/providers/ToastContext"

export default function BillingPage() {
    const [unpaidBills, setUnpaidBills] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [selectedBill, setSelectedBill] = React.useState<any>(null)
    const [isProcessing, setIsProcessing] = React.useState(false)
    const { success, error } = useToast()

    const fetchUnpaid = async () => {
        setIsLoading(true)
        try {
            const data = await billingApi.getUnpaid()
            setUnpaidBills(data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchUnpaid()
    }, [])

    const handleProcessPayment = async () => {
        if (!selectedBill) return
        setIsProcessing(true)
        try {
            await billingApi.payBill(selectedBill.id)
            // Update local state instead of clearing, so receipt stays visible for printing
            setSelectedBill({ ...selectedBill, status: 'PAID', paidAt: new Date().toISOString() })
            fetchUnpaid()
            success("Payment successful! Official receipt generated.", "Accounts Cleared")
        } catch (err) {
            error("Failed to process payment", "Transaction Error")
        } finally {
            setIsProcessing(false)
        }
    }

    const filtered = unpaidBills.filter(b => 
        b.patient?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.patient?.folderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Accounts & Billing</h2>
                        <p className="text-slate-500 mt-1">Manage patient invoices and process payments.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-xl text-green-700 font-bold text-sm">
                            <Banknote className="w-4 h-4" /> Unpaid Items: {unpaidBills.length}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Unpaid Bills List */}
                    <Card className="lg:col-span-2 print:hidden">
                        <CardHeader className="border-b border-slate-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search bills by patient name or folder..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="p-12 text-center text-slate-400 italic font-medium">Fetching bills...</div>
                            ) : filtered.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Receipt className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 font-bold">No unpaid bills found.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {filtered.map(bill => (
                                        <div 
                                            key={bill.id}
                                            onClick={() => setSelectedBill(bill)}
                                            className={`p-5 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between group ${selectedBill?.id === bill.id ? 'bg-primary/5 active-bill' : ''}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center text-primary shadow-sm">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">GH₵</span>
                                                    <span className="font-black text-sm">{Math.floor(bill.totalAmount)}</span>
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900">{bill.patient?.fullName}</p>
                                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{bill.patient?.folderNumber}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-primary">GH₵ {bill.totalAmount.toFixed(2)}</p>
                                                <div className="flex items-center gap-1.5 justify-end mt-1">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Awaiting Payment</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Receipt / Processor */}
                    <div className="space-y-6 print:col-span-3 print:max-w-2xl print:mx-auto print:w-full">
                        {selectedBill ? (
                            <div className="space-y-6">
                                <Card className="border-primary/20 shadow-xl shadow-primary/5 sticky top-6 overflow-hidden print:shadow-none print:border-none print:static">
                                    {/* Header / Receipt Branding */}
                                    <div className="bg-primary p-6 text-white text-center print:bg-white print:text-slate-900 print:text-left print:p-0 print:mb-8">
                                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm print:hidden">
                                            <CreditCard className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="hidden print:block mb-4">
                                            <h1 className="text-2xl font-black uppercase tracking-tighter ring-2 ring-slate-900 px-3 inline-block">DIVINE FAVOR HOSPITAL</h1>
                                            <p className="text-[10px] font-bold mt-1">Official Medical Revenue Receipt</p>
                                        </div>
                                        <p className="text-xs font-black opacity-80 uppercase tracking-widest">
                                            {selectedBill.status === 'PAID' ? 'Total Amount Paid' : 'Grand Total Due'}
                                        </p>
                                        <h3 className="text-4xl font-black mt-1">GH₵ {selectedBill.totalAmount.toFixed(2)}</h3>
                                        {selectedBill.status === 'PAID' && (
                                            <div className="mt-2 bg-white/20 inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest animate-bounce">
                                                Transaction Settled & Cleared
                                            </div>
                                        )}
                                    </div>

                                    <CardContent className="p-6 space-y-6 print:p-0">
                                        <div className="grid grid-cols-2 gap-4 print:grid-cols-2">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Encounter</p>
                                                <p className="text-sm font-black text-slate-900">{selectedBill.patient?.fullName}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{selectedBill.patient?.folderNumber}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Receipt Number</p>
                                                <p className="text-xs font-mono font-bold text-slate-700">#INV-2026-{selectedBill.id}</p>
                                                <p className="text-[10px] font-bold text-slate-500">
                                                    {selectedBill.status === 'PAID' 
                                                        ? `Paid on: ${new Date(selectedBill.paidAt).toLocaleDateString()}` 
                                                        : `Issued: ${new Date(selectedBill.createdAt).toLocaleDateString()}`}
                                                </p>
                                            </div>
                                        </div>

                                        {/* INSURANCE SECTION */}
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Insurance / Claim Number</label>
                                                <div className="h-4 w-4 rounded-full bg-indigo-100 flex items-center justify-center">
                                                    <ShieldCheck className="w-2.5 h-2.5 text-indigo-600" />
                                                </div>
                                            </div>
                                            <input 
                                                type="text"
                                                placeholder="None / Private Cash"
                                                className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-black text-indigo-600 placeholder:text-slate-300"
                                                value={selectedBill.insuranceNumber || ""}
                                                onChange={(e) => setSelectedBill({...selectedBill, insuranceNumber: e.target.value})}
                                            />
                                        </div>

                                        {/* ITEMIZED ITEM SERVICES */}
                                        <div className="space-y-3 pt-2 border-t border-slate-100 print:border-slate-900 print:border-t-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Itemized Service Charges</p>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="font-bold text-slate-600">Consultation Services</span>
                                                    <span className="font-black text-slate-900">GH₵ {(selectedBill.consultationFee || 0).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="font-bold text-slate-600">Laboratory & Radiology</span>
                                                    <span className="font-black text-slate-900">GH₵ {(selectedBill.labFee || 0).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="font-bold text-slate-600">Pharmacy & Medications</span>
                                                    <span className="font-black text-slate-900">GH₵ {(selectedBill.pharmacyFee || 0).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 flex flex-col gap-3 print:hidden">
                                            <button
                                                onClick={handleProcessPayment}
                                                disabled={isProcessing || selectedBill.status === 'PAID'}
                                                className={`w-full py-4 rounded-2xl font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                                                    selectedBill.status === 'PAID' 
                                                    ? 'bg-emerald-500 text-white shadow-emerald-100 cursor-default' 
                                                    : 'bg-primary text-white shadow-primary/30 hover:scale-[1.02] active:scale-95'
                                                }`}
                                            >
                                                {isProcessing ? "Recording Payment..." : selectedBill.status === 'PAID' ? "PAYMENT COLLECTED ✅" : "Mark as PAID & Settle"}
                                            </button>
                                            <button
                                                onClick={() => window.print()}
                                                className="w-full py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                                            >
                                                <Receipt className="w-4 h-4" /> Print Itemized Receipt
                                            </button>
                                        </div>

                                        <div className="hidden print:block text-[10px] text-center text-slate-400 mt-20 border-t border-slate-200 pt-4 italic">
                                            This is a computerized medical invoice. Digital signature of Divine Favor Hospital Admin.
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <Receipt className="w-12 h-12 text-slate-300 mb-4" />
                                <p className="text-slate-500 font-bold">Select a bill to process payment.</p>
                            </div>
                        )}
                    </div>
                </div>
                {/* Print Styling Injection */}
                <style jsx global>{`
                    @media print {
                        body { background: white !important; }
                        .active-bill { background: transparent !important; }
                        @page { margin: 1cm; }
                    }
                `}</style>
            </div>
        </DashboardLayout>
    )
}
