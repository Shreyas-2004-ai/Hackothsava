import type React from "react"
import type { Metadata } from "next"
import { Inter, Press_Start_2P } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"

const inter = Inter({ subsets: ["latin"] })
const pressStart2P = Press_Start_2P({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-press-start'
})

export const metadata: Metadata = {
  title: "IgniteVidya - STEM Learning Platform",
  description: "Family connections for all. Interactive family tree management with secure authentication, multi-generational mapping, and personalized relationship tracking.",
  generator: 'IgniteVidya',
  keywords: ['STEM', 'Education', 'Learning', 'Science', 'Technology', 'Engineering', 'Mathematics', 'Students', 'Grades 6-12'],
  authors: [{ name: 'IgniteVidya Team' }],
  openGraph: {
    title: 'IgniteVidya - STEM Learning Platform',
    description: 'Family connections for all. Interactive family tree management with secure authentication, multi-generational mapping, and personalized relationship tracking.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${pressStart2P.variable}`} suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
