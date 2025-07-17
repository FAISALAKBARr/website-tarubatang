"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Grid3X3, LayoutGrid, RefreshCw, X, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface GalleryItem {
  id: string
  title: string
  images: string[]
  category: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface GalleryResponse {
  items: GalleryItem[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export default function GalleryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedView, setSelectedView] = useState<"grid" | "masonry">("grid")
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  })
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const categories = [
    { value: "all", label: "Semua Kategori" },
    { value: "Wisata Alam", label: "Wisata Alam" },
    { value: "Budaya", label: "Budaya" },
    { value: "Event", label: "Event" },
    { value: "Kehidupan Desa", label: "Kehidupan Desa" },
    { value: "Pemandangan", label: "Pemandangan" },
    { value: "Arsitektur", label: "Arsitektur" },
    { value: "Camping", label: "Camping" },
    { value: "UMKM", label: "UMKM" }
  ]

  const fetchGalleryItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      if (searchTerm.trim()) params.append("search", searchTerm.trim())
      if (selectedCategory !== "all") params.append("category", selectedCategory)

      console.log('Fetching gallery with params:', params.toString())

      const response = await fetch(`/api/gallery?${params.toString()}`)
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data: GalleryResponse = await response.json()
      console.log('Gallery data received:', data)
      
      // Pastikan data memiliki struktur yang benar
      if (data && data.items && Array.isArray(data.items)) {
        setGalleryItems(data.items)
        setPagination(data.pagination)
      } else {
        console.error('Invalid data structure:', data)
        throw new Error('Format data tidak valid dari API')
      }

    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : "Terjadi kesalahan tak terduga")
      setGalleryItems([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedCategory, pagination.page, pagination.limit])

  useEffect(() => {
    fetchGalleryItems()
  }, [fetchGalleryItems])

  // Reset page when search/category changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [searchTerm, selectedCategory])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Wisata Alam": return "bg-green-100 text-green-800"
      case "Budaya": return "bg-purple-100 text-purple-800"
      case "Event": return "bg-blue-100 text-blue-800"
      case "Kehidupan Desa": return "bg-orange-100 text-orange-800"
      case "Pemandangan": return "bg-teal-100 text-teal-800"
      case "Arsitektur": return "bg-gray-100 text-gray-800"
      case "Camping": return "bg-yellow-100 text-yellow-800"
      case "UMKM": return "bg-pink-100 text-pink-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const nextImage = () => {
    setLightboxIndex((prev) => 
      prev !== null ? (prev + 1) % galleryItems.length : null
    )
  }
  const prevImage = () => {
    setLightboxIndex((prev) => 
      prev !== null ? (prev - 1 + galleryItems.length) % galleryItems.length : null
    )
  }
  const handleRetry = () => fetchGalleryItems()
  const handleResetFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
  }

  // Helper function to get image URL
  const getImageUrl = (item: GalleryItem): string => {
    if (Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0]
    }
    return "/placeholder.svg?height=300&width=400"
  }

  const handlePaginationChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[350px] bg-gradient-to-r from-teal-800 to-teal-600">
        <div className="absolute inset-0 bg-black/40" />
        <Image 
          src="/merbabuu.png" 
          alt="Galeri Desa Tarubatang" 
          fill 
          className="object-cover"
          priority
        />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-4">Galeri Desa Tarubatang</h1>
            <p className="text-xl text-teal-100 max-w-2xl">
              Kumpulan dokumentasi keindahan Desa Tarubatang
            </p>
          </div>
        </div>
      </section>

      {/* Filter & Search */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari foto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant={selectedView === "grid" ? "default" : "outline"}
                onClick={() => setSelectedView("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={selectedView === "masonry" ? "default" : "outline"}
                onClick={() => setSelectedView("masonry")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleRetry} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {selectedCategory === "all" ? "Semua Foto" : `Galeri ${selectedCategory}`}
            </h2>
            {!loading && (
              <p className="text-sm text-gray-500 mt-2">
                Menampilkan {galleryItems.length} dari {pagination.total} foto
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Memuat galeri...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={handleRetry} className="mr-2">
                Coba Lagi
              </Button>
              <Button variant="outline" onClick={handleResetFilters}>
                Reset Filter
              </Button>
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Tidak ada foto yang ditemukan.</p>
              <Button className="mt-4" onClick={handleResetFilters}>
                Reset Filter
              </Button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              selectedView === "grid" 
                ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "columns-1 md:columns-2 lg:columns-3 xl:columns-4"
            }`}>
              {galleryItems.map((item, index) => (
                <Card
                  key={item.id}
                  className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group ${
                    selectedView === "masonry" ? "mb-6 break-inside-avoid" : ""
                  }`}
                  onClick={() => openLightbox(index)}
                >
                  <div className="relative">
                    <Image
                      src={getImageUrl(item)}
                      alt={item.title}
                      width={400}
                      height={300}
                      className={`w-full object-cover ${
                        selectedView === "grid" ? "h-48" : "h-auto"
                      }`}
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-1">{item.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePaginationChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={pagination.page === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePaginationChange(page)}
                    disabled={loading}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePaginationChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Button 
              variant="ghost" 
              className="absolute top-4 right-4 text-white hover:bg-white/20" 
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>
            <Button 
              variant="ghost" 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20" 
              onClick={prevImage}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button 
              variant="ghost" 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20" 
              onClick={nextImage}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
            <div className="max-w-4xl max-h-full">
              <Image
                src={getImageUrl(galleryItems[lightboxIndex])}
                alt={galleryItems[lightboxIndex].title}
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain"
              />
              <div className="bg-black/50 text-white p-4 rounded-b-lg">
                <h3 className="text-xl font-semibold">
                  {galleryItems[lightboxIndex].title}
                </h3>
                <p className="text-sm mt-1">
                  {new Date(galleryItems[lightboxIndex].createdAt).toLocaleDateString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}