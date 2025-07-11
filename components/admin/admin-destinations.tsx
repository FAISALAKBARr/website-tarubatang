"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  EyeOff,
  Star,
  Users,
  Calendar,
  Camera,
  Mountain,
  TreePine,
  Tent
} from "lucide-react"
import Image from "next/image"

interface Destination {
  id: string
  name: string
  slug: string
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
  createdAt: string
  updatedAt: string
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

interface DestinationForm {
  name: string
  category: string
  description: string
  content: string
  price: string
  facilities: string[]
  location: string
  latitude?: number
  longitude?: number
  images: string[]
}

const initialFormData: DestinationForm = {
  name: "",
  category: "",
  description: "",
  content: "",
  price: "",
  facilities: [],
  location: "",
  latitude: undefined,
  longitude: undefined,
  images: []
}

const categories = [
  { value: "Wisata Alam", label: "Wisata Alam", icon: TreePine },
  { value: "Pendakian", label: "Pendakian", icon: Mountain },
  { value: "Camping", label: "Camping", icon: Tent },
  { value: "Spot Foto", label: "Spot Foto", icon: Camera },
]

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })
  
  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null)
  const [formData, setFormData] = useState<DestinationForm>(initialFormData)
  const [formLoading, setFormLoading] = useState(false)

  // Fetch destinations from API
  useEffect(() => {
    fetchDestinations()
  }, [searchTerm, selectedCategory, pagination.page])

  const fetchDestinations = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      
      if (searchTerm) params.append("search", searchTerm)
      if (selectedCategory !== "all") params.append("category", selectedCategory)

      const response = await fetch(`/api/destinations?${params}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch destinations")
      }

      const data = await response.json()
      setDestinations(data.destinations || [])
      setPagination(data.pagination)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setDestinations([])
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

  const handleCreateDestination = () => {
    setEditingDestination(null)
    setFormData(initialFormData)
    setIsDialogOpen(true)
  }

  const handleEditDestination = (destination: Destination) => {
    setEditingDestination(destination)
    setFormData({
      name: destination.name,
      category: destination.category,
      description: destination.description,
      content: destination.content || "",
      price: destination.price,
      facilities: destination.facilities,
      location: destination.location,
      latitude: destination.latitude,
      longitude: destination.longitude,
      images: destination.images
    })
    setIsDialogOpen(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    
    try {
      const token = localStorage.getItem("token")
      const url = editingDestination 
        ? `/api/destinations/${editingDestination.id}`
        : "/api/destinations"
      
      const method = editingDestination ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error("Failed to save destination")
      }

      await fetchDestinations()
      setIsDialogOpen(false)
      setFormData(initialFormData)
      setEditingDestination(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save destination")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteDestination = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus destinasi ini?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/destinations/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        throw new Error("Failed to delete destination")
      }

      await fetchDestinations()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete destination")
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/destinations/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (!response.ok) {
        throw new Error("Failed to update destination status")
      }

      await fetchDestinations()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update destination status")
    }
  }

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.value === category)
    return categoryData ? categoryData.icon : MapPin
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Destinasi</h1>
          <p className="text-gray-600">Kelola destinasi wisata di Desa Tarubatang</p>
        </div>
        <Button onClick={handleCreateDestination}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Destinasi
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari destinasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchDestinations} className="mt-2">
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Destinations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Daftar Destinasi
            {!loading && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({destinations.length} dari {pagination.total} destinasi)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Memuat destinasi...</p>
            </div>
          ) : destinations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Tidak ada destinasi yang ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Destinasi</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {destinations.map((destination) => {
                    const IconComponent = getCategoryIcon(destination.category)
                    return (
                      <TableRow key={destination.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                              <Image
                                src={destination.images[0] || "/placeholder.svg?height=48&width=48"}
                                alt={destination.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{destination.name}</p>
                              <p className="text-sm text-gray-500 truncate max-w-xs">
                                {destination.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getDifficultyColor(destination.category)}>
                            <IconComponent className="h-3 w-3 mr-1" />
                            {destination.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            {destination.location}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{destination.price}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                            <span>{destination.rating.toFixed(1)}</span>
                            <span className="text-sm text-gray-500 ml-1">
                              ({destination._count.reviews})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={destination.isActive ? "default" : "secondary"}>
                            {destination.isActive ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleActive(destination.id, destination.isActive)}
                            >
                              {destination.isActive ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditDestination(destination)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteDestination(destination.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
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
                  disabled={pagination.page === 1}
                >
                  Sebelumnya
                </Button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={pagination.page === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDestination ? "Edit Destinasi" : "Tambah Destinasi Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nama Destinasi</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
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

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="content">Konten Detail</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Harga</Label>
                <Input
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Gratis / Rp 10.000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Lokasi</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude || ""}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude || ""}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="facilities">Fasilitas</Label>
              <Input
                id="facilities"
                value={formData.facilities.join(", ")}
                onChange={(e) => setFormData({ ...formData, facilities: e.target.value.split(", ").filter(f => f.trim()) })}
                placeholder="Toilet, Parkir, Mushola (pisahkan dengan koma)"
              />
            </div>

            <div>
              <Label htmlFor="images">URL Gambar</Label>
              <Input
                id="images"
                value={formData.images.join(", ")}
                onChange={(e) => setFormData({ ...formData, images: e.target.value.split(", ").filter(i => i.trim()) })}
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? "Menyimpan..." : editingDestination ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}