"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Mountain,
  Save,
  Plus,
  Trash2,
  Eye,
  Users,
  MessageSquare,
  Calendar,
  MapPin,
  Utensils,
  Mail,
  Clock,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Submission {
  id: number
  type: string
  name: string
  email: string
  message: string
  timestamp: string
  status: "new" | "read" | "replied"
}

export default function AdminDashboard() {
  const [content, setContent] = useState<any>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [activeTab, setActiveTab] = useState("hero")
  const [isSaving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  // Load content and submissions
  useEffect(() => {
    loadContent()
    loadSubmissions()
  }, [])

  const loadContent = async () => {
    try {
      const response = await fetch("/api/content")
      if (response.ok) {
        const data = await response.json()
        setContent(data)
      }
    } catch (error) {
      console.error("Failed to load content:", error)
    }
  }

  const loadSubmissions = async () => {
    try {
      const response = await fetch("/api/submissions")
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      }
    } catch (error) {
      console.error("Failed to load submissions:", error)
    }
  }

  const saveContent = async () => {
    setSaving(true)
    setSaveMessage("")

    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(content),
      })

      if (response.ok) {
        setSaveMessage("Konten berhasil disimpan!")
      } else {
        setSaveMessage("Gagal menyimpan konten.")
      }
    } catch (error) {
      setSaveMessage("Terjadi kesalahan saat menyimpan.")
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMessage(""), 3000)
    }
  }

  const updateSubmissionStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setSubmissions(submissions.map((sub) => (sub.id === id ? { ...sub, status: status as any } : sub)))
      }
    } catch (error) {
      console.error("Failed to update submission:", error)
    }
  }

  const addDestination = () => {
    const newDestination = {
      id: Date.now(),
      name: "Destinasi Baru",
      category: "Wisata Alam",
      description: "Deskripsi destinasi baru",
      image: "/placeholder.svg?height=200&width=300",
      rating: 4.5,
      price: "Rp 0",
    }
    setContent({
      ...content,
      destinations: [...content.destinations, newDestination],
    })
  }

  const removeDestination = (id: number) => {
    setContent({
      ...content,
      destinations: content.destinations.filter((dest: any) => dest.id !== id),
    })
  }

  const addUMKM = () => {
    const newUMKM = {
      id: Date.now(),
      name: "UMKM Baru",
      category: "Makanan",
      description: "Deskripsi UMKM baru",
      image: "/placeholder.svg?height=60&width=60",
      price: "Rp 0",
      contact: "0812-0000-0000",
    }
    setContent({
      ...content,
      umkm: [...content.umkm, newUMKM],
    })
  }

  const removeUMKM = (id: number) => {
    setContent({
      ...content,
      umkm: content.umkm.filter((item: any) => item.id !== id),
    })
  }

  const addEvent = () => {
    const newEvent = {
      id: Date.now(),
      name: "Event Baru",
      date: new Date().toISOString().split("T")[0],
      location: "Lokasi Event",
      description: "Deskripsi event baru",
      category: "Budaya",
    }
    setContent({
      ...content,
      events: [...content.events, newEvent],
    })
  }

  const removeEvent = (id: number) => {
    setContent({
      ...content,
      events: content.events.filter((event: any) => event.id !== id),
    })
  }

  const addGalleryPhoto = () => {
    const newPhoto = {
      id: Date.now(),
      title: "Foto Baru",
      image: "/placeholder.svg?height=200&width=200",
      category: "Pemandangan",
    }
    setContent({
      ...content,
      gallery: [...content.gallery, newPhoto],
    })
  }

  const removeGalleryPhoto = (id: number) => {
    setContent({
      ...content,
      gallery: content.gallery.filter((photo: any) => photo.id !== id),
    })
  }

  const getSubmissionTypeColor = (type: string) => {
    switch (type) {
      case "guestbook":
        return "bg-blue-100 text-blue-800"
      case "volunteer":
        return "bg-green-100 text-green-800"
      case "feedback":
        return "bg-yellow-100 text-yellow-800"
      case "complaint":
        return "bg-red-100 text-red-800"
      case "business":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-red-100 text-red-800"
      case "read":
        return "bg-yellow-100 text-yellow-800"
      case "replied":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Mountain className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Kelola Konten Website Desa Tarubatang</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-green-600 hover:text-green-700">
                <Eye className="h-5 w-5" />
              </Link>
              <Button onClick={saveContent} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Menyimpan..." : "Simpan Semua"}
              </Button>
            </div>
          </div>
          {saveMessage && (
            <div
              className={`mt-2 p-2 rounded text-sm ${
                saveMessage.includes("berhasil") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              {saveMessage}
            </div>
          )}
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Destinasi</p>
                  <p className="text-3xl font-bold text-gray-900">{content.destinations?.length || 0}</p>
                </div>
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total UMKM</p>
                  <p className="text-3xl font-bold text-gray-900">{content.umkm?.length || 0}</p>
                </div>
                <Utensils className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Event</p>
                  <p className="text-3xl font-bold text-gray-900">{content.events?.length || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pesan Baru</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {submissions.filter((s) => s.status === "new").length}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="destinations">Destinasi</TabsTrigger>
            <TabsTrigger value="umkm">UMKM</TabsTrigger>
            <TabsTrigger value="events">Event</TabsTrigger>
            <TabsTrigger value="gallery">Galeri</TabsTrigger>
            <TabsTrigger value="submissions">Pesan</TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Edit Hero Section & Informasi Umum</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="hero-title">Judul Hero</Label>
                      <Input
                        id="hero-title"
                        value={content.hero?.title || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            hero: { ...content.hero, title: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="hero-description">Deskripsi Hero</Label>
                      <Textarea
                        id="hero-description"
                        value={content.hero?.description || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            hero: { ...content.hero, description: e.target.value },
                          })
                        }
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="about-title">Judul Tentang</Label>
                      <Input
                        id="about-title"
                        value={content.about?.title || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: { ...content.about, title: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="about-description">Deskripsi Tentang</Label>
                      <Textarea
                        id="about-description"
                        value={content.about?.description || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: { ...content.about, description: e.target.value },
                          })
                        }
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Statistik Desa</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="altitude">Ketinggian</Label>
                      <Input
                        id="altitude"
                        value={content.about?.stats?.altitude || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              stats: { ...content.about.stats, altitude: e.target.value },
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="population">Penduduk</Label>
                      <Input
                        id="population"
                        value={content.about?.stats?.population || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              stats: { ...content.about.stats, population: e.target.value },
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="destinations-count">Destinasi</Label>
                      <Input
                        id="destinations-count"
                        value={content.about?.stats?.destinations || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              stats: { ...content.about.stats, destinations: e.target.value },
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="events-count">Event</Label>
                      <Input
                        id="events-count"
                        value={content.about?.stats?.events || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            about: {
                              ...content.about,
                              stats: { ...content.about.stats, events: e.target.value },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Kontak</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="village-phone">Telepon Kantor Desa</Label>
                      <Input
                        id="village-phone"
                        value={content.contact?.village || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            contact: { ...content.contact, village: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="tourism-phone">Telepon Wisata</Label>
                      <Input
                        id="tourism-phone"
                        value={content.contact?.tourism || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            contact: { ...content.contact, tourism: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergency-phone">Telepon Darurat</Label>
                      <Input
                        id="emergency-phone"
                        value={content.contact?.emergency || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            contact: { ...content.contact, emergency: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={content.contact?.email || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            contact: { ...content.contact, email: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Alamat</Label>
                      <Textarea
                        id="address"
                        value={content.contact?.address || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            contact: { ...content.contact, address: e.target.value },
                          })
                        }
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Destinations */}
          <TabsContent value="destinations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Kelola Destinasi Wisata</CardTitle>
                  <Button onClick={addDestination}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Destinasi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {content.destinations?.map((destination: any, index: number) => (
                    <Card key={destination.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <Label>Nama Destinasi</Label>
                            <Input
                              value={destination.name}
                              onChange={(e) => {
                                const updated = [...content.destinations]
                                updated[index].name = e.target.value
                                setContent({ ...content, destinations: updated })
                              }}
                            />
                          </div>
                          <div>
                            <Label>Kategori</Label>
                            <Input
                              value={destination.category}
                              onChange={(e) => {
                                const updated = [...content.destinations]
                                updated[index].category = e.target.value
                                setContent({ ...content, destinations: updated })
                              }}
                            />
                          </div>
                          <div>
                            <Label>Harga</Label>
                            <Input
                              value={destination.price}
                              onChange={(e) => {
                                const updated = [...content.destinations]
                                updated[index].price = e.target.value
                                setContent({ ...content, destinations: updated })
                              }}
                            />
                          </div>
                          <div>
                            <Label>Rating</Label>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="5"
                              value={destination.rating}
                              onChange={(e) => {
                                const updated = [...content.destinations]
                                updated[index].rating = Number.parseFloat(e.target.value)
                                setContent({ ...content, destinations: updated })
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label>Deskripsi</Label>
                            <Textarea
                              value={destination.description}
                              onChange={(e) => {
                                const updated = [...content.destinations]
                                updated[index].description = e.target.value
                                setContent({ ...content, destinations: updated })
                              }}
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label>URL Gambar</Label>
                            <Input
                              value={destination.image}
                              onChange={(e) => {
                                const updated = [...content.destinations]
                                updated[index].image = e.target.value
                                setContent({ ...content, destinations: updated })
                              }}
                              placeholder="/placeholder.svg?height=200&width=300"
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button variant="destructive" size="sm" onClick={() => removeDestination(destination.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* UMKM */}
          <TabsContent value="umkm">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Kelola UMKM & Homestay</CardTitle>
                  <Button onClick={addUMKM}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah UMKM
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {content.umkm?.map((item: any, index: number) => (
                    <Card key={item.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <Label>Nama UMKM</Label>
                            <Input
                              value={item.name}
                              onChange={(e) => {
                                const updated = [...content.umkm]
                                updated[index].name = e.target.value
                                setContent({ ...content, umkm: updated })
                              }}
                            />
                          </div>
                          <div>
                            <Label>Kategori</Label>
                            <Input
                              value={item.category}
                              onChange={(e) => {
                                const updated = [...content.umkm]
                                updated[index].category = e.target.value
                                setContent({ ...content, umkm: updated })
                              }}
                            />
                          </div>
                          <div>
                            <Label>Harga</Label>
                            <Input
                              value={item.price}
                              onChange={(e) => {
                                const updated = [...content.umkm]
                                updated[index].price = e.target.value
                                setContent({ ...content, umkm: updated })
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label>Deskripsi</Label>
                            <Textarea
                              value={item.description}
                              onChange={(e) => {
                                const updated = [...content.umkm]
                                updated[index].description = e.target.value
                                setContent({ ...content, umkm: updated })
                              }}
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label>Kontak</Label>
                            <Input
                              value={item.contact}
                              onChange={(e) => {
                                const updated = [...content.umkm]
                                updated[index].contact = e.target.value
                                setContent({ ...content, umkm: updated })
                              }}
                            />
                          </div>
                          <div>
                            <Label>URL Gambar</Label>
                            <Input
                              value={item.image}
                              onChange={(e) => {
                                const updated = [...content.umkm]
                                updated[index].image = e.target.value
                                setContent({ ...content, umkm: updated })
                              }}
                              placeholder="/placeholder.svg?height=60&width=60"
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button variant="destructive" size="sm" onClick={() => removeUMKM(item.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Kelola Event & Acara</CardTitle>
                  <Button onClick={addEvent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {content.events?.map((event: any, index: number) => (
                    <Card key={event.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <Label>Nama Event</Label>
                            <Input
                              value={event.name}
                              onChange={(e) => {
                                const updated = [...content.events]
                                updated[index].name = e.target.value
                                setContent({ ...content, events: updated })
                              }}
                            />
                          </div>
                          <div>
                            <Label>Tanggal</Label>
                            <Input
                              type="date"
                              value={event.date}
                              onChange={(e) => {
                                const updated = [...content.events]
                                updated[index].date = e.target.value
                                setContent({ ...content, events: updated })
                              }}
                            />
                          </div>
                          <div>
                            <Label>Lokasi</Label>
                            <Input
                              value={event.location}
                              onChange={(e) => {
                                const updated = [...content.events]
                                updated[index].location = e.target.value
                                setContent({ ...content, events: updated })
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label>Kategori</Label>
                            <Input
                              value={event.category}
                              onChange={(e) => {
                                const updated = [...content.events]
                                updated[index].category = e.target.value
                                setContent({ ...content, events: updated })
                              }}
                            />
                          </div>
                          <div>
                            <Label>Deskripsi</Label>
                            <Textarea
                              value={event.description}
                              onChange={(e) => {
                                const updated = [...content.events]
                                updated[index].description = e.target.value
                                setContent({ ...content, events: updated })
                              }}
                              rows={3}
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button variant="destructive" size="sm" onClick={() => removeEvent(event.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery */}
          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Kelola Galeri Foto</CardTitle>
                  <Button onClick={addGalleryPhoto}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Foto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {content.gallery?.map((photo: any, index: number) => (
                    <Card key={photo.id} className="p-4">
                      <div className="space-y-3">
                        <div className="relative h-32 bg-gray-100 rounded">
                          <Image
                            src={photo.image || "/placeholder.svg?height=128&width=200"}
                            alt={photo.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div>
                          <Label>Judul Foto</Label>
                          <Input
                            value={photo.title}
                            onChange={(e) => {
                              const updated = [...content.gallery]
                              updated[index].title = e.target.value
                              setContent({ ...content, gallery: updated })
                            }}
                          />
                        </div>
                        <div>
                          <Label>Kategori</Label>
                          <Input
                            value={photo.category}
                            onChange={(e) => {
                              const updated = [...content.gallery]
                              updated[index].category = e.target.value
                              setContent({ ...content, gallery: updated })
                            }}
                          />
                        </div>
                        <div>
                          <Label>URL Gambar</Label>
                          <Input
                            value={photo.image}
                            onChange={(e) => {
                              const updated = [...content.gallery]
                              updated[index].image = e.target.value
                              setContent({ ...content, gallery: updated })
                            }}
                            placeholder="/placeholder.svg?height=200&width=200"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button variant="destructive" size="sm" onClick={() => removeGalleryPhoto(photo.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions */}
          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Pesan & Formulir Masuk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Belum ada pesan masuk</p>
                    </div>
                  ) : (
                    submissions.map((submission) => (
                      <Card key={submission.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge className={getSubmissionTypeColor(submission.type)}>
                              {submission.type === "guestbook" && "Buku Tamu"}
                              {submission.type === "volunteer" && "Relawan"}
                              {submission.type === "feedback" && "Saran"}
                              {submission.type === "complaint" && "Keluhan"}
                              {submission.type === "business" && "Bisnis"}
                            </Badge>
                            <Badge className={getStatusColor(submission.status)}>
                              {submission.status === "new" && "Baru"}
                              {submission.status === "read" && "Dibaca"}
                              {submission.status === "replied" && "Dibalas"}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {new Date(submission.timestamp).toLocaleDateString("id-ID")}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{submission.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{submission.email}</span>
                            </div>
                          </div>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded">{submission.message}</p>
                        </div>

                        <div className="flex space-x-2 mt-4">
                          {submission.status === "new" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateSubmissionStatus(submission.id, "read")}
                            >
                              Tandai Dibaca
                            </Button>
                          )}
                          {submission.status === "read" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateSubmissionStatus(submission.id, "replied")}
                            >
                              Tandai Dibalas
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`mailto:${submission.email}?subject=Re: ${submission.type}`)}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Balas Email
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
