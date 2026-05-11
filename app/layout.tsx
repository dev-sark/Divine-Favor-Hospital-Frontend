import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthContext";
import { ThemeProvider } from "@/providers/ThemeContext";
import { ToastProvider } from "@/providers/ToastContext";

export const metadata: Metadata = {
  title: "Divine Favour Hospital - Zero Paperwork System",
  description: "Next-generation Hospital Management System for premium clinical care.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
