"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { servicesApi } from "@/lib/api"
import { Tag, Plus, Trash2, Save, IndianRupee, Banknote, Stethoscope, FlaskConical, Layout } from "lucide-react"

export default function PricingPage() {
    const [services, setServices] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSaving, setIsSaving] = React.useState(false)

    // Form State
    const [name, setName] = React.useState("")
    const [category, setCategory] = React.useState("CONSULTATION")
    const [price, setPrice] = React.useState("")

    const fetchServices = async () => {
        setIsLoading(true)
        try {
            const data = await servicesApi.getAll()
            setServices(data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchServices()
    }, [])

    const handleAddService = async () => {
        if (!name || !price) return
        setIsSaving(true)
        try {
            await servicesApi.save({ name, category, price: parseFloat(price) })
            setName("")
            setPrice("")
            fetchServices()
        } catch (err) {
            alert("Failed to save service")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this service?")) return
        try {
            await servicesApi.delete(id)
            fetchServices()
        } catch (err) {
            alert("Failed to delete")
        }
    }

    const [editingId, setEditingId] = React.useState<number | null>(null)
    const [editPrice, setEditPrice] = React.useState("")

    const handleUpdatePrice = async (service: any) => {
        setIsSaving(true)
        try {
            await servicesApi.save({ ...service, price: parseFloat(editPrice) })
            setEditingId(null)
            fetchServices()
        } catch (err) {
            alert("Update failed")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Hospital Revenue Control</h2>
                    <p className="text-slate-500 font-medium mt-1">Configure service rates and billing categories for the facility.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Entry Form */}
                    <Card className="lg:col-span-1 border-2 border-indigo-100 shadow-xl shadow-indigo-100/20 rounded-[35px] overflow-hidden self-start sticky top-6">
                        <CardHeader className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-8">
                            <div className="flex items-center gap-3">
                                <Plus className="w-6 h-6" />
                                <CardTitle className="text-xl font-black">Add New Service</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Name</label>
                                <input 
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-bold"
                                    placeholder="e.g. Specialist Consultation"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                                <select 
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-bold"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="CONSULTATION">Consultation</option>
                                    <option value="LAB">Laboratory</option>
                                    <option value="RADIOLOGY">Radiology</option>
                                    <option value="OTHER">Other Procedures</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default Price (GHS)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">GH₵</span>
                                    <input 
                                        type="number"
                                        className="w-full p-4 pl-12 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-black"
                                        placeholder="0.00"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleAddService}
                                disabled={isSaving || !name || !price}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save to Price List
                            </button>
                        </CardContent>
                    </Card>

                    {/* Price List Table */}
                    <Card className="lg:col-span-2 border-slate-100 shadow-sm rounded-[35px] overflow-hidden min-h-[600px]">
                        <CardHeader className="bg-white border-b border-slate-100 p-8 flex flex-row justify-between items-center">
                            <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-3">
                                <Banknote className="text-indigo-600" />
                                Current Active Rates
                            </CardTitle>
                            <div className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-700 font-bold text-xs">
                                {services.length} Services Listed
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="p-20 text-center text-slate-300 italic font-medium">Fetching price list...</div>
                            ) : services.length === 0 ? (
                                <div className="p-20 text-center space-y-4">
                                    <Layout className="w-16 h-16 text-slate-100 mx-auto" />
                                    <p className="text-slate-400 font-bold">Your price list is empty.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {services.map((s) => (
                                        <div key={s.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                                                    s.category === 'CONSULTATION' ? 'bg-blue-50 text-blue-600' :
                                                    s.category === 'LAB' ? 'bg-purple-50 text-purple-600' :
                                                    s.category === 'RADIOLOGY' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
                                                }`}>
                                                    {s.category === 'CONSULTATION' ? <Stethoscope /> : s.category === 'LAB' ? <FlaskConical /> : <Tag />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 border-b-2 border-transparent group-hover:border-indigo-100 transition-all">{s.name}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.category}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                {editingId === s.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="number" 
                                                            className="w-24 p-2 bg-white border border-indigo-200 rounded-lg text-sm font-black outline-none"
                                                            value={editPrice}
                                                            onChange={(e) => setEditPrice(e.target.value)}
                                                        />
                                                        <button 
                                                            onClick={() => handleUpdatePrice(s)}
                                                            className="p-2 bg-emerald-500 text-white rounded-lg"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <p className="text-xl font-black text-slate-900 tracking-tight">GH₵ {s.price.toFixed(2)}</p>
                                                )}
                                                
                                                <div className="flex items-center gap-1">
                                                    <button 
                                                        onClick={() => { setEditingId(s.id); setEditPrice(s.price.toString()); }}
                                                        className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    >
                                                        <Layout className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(s.id)}
                                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
