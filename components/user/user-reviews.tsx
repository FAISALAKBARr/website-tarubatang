"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Star, Edit, Trash2, Plus } from "lucide-react"
import Image from "next/image"

const mockReviews = [
  {
    id: 1,
    destinationName: "Air Terjun Sekumpul",
    destinationImage: "/placeholder.svg?height=100&width=100",
    rating: 5,
    review:
      "Tempat yang sangat indah! Air terjunnya jernih dan suasananya sangat menenangkan. Cocok untuk refreshing bersama keluarga.",
    date: "2024-05-20",
    helpful: 12,
  },
  {
    id: 2,
    destinationName: "Camping Ground Sunrise",
    destinationImage: "/placeholder.svg?height=100&width=100",
    rating: 4,
    review:
      "View sunrise-nya memang luar biasa. Fasilitas cukup lengkap, tapi akses jalan masih agak sulit untuk kendaraan roda empat.",
    date: "2024-05-15",
    helpful: 8,
  },
  {
    id: 3,
    destinationName: "Hutan Pinus Tarubatang",
    destinationImage: "/placeholder.svg?height=100&width=100",
    rating: 5,
    review: "Spot foto yang instagramable banget! Udaranya sejuk dan banyak tempat untuk bersantai. Recommended!",
    date: "2024-05-10",
    helpful: 15,
  },
]

export default function UserReviews() {
  const [reviews, setReviews] = useState(mockReviews)
  const [editingReview, setEditingReview] = useState<any>(null)
  const [editText, setEditText] = useState("")
  const [editRating, setEditRating] = useState(5)

  const handleEditReview = (review: any) => {
    setEditingReview(review)
    setEditText(review.review)
    setEditRating(review.rating)
  }

  const handleSaveEdit = () => {
    setReviews(
      reviews.map((review) =>
        review.id === editingReview.id ? { ...review, review: editText, rating: editRating } : review,
      ),
    )
    setEditingReview(null)
    setEditText("")
    setEditRating(5)
  }

  const handleDeleteReview = (id: number) => {
    setReviews(reviews.filter((review) => review.id !== id))
  }

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"
            } ${interactive ? "cursor-pointer" : ""}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2">Review Saya</h3>
          <p className="text-gray-600">Review yang telah Anda tulis untuk destinasi wisata</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tulis Review Baru
        </Button>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada review</h3>
            <p className="text-gray-600 mb-4">
              Bagikan pengalaman Anda dengan menulis review untuk destinasi yang telah dikunjungi
            </p>
            <Button>Tulis Review Pertama</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                {editingReview?.id === review.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Image
                        src={review.destinationImage || "/placeholder.svg"}
                        alt={review.destinationName}
                        width={60}
                        height={60}
                        className="rounded-lg"
                      />
                      <div>
                        <h4 className="font-semibold">{review.destinationName}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-600">Rating:</span>
                          {renderStars(editRating, true, setEditRating)}
                        </div>
                      </div>
                    </div>
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      placeholder="Tulis review Anda..."
                      rows={4}
                    />
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleSaveEdit}>
                        Simpan
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingReview(null)}>
                        Batal
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <Image
                          src={review.destinationImage || "/placeholder.svg"}
                          alt={review.destinationName}
                          width={60}
                          height={60}
                          className="rounded-lg"
                        />
                        <div>
                          <h4 className="font-semibold">{review.destinationName}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-600">
                              {new Date(review.date).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditReview(review)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteReview(review.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{review.review}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {review.helpful} orang merasa review ini membantu
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
