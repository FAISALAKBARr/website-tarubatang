"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mountain,
  Users,
  MapPin,
  Calendar,
  BarChart3,
  LogOut,
  Bell,
  Search,
  MessageSquare,
  Store,
  Image,
  TrendingUp,
  Activity,
  Eye,
  Settings,
  Home,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

import AdminDestinations from "@/components/admin/admin-destinations";
import AdminEvents from "@/components/admin/admin-events";
import AdminGallery from "@/components/admin/admin-gallery";
import AdminUsers from "@/components/admin/admin-users";
import AdminUMKM from "@/components/admin/admin-umkm";
import AdminBasecamp from "@/components/admin/admin-basecamp";
import ComprehensiveAnalytics from "@/components/admin/admin-analytics";

// Add the interfaces that ComprehensiveAnalytics expects
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
}

interface Destination {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  location: string;
  images: string[];
  rating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Event {
  id: string;
  name: string;
  category: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  maxParticipants?: number;
  currentParticipants: number;
  price?: string;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UMKM {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  stock?: number;
  images: string[];
  contact: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

interface Basecamp {
  id: string;
  namaBasecamp: string;
  fasilitas: string[];
  dayaTampungKendaraan: number;
  dayaTampungOrang: number;
  nomorWa: string;
  images: string[];
  lokasi: string;
  pemilik: string;
  menuMakanan: string[];
  menuMinuman: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Gallery {
  id: string;
  title: string;
  category: string;
  images: string[];
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AnalyticsData {
  destinations: Destination[];
  events: Event[];
  umkm: UMKM[];
  basecamps: Basecamp[];
  galleries: Gallery[];
  users: User[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "destinations";

  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalDestinations: 8,
    totalUsers: 156,
    totalEvents: 12,
    monthlyVisitors: 2847,
  });
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Add analytics data state with proper initialization
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    destinations: [],
    events: [],
    umkm: [],
    basecamps: [],
    galleries: [],
    users: [],
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Check if user is logged in and is admin
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/auth/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      router.push("/");
      return;
    }

    setUser(parsedUser);
  }, [router]);

  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };

    window.addEventListener("changeAdminTab", handleTabChange as EventListener);

