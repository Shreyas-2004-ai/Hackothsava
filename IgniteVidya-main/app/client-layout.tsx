"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Navigation from "@/components/navigation"
import TerminalChat from "@/components/terminal-chat"
import ApnaParivCompanion from "@/components/afzal-chat"
import SplashScreen from "@/components/splash-screen"
import AudioManager from "@/components/audio-manager"
import { useState, useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showSplash, setShowSplash] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [isApnaParivCompanionOpen, setIsApnaParivCompanionOpen] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleTerminalOpen = () => {
    setIsApnaParivCompanionOpen(false)
    setIsTerminalOpen(true)
  }

  const handleApnaParivCompanionOpen = () => {
    setIsTerminalOpen(false)
    setIsApnaParivCompanionOpen(true)
  }

  const handleSplashComplete = () => {
    setShowSplash(false)
    // Enable audio after splash screen with a small delay
    setTimeout(() => {
      setAudioEnabled(true)
    }, 500)
  }

  if (!mounted) {
    return <div className="min-h-screen bg-black" />
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <>
          <Navigation />
          <main>{children}</main>
          <TerminalChat isApnaParivCompanionOpen={isApnaParivCompanionOpen} onOpen={handleTerminalOpen} />
          <ApnaParivCompanion isTerminalOpen={isTerminalOpen} onOpen={handleApnaParivCompanionOpen} />
          <Toaster />
          {/* Audio Manager - starts after splash screen */}
          {audioEnabled && (
            <AudioManager 
              autoPlay={true} 
              showControls={true}
            />
          )}
        </>
      )}
    </ThemeProvider>
  )
}
