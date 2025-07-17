"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock, Filter, Search, Loader2, RefreshCw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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

interface User {
  id: string
  email: string
  name: string
  role: string
}

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })
  const [user, setUser] = useState<User | null>(null)
  const [joining, setJoining] = useState<string | null>(null)

  // Available categories from your data
  const categories = [
    { value: "all", label: "Semua" },
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

  // Initialize user data
  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      }
    }
  }, [])

  // Fetch events from API with improved error handling
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
      } else if (selectedStatus === "ongoing") {
        params.append("status", "ongoing")
      } else if (selectedStatus === "completed") {
        params.append("status", "completed")
      }

      const response = await fetch(`/api/event?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(user && localStorage.getItem("token") ? {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
          } : {})
        },
        // Add cache control for fresh data
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
      
      // Validate response structure
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
      setPagination({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      })
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedCategory, selectedStatus, pagination.page, user])

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

  const handleJoinEvent = async (eventId: string) => {
    if (!user) {
      // Redirect to login
      window.location.href = "/auth/login"
      return
    }

    try {
      setJoining(eventId)
      
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`/api/events/${eventId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })

      const responseData = await response.json()

      if (response.ok) {
        // Refresh events to update participant count
        await fetchEvents()
        alert("Berhasil mendaftar event!")
      } else {
        throw new Error(responseData.message || "Gagal mendaftar event")
      }
    } catch (error) {
      console.error("Error joining event:", error)
      alert(error instanceof Error ? error.message : "Terjadi kesalahan saat mendaftar event")
    } finally {
      setJoining(null)
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
      </header>

      {/* Hero Section */}
      <section className="relative h-[300px] bg-gradient-to-r from-purple-800 to-purple-600">
        <div className="absolute inset-0 bg-black/40"></div>
        <Image src="/merbabuu.png" alt="Event Desa Tarubatang" fill className="object-cover" />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-4">Event & Acara Desa Tarubatang</h1>
            <p className="text-xl text-purple-100 max-w-2xl">
              Ikuti berbagai acara menarik dan bergabunglah dengan komunitas Desa Tarubatang
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
              <input
                type="text"
                placeholder="Cari event atau acara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center space-x-4">
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
              </div>
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
                onClick={handleRetry}
                disabled={loading}
                className="flex items-center space-x-1"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Daftar Event & Acara</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Temukan berbagai acara menarik yang diselenggarakan di Desa Tarubatang
            </p>
            {!loading && !error && (
              <p className="text-sm text-gray-500 mt-2">
                Menampilkan {events.length} dari {pagination.total} events
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Memuat events...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={handleRetry}>Coba Lagi</Button>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                  ? "Tidak ada event yang ditemukan." 
                  : "Belum ada event yang tersedia."}
              </p>
              <Button onClick={handleResetFilters} className="mt-4">
                Reset Filter
              </Button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => {
                  const eventStatus = getStatusFromDate(event.date, event.endDate)
                  const participantCount = event._count?.participants ?? event.currentParticipants ?? 0
                  
                  return (
                    <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48">
                        <Image
                          src={event.images?.[0] || "/placeholder.svg?height=200&width=300"}
                          alt={event.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-4 left-4 flex space-x-2">
                          <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
                          <Badge className={getStatusColor(eventStatus)}>{getStatusText(eventStatus)}</Badge>
                        </div>
                        {event.price === "0" || event.price === "Gratis" || !event.price ? (
                          <Badge className="absolute top-4 right-4 bg-green-500 text-white">Gratis</Badge>
                        ) : (
                          <Badge className="absolute top-4 right-4 bg-blue-500 text-white">
                            {event.price}
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                        <p className="text-gray-600 mb-4 text-sm line-clamp-3">{event.description}</p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(event.date).toLocaleDateString("id-ID")}
                            {event.endDate && event.endDate !== event.date && (
                              <span> - {new Date(event.endDate).toLocaleDateString("id-ID")}</span>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="h-4 w-4 mr-2" />
                            {participantCount}
                            {event.maxParticipants && `/${event.maxParticipants}`} peserta
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {eventStatus === "upcoming" && (
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleJoinEvent(event.id)}
                              disabled={
                                joining === event.id ||
                                (!!event.maxParticipants && participantCount >= event.maxParticipants)
                              }
                            >
                              {joining === event.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Mendaftar...
                                </>
                              ) : (
                                event.maxParticipants && participantCount >= event.maxParticipants ? "Penuh" : "Daftar"
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <Link href={`/events/${event.slug}`}>
                              Detail
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
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
            </>
          )}
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Statistik Event</h2>
            <p className="text-gray-600">Data event dan partisipasi masyarakat</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {loading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  ) : (
                    pagination.total
                  )}
                </div>
                <p className="text-gray-600">Total Event</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {loading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  ) : (
                    events.filter(e => getStatusFromDate(e.date, e.endDate) === "upcoming").length
                  )}
                </div>
                <p className="text-gray-600">Event Mendatang</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {loading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  ) : (
                    events.reduce((sum, e) => sum + (e._count?.participants || e.currentParticipants || 0), 0)
                  )}
                </div>
                <p className="text-gray-600">Total Peserta</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {loading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                  ) : (
                    categories.length - 1
                  )}
                </div>
                <p className="text-gray-600">Kategori Event</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ingin Mengadakan Event di Tarubatang?</h2>
          <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
            Hubungi kami untuk informasi pengajuan event atau kerjasama acara di Desa Tarubatang
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Ajukan Event
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-purple-600 bg-transparent"
            >
              Panduan Event
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        
      </footer>
    </div>
  )
}