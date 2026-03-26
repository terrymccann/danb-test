import type { Metadata } from "next"
import { Open_Sans } from "next/font/google"
import { Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/layout/Navbar"
import { cn } from "@/lib/utils"

const fontSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "DANB CDA Practice Exam",
  description:
    "Practice exams for the DANB Certified Dental Assistant (CDA) certification — GC, RHS, and ICE components.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        fontSans.variable
      )}
    >
      <body>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <Navbar />
            <div className="pt-14">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
