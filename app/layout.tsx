import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthContext";

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
      <body className="antialiased" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
