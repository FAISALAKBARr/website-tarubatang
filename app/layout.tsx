import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Desa Tarubatang - Wisata Alam Gunung Merbabu",
  description:
    "Destinasi wisata alam terbaik di kaki Gunung Merbabu, Boyolali. Jelajahi keindahan air terjun, jalur pendakian, dan camping ground dengan pemandangan spektakuler.",
  keywords: "Tarubatang, Boyolali, Gunung Merbabu, wisata alam, pendakian, camping, air terjun",

}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" /> 
      </head>
      <body>
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            {children}
            <Footer/> 
          </ThemeProvider>
      </body>
    </html>
  )
}