    return () => {
      window.removeEventListener(
        "changeAdminTab",
        handleTabChange as EventListener
      );
    };
  }, []);

  // Function to load analytics data
  const loadAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      // This is where you would fetch real data from your API
      // For now, using mock data that matches the expected structure
      const mockData: AnalyticsData = {
        destinations: [
          {
            id: "1",
            name: "Gunung Tarubatang",
            category: "Gunung",
            description: "Destinasi hiking populer",
            price: "Gratis",
            location: "Desa Tarubatang",
            images: ["image1.jpg"],
            rating: 4.5,
            totalReviews: 45,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          // Add more mock destinations as needed
        ],
        events: [
          {
            id: "1",
            name: "Festival Desa",
            category: "Budaya",
            description: "Festival tahunan desa",
            date: new Date().toISOString(),
            location: "Balai Desa",
            currentParticipants: 150,
            maxParticipants: 200,
            images: ["event1.jpg"],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          // Add more mock events as needed
        ],
        umkm: [
          {
            id: "1",
            name: "Kerajinan Bambu",
            category: "Kerajinan",
            description: "Produk kerajinan bambu lokal",
            price: "50000",
            stock: 20,
            images: ["umkm1.jpg"],
            contact: "081234567890",
            location: "RT 01 RW 02",
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          // Add more mock UMKM as needed
        ],
        basecamps: [
          {
            id: "1",
            namaBasecamp: "Basecamp Gunung",
            fasilitas: ["Parkir", "Toilet", "Warung"],
            dayaTampungKendaraan: 50,
            dayaTampungOrang: 100,
            nomorWa: "081234567890",
            images: ["basecamp1.jpg"],
            lokasi: "Kaki Gunung Tarubatang",
            pemilik: "Pak Sardi",
            menuMakanan: ["Nasi Gudeg", "Soto"],
            menuMinuman: ["Teh", "Kopi"],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          // Add more mock basecamps as needed
        ],
        galleries: [
          {
            id: "1",
            title: "Pemandangan Desa",
            category: "Landscape",
            images: ["gallery1.jpg", "gallery2.jpg"],
            description: "Koleksi foto pemandangan desa",
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          // Add more mock galleries as needed
        ],
        users: [
          {
            id: "1",
            name: "Admin User",
            email: "admin@example.com",
            role: "ADMIN",
            status: "ACTIVE",
            createdAt: new Date().toISOString(),
          },
          // Add more mock users as needed
        ],
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAnalyticsData(mockData);
    } catch (error) {
      console.error("Error loading analytics data:", error);
      // Keep the empty state on error
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Load analytics data when component mounts or when analytics tab is selected
  useEffect(() => {
    if (activeTab === "analytics") {
      loadAnalyticsData();
    }
  }, [activeTab]);

  // Update fungsi handleLogout
  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      try {
        // Clear local storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Reset states
        setUser(null);
        setStats({
          totalDestinations: 0,
          totalUsers: 0,
          totalEvents: 0,
          monthlyVisitors: 0,
        });

        // Dispatch storage event untuk update header
        window.dispatchEvent(
          new CustomEvent("authChange", {
            detail: { action: "logout" },
          })
        );

        // Tunggu sebentar sebelum redirect
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Redirect ke login page
        router.replace("/auth/login");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const refreshStats = async () => {
    setIsRefreshing(true);
    try {
      // Simulated API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Update stats here
      if (activeTab === "analytics") {
        await loadAnalyticsData();
      }
    } catch (error) {
      console.error("Error refreshing stats:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshAnalytics = () => {
    loadAnalyticsData();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Memuat dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mountain className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm text-gray-500">
                    Desa Tarubatang Management
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  Selamat datang, {user.name}
                </p>
                <p className="text-xs text-gray-500">
                  {currentTime.toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={refreshStats}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/")} // Gunakan window.location.href
              >
                <Home className="h-4 w-4 mr-2" />
                Lihat Website
              </Button>

              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Welcome Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Selamat datang kembali, {user.name}! 👋
              </h2>
              <p className="text-green-100">
                Kelola website Desa Tarubatang dengan mudah dari dashboard ini
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="p-4 bg-white/20 rounded-lg backdrop-blur-sm">
                <Activity className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Total Destinasi
                <MapPin className="h-5 w-5 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalDestinations}
                </p>
                <div className="text-right">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-green-100 text-green-800"
                  >
                    +2 bulan ini
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">↗ 25% naik</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Total Users
                <Users className="h-5 w-5 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalUsers}
                </p>
                <div className="text-right">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-blue-100 text-blue-800"
                  >
                    +23 minggu ini
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">↗ 15% naik</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Total Events
                <Calendar className="h-5 w-5 text-purple-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalEvents}
                </p>
                <div className="text-right">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-purple-100 text-purple-800"
                  >
                    +1 bulan ini
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">↗ 8% naik</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                Pengunjung Bulanan
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-gray-900">
                  {stats.monthlyVisitors.toLocaleString()}
                </p>
                <div className="text-right">
                  <Badge className="text-xs bg-green-100 text-green-800">
                    +12% dari bulan lalu
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">↗ Trending naik</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-16 flex-col space-y-2"
              onClick={() => setActiveTab("destinations")}
            >
              <MapPin className="h-5 w-5" />
              <span className="text-sm">Tambah Destinasi</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col space-y-2"
              onClick={() => setActiveTab("events")}
            >
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Buat Event</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col space-y-2"
              onClick={() => setActiveTab("gallery")}
            >
              <Image className="h-5 w-5" />
              <span className="text-sm">Upload Foto</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col space-y-2"
              onClick={() => setActiveTab("message")}
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-sm">Lihat Pesan</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Main Content Tabs */}
        <Card className="shadow-sm">
          <Tabs
            value={activeTab}
            className="space-y-6"
            onValueChange={handleTabChange}
          >
            <div className="p-6 pb-0">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto bg-gray-100">
                <TabsTrigger
                  value="destinations"
                  className="flex items-center space-x-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Destinasi</span>
                </TabsTrigger>
                <TabsTrigger
                  value="umkm"
                  className="flex items-center space-x-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Store className="h-4 w-4" />
                  <span className="hidden sm:inline">UMKM</span>
                </TabsTrigger>
                <TabsTrigger
                  value="basecamp"
                  className="flex items-center space-x-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Mountain className="h-4 w-4" />
                  <span className="hidden sm:inline">Basecamp</span>
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  className="flex items-center space-x-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Events</span>
                </TabsTrigger>
                <TabsTrigger
                  value="gallery"
                  className="flex items-center space-x-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Image className="h-4 w-4" />
                  <span className="hidden sm:inline">Galeri</span>
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="flex items-center space-x-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger
                  value="message"
                  className="flex items-center space-x-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Pesan</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 pt-0">
              <TabsContent value="destinations" className="mt-0">
                <AdminDestinations />
              </TabsContent>

              <TabsContent value="umkm" className="mt-0">
                <AdminUMKM />
              </TabsContent>

              <TabsContent value="basecamp" className="mt-0">
                <AdminBasecamp />
              </TabsContent>

              <TabsContent value="events" className="mt-0">
                <AdminEvents />
              </TabsContent>

              <TabsContent value="gallery" className="mt-0">
                <AdminGallery />
              </TabsContent>

              <TabsContent value="users" className="mt-0">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Manajemen Pengguna
                  </h3>
                  <p className="text-gray-600">
                    Kelola akun pengguna dan hak akses
                  </p>
                </div>
                <AdminUsers />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                {/* <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Analytics & Laporan
                  </h3>
                  <p className="text-gray-600">
                    Lihat statistik website dan analisis pengunjung
                  </p>
                </div> */}
                {/* Fixed: Now passing the required data prop */}
                <ComprehensiveAnalytics
                  data={analyticsData}
                  loading={analyticsLoading}
                  onRefresh={handleRefreshAnalytics}
                />
              </TabsContent>

              <TabsContent value="message" className="mt-0">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Pesan & Buku Tamu
                  </h3>
                  <p className="text-gray-600">
                    Kelola pesan masuk dari pengunjung website
                  </p>
                </div>
                <div className="p-8 text-center bg-gray-50 rounded-lg">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Fitur Pesan Segera Hadir
                  </h3>
                  <p className="text-gray-600">
                    Fitur manajemen pesan dan buku tamu sedang dalam
                    pengembangan
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
