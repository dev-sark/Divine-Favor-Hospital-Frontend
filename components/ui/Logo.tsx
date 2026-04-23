import * as React from "react"

export function Logo({ className }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 ${className || ""}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
            </div>
            <div className="flex flex-col leading-none">
                <span className="text-xl font-bold tracking-tight text-slate-900">Divine Favour</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Hospital</span>
            </div>
        </div>
    )
}
