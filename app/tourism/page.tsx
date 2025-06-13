"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Users, Star, Camera, Mountain, TreePine, Tent } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import GoogleMapsComponent from "@/components/google-maps"

const destinations = [
  {
    id: 1,
    name: "Air Terjun Sekumpul",
    category: "Wisata Alam",
    image: "/placeholder.svg?height=300&width=400",
    description:
      "Air terjun spektakuler setinggi 25 meter dengan kolam alami yang jernih dan segar. Dikelilingi oleh hutan tropis yang asri, tempat ini menjadi favorit wisatawan untuk berenang dan bersantai.",
    features: ["Kolam Renang Alami", "Area Piknik", "Spot Foto Instagramable"],
    distance: "2 km dari pusat desa",
    duration: "30 menit jalan kaki",
    difficulty: "Mudah",
    rating: 4.8,
    price: "Rp 10.000",
    coordinates: { lat: -7.4167, lng: 110.4833 },
  },
  {
    id: 2,
    name: "Basecamp Pendakian Merbabu",
    category: "Pendakian",
    image: "/placeholder.svg?height=300&width=400",
    description:
      "Basecamp resmi pendakian Gunung Merbabu via jalur Tarubatang. Dilengkapi dengan fasilitas lengkap termasuk tempat istirahat, warung makan, dan pemandu berpengalaman.",
    features: ["Pemandu Profesional", "Penyewaan Alat", "Warung Makan", "Area Parkir"],
    distance: "1 km dari pusat desa",
    duration: "15 menit jalan kaki",
    difficulty: "Menantang",
    rating: 4.9,
    price: "Rp 25.000",
    coordinates: { lat: -7.415, lng: 110.485 },
  },
  {
    id: 3,
    name: "Camping Ground Sunrise",
    category: "Camping",
    image: "/placeholder.svg?height=300&width=400",
    description:
      "Area camping terbaik dengan pemandangan sunrise yang menakjubkan. Dilengkapi fasilitas toilet, tempat cuci, dan warung makan untuk kenyamanan berkemah.",
    features: ["View Sunrise Terbaik", "Toilet & MCK", "Warung Makan", "Area Api Unggun"],
    distance: "3 km dari pusat desa",
    duration: "45 menit jalan kaki",
    difficulty: "Sedang",
    rating: 4.7,
    price: "Rp 15.000/malam",
    coordinates: { lat: -7.418, lng: 110.482 },
  },
  {
    id: 4,
    name: "Hutan Pinus Tarubatang",
    category: "Wisata Alam",
    image: "/placeholder.svg?height=300&width=400",
    description:
      "Hutan pinus yang sejuk dengan jalur trekking yang tertata rapi. Udara segar dan pemandangan yang indah menjadikan tempat ini perfect untuk healing dan foto-foto.",
    features: ["Jalur Trekking", "Spot Foto Aesthetic", "Udara Sejuk", "Hammock Area"],
    distance: "2.5 km dari pusat desa",
    duration: "40 menit jalan kaki",
    difficulty: "Mudah",
    rating: 4.6,
    price: "Rp 5.000",
    coordinates: { lat: -7.42, lng: 110.48 },
  },
  {
    id: 5,
    name: "Sungai Jernih Merbabu",
    category: "Wisata Alam",
    image: "/placeholder.svg?height=300&width=400",
    description:
      "Sungai dengan air yang sangat jernih dan segar langsung dari mata air Gunung Merbabu. Tempat yang sempurna untuk refreshing dan bermain air.",
    features: ["Air Jernih & Segar", "Area Bermain Air", "Spot Foto", "Gazebo Istirahat"],
    distance: "1.5 km dari pusat desa",
    duration: "25 menit jalan kaki",
    difficulty: "Mudah",
    rating: 4.5,
    price: "Gratis",
    coordinates: { lat: -7.419, lng: 110.487 },
  },
  {
    id: 6,
    name: "Spot Foto Panorama",
    category: "Spot Foto",
    image: "/placeholder.svg?height=300&width=400",
    description:
      "Spot foto terbaik dengan panorama 360 derajat pemandangan pegunungan. Tempat favorit untuk menikmati sunset dan mengabadikan momen indah.",
    features: ["View 360 Derajat", "Sunset Point", "Spot Foto Terbaik", "Bangku Santai"],
    distance: "4 km dari pusat desa",
    duration: "1 jam jalan kaki",
    difficulty: "Sedang",
    rating: 4.9,
    price: "Gratis",
    coordinates: { lat: -7.414, lng: 110.488 },
  },
]

