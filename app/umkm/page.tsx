"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Phone, MapPin, Search, Filter, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function UMKMPage() {
  const [umkmData, setUmkmData] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Semua")
  const [filteredUMKM, setFilteredUMKM] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)

  // Fetch UMKM data from API
  useEffect(() => {
    fetch("/api/produk")
      .then((res) => res.json())
      .then((data) => setUmkmData(data.umkm || []))
  }, [])

  // Set user if logged in
  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  // Filter UMKM
  useEffect(() => {
    let filtered = umkmData

    if (searchTerm) {
      filtered = filtered.filter(
        (umkm) =>
          umkm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          umkm.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "Semua") {
      filtered = filtered.filter((umkm) => umkm.category === selectedCategory)
    }

    setFilteredUMKM(filtered)
  }, [searchTerm, selectedCategory, umkmData])

  const categories = ["Semua", ...Array.from(new Set(umkmData.map((umkm) => umkm.category)))]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
      </header>

      {/* Hero Section */}
      <section className="relative h-[300px] bg-gradient-to-r from-blue-800 to-blue-600">
        <div className="absolute inset-0 bg-black/40"></div>
        <Image src="/placeholder.svg?height=300&width=1200" alt="UMKM Desa Tarubatang" fill className="object-cover" />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-4">UMKM & Homestay Tarubatang</h1>
            <p className="text-xl text-blue-100 max-w-2xl">
              Dukung ekonomi lokal dengan berbelanja produk UMKM dan menginap di homestay warga desa
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari UMKM atau produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* UMKM Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Daftar UMKM & Homestay</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Temukan berbagai produk lokal berkualitas dan penginapan nyaman di Desa Tarubatang
            </p>
          </div>

          {filteredUMKM.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Tidak ada UMKM yang ditemukan</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("Semua")
                }}
                className="mt-4"
              >
                Reset Filter
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredUMKM.map((umkm) => (
                <Card key={umkm.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={umkm.images?.[0] || "/placeholder.svg?height=200&width=200"}
                      alt={umkm.name}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-4 left-4 bg-blue-500">{umkm.category}</Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold">{umkm.name}</h3>
                      <Button size="sm" variant="ghost" className="p-1">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm">{umkm.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        {umkm.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-4 w-4 mr-2" />
                        {umkm.contact}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-lg font-bold text-green-600">{umkm.price}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(`https://wa.me/${umkm.contact.replace(/[^0-9]/g, "")}`, "_blank")}
                      >
                        Hubungi
                      </Button>
                      <Button size="sm" variant="outline">
                        Detail
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
