import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Deranged Story Generator",
  description: "Create unique and imaginative stories with AI",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#4F46E5",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gradient-to-b from-indigo-50 to-white`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </body>
    </html>
  )
}