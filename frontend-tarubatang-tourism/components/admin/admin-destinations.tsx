"use client"

import { useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Eye, Star } from "lucide-react"
import Image from "next/image"

const mockDestinations = [
  {
    id: 1,
    name: "Air Terjun Sekumpul",
    category: "Wisata Alam",
    description: "Air terjun setinggi 25 meter dengan kolam alami yang jernih",
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.8,
    price: "Rp 10.000",
    status: "active",
    visitors: 1250,
  },
  {
    id: 2,
    name: "Basecamp Pendakian Merbabu",
    category: "Pendakian",
    description: "Basecamp resmi pendakian Gunung Merbabu via Tarubatang",
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.9,
    price: "Rp 25.000",
    status: "active",
    visitors: 890,
  },
  {
    id: 3,
    name: "Camping Ground Sunrise",
    category: "Camping",
    description: "Area camping dengan view sunrise terbaik",
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.7,
    price: "Rp 15.000/malam",
    status: "active",
    visitors: 650,
  },
]

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState(mockDestinations)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingDestination, setEditingDestination] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    difficulty: "",
    features: "",
  })

  const handleAddDestination = () => {
    const newDestination = {
      id: destinations.length + 1,
      ...formData,
      rating: 0,
      status: "active",
      visitors: 0,
      image: "/placeholder.svg?height=200&width=300",
    }
    setDestinations([...destinations, newDestination])
    setFormData({
      name: "",
      category: "",
      description: "",
      price: "",
      difficulty: "",
      features: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleEditDestination = (destination: any) => {
    setEditingDestination(destination)
    setFormData({
      name: destination.name,
      category: destination.category,
      description: destination.description,
      price: destination.price,
      difficulty: destination.difficulty || "",
      features: destination.features || "",
    })
  }

  const handleUpdateDestination = () => {
    setDestinations(destinations.map((dest) => (dest.id === editingDestination.id ? { ...dest, ...formData } : dest)))
    setEditingDestination(null)
    setFormData({
      name: "",
      category: "",
      description: "",
      price: "",
      difficulty: "",
      features: "",
    })
  }

  const handleDeleteDestination = (id: number) => {
    setDestinations(destinations.filter((dest) => dest.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kelola Destinasi Wisata</h2>
          <p className="text-gray-600">Tambah, edit, dan kelola destinasi wisata di Desa Tarubatang</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Destinasi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Destinasi Baru</DialogTitle>
              <DialogDescription>Isi form di bawah untuk menambah destinasi wisata baru</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Destinasi</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama destinasi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wisata Alam">Wisata Alam</SelectItem>
                    <SelectItem value="Pendakian">Pendakian</SelectItem>
                    <SelectItem value="Camping">Camping</SelectItem>
                    <SelectItem value="Spot Foto">Spot Foto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Masukkan deskripsi destinasi"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Harga</Label>
                <Input
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Rp 10.000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Tingkat Kesulitan</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tingkat kesulitan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mudah">Mudah</SelectItem>
                    <SelectItem value="Sedang">Sedang</SelectItem>
                    <SelectItem value="Menantang">Menantang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="features">Fasilitas (pisahkan dengan koma)</Label>
                <Input
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Toilet, Warung Makan, Area Parkir"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddDestination}>Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Destinations Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((destination) => (
          <Card key={destination.id} className="overflow-hidden">
            <div className="relative h-48">
              <Image
                src={destination.image || "/placeholder.svg"}
                alt={destination.name}
                fill
                className="object-cover"
              />
              <Badge className={`absolute top-4 left-4 ${getStatusColor(destination.status)}`}>
                {destination.status === "active" ? "Aktif" : "Tidak Aktif"}
              </Badge>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{destination.rating}</span>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{destination.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {destination.category}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-green-600">{destination.price}</p>
              </div>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{destination.description}</p>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Eye className="h-4 w-4 mr-1" />
                {destination.visitors} pengunjung
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  Lihat
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEditDestination(destination)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDeleteDestination(destination.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingDestination} onOpenChange={() => setEditingDestination(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Destinasi</DialogTitle>
            <DialogDescription>Update informasi destinasi wisata</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Destinasi</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Wisata Alam">Wisata Alam</SelectItem>
                  <SelectItem value="Pendakian">Pendakian</SelectItem>
                  <SelectItem value="Camping">Camping</SelectItem>
                  <SelectItem value="Spot Foto">Spot Foto</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="space-y-2">
              <Label htmlFor="edit-price">Harga</Label>
              <Input
                id="edit-price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-difficulty">Tingkat Kesulitan</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mudah">Mudah</SelectItem>
                  <SelectItem value="Sedang">Sedang</SelectItem>
                  <SelectItem value="Menantang">Menantang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setEditingDestination(null)}>
              Batal
            </Button>
            <Button onClick={handleUpdateDestination}>Update</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
