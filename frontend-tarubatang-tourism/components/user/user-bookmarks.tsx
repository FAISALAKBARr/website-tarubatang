"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Star, Trash2, ExternalLink } from "lucide-react"
import Image from "next/image"

const mockBookmarks = [
  {
    id: 1,
    name: "Air Terjun Sekumpul",
    category: "Wisata Alam",
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.8,
    price: "Rp 10.000",
    distance: "2 km dari pusat desa",
    bookmarkedAt: "2024-05-15",
  },
  {
    id: 2,
    name: "Camping Ground Sunrise",
    category: "Camping",
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.7,
    price: "Rp 15.000/malam",
    distance: "3 km dari pusat desa",
    bookmarkedAt: "2024-05-20",
  },
  {
    id: 3,
    name: "Spot Foto Panorama",
    category: "Spot Foto",
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.9,
    price: "Gratis",
    distance: "4 km dari pusat desa",
    bookmarkedAt: "2024-05-25",
  },
]

export default function UserBookmarks() {
  const [bookmarks, setBookmarks] = useState(mockBookmarks)

  const handleRemoveBookmark = (id: number) => {
    setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Destinasi Favorit Saya</h3>
        <p className="text-gray-600">Destinasi wisata yang telah Anda bookmark untuk dikunjungi nanti</p>
      </div>

      {bookmarks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada destinasi favorit</h3>
            <p className="text-gray-600 mb-4">Mulai jelajahi destinasi wisata dan tambahkan ke favorit Anda</p>
            <Button>Jelajahi Destinasi</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bookmark) => (
            <Card key={bookmark.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image src={bookmark.image || "/placeholder.svg"} alt={bookmark.name} fill className="object-cover" />
                <Badge className="absolute top-4 left-4 bg-green-500">{bookmark.category}</Badge>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{bookmark.rating}</span>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute bottom-4 right-4 h-8 w-8 p-0"
                  onClick={() => handleRemoveBookmark(bookmark.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{bookmark.name}</h3>
                  <p className="text-sm font-medium text-green-600">{bookmark.price}</p>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  {bookmark.distance}
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  Disimpan pada {new Date(bookmark.bookmarkedAt).toLocaleDateString("id-ID")}
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Lihat Detail
                  </Button>
                  <Button size="sm" variant="outline">
                    Petunjuk Arah
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
