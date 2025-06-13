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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mountain className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Desa Tarubatang</h1>
                <p className="text-sm text-gray-600">Boyolali, Jawa Tengah</p>
              </div>
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="#beranda" className="text-gray-700 hover:text-green-600 font-medium">
                Beranda
              </a>
              <a href="#tentang" className="text-gray-700 hover:text-green-600 font-medium">
                Tentang
              </a>
              <a href="#wisata" className="text-gray-700 hover:text-green-600 font-medium">
                Wisata
              </a>
              <a href="#umkm" className="text-gray-700 hover:text-green-600 font-medium">
                UMKM
              </a>
              <a href="#acara" className="text-gray-700 hover:text-green-600 font-medium">
                Acara
              </a>
              <a href="#kontak" className="text-gray-700 hover:text-green-600 font-medium">
                Kontak
              </a>
            </div>
            <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="beranda" className="relative h-[600px] bg-gradient-to-r from-green-800 to-green-600">
        <div className="absolute inset-0 bg-black/40"></div>
        <Image
          src="/placeholder.svg?height=600&width=1200"
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
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-green-600"
              >
                Lihat Acara
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section id="tentang" className="py-12 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{content.about.title}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{content.about.description}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-800">{content.about.stats.altitude}</h3>
                <p className="text-gray-600">Ketinggian</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-800">{content.about.stats.population}</h3>
                <p className="text-gray-600">Penduduk</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Mountain className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-800">{content.about.stats.destinations}</h3>
                <p className="text-gray-600">Destinasi Wisata</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-800">{content.about.stats.events}</h3>
                <p className="text-gray-600">Acara Tahunan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section id="wisata" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Destinasi Wisata Unggulan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
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
                  <p className="text-gray-600 mb-4">{destination.description}</p>
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
      <section id="umkm" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">UMKM & Homestay</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
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
                    <p className="text-sm text-gray-600">{item.description}</p>
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
      <section id="acara" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Acara & Event</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ikuti berbagai acara menarik yang diselenggarakan di Desa Tarubatang
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.events.map((event) => (
              <Card key={event.id} className="overflow-hidden border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <Badge className="mb-3 bg-blue-100 text-blue-800">{event.category}</Badge>
                  <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                  <p className="text-gray-600 mb-4">{event.description}</p>
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
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Galeri Foto</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Lihat keindahan Desa Tarubatang melalui foto-foto terbaru</p>
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
      <section id="kontak" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Kontak & Buku Tamu</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Hubungi kami atau tinggalkan pesan di buku tamu</p>
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
                      <p className="text-sm text-gray-600">{content.contact.village}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Pengelola Wisata</p>
                      <p className="text-sm text-gray-600">{content.contact.tourism}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Darurat (SAR)</p>
                      <p className="text-sm text-gray-600">{content.contact.emergency}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="space-y-2">
                    <p className="font-medium">Alamat</p>
                    <p className="text-sm text-gray-600">{content.contact.address}</p>
                    <p className="text-sm text-gray-600">Email: {content.contact.email}</p>
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
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Mountain className="h-6 w-6 text-green-400" />
                <h3 className="text-lg font-semibold">Desa Tarubatang</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Destinasi wisata alam terbaik di kaki Gunung Merbabu, menawarkan pengalaman tak terlupakan dengan
                keindahan alam dan budaya lokal.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Menu Utama</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="#tentang" className="hover:text-green-400">
                    Tentang Desa
                  </a>
                </li>
                <li>
                  <a href="#wisata" className="hover:text-green-400">
                    Destinasi Wisata
                  </a>
                </li>
                <li>
                  <a href="#umkm" className="hover:text-green-400">
                    UMKM & Homestay
                  </a>
                </li>
                <li>
                  <a href="#acara" className="hover:text-green-400">
                    Acara & Event
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Kantor Desa: {content.contact.village}</p>
                <p>Wisata: {content.contact.tourism}</p>
                <p>Email: {content.contact.email}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Desa Tarubatang. Dikembangkan oleh Tim KKN Universitas</p>
          </div>
        </div>
      </footer>
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
