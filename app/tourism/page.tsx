"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, Users, Star, Camera, Mountain, TreePine, Tent, Search, Filter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import GoogleMapsComponent from "@/components/google-maps"

interface Destination {
  id: string
  name: string
  category: string
  description: string
  content?: string
  price: string
  facilities: string[]
  location: string
  latitude?: number
  longitude?: number
  images: string[]
  rating: number
  totalReviews: number
  isActive: boolean
  _count: {
    reviews: number
    bookmarks: number
  }
}

interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function TourismPage() {
  const [user, setUser] = useState<any>(null)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 0
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    fetchDestinations()
  }, [searchTerm, selectedCategory, pagination.page])

  const fetchDestinations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      
      if (searchTerm) params.append("search", searchTerm)
      if (selectedCategory !== "all") params.append("category", selectedCategory)

      const response = await fetch(`/api/destinations?${params}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch destinations")
      }

      const data = await response.json()
      setDestinations(data.destinations)
      setPagination(data.pagination)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const getDifficultyColor = (category: string) => {
    switch (category) {
      case "Wisata Alam":
        return "bg-green-100 text-green-800"
      case "Pendakian":
        return "bg-red-100 text-red-800"
      case "Camping":
        return "bg-blue-100 text-blue-800"
      case "Spot Foto":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Wisata Alam":
        return TreePine
      case "Pendakian":
        return Mountain
      case "Camping":
        return Tent
      case "Spot Foto":
        return Camera
      default:
        return MapPin
    }
  }

  const categories = [
    { value: "all", label: "Semua Kategori" },
    { value: "Wisata Alam", label: "Wisata Alam" },
    { value: "Pendakian", label: "Pendakian" },
    { value: "Camping", label: "Camping" },
    { value: "Spot Foto", label: "Spot Foto" },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[400px] bg-gradient-to-r from-green-800 to-green-600">
        <div className="absolute inset-0 bg-black/40"></div>
        <Image
          src="/placeholder.svg?height=400&width=1200"
          alt="Destinasi Wisata Tarubatang"
          fill
          className="object-cover"
        />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-4">Destinasi Wisata Tarubatang</h1>
            <p className="text-xl text-green-100 max-w-2xl">
              Jelajahi keindahan alam yang menakjubkan di kaki Gunung Merbabu dengan berbagai destinasi wisata yang
              memikat hati
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari destinasi wisata..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Cari
              </Button>
            </form>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Peta Lokasi Wisata</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Temukan lokasi semua destinasi wisata di Desa Tarubatang dengan peta interaktif di bawah ini
            </p>
          </div>
          <GoogleMapsComponent />
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {selectedCategory === "all" ? "Semua Destinasi Wisata" : `Destinasi ${selectedCategory}`}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {searchTerm ? `Hasil pencarian untuk "${searchTerm}"` : "Pilih destinasi yang sesuai dengan minat dan kemampuan Anda"}
            </p>
            {!loading && (
              <p className="text-sm text-gray-500 mt-2">
                Menampilkan {destinations.length} dari {pagination.total} destinasi
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Memuat destinasi...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchDestinations}>Coba Lagi</Button>
            </div>
          ) : destinations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Tidak ada destinasi yang ditemukan.</p>
              <Button onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
                setPagination(prev => ({ ...prev, page: 1 }))
              }} className="mt-4">
                Reset Filter
              </Button>
            </div>
          ) : (
            <>
              <div className="grid lg:grid-cols-2 gap-8">
                {destinations.map((destination) => {
                  const IconComponent = getCategoryIcon(destination.category)
                  return (
                    <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="md:flex">
                        <div className="md:w-1/2 relative h-64 md:h-auto">
                          <Image
                            src={destination.images[0] || "/placeholder.svg?height=300&width=400"}
                            alt={destination.name}
                            fill
                            className="object-cover"
                          />
                          <Badge className={`${getDifficultyColor(destination.category)} absolute top-4 left-4`}>
                            {destination.category}
                          </Badge>
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{destination.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        <div className="md:w-1/2 p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <IconComponent className="h-5 w-5 text-green-600" />
                              <h3 className="text-xl font-semibold">{destination.name}</h3>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">{destination.price}</p>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-4 text-sm leading-relaxed">{destination.description}</p>

                          <div className="space-y-3 mb-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-4 w-4 mr-2" />
                              {destination.location}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Star className="h-4 w-4 mr-2" />
                              {destination._count.reviews} ulasan • {destination._count.bookmarks} bookmark
                            </div>
                          </div>

                          {destination.facilities.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium text-sm mb-2">Fasilitas:</h4>
                              <div className="flex flex-wrap gap-1">
                                {destination.facilities.slice(0, 3).map((facility, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {facility}
                                  </Badge>
                                ))}
                                {destination.facilities.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{destination.facilities.length - 3} lainnya
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                if (destination.latitude && destination.longitude) {
                                  const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`
                                  window.open(url, "_blank")
                                }
                              }}
                              disabled={!destination.latitude || !destination.longitude}
                            >
                              Petunjuk Arah
                            </Button>
                            <Button size="sm" variant="outline">
                              Detail
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                    >
                      Sebelumnya
                    </Button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={pagination.page === page ? "default" : "outline"}
                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Tips Berwisata</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Panduan penting untuk pengalaman wisata yang aman dan menyenangkan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="h-5 w-5 mr-2 text-green-600" />
                  Waktu Terbaik
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Pagi hari (06:00-10:00) untuk sunrise</li>
                  <li>• Sore hari (15:00-18:00) untuk sunset</li>
                  <li>• Hindari musim hujan (Nov-Mar)</li>
                  <li>• Weekend lebih ramai pengunjung</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Persiapan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Bawa jaket (suhu dingin di malam hari)</li>
                  <li>• Sepatu trekking yang nyaman</li>
                  <li>• Air minum dan snack secukupnya</li>
                  <li>• Power bank untuk dokumentasi</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TreePine className="h-5 w-5 mr-2 text-green-600" />
                  Etika Wisata
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Jaga kebersihan lingkungan</li>
                  <li>• Tidak merusak tanaman/fasilitas</li>
                  <li>• Hormati budaya lokal</li>
                  <li>• Gunakan jasa pemandu lokal</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Siap Menjelajahi Tarubatang?</h2>
          <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
            Hubungi kami untuk informasi lebih lanjut atau bantuan perencanaan perjalanan wisata Anda
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Hubungi Pemandu Wisata
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-green-600">
              Lihat Paket Wisata
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}