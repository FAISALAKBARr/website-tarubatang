"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Calendar, Users, Mountain, Star, Send } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { User } from "lucide-react"

interface WebsiteContent {
  hero: {
    title: string
    subtitle: string
    description: string
  }
  about: {
    title: string
    description: string
    stats: {
      altitude: string
      population: string
      destinations: string
      events: string
    }
  }
  destinations: Array<{
    id: number
    name: string
    category: string
    description: string
    image: string
    rating: number
    price: string
  }>
  umkm: Array<{
    id: number
    name: string
    category: string
    description: string
    image: string
    price: string
    contact: string
  }>
  events: Array<{
    id: number
    name: string
    date: string
    location: string
    description: string
    category: string
  }>
  gallery: Array<{
    id: number
    title: string
    image: string
    category: string
  }>
  contact: {
    village: string
    tourism: string
    emergency: string
    email: string
    address: string
  }
}

export default function HomePage() {
  const [content, setContent] = useState<WebsiteContent | null>(null)
  const [guestbookForm, setGuestbookForm] = useState({
    name: "",
    email: "",
    message: "",
    type: "guestbook", // guestbook, volunteer, feedback
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")

  // Load website content
  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch("/api/content")
        if (response.ok) {
          const data = await response.json()
          setContent(data)
        } else {
          // Load default content if API fails
          setContent(getDefaultContent())
        }
      } catch (error) {
        console.error("Failed to load content:", error)
        setContent(getDefaultContent())
      }
    }
    loadContent()
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
        setSubmitMessage("Terjadi kesalahan. Silakan coba lagi.")
      }
    } catch (error) {
      setSubmitMessage("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Memuat halaman...</p>
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
            <h1 className="text-5xl font-bold mb-4">{content.hero.title}</h1>
            <p className="text-xl mb-6 text-green-100">{content.hero.description}</p>
            <div className="flex space-x-4">
              <Button size="lg" className="bg-green-500 hover:bg-green-600">
                Jelajahi Wisata
              </Button>
              <Button
                size="lg"
                variant="secondary"
                // className="text-primary border-border "
              >
                Lihat Acara
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section id="tentang" className="py-12 bg-background scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">{content.about.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{content.about.description}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className=" rounded-lg p-6 shadow-sm">
                <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">{content.about.stats.altitude}</h3>
                <p className="text-muted-foreground">Ketinggian</p>
              </div>
            </div>
            <div className="text-center">
              <div className=" rounded-lg p-6 shadow-sm">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">{content.about.stats.population}</h3>
                <p className="text-muted-foreground">Penduduk</p>
              </div>
            </div>
            <div className="text-center">
              <div className=" rounded-lg p-6 shadow-sm">
                <Mountain className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">{content.about.stats.destinations}</h3>
                <p className="text-muted-foreground">Destinasi Wisata</p>
              </div>
            </div>
            <div className="text-center">
              <div className=" rounded-lg p-6 shadow-sm">
                <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">{content.about.stats.events}</h3>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.destinations.map((destination) => (
              <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={destination.image || "/placeholder.svg?height=200&width=300"}
                    alt={destination.name}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-green-500">{destination.category}</Badge>
                  <div className="absolute top-4 right-4 /90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{destination.rating}</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold">{destination.name}</h3>
                    <p className="text-sm font-medium text-green-600">{destination.price}</p>
                  </div>
                  <p className="text-muted-foreground mb-4">{destination.description}</p>
                  <Button size="sm" className="w-full">
                    Lihat Detail
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* UMKM Section */}
      <section id="umkm" className="py-16 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">UMKM & Homestay</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dukung ekonomi lokal dengan berbelanja produk UMKM dan menginap di homestay warga
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.umkm.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center space-x-4">
                  <Image
                    src={item.image || "/placeholder.svg?height=60&width=60"}
                    alt={item.name}
                    width={60}
                    height={60}
                    className="rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <Badge variant="secondary" className="text-xs mb-1">
                      {item.category}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <p className="text-sm text-green-600 font-medium">{item.price}</p>
                    {item.contact && <p className="text-xs text-gray-500">Kontak: {item.contact}</p>}
                  </div>
                </div>
              </Card>
            ))}
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.events.map((event) => (
              <Card key={event.id} className="overflow-hidden border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <Badge className="mb-3 bg-blue-100 text-blue-800">{event.category}</Badge>
                  <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                  <p className="text-muted-foreground mb-4">{event.description}</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.date).toLocaleDateString("id-ID")}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Galeri Foto</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Lihat keindahan Desa Tarubatang melalui foto-foto terbaru</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {content.gallery.map((photo) => (
              <div key={photo.id} className="relative group overflow-hidden rounded-lg">
                <Image
                  src={photo.image || "/placeholder.svg?height=200&width=200"}
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
                      <p className="text-sm text-muted-foreground">{content.contact.village}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Pengelola Wisata</p>
                      <p className="text-sm text-muted-foreground">{content.contact.tourism}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Darurat (SAR)</p>
                      <p className="text-sm text-muted-foreground">{content.contact.emergency}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="space-y-2">
                    <p className="font-medium">Alamat</p>
                    <p className="text-sm text-muted-foreground">{content.contact.address}</p>
                    <p className="text-sm text-muted-foreground">Email: {content.contact.email}</p>
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
                      className="w-full p-2 border border-gray-300 rounded-md"
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
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
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

      {/* Footer */}
      
    </div>
  )
}

// Default content fallback
function getDefaultContent(): WebsiteContent {
  return {
    hero: {
      title: "Selamat Datang di Desa Tarubatang",
      subtitle: "Kawasan Taman Nasional Gunung Merbabu",
      description:
        "Destinasi wisata alam yang memukau di kaki Gunung Merbabu, menawarkan keindahan alam, budaya lokal, dan pengalaman tak terlupakan.",
    },
    about: {
      title: "Tentang Desa Tarubatang",
      description:
        "Desa wisata yang terletak di kaki Gunung Merbabu dengan keindahan alam yang menakjubkan dan budaya lokal yang kaya.",
      stats: {
        altitude: "1,200m",
        population: "2,500",
        destinations: "8",
        events: "12",
      },
    },
    destinations: [
      {
        id: 1,
        name: "Air Terjun Sekumpul",
        category: "Wisata Alam",
        description: "Air terjun setinggi 25 meter dengan kolam alami yang jernih",
        image: "/placeholder.svg?height=200&width=300",
        rating: 4.8,
        price: "Rp 10.000",
      },
      {
        id: 2,
        name: "Basecamp Pendakian Merbabu",
        category: "Pendakian",
        description: "Basecamp resmi pendakian Gunung Merbabu via Tarubatang",
        image: "/placeholder.svg?height=200&width=300",
        rating: 4.9,
        price: "Rp 25.000",
      },
      {
        id: 3,
        name: "Camping Ground Sunrise",
        category: "Camping",
        description: "Area camping dengan view sunrise terbaik",
        image: "/placeholder.svg?height=200&width=300",
        rating: 4.7,
        price: "Rp 15.000/malam",
      },
    ],
    umkm: [
      {
        id: 1,
        name: "Keripik Singkong Bu Sari",
        category: "Makanan",
        description: "Keripik singkong renyah dengan berbagai rasa",
        image: "/placeholder.svg?height=60&width=60",
        price: "Rp 15.000/bungkus",
        contact: "0812-3456-7890",
      },
      {
        id: 2,
        name: "Homestay Merbabu View",
        category: "Homestay",
        description: "4 kamar, AC, WiFi, view gunung",
        image: "/placeholder.svg?height=60&width=60",
        price: "Rp 150.000/malam",
        contact: "0813-4567-8901",
      },
    ],
    events: [
      {
        id: 1,
        name: "Merbabu De Trail",
        date: "2024-08-15",
        location: "Basecamp Tarubatang",
        description: "Event trail running tahunan dengan rute menantang di sekitar Gunung Merbabu",
        category: "Olahraga",
      },
      {
        id: 2,
        name: "Festival Panen Raya",
        date: "2024-04-20",
        location: "Balai Desa",
        description: "Perayaan hasil panen dengan pertunjukan seni budaya dan kuliner tradisional",
        category: "Budaya",
      },
    ],
    gallery: [
      {
        id: 1,
        title: "Sunrise di Merbabu",
        image: "/placeholder.svg?height=200&width=200",
        category: "Pemandangan",
      },
      {
        id: 2,
        title: "Air Terjun Sekumpul",
        image: "/placeholder.svg?height=200&width=200",
        category: "Wisata Alam",
      },
      {
        id: 3,
        title: "Hutan Pinus",
        image: "/placeholder.svg?height=200&width=200",
        category: "Spot Foto",
      },
      {
        id: 4,
        title: "Camping Ground",
        image: "/placeholder.svg?height=200&width=200",
        category: "Camping",
      },
    ],
    contact: {
      village: "(0276) 123-4567",
      tourism: "0812-3456-7890",
      emergency: "0811-2233-4455",
      email: "info@tarubatang.desa.id",
      address: "Desa Tarubatang, Kecamatan Selo, Kabupaten Boyolali, Jawa Tengah 57365",
    },
  }
}
