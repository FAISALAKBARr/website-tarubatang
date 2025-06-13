"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock, Plus, Edit, Trash2 } from "lucide-react"

const mockTrips = [
  {
    id: 1,
    name: "Weekend Camping di Merbabu",
    date: "2024-07-15",
    endDate: "2024-07-17",
    destinations: ["Camping Ground Sunrise", "Air Terjun Sekumpul"],
    participants: 4,
    status: "upcoming",
    notes: "Trip bersama keluarga untuk menikmati sunrise dan air terjun",
  },
  {
    id: 2,
    name: "Pendakian Gunung Merbabu",
    date: "2024-08-20",
    endDate: "2024-08-22",
    destinations: ["Basecamp Pendakian Merbabu", "Puncak Merbabu"],
    participants: 6,
    status: "planned",
    notes: "Pendakian bersama teman-teman komunitas hiking",
  },
  {
    id: 3,
    name: "Foto Hunting Tarubatang",
    date: "2024-05-10",
    endDate: "2024-05-10",
    destinations: ["Hutan Pinus Tarubatang", "Spot Foto Panorama"],
    participants: 2,
    status: "completed",
    notes: "Hunting foto untuk konten Instagram",
  },
]

export default function UserTrips() {
  const [trips, setTrips] = useState(mockTrips)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "planned":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Akan Datang"
      case "planned":
        return "Direncanakan"
      case "completed":
        return "Selesai"
      case "cancelled":
        return "Dibatalkan"
      default:
        return "Unknown"
    }
  }

  const handleDeleteTrip = (id: number) => {
    setTrips(trips.filter((trip) => trip.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2">Trip Saya</h3>
          <p className="text-gray-600">Kelola rencana perjalanan wisata Anda</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Rencanakan Trip Baru
        </Button>
      </div>

      {trips.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada trip yang direncanakan</h3>
            <p className="text-gray-600 mb-4">
              Mulai rencanakan perjalanan wisata Anda ke destinasi-destinasi menarik di Tarubatang
            </p>
            <Button>Rencanakan Trip Pertama</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <Card key={trip.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold">{trip.name}</h3>
                      <Badge className={getStatusColor(trip.status)}>{getStatusText(trip.status)}</Badge>
                    </div>
                    <p className="text-gray-600 mb-4">{trip.notes}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteTrip(trip.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{new Date(trip.date).toLocaleDateString("id-ID")}</p>
                      {trip.endDate !== trip.date && (
                        <p className="text-xs text-gray-500">
                          s/d {new Date(trip.endDate).toLocaleDateString("id-ID")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{trip.participants} orang</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{trip.destinations.length} destinasi</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {trip.endDate === trip.date
                        ? "1 hari"
                        : `${Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.date).getTime()) / (1000 * 60 * 60 * 24)) + 1} hari`}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Destinasi yang akan dikunjungi:</h4>
                  <div className="flex flex-wrap gap-2">
                    {trip.destinations.map((destination, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {destination}
                      </Badge>
                    ))}
                  </div>
                </div>

                {trip.status === "upcoming" && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button size="sm">Lihat Detail</Button>
                      <Button size="sm" variant="outline">
                        Edit Rencana
                      </Button>
                      <Button size="sm" variant="outline">
                        Bagikan
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {trips.filter((t) => t.status === "upcoming").length}
            </div>
            <p className="text-sm text-gray-600">Trip Mendatang</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {trips.filter((t) => t.status === "planned").length}
            </div>
            <p className="text-sm text-gray-600">Sedang Direncanakan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {trips.filter((t) => t.status === "completed").length}
            </div>
            <p className="text-sm text-gray-600">Trip Selesai</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
