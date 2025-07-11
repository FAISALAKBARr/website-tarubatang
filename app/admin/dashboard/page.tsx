"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mountain, Users, MapPin, Calendar, BarChart3, LogOut, Bell, Search, MessageSquare, Store, Image } from "lucide-react"
import Link from "next/link"

import AdminDestinations from "@/components/admin/admin-destinations"
import AdminEvents from "@/components/admin/admin-events"
import AdminUsers from "@/components/admin/admin-users"
import AdminAnalytics from "@/components/admin/admin-analytics"
import AdminUMKM from '@/components/admin/admin-umkm'

export default function AdminDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'destinations'

  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalDestinations: 8,
    totalUsers: 156,
    totalEvents: 12,
    monthlyVisitors: 2847,
  })
  const [activeTab, setActiveTab] = useState(defaultTab)

  useEffect(() => {
    // Check if user is logged in and is admin
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/auth/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "admin") {
      router.push("/")
      return
    }

    setUser(parsedUser)
  }, [router])

  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('changeAdminTab', handleTabChange as EventListener);

    return () => {
      window.removeEventListener('changeAdminTab', handleTabChange as EventListener);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Destinasi</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalDestinations}</p>
                </div>
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  +2 bulan ini
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  +23 minggu ini
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  +1 bulan ini
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pengunjung Bulanan</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.monthlyVisitors.toLocaleString()}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <div className="mt-2">
                <Badge className="text-xs bg-green-100 text-green-800">+12% dari bulan lalu</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs 
          value={activeTab} 
          className="space-y-6"
          onValueChange={handleTabChange}
        >
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="destinations" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Destinasi</span>
            </TabsTrigger>
            <TabsTrigger value="umkm" className="flex items-center space-x-2">
              <Store className="h-4 w-4" />
              <span>UMKM</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </TabsTrigger>
            <TabsTrigger value="destinations" className="flex items-center space-x-2">
              <Image className="h-4 w-4" />
              <span>Galeri</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="message" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Pesan</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="destinations">
            <AdminDestinations />
          </TabsContent>

          <TabsContent value="umkm">
            <AdminUMKM />
          </TabsContent>

          <TabsContent value="events">
            <AdminEvents />
          </TabsContent>

          <TabsContent value="galeri">
            <AdminDestinations />
          </TabsContent>
          
          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>
          
          <TabsContent value="message">
            <AdminAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
