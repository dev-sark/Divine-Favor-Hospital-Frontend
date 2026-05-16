"use client"

import Link from "next/link"
import { Logo } from "@/components/ui/Logo"
import { useTheme } from "@/providers/ThemeContext"
import { Sun, Moon } from "lucide-react"

export default function HomePage() {
  const { theme, toggleTheme } = useTheme()
  const isDarkMode = theme === 'dark'

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600 dark:text-slate-400">
            <Link href="#services" className="hover:text-primary transition-colors">Services</Link>
            <Link href="#about" className="hover:text-primary transition-colors">About Us</Link>
            <Link href="#contact" className="hover:text-primary transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-24 pb-32">
          {/* Subtle Background Gradients */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-3xl -translate-x-1/3 translate-y-1/3" />
          </div>

          <div className="container relative z-10 mx-auto px-4 text-center">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary mb-8">
              Zero Paperwork Hospital System
            </div>
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-7xl">
              Premium Clinical Care, <br />
              <span className="text-primary">Digitally Enhanced.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400 sm:text-xl leading-relaxed">
              Divine Favour Hospital leads the way in healthcare innovation. Experience seamless service from reception to recovery, powered by our next-generation Hospital Management System.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-base font-semibold text-white shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                Access Staff Portal
              </Link>
              <Link
                href="#services"
                className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 text-base font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-24 bg-card dark:bg-slate-900/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Comprehensive Healthcare Services</h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Delivering excellence across every medical specialty.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { title: 'General Consultation', desc: 'Expert medical advice and primary care from our experienced physicians.' },
                { title: 'Advanced Diagnostics', desc: 'State-of-the-art laboratory and radiology services for precise results.' },
                { title: 'Emergency Care', desc: '24/7 emergency response with a dedicated triage and trauma team.' },
                { title: 'Surgical Operations', desc: 'Modern surgical theaters equipped for minimally invasive procedures.' },
                { title: 'Pharmacy Services', desc: 'Fully stocked digital pharmacy attached directly to your prescriptions.' },
                { title: 'Maternity Care', desc: 'Comprehensive antenatal, delivery, and postnatal support.' },
              ].map((service, i) => (
                <div key={i} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 hover:shadow-lg dark:hover:shadow-primary/5 transition-shadow">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{service.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
        <div className="container mx-auto px-4 text-center">
          <Logo className="justify-center mb-6" />
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
            Providing exceptional healthcare through technology and compassion. The zero-paperwork hospital of the future.
          </p>
          <div className="text-sm font-medium text-slate-400 dark:text-slate-600">
            &copy; {new Date().getFullYear()} Divine Favour Hospital. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