export default function TourismPage() {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Mudah":
        return "bg-green-100 text-green-800"
      case "Sedang":
        return "bg-yellow-100 text-yellow-800"
      case "Menantang":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Wisata Alam":
        return TreePine
      case "Pendakian":
        return Mountain
      case "Camping":
        return Tent
      case "Spot Foto":
        return Camera
      default:
        return MapPin
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative h-[400px] bg-gradient-to-r from-green-800 to-green-600">
        <div className="absolute inset-0 bg-black/40"></div>
        <Image
          src="/placeholder.svg?height=400&width=1200"
          alt="Destinasi Wisata Tarubatang"
          fill
          className="object-cover"
        />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-4">Destinasi Wisata Tarubatang</h1>
            <p className="text-xl text-green-100 max-w-2xl">
              Jelajahi keindahan alam yang menakjubkan di kaki Gunung Merbabu dengan berbagai destinasi wisata yang
              memikat hati
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Peta Lokasi Wisata</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Temukan lokasi semua destinasi wisata di Desa Tarubatang dengan peta interaktif di bawah ini
            </p>
          </div>
          <GoogleMapsComponent />
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Semua Destinasi Wisata</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pilih destinasi yang sesuai dengan minat dan kemampuan Anda
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {destinations.map((destination) => {
              const IconComponent = getCategoryIcon(destination.category)
              return (
                <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="md:flex">
                    <div className="md:w-1/2 relative h-64 md:h-auto">
                      <Image
                        src={destination.image || "/placeholder.svg"}
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

                    <div className="md:w-1/2 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-5 w-5 text-green-600" />
                          <h3 className="text-xl font-semibold">{destination.name}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{destination.price}</p>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">{destination.description}</p>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-2" />
                          {destination.distance}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-2" />
                          {destination.duration}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getDifficultyColor(destination.difficulty)}>{destination.difficulty}</Badge>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2">Fasilitas:</h4>
                        <div className="flex flex-wrap gap-1">
                          {destination.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.coordinates.lat},${destination.coordinates.lng}`
                            window.open(url, "_blank")
                          }}
                        >
                          Petunjuk Arah
                        </Button>
                        <Button size="sm" variant="outline">
                          Detail
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Tips Berwisata</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Panduan penting untuk pengalaman wisata yang aman dan menyenangkan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="h-5 w-5 mr-2 text-green-600" />
                  Waktu Terbaik
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Pagi hari (06:00-10:00) untuk sunrise</li>
                  <li>• Sore hari (15:00-18:00) untuk sunset</li>
                  <li>• Hindari musim hujan (Nov-Mar)</li>
                  <li>• Weekend lebih ramai pengunjung</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Persiapan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Bawa jaket (suhu dingin di malam hari)</li>
                  <li>• Sepatu trekking yang nyaman</li>
                  <li>• Air minum dan snack secukupnya</li>
                  <li>• Power bank untuk dokumentasi</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TreePine className="h-5 w-5 mr-2 text-green-600" />
                  Etika Wisata
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Jaga kebersihan lingkungan</li>
                  <li>• Tidak merusak tanaman/fasilitas</li>
                  <li>• Hormati budaya lokal</li>
                  <li>• Gunakan jasa pemandu lokal</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Siap Menjelajahi Tarubatang?</h2>
          <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
            Hubungi kami untuk informasi lebih lanjut atau bantuan perencanaan perjalanan wisata Anda
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Hubungi Pemandu Wisata
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-green-600">
              Lihat Paket Wisata
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
