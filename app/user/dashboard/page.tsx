"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sprout, BarChart3, Calendar, Store, User, LogOut, Bell, PlusCircle, Tractor, CloudRain } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import UserHarvests from "@/components/user/user-harvests"
import UserMarket from "@/components/user/user-market"
import UserProfile from "@/components/user/user-profile"
import UserPlanning from "@/components/user/user-planning"

export default function VillagerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [userStats, setUserStats] = useState({
    currentHarvests: 3,
    totalYield: 1250, // in kg
    plannedPlantings: 2,
    marketListings: 5,
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
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Selamat datang, {user.name}!</h2>
                  <p className="text-green-100">
                    Kelola hasil panen dan pantau perkembangan pertanian Anda di Desa Tarubatang.
                  </p>
                </div>
                <div className="hidden md:block">
                  <Sprout className="h-16 w-16 text-green-200" />
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
                  <p className="text-sm font-medium text-gray-600">Panen Aktif</p>
                  <p className="text-3xl font-bold text-gray-900">{userStats.currentHarvests}</p>
                </div>
                <Sprout className="h-8 w-8 text-green-600" />
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
                  <p className="text-sm font-medium text-gray-600">Total Hasil (kg)</p>
                  <p className="text-3xl font-bold text-gray-900">{userStats.totalYield}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="mt-2">
                <Button variant="ghost" size="sm" className="text-xs p-0 h-auto">
                  Lihat statistik →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rencana Tanam</p>
                  <p className="text-3xl font-bold text-gray-900">{userStats.plannedPlantings}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2">
                <Button variant="ghost" size="sm" className="text-xs p-0 h-auto">
                  Tambah rencana →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Produk di Pasar</p>
                  <p className="text-3xl font-bold text-gray-900">{userStats.marketListings}</p>
                </div>
                <Store className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-2">
                <Button variant="ghost" size="sm" className="text-xs p-0 h-auto">
                  Kelola produk →
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
              <PlusCircle className="h-6 w-6" />
              <span className="text-sm">Catat Panen Baru</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Store className="h-6 w-6" />
              <span className="text-sm">Jual ke Pasar</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Tractor className="h-6 w-6" />
              <span className="text-sm">Peralatan</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <CloudRain className="h-6 w-6" />
              <span className="text-sm">Prakiraan Cuaca</span>
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="harvests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="harvests" className="flex items-center space-x-2">
              <Sprout className="h-4 w-4" />
              <span>Hasil Panen</span>
            </TabsTrigger>
            <TabsTrigger value="planning" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Perencanaan</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center space-x-2">
              <Store className="h-4 w-4" />
              <span>Pasar</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profil</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="harvests">
            <UserHarvests />
          </TabsContent>

          <TabsContent value="planning">
            <UserPlanning />
          </TabsContent>

          <TabsContent value="market">
            <UserMarket />
          </TabsContent>

          <TabsContent value="profile">
            <UserProfile user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
