import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AIAssistant from "@/components/AIAssistant";


export const metadata: Metadata = {
  title: "EazyPrepAI - AI-Powered UPSC Preparation Platform",
  description: "Your complete AI-driven companion for UPSC success. Get personalized study planning, smart analytics, AI mentorship, and more.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased bg-[var(--background)]">
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 mr-80 p-8">
              {children}
            </main>
            <AIAssistant />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
