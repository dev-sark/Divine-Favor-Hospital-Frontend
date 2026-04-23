"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

type Role = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST' | 'LAB_TECH' | 'PHARMACIST' | 'CASHIER' | null

interface User {
    name: string
    role: Role
    token: string
}

interface AuthContextType {
    user: User | null
    login: (name: string, roles: string[], token: string) => void
    logout: () => void
    isLoading: boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const router = useRouter()

    React.useEffect(() => {
        // Check for stored session
        const storedUser = localStorage.getItem('hms_user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        setIsLoading(false)
    }, [])

    const login = (name: string, roles: string[], token: string) => {
        // Map Spring Security ROLE_X to internal Role type
        let userRole: Role = 'DOCTOR'
        if (roles.includes('ROLE_ADMIN')) userRole = 'ADMIN'
        else if (roles.includes('ROLE_RECEPTIONIST')) userRole = 'RECEPTIONIST'
        else if (roles.includes('ROLE_NURSE')) userRole = 'NURSE'
        else if (roles.includes('ROLE_LAB_TECH')) userRole = 'LAB_TECH'
        else if (roles.includes('ROLE_PHARMACIST')) userRole = 'PHARMACIST'
        else if (roles.includes('ROLE_CASHIER')) userRole = 'CASHIER'

        const newUser = { name, role: userRole, token }
        setUser(newUser)
        localStorage.setItem('hms_user', JSON.stringify(newUser))
        localStorage.setItem('token', token)
        router.push('/dashboard')
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('hms_user')
        localStorage.removeItem('token')
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = React.useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
