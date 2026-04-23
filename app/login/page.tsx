"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Logo } from "@/components/ui/Logo"
import { useAuth } from "@/providers/AuthContext"
import { authApi } from "@/lib/api"
import Link from "next/link"

export default function LoginPage() {
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState("")
    const [username, setUsername] = React.useState("")
    const [password, setPassword] = React.useState("")
    const { login } = useAuth()

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const response = await authApi.login({ username, password })
            login(response.username, response.roles, response.token)
        } catch (err: any) {
            setError(err.message || "Invalid credentials. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Link href="/" className="absolute top-8 left-8 text-sm font-semibold text-primary hover:underline flex items-center gap-2">
                &larr; Back to Home
            </Link>
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-3xl" />
            </div>

            <Card className="z-10 w-full max-w-md border-none shadow-xl ring-1 ring-slate-200">
                <CardHeader className="space-y-4 pb-8 text-center">
                    <div className="flex justify-center">
                        <Logo />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold text-slate-900">Sign in to HMS</CardTitle>
                        <CardDescription className="text-slate-500">
                            Enter your credentials to access the portal.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-xs font-bold text-red-600 bg-red-50 rounded-xl border border-red-100 animate-in fade-in zoom-in duration-300">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Username"
                            placeholder="e.g. nurse_mary"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isLoading}
                        />
                        <Input
                            label="Password"
                            placeholder="••••••••"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                        <Button className="w-full mt-2" type="submit" disabled={isLoading}>
                            {isLoading ? "Authenticating..." : "Sign In to Portal"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 border-t border-slate-100 bg-slate-50/50 p-6 rounded-b-2xl">
                    <p className="text-xs text-center text-slate-500 font-medium">
                        Managed by Divine Favour IT Support
                    </p>
                    <div className="text-[10px] text-center font-bold uppercase tracking-wider text-slate-400">
                        Secure Role-Based Access Gate
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
