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
import { Plus, Edit, Trash2, Calendar, Users, MapPin } from "lucide-react"

const mockEvents = [
  {
    id: 1,
    name: "Merbabu De Trail 2024",
    date: "2024-08-15",
    time: "06:00",
    location: "Basecamp Tarubatang",
    description: "Event trail running tahunan dengan rute menantang di sekitar Gunung Merbabu",
    participants: 450,
    maxParticipants: 500,
    status: "upcoming",
    category: "Olahraga",
  },
  {
    id: 2,
    name: "Festival Panen Raya",
    date: "2024-04-20",
    time: "08:00",
    location: "Balai Desa Tarubatang",
    description: "Perayaan hasil panen dengan pertunjukan seni budaya dan kuliner tradisional",
    participants: 200,
    maxParticipants: 300,
    status: "completed",
    category: "Budaya",
  },
  {
    id: 3,
    name: "Gotong Royong Desa",
    date: "2024-07-10",
    time: "07:00",
    location: "Seluruh Desa",
    description: "Kegiatan bersih-bersih dan perawatan fasilitas wisata bersama masyarakat",
    participants: 80,
    maxParticipants: 100,
    status: "ongoing",
    category: "Sosial",
  },
]

export default function AdminEvents() {
  const [events, setEvents] = useState(mockEvents)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    location: "",
    description: "",
    maxParticipants: "",
    category: "",
  })

  const handleAddEvent = () => {
    const newEvent = {
      id: events.length + 1,
      ...formData,
      participants: 0,
      status: "upcoming",
      maxParticipants: Number.parseInt(formData.maxParticipants),
    }
    setEvents([...events, newEvent])
    setFormData({
      name: "",
      date: "",
      time: "",
      location: "",
      description: "",
      maxParticipants: "",
      category: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleEditEvent = (event: any) => {
    setEditingEvent(event)
    setFormData({
      name: event.name,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      maxParticipants: event.maxParticipants.toString(),
      category: event.category,
    })
  }

  const handleUpdateEvent = () => {
    setEvents(
      events.map((event) =>
        event.id === editingEvent.id
          ? { ...event, ...formData, maxParticipants: Number.parseInt(formData.maxParticipants) }
          : event,
      ),
    )
    setEditingEvent(null)
    setFormData({
      name: "",
      date: "",
      time: "",
      location: "",
      description: "",
      maxParticipants: "",
      category: "",
    })
  }

  const handleDeleteEvent = (id: number) => {
    setEvents(events.filter((event) => event.id !== id))
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kelola Event & Acara</h2>
          <p className="text-gray-600">Tambah, edit, dan kelola event di Desa Tarubatang</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
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
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Waktu</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Masukkan deskripsi event"
                  rows={3}
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
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Olahraga, Budaya, Sosial"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddEvent}>Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold">{event.name}</h3>
                    <Badge className={getStatusColor(event.status)}>{getStatusText(event.status)}</Badge>
                    <Badge variant="secondary">{event.category}</Badge>
                  </div>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        {new Date(event.date).toLocaleDateString("id-ID")} - {event.time}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>
                        {event.participants}/{event.maxParticipants} peserta
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button size="sm" variant="outline" onClick={() => handleEditEvent(event)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteEvent(event.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
        <DialogContent className="max-w-2xl">
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
              <Label htmlFor="edit-date">Tanggal</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-time">Waktu</Label>
              <Input
                id="edit-time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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
              <Label htmlFor="edit-maxParticipants">Maksimal Peserta</Label>
              <Input
                id="edit-maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Kategori</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setEditingEvent(null)}>
              Batal
            </Button>
            <Button onClick={handleUpdateEvent}>Update</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
