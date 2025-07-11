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
import { Plus, Edit, Trash2, Calendar, Users, MapPin, Loader2, RefreshCw, Search, Filter } from "lucide-react"

// Types based on Prisma schema
interface Event {
  id: string
  name: string
  slug: string
  description: string
  content?: string
  category: string
  date: string
  endDate?: string
  location: string
  maxParticipants?: number
  currentParticipants: number
  price?: string
  images: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    participants: number
  }
}

interface EventsResponse {
  events: Event[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface FormData {
  name: string
  date: string
  endDate: string
  location: string
  description: string
  content: string
  maxParticipants: string
  price: string
  category: string
  images: string[]
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  
  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })

  const [formData, setFormData] = useState<FormData>({
    name: "",
    date: "",
    endDate: "",
    location: "",
    description: "",
    content: "",
    maxParticipants: "",
    price: "",
    category: "",
    images: [],
  })

  // Available categories
  const categories = [
    { value: "all", label: "Semua Kategori" },
    { value: "Olahraga", label: "Olahraga" },
    { value: "Budaya", label: "Budaya" },
    { value: "Sosial", label: "Sosial" },
    { value: "Edukasi", label: "Edukasi" },
    { value: "Hiburan", label: "Hiburan" }
  ]

  const statuses = [
    { value: "all", label: "Semua Status" },
    { value: "upcoming", label: "Akan Datang" },
    { value: "ongoing", label: "Berlangsung" },
    { value: "completed", label: "Selesai" }
  ]

