"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Image as ImageIcon, Loader2, RefreshCw, Search, Filter, Grid3X3, LayoutGrid, X, ChevronLeft, ChevronRight, Upload } from "lucide-react"
import Image from "next/image"

// Types
interface GalleryItem {
  id: string
  title: string
  description?: string
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

interface FormData {
  title: string
  description: string
  category: string
  images: string[]
}

export default function AdminGallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedView, setSelectedView] = useState<"grid" | "masonry">("grid")
  
  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  })

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    images: [],
  })

  // Available categories
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

  // Fetch gallery items from API
  const fetchGalleryItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim())
      }

      if (selectedCategory !== "all") {
        params.append("category", selectedCategory)
      }
      
      console.log('Admin fetching gallery with params:', params.toString())
      
      const response = await fetch(`/api/gallery?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })
    
      console.log('Admin response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Admin API Error:', errorText)
        let errorMessage = "Failed to fetch gallery items"
        
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorMessage
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        
        throw new Error(errorMessage)
      }

      const data: GalleryResponse = await response.json()
      
      if (!data.items || !Array.isArray(data.items)) {
        throw new Error("Invalid response format: items array missing")
      }

      if (!data.pagination) {
        throw new Error("Invalid response format: pagination data missing")
      }

      setGalleryItems(data.items)
      setPagination(data.pagination)
    } catch (err) {
      console.error("Error fetching gallery items:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      setGalleryItems([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedCategory, pagination.page])

  // Fetch gallery items when dependencies change
  useEffect(() => {
    fetchGalleryItems()
  }, [fetchGalleryItems])

  // Reset page when filters change
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }))
    }
  }, [searchTerm, selectedCategory])

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      images: [],
    })
  }

  const handleAddItem = async () => {
    if (!formData.title.trim() || !formData.category || formData.images.length === 0) {
      alert("Harap isi semua field yang diperlukan")
      return
    }

    try {
      setSubmitting(true)
      
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        images: formData.images.filter(img => img.trim() !== "")
      }

      const response = await fetch("/api/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create gallery item")
      }

      await fetchGalleryItems()
      setIsAddDialogOpen(false)
      resetForm()
      alert("Item galeri berhasil ditambahkan!")
    } catch (error) {
      console.error("Error adding gallery item:", error)
      alert(error instanceof Error ? error.message : "Terjadi kesalahan saat menambah item galeri")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditItem = (item: GalleryItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description || "",
      category: item.category,
      images: item.images || [],
    })
  }

  const handleUpdateItem = async () => {
    if (!editingItem) return

    if (!formData.title.trim() || !formData.category || formData.images.length === 0) {
      alert("Harap isi semua field yang diperlukan")
      return
    }

    try {
      setSubmitting(true)
      
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const payload = {
        id: editingItem.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        images: formData.images.filter(img => img.trim() !== "")
      }

      const response = await fetch(`/api/gallery/${editingItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update gallery item")
      }

      await fetchGalleryItems()
      setEditingItem(null)
      resetForm()
      alert("Item galeri berhasil diperbarui!")
    } catch (error) {
      console.error("Error updating gallery item:", error)
      alert(error instanceof Error ? error.message : "Terjadi kesalahan saat memperbarui item galeri")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus item galeri ini?")) return

    try {
      setDeleting(itemId)
      
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`/api/gallery/${itemId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete gallery item")
      }

      await fetchGalleryItems()
      alert("Item galeri berhasil dihapus!")
    } catch (error) {
      console.error("Error deleting gallery item:", error)
      alert(error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus item galeri")
    } finally {
      setDeleting(null)
    }
  }

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

  const handleRetry = () => {
    fetchGalleryItems()
  }

  const handleResetFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
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

  const getImageUrl = (item: GalleryItem): string => {
    if (Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0]
    }
    return "/placeholder.svg?height=300&width=400"
  }

  const addImageUrl = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ""]
    }))
  }

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const updateImageUrl = (index: number, url: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? url : img)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Kelola Galeri</h2>
          <p className="text-gray-600">Tambah, edit, dan kelola galeri foto Desa Tarubatang</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Foto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Foto Baru</DialogTitle>
                <DialogDescription>Isi form di bawah untuk menambah foto baru ke galeri</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Masukkan judul foto"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Pilih kategori</option>
                    {categories.slice(1).map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi (Opsional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Masukkan deskripsi foto"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL Gambar</Label>
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={image}
                        onChange={(e) => updateImageUrl(index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeImageUrl(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addImageUrl}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah URL Gambar
                  </Button>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    resetForm()
                  }}
                  disabled={submitting}
                >
                  Batal
                </Button>
                <Button onClick={handleAddItem} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari foto..."
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
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center space-x-1">
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
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Memuat galeri...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <p className="text-red-700 text-lg mb-4">Error: {error}</p>
              <div className="space-y-2">
                <Button onClick={handleRetry}>
                  Coba Lagi
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleResetFilters}
                >
                  Reset Filter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : galleryItems.length === 0 ? (
        <div className="text-center py-12">
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500 text-lg mb-4">Tidak ada foto yang ditemukan</p>
              <Button onClick={handleResetFilters}>
                Reset Filter
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          selectedView === "grid" 
            ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "columns-1 md:columns-2 lg:columns-3 xl:columns-4"
        }`}>
          {galleryItems.map((item, index) => (
            <Card
              key={item.id}
              className={`overflow-hidden hover:shadow-lg transition-shadow group ${
                selectedView === "masonry" ? "mb-4 break-inside-avoid" : ""
              }`}
            >
              <div className="relative">
                <Image
                  src={getImageUrl(item)}
                  alt={item.title}
                  width={400}
                  height={300}
                  className={`w-full object-cover cursor-pointer ${
                    selectedView === "grid" ? "h-48" : "h-auto"
                  }`}
                  onClick={() => openLightbox(index)}
                />
                <div className="absolute top-2 left-2">
                  <Badge className={getCategoryColor(item.category)}>
                    {item.category}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleEditItem(item)}
                      disabled={submitting}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={deleting === item.id}
                    >
                      {deleting === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1 line-clamp-1">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString("id-ID")}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {item.images.length} gambar
                  </span>
                  <Badge variant={item.isActive ? "default" : "secondary"}>
                    {item.isActive ? "Aktif" : "Tidak Aktif"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1 || loading}
            >
              Previous
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={pagination.page === page ? "default" : "outline"}
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page }))}
                disabled={loading}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => {
        setEditingItem(null)
        resetForm()
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Foto</DialogTitle>
            <DialogDescription>Update informasi foto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Judul</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Kategori</Label>
              <select
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {categories.slice(1).map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>URL Gambar</Label>
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={image}
                    onChange={(e) => updateImageUrl(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeImageUrl(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImageUrl}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah URL Gambar
              </Button>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setEditingItem(null)
                resetForm()
              }}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button onClick={handleUpdateItem} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                                {galleryItems[lightboxIndex].description && (
                  <p className="text-sm mt-1">
                    {galleryItems[lightboxIndex].description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

                