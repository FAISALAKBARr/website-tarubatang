"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, MapPin, Calendar, Star } from "lucide-react"

export default function AdminAnalytics() {
  const analyticsData = {
    visitors: {
      total: 2847,
      growth: 12.5,
      trend: "up",
    },
    destinations: {
      mostVisited: "Air Terjun Sekumpul",
      visits: 1250,
      growth: 8.3,
    },
    events: {
      upcoming: 3,
      thisMonth: 2,
      participants: 450,
    },
    reviews: {
      average: 4.7,
      total: 156,
      thisMonth: 23,
    },
  }

  const monthlyVisitors = [
    { month: "Jan", visitors: 1200 },
    { month: "Feb", visitors: 1450 },
    { month: "Mar", visitors: 1800 },
    { month: "Apr", visitors: 2100 },
    { month: "May", visitors: 2400 },
    { month: "Jun", visitors: 2847 },
  ]

  const topDestinations = [
    { name: "Air Terjun Sekumpul", visits: 1250, rating: 4.8 },
    { name: "Basecamp Pendakian Merbabu", visits: 890, rating: 4.9 },
    { name: "Camping Ground Sunrise", visits: 650, rating: 4.7 },
    { name: "Hutan Pinus Tarubatang", visits: 520, rating: 4.6 },
    { name: "Spot Foto Panorama", visits: 480, rating: 4.9 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Analytics & Statistik</h2>
        <p className="text-gray-600">Pantau performa website dan aktivitas wisata</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pengunjung Bulanan</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.visitors.total.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                +{analyticsData.visitors.growth}% dari bulan lalu
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Destinasi Terpopuler</p>
                <p className="text-lg font-bold text-gray-900">{analyticsData.destinations.mostVisited}</p>
              </div>
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-600">{analyticsData.destinations.visits.toLocaleString()} kunjungan</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+{analyticsData.destinations.growth}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Event Mendatang</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.events.upcoming}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-600">{analyticsData.events.participants} total peserta</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating Rata-rata</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.reviews.average}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-600">{analyticsData.reviews.total} total review</p>
              <p className="text-sm text-green-600">+{analyticsData.reviews.thisMonth} bulan ini</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visitor Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Pengunjung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyVisitors.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{data.month}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(data.visitors / Math.max(...monthlyVisitors.map((m) => m.visitors))) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-16 text-right">{data.visitors.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Destinations */}
        <Card>
          <CardHeader>
            <CardTitle>Destinasi Terpopuler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDestinations.map((destination, index) => (
                <div key={destination.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{destination.name}</p>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600">{destination.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{destination.visits.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">kunjungan</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Review baru untuk Air Terjun Sekumpul</p>
                <p className="text-xs text-gray-600">Ahmad Wijaya memberikan rating 5 bintang - 2 jam yang lalu</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Pendaftaran event Merbabu De Trail</p>
                <p className="text-xs text-gray-600">15 peserta baru mendaftar - 4 jam yang lalu</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">User baru bergabung</p>
                <p className="text-xs text-gray-600">Siti Nurhaliza mendaftar sebagai user - 6 jam yang lalu</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Destinasi baru ditambahkan</p>
                <p className="text-xs text-gray-600">Spot Foto Panorama telah dipublikasikan - 1 hari yang lalu</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
