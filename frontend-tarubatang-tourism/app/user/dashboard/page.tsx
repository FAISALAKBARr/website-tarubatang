"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mountain, MapPin, Calendar, Star, Camera, User, LogOut, Bell, Bookmark, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import UserBookmarks from "@/components/user/user-bookmarks"
import UserReviews from "@/components/user/user-reviews"
import UserProfile from "@/components/user/user-profile"
import UserTrips from "@/components/user/user-trips"

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null)
  const [userStats, setUserStats] = useState({
    bookmarkedDestinations: 5,
    reviewsWritten: 3,
    tripsPlanned: 2,
    photosUploaded: 12,
  })
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/auth/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
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
              <Link href="/" className="flex items-center space-x-2">
                <Mountain className="h-8 w-8 text-green-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Dashboard Saya</h1>
                  <p className="text-sm text-gray-600">Desa Tarubatang</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">Wisatawan</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Selamat datang, {user.name}!</h2>
                  <p className="text-green-100">
                    Jelajahi keindahan Desa Tarubatang dan rencanakan petualangan Anda berikutnya.
                  </p>
                </div>
                <div className="hidden md:block">
                  <Mountain className="h-16 w-16 text-green-200" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Destinasi Favorit</p>
                  <p className="text-3xl font-bold text-gray-900">{userStats.bookmarkedDestinations}</p>
                </div>
                <Bookmark className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2">
                <Button variant="ghost" size="sm" className="text-xs p-0 h-auto">
                  Lihat semua →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Review Ditulis</p>
                  <p className="text-3xl font-bold text-gray-900">{userStats.reviewsWritten}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="mt-2">
                <Button variant="ghost" size="sm" className="text-xs p-0 h-auto">
                  Tulis review →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trip Direncanakan</p>
                  <p className="text-3xl font-bold text-gray-900">{userStats.tripsPlanned}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2">
                <Button variant="ghost" size="sm" className="text-xs p-0 h-auto">
                  Rencanakan trip →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Foto Dibagikan</p>
                  <p className="text-3xl font-bold text-gray-900">{userStats.photosUploaded}</p>
                </div>
                <Camera className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-2">
                <Button variant="ghost" size="sm" className="text-xs p-0 h-auto">
                  Upload foto →
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <MapPin className="h-6 w-6" />
              <span className="text-sm">Jelajahi Destinasi</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Rencanakan Trip</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Camera className="h-6 w-6" />
              <span className="text-sm">Upload Foto</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <MessageSquare className="h-6 w-6" />
              <span className="text-sm">Tulis Review</span>
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="bookmarks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookmarks" className="flex items-center space-x-2">
              <Bookmark className="h-4 w-4" />
              <span>Favorit</span>
            </TabsTrigger>
            <TabsTrigger value="trips" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Trip Saya</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>Review</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profil</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookmarks">
            <UserBookmarks />
          </TabsContent>

          <TabsContent value="trips">
            <UserTrips />
          </TabsContent>

          <TabsContent value="reviews">
            <UserReviews />
          </TabsContent>

          <TabsContent value="profile">
            <UserProfile user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
