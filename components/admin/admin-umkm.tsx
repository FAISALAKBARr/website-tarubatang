"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Phone, 
  MapPin, 
  Store,
  Eye,
  RefreshCw
} from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface UMKM {
  id: string
  name: string
  category: string
  description: string
  price: string
  stock?: number
  images: string[]
  contact: string
  location?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    phone: string
  }
}

interface UMKMFormData {
  name: string
  category: string
  description: string
  price: string
  stock: number
  images: string[]
  contact: string
  location: string
  userId: string
}

export default function AdminUMKM() {
  const [umkmData, setUmkmData] = useState<UMKM[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUMKM, setEditingUMKM] = useState<UMKM | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState<UMKMFormData>({
    name: "",
    category: "",
    description: "",
    price: "",
    stock: 0,
    images: [],
    contact: "",
    location: "",
    userId: ""
  })

  const categories = [
    "Kuliner",
    "Kerajinan",
    "Homestay",
    "Pertanian",
    "Peternakan",
    "Jasa",
    "Lainnya"
  ]

  // Fetch UMKM data
  const fetchUMKM = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      
      const queryParams = new URLSearchParams({
        limit: "100",
        page: "1"
      })
      
      if (searchTerm) {
        queryParams.append("search", searchTerm)
      }
      
      if (selectedCategory !== "all") {
        queryParams.append("category", selectedCategory)
      }

      const response = await fetch(`/api/produk?${queryParams}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (!response.ok) {
        throw new Error("Failed to fetch UMKM data")
      }

      const data = await response.json()
      setUmkmData(data.umkm || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setUmkmData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUMKM()
  }, [searchTerm, selectedCategory])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authorization token found")
      }

      const url = editingUMKM ? `/api/produk/${editingUMKM.id}` : "/api/produk"
      const method = editingUMKM ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error("Failed to save UMKM")
      }

      await fetchUMKM()
      setIsDialogOpen(false)
      setEditingUMKM(null)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save UMKM")
    } finally {
      setFormLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus UMKM ini?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/produk/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to delete UMKM")
      }

      await fetchUMKM()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete UMKM")
    }
  }

  // Handle edit
  const handleEdit = (umkm: UMKM) => {
    setEditingUMKM(umkm)
    setFormData({
      name: umkm.name,
      category: umkm.category,
      description: umkm.description,
      price: umkm.price,
      stock: umkm.stock || 0,
      images: umkm.images,
      contact: umkm.contact,
      location: umkm.location || "",
      userId: umkm.user.id
    })
    setIsDialogOpen(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      price: "",
      stock: 0,
      images: [],
      contact: "",
      location: "",
      userId: ""
    })
  }

  // Handle add new
  const handleAdd = () => {
    setEditingUMKM(null)
    resetForm()
    setIsDialogOpen(true)
  }

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // fetchUMKM will be called automatically due to useEffect dependency
  }

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    // fetchUMKM will be called automatically due to useEffect dependency
  }

  const filteredUMKM = umkmData.filter(umkm => {
    const matchesSearch = !searchTerm || 
      umkm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      umkm.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      umkm.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || umkm.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen UMKM</h1>
          <p className="text-gray-600">Kelola produk dan layanan UMKM Desa Tarubatang</p>
        </div>
        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Tambah UMKM
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total UMKM</p>
                <p className="text-2xl font-bold">{umkmData.length}</p>
              </div>
              <Store className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktif</p>
                <p className="text-2xl font-bold text-green-600">
                  {umkmData.filter(u => u.isActive).length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kategori</p>
                <p className="text-2xl font-bold">
                  {new Set(umkmData.map(u => u.category)).size}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Filter className="h-4 w-4 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bulan Ini</p>
                <p className="text-2xl font-bold text-orange-600">
                  {umkmData.filter(u => {
                    const created = new Date(u.createdAt)
                    const now = new Date()
                    return created.getMonth() === now.getMonth() && 
                           created.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Plus className="h-4 w-4 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
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
                  placeholder="Cari UMKM, produk, atau pemilik..."
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
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
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
            <Button onClick={fetchUMKM} className="mt-2">
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      )}

      {/* UMKM Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Daftar UMKM
            {!loading && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredUMKM.length} dari {umkmData.length} UMKM)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Memuat data UMKM...</p>
            </div>
          ) : filteredUMKM.length === 0 ? (
            <div className="text-center py-8">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Tidak ada UMKM yang ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>UMKM</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Pemilik</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUMKM.map((umkm) => (
                    <TableRow key={umkm.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                            <Image
                              src={umkm.images?.[0] || "/placeholder.svg?height=48&width=48"}
                              alt={umkm.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{umkm.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {umkm.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{umkm.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{umkm.user.name}</p>
                          <p className="text-sm text-gray-500">{umkm.user.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {umkm.price}
                      </TableCell>
                      <TableCell>
                        {umkm.stock !== null ? umkm.stock : 'Tidak terbatas'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={umkm.isActive ? "default" : "secondary"}>
                          {umkm.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(umkm)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(umkm.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUMKM ? "Edit UMKM" : "Tambah UMKM Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingUMKM ? "Perbarui informasi UMKM" : "Tambahkan UMKM baru ke database"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nama UMKM</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
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
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Harga</Label>
                <Input
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="Contoh: Rp 50.000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock">Stok</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                  min="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact">Kontak</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  placeholder="Contoh: 08123456789"
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Lokasi</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Contoh: Jl. Raya Tarubatang"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="userId">User ID Pemilik</Label>
              <Input
                id="userId"
                value={formData.userId}
                onChange={(e) => setFormData({...formData, userId: e.target.value})}
                placeholder="ID pengguna pemilik UMKM"
                required
              />
            </div>

            <div>
              <Label htmlFor="images">URL Gambar</Label>
              <Input
                id="images"
                value={formData.images.join(", ")}
                onChange={(e) => setFormData({...formData, images: e.target.value.split(", ").filter(i => i.trim())})}
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? "Menyimpan..." : editingUMKM ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}