  // Fetch events from API
  const fetchEvents = useCallback(async () => {
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

      if (selectedStatus === "upcoming") {
        params.append("upcoming", "true")
      }

      const token = localStorage.getItem("token")
      const response = await fetch(`/api/event?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        cache: 'no-cache'
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Failed to fetch events"
        
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorMessage
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        
        throw new Error(errorMessage)
      }

      const data: EventsResponse = await response.json()
      
      if (!data.events || !Array.isArray(data.events)) {
        throw new Error("Invalid response format: events array missing")
      }

      if (!data.pagination) {
        throw new Error("Invalid response format: pagination data missing")
      }

      setEvents(data.events)
      setPagination(data.pagination)
    } catch (err) {
      console.error("Error fetching events:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedCategory, selectedStatus, pagination.page])

  // Fetch events when dependencies change
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Reset page when filters change
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }))
    }
  }, [searchTerm, selectedCategory, selectedStatus])

  const resetForm = () => {
    setFormData({
      name: "",
      date: "",
      endDate: "",
      location: "",
      description: "",
      content: "",
      maxParticipants: "",
      price: "",
      category: "",
      images: [],
    })
  }

  const handleAddEvent = async () => {
    try {
      setSubmitting(true)
      
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const payload = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        price: formData.price || "0",
      }

      const response = await fetch("/api/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create event")
      }

      await fetchEvents()
      setIsAddDialogOpen(false)
      resetForm()
      alert("Event berhasil ditambahkan!")
    } catch (error) {
      console.error("Error adding event:", error)
      alert(error instanceof Error ? error.message : "Terjadi kesalahan saat menambah event")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      name: event.name,
      date: event.date.split('T')[0], // Format for date input
      endDate: event.endDate ? event.endDate.split('T')[0] : "",
      location: event.location,
      description: event.description,
      content: event.content || "",
      maxParticipants: event.maxParticipants?.toString() || "",
      price: event.price || "",
      category: event.category,
      images: event.images || [],
    })
  }

  const handleUpdateEvent = async () => {
    if (!editingEvent) return

    try {
      setSubmitting(true)
      
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const payload = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        price: formData.price || "0",
      }

      const response = await fetch(`/api/event/${editingEvent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update event")
      }

      await fetchEvents()
      setEditingEvent(null)
      resetForm()
      alert("Event berhasil diperbarui!")
    } catch (error) {
      console.error("Error updating event:", error)
      alert(error instanceof Error ? error.message : "Terjadi kesalahan saat memperbarui event")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus event ini?")) return

    try {
      setDeleting(eventId)
      
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`/api/event/${eventId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete event")
      }

      await fetchEvents()
      alert("Event berhasil dihapus!")
    } catch (error) {
      console.error("Error deleting event:", error)
      alert(error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus event")
    } finally {
      setDeleting(null)
    }
  }

  const getStatusFromDate = (date: string, endDate?: string) => {
    const now = new Date()
    const eventDate = new Date(date)
    const eventEndDate = endDate ? new Date(endDate) : eventDate
    
    if (now < eventDate) {
      return "upcoming"
    } else if (now > eventEndDate) {
      return "completed"
    } else {
      return "ongoing"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "ongoing":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Akan Datang"
      case "ongoing":
        return "Berlangsung"
      case "completed":
        return "Selesai"
      default:
        return "Unknown"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Olahraga":
        return "bg-red-100 text-red-800"
      case "Budaya":
        return "bg-purple-100 text-purple-800"
      case "Sosial":
        return "bg-green-100 text-green-800"
      case "Edukasi":
        return "bg-blue-100 text-blue-800"
      case "Hiburan":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleRetry = () => {
    fetchEvents()
  }

  const handleResetFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSelectedStatus("all")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Kelola Event & Acara</h2>
          <p className="text-gray-600">Tambah, edit, dan kelola event di Desa Tarubatang</p>
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
                Tambah Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Event Baru</DialogTitle>
                <DialogDescription>Isi form di bawah untuk menambah event baru</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Nama Event</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama event"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Tanggal Mulai</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Tanggal Selesai (Opsional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="location">Lokasi</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Masukkan lokasi event"
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
                  <Label htmlFor="price">Harga</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Gratis atau Rp 50.000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Maksimal Peserta</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Deskripsi Singkat</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Masukkan deskripsi singkat event"
                    rows={3}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="content">Konten Detail (Opsional)</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Masukkan konten detail event"
                    rows={4}
                  />
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
                <Button onClick={handleAddEvent} disabled={submitting}>
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
                placeholder="Cari event..."
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
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
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

      {/* Events List */}
      {loading ? (
        <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Memuat data Events...</p>
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
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500 text-lg mb-4">Tidak ada event yang ditemukan</p>
              <Button onClick={handleResetFilters}>
                Reset Filter
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const eventStatus = getStatusFromDate(event.date, event.endDate)
            const participantCount = event._count?.participants ?? event.currentParticipants ?? 0
            
            return (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold">{event.name}</h3>
                        <Badge className={getStatusColor(eventStatus)}>
                          {getStatusText(eventStatus)}
                        </Badge>
                        <Badge className={getCategoryColor(event.category)}>
                          {event.category}
                        </Badge>
                        {event.price === "0" || event.price === "Gratis" || !event.price ? (
                          <Badge className="bg-green-100 text-green-800">Gratis</Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800">
                            {event.price}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4">{event.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            {new Date(event.date).toLocaleDateString("id-ID")}
                            {event.endDate && event.endDate !== event.date && (
                              <span> - {new Date(event.endDate).toLocaleDateString("id-ID")}</span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>
                            {participantCount}
                            {event.maxParticipants && `/${event.maxParticipants}`} peserta
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditEvent(event)}
                        disabled={submitting}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteEvent(event.id)}
                        disabled={deleting === event.id}
                      >
                        {deleting === event.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
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
      <Dialog open={!!editingEvent} onOpenChange={() => {
        setEditingEvent(null)
        resetForm()
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update informasi event</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-name">Nama Event</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Tanggal Mulai</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-endDate">Tanggal Selesai</Label>
              <Input
                id="edit-endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-location">Lokasi</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
              <Label htmlFor="edit-price">Harga</Label>
              <Input
                id="edit-price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-maxParticipants">Maksimal Peserta</Label>
              <Input
                id="edit-maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
                        <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-content">Konten Detail (Opsional)</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setEditingEvent(null)
                resetForm()
              }}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button onClick={handleUpdateEvent} disabled={submitting}>
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
    </div>
  )
}
