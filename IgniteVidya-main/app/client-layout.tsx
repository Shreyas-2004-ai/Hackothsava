"use client";

import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import Navigation from "@/components/navigation";
import TerminalChat from "@/components/terminal-chat";
import ApnaParivCompanion from "@/components/afzal-chat";
import AudioManager from "@/components/audio-manager";
import FloatingChatWidget from "@/components/floating-chat-widget";
import { AuthProvider } from "@/contexts/AuthContext";
import { FamilyProvider } from "@/contexts/FamilyContext";
import { useState, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isApnaParivCompanionOpen, setIsApnaParivCompanionOpen] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTerminalOpen = () => {
    setIsApnaParivCompanionOpen(false);
    setIsTerminalOpen(true);
  };

  const handleApnaParivCompanionOpen = () => {
    setIsTerminalOpen(false);
    setIsApnaParivCompanionOpen(true);
  };

  if (!mounted) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <AuthProvider>
      <FamilyProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navigation />
          <main>{children}</main>
          <TerminalChat
            isApnaParivCompanionOpen={isApnaParivCompanionOpen}
            onOpen={handleTerminalOpen}
          />
          <ApnaParivCompanion
            isTerminalOpen={isTerminalOpen}
            onOpen={handleApnaParivCompanionOpen}
          />
          <FloatingChatWidget />
          <Toaster />
          <SonnerToaster />
          <AudioManager autoPlay={true} showControls={true} />
        </ThemeProvider>
      </FamilyProvider>
    </AuthProvider>
  );
}
