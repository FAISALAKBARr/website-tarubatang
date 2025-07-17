"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Calendar, Users, Mountain, Star, Send, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { User } from "lucide-react"

// API Response Types
interface Destination {
  id: string
  name: string
  slug: string
  category: string
  description: string
  images: string[]
  rating: number
  price: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface UMKM {
  id: string
  name: string
  slug: string
  category: string
  description: string
  images: string[]
  price: string
  contact: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Event {
  id: string
  name: string
  slug: string
  date: string
  location: string
  description: string
  category: string
  images: string[]
  price?: string
  maxParticipants?: number
  currentParticipants: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Gallery {
  id: string
  title: string
  images: string[]
  category: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface WebsiteStats {
  totalDestinations: number
  totalEvents: number
  totalUMKM: number
  totalGallery: number
  totalSubmissions: number
}

export default function HomePage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [umkm, setUMKM] = useState<UMKM[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [gallery, setGallery] = useState<Gallery[]>([])
  const [stats, setStats] = useState<WebsiteStats>({
    totalDestinations: 0,
    totalEvents: 0,
    totalUMKM: 0,
    totalGallery: 0,
    totalSubmissions: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [guestbookForm, setGuestbookForm] = useState({
    name: "",
    email: "",
    message: "",
    type: "guestbook", // guestbook, volunteer, feedback
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")

  // Individual API fetch functions with error handling
  const fetchDestinations = async () => {
    try {
      const response = await fetch("/api/destinations?limit=6")
      if (response.ok) {
        const data = await response.json()
        return data.destinations || data.data || []
      }
      return []
    } catch (error) {
      console.error("Error fetching destinations:", error)
      return []
    }
  }

  const fetchUMKM = async () => {
    try {
      const response = await fetch("/api/produk?limit=6")
      if (response.ok) {
        const data = await response.json()
        return data.umkm || data.data || []
      }
      return []
    } catch (error) {
      console.error("Error fetching UMKM:", error)
      return []
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/event?limit=6")
      if (response.ok) {
        const data = await response.json()
        return data.events || data.data || []
      }
      return []
    } catch (error) {
      console.error("Error fetching events:", error)
      return []
    }
  }

  // Fixed fetchGallery function for homepage
  const fetchGallery = async () => {
    try {
      const response = await fetch("/api/gallery?limit=8")
      if (response.ok) {
        const data = await response.json()
        return data.items || [] // ✅ FIXED: Use data.items instead of data.gallery
      }
      return []
    } catch (error) {
      console.error("Error fetching gallery:", error)
      return []
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats")
      if (response.ok) {
        const data = await response.json()
        return data
      }
      return null
    } catch (error) {
      console.error("Error fetching stats:", error)
      return null
    }
  }

  // Load all data with better error handling
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all data concurrently but handle errors individually
        const [
          destinationsData,
          umkmData,
          eventsData,
          galleryData,
          statsData
        ] = await Promise.all([
          fetchDestinations(),
          fetchUMKM(),
          fetchEvents(),
          fetchGallery(),
          fetchStats()
        ])

        // Set state with fetched data
        setDestinations(destinationsData)
        setUMKM(umkmData)
        setEvents(eventsData)
        setGallery(galleryData)
        
        // Set stats with fallback values
        setStats(statsData || {
          totalDestinations: destinationsData.length,
          totalEvents: eventsData.length,
          totalUMKM: umkmData.length,
          totalGallery: galleryData.length,
          totalSubmissions: 0
        })

      } catch (error) {
        console.error("Failed to load data:", error)
        setError(error instanceof Error ? error.message : "Terjadi kesalahan saat memuat data")
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage("")

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...guestbookForm,
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        setSubmitMessage("Terima kasih! Pesan Anda telah terkirim.")
        setGuestbookForm({ name: "", email: "", message: "", type: "guestbook" })
      } else {
        const errorData = await response.json().catch(() => ({}))
        setSubmitMessage(errorData.message || "Terjadi kesalahan. Silakan coba lagi.")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmitMessage("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Updated consistent loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-muted-foreground mt-4">Memuat halaman...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section id="beranda" className="relative h-[600px] bg-background overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <Image
          src="/merbabuu.png"
          alt="Pemandangan Gunung Merbabu dari Desa Tarubatang"
          fill
          className="object-cover"
        />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <Badge className="mb-4 bg-green-500 hover:bg-green-600">Kawasan Taman Nasional Gunung Merbabu</Badge>
            <h1 className="text-5xl font-bold mb-4">Desa Tarubatang</h1>
            <p className="text-xl mb-6 text-green-100">
              Destinasi wisata alam terbaik di kaki Gunung Merbabu dengan keindahan yang memukau dan budaya yang kaya
            </p>
            <div className="flex space-x-4">
              <Button size="lg" className="bg-green-500 hover:bg-green-600" asChild>
                <Link href="/tourism">Jelajahi Wisata</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/events">Lihat Acara</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Error Display */}
      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ Beberapa data mungkin tidak dapat dimuat: {error}
            </p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <section id="tentang" className="py-12 bg-background scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Tentang Desa Tarubatang</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Desa wisata yang terletak di lereng Gunung Merbabu, menawarkan pengalaman wisata alam yang tak terlupakan
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="rounded-lg p-6 shadow-sm">
                <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">1.200m</h3>
                <p className="text-muted-foreground">Ketinggian</p>
              </div>
            </div>
            <div className="text-center">
              <div className="rounded-lg p-6 shadow-sm">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">2.500</h3>
                <p className="text-muted-foreground">Penduduk</p>
              </div>
            </div>
            <div className="text-center">
              <div className="rounded-lg p-6 shadow-sm">
                <Mountain className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">{stats.totalDestinations}</h3>
                <p className="text-muted-foreground">Destinasi Wisata</p>
              </div>
            </div>
            <div className="text-center">
              <div className="rounded-lg p-6 shadow-sm">
                <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">{stats.totalEvents}</h3>
                <p className="text-muted-foreground">Acara Tahunan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section id="wisata" className="py-16 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Destinasi Wisata Unggulan
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Jelajahi keindahan alam Desa Tarubatang dengan berbagai destinasi wisata yang menakjubkan
            </p>
          </div>

          {destinations.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations.map((destination) => (
                <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={destination.images?.[0] || "/placeholder.svg?height=200&width=300"}
                      alt={destination.name}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-4 left-4 bg-green-500">{destination.category}</Badge>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{destination.rating}</span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold">{destination.name}</h3>
                      <p className="text-sm font-medium text-green-600">{destination.price}</p>
                    </div>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{destination.description}</p>
                    <Button size="sm" className="w-full" asChild>
                      <Link href={`/tourism/${destination.slug}`}>
                        Lihat Detail
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Belum ada destinasi wisata yang tersedia</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Button size="lg" variant="outline" asChild>
              <Link href="/tourism">
                Lihat Semua Destinasi
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* UMKM Section */}
      <section id="umkm" className="py-16 bg-gray-50 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">UMKM & Basecamp</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dukung ekonomi lokal dengan berbelanja produk UMKM dan menginap di basecamp warga
            </p>
          </div>

          {umkm.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {umkm.map((item) => (
                <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={item.images?.[0] || "/placeholder.svg?height=60&width=60"}
                      alt={item.name}
                      width={60}
                      height={60}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <Badge variant="secondary" className="text-xs mb-1">
                        {item.category}
                      </Badge>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      <p className="text-sm text-green-600 font-medium">{item.price}</p>
                      {item.contact && <p className="text-xs text-gray-500">Kontak: {item.contact}</p>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Belum ada UMKM yang terdaftar</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Button size="lg" variant="outline" asChild>
              <Link href="/umkm">
                Lihat Semua UMKM
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Events */}
      <section id="acara" className="py-16 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Acara & Event</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ikuti berbagai acara menarik yang diselenggarakan di Desa Tarubatang
            </p>
          </div>

          {events.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Badge className="mb-3 bg-blue-100 text-blue-800">{event.category}</Badge>
                    <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">{event.description}</p>
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(event.date).toLocaleDateString("id-ID")}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                    </div>
                    <Button size="sm" className="w-full" asChild>
                      <Link href={`/events/${event.slug}`}>
                        Lihat Detail
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Belum ada acara yang terjadwal</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Button size="lg" variant="outline" asChild>
              <Link href="/events">
                Lihat Semua Event
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Galeri Foto</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Lihat keindahan Desa Tarubatang melalui foto-foto terbaru
            </p>
          </div>

          {gallery.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((photo) => (
                <div key={photo.id} className="relative group overflow-hidden rounded-lg">
                  <Image
                    src={photo.images?.[0] || "/placeholder.svg?height=200&width=200"}
                    alt={photo.title}
                    width={200}
                    height={200}
                    className="object-cover w-full h-48 group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-4 text-white">
                      <p className="font-medium">{photo.title}</p>
                      <Badge variant="secondary" className="text-xs">
                        {photo.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Belum ada foto di galeri</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Button size="lg" variant="outline" asChild>
              <Link href="/gallery">
                Lihat Semua Foto
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact & Forms */}
      <section id="kontak" className="py-16 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Kontak & Buku Tamu</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Hubungi kami atau tinggalkan pesan di buku tamu</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Kontak Penting</h3>
              <div className="space-y-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Kantor Desa</p>
                      <p className="text-sm text-muted-foreground">+62 274 123456</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Pengelola Wisata</p>
                      <p className="text-sm text-muted-foreground">+62 812 3456 7890</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Darurat (SAR)</p>
                      <p className="text-sm text-muted-foreground">115</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="space-y-2">
                    <p className="font-medium">Alamat</p>
                    <p className="text-sm text-muted-foreground">
                      Desa Tarubatang, Kec. Kemalang, Kab. Klaten, Jawa Tengah 57465
                    </p>
                    <p className="text-sm text-muted-foreground">Email: info@tarubatang.id</p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Forms */}
            <div>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-6">Buku Tamu & Formulir</h3>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Jenis Pesan</Label>
                    <select
                      id="type"
                      value={guestbookForm.type}
                      onChange={(e) => setGuestbookForm({ ...guestbookForm, type: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="guestbook">Buku Tamu</option>
                      <option value="volunteer">Daftar Relawan</option>
                      <option value="feedback">Saran & Masukan</option>
                      <option value="complaint">Keluhan</option>
                      <option value="business">Kerjasama Bisnis</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={guestbookForm.name}
                      onChange={(e) => setGuestbookForm({ ...guestbookForm, name: e.target.value })}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={guestbookForm.email}
                      onChange={(e) => setGuestbookForm({ ...guestbookForm, email: e.target.value })}
                      placeholder="Masukkan email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Pesan</Label>
                    <Textarea
                      id="message"
                      value={guestbookForm.message}
                      onChange={(e) => setGuestbookForm({ ...guestbookForm, message: e.target.value })}
                      placeholder="Tulis pesan Anda..."
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Kirim Pesan
                      </>
                    )}
                  </Button>

                  {submitMessage && (
                    <div
                      className={`p-3 rounded-md text-sm ${
                        submitMessage.includes("Terima kasih") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                      }`}
                    >
                      {submitMessage}
                    </div>
                  )}
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}