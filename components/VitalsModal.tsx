"use client"

import * as React from "react"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/Card"

interface VitalsModalProps {
    patient: any;
    isOpen: boolean;
    onClose: () => void;
    onSave: (vitals: any) => Promise<void>;
}

export function VitalsModal({ patient, isOpen, onClose, onSave }: VitalsModalProps) {
    const [temperature, setTemperature] = React.useState("37.0")
    const [bloodPressure, setBloodPressure] = React.useState("120/80")
    const [weight, setWeight] = React.useState("70.0")
    const [priority, setPriority] = React.useState("NORMAL")
    const [urgencyReason, setUrgencyReason] = React.useState("")
    const [isSaving, setIsSaving] = React.useState(false)

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await onSave({
                temperature,
                bloodPressure,
                weight: parseFloat(weight),
                priority,
                urgencyReason,
                status: "WAITING_FOR_DOCTOR"
            })
            onClose()
        } catch (err) {
            console.error(err)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <CardHeader>
                    <CardTitle>Record Patient Vitals</CardTitle>
                    <CardDescription>
                        Logging vitals for <span className="font-bold text-slate-900">{patient.fullName}</span>
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Temperature (°C)</label>
                            <Input 
                                type="text" 
                                value={temperature} 
                                onChange={(e) => setTemperature(e.target.value)} 
                                placeholder="e.g. 37.5"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Blood Pressure (mmHg)</label>
                            <Input 
                                type="text" 
                                value={bloodPressure} 
                                onChange={(e) => setBloodPressure(e.target.value)} 
                                placeholder="e.g. 120/80"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Weight (kg)</label>
                            <Input 
                                type="number" 
                                step="0.1"
                                value={weight} 
                                onChange={(e) => setWeight(e.target.value)} 
                                placeholder="e.g. 70.5"
                                required
                            />
                        </div>

                        <div className="pt-2 border-t border-slate-100 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Encounter Priority</label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                >
                                    <option value="NORMAL">Normal Routine</option>
                                    <option value="EMERGENCY">Emergency (Urgent)</option>
                                    <option value="CRITICAL">Critical (Immediate Attention)</option>
                                </select>
                            </div>

                            {(priority === 'EMERGENCY' || priority === 'CRITICAL') && (
                                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                                    <label className="text-xs font-bold text-red-500 uppercase">Urgency Reason / Notes</label>
                                    <textarea 
                                        className="flex min-h-[60px] w-full rounded-md border border-red-100 bg-red-50/20 px-3 py-2 text-sm focus:ring-1 focus:ring-red-500 outline-none"
                                        value={urgencyReason}
                                        onChange={(e) => setUrgencyReason(e.target.value)}
                                        placeholder="Briefly describe the emergency condition..."
                                        required
                                    />
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-3 pt-2">
                        <Button type="button" variant="ghost" className="flex-1" onClick={onClose} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isSaving}>
                            {isSaving ? "Saving..." : "Check-in Patient"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
