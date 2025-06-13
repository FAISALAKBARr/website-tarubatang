import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Desa Tarubatang - Wisata Alam Gunung Merbabu",
  description:
    "Destinasi wisata alam terbaik di kaki Gunung Merbabu, Boyolali. Jelajahi keindahan air terjun, jalur pendakian, dan camping ground dengan pemandangan spektakuler.",
  keywords: "Tarubatang, Boyolali, Gunung Merbabu, wisata alam, pendakian, camping, air terjun",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
