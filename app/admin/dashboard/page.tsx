"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState, useEffect } from "react";
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
// import AdminUsers from "@/components/admin/admin-users";
import AdminUMKM from "@/components/admin/admin-umkm";
import AdminBasecamp from "@/components/admin/admin-basecamp";
import AdminSubmissions from "@/components/admin/admin-submissions";
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
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key for child components

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
    // Load initial data
    loadDashboardData();
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

  // Function to load all dashboard data
  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch stats data
      // const statsResponse = await fetch('/api/admin/stats', { headers });
      // if (statsResponse.ok) {
      //   const statsData = await statsResponse.json();
      //   setStats(statsData);
      // }

      // For now, simulate updated stats
      setStats((prevStats) => ({
        totalDestinations: Math.max(
          1,
          prevStats.totalDestinations + Math.floor(Math.random() * 3) - 1
        ),
        totalUsers: Math.max(
          1,
          prevStats.totalUsers + Math.floor(Math.random() * 10) - 3
        ),
        totalEvents: Math.max(
          1,
          prevStats.totalEvents + Math.floor(Math.random() * 2) - 1
        ),
        monthlyVisitors: Math.max(
          100,
          prevStats.monthlyVisitors + Math.floor(Math.random() * 150) - 75
        ),
      }));

      // Simulasi delay loading untuk UX yang lebih baik
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      throw error; // Re-throw untuk ditangkap oleh refreshStats
    }
  };

  // Function to load analytics data
  const loadAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Replace with actual API calls
      const [destinations, events, produk, basecamps, galleries, users] =
        await Promise.all([
          fetch("/api/admin/destinations", { headers }).then((res) =>
            res.json()
          ),
          fetch("/api/events", { headers }).then((res) => res.json()),
          fetch("/api/produk", { headers }).then((res) => res.json()),
          fetch("/api/basecamps", { headers }).then((res) => res.json()),
          fetch("/api/galleries", { headers }).then((res) => res.json()),
          fetch("/api/users", { headers }).then((res) => res.json()),
        ]);

      // For now, using mock data with random updates
      // const mockData: AnalyticsData = {
      //   destinations: [
      //     {
      //       id: "1",
      //       name: "Gunung Tarubatang",
      //       category: "Gunung",
      //       description: "Destinasi hiking populer",
      //       price: "Gratis",
      //       location: "Desa Tarubatang",
      //       images: ["image1.jpg"],
      //       rating: 4.5,
      //       totalReviews: 45 + Math.floor(Math.random() * 10),
      //       isActive: true,
      //       createdAt: new Date().toISOString(),
      //       updatedAt: new Date().toISOString(),
      //     },
      //     {
      //       id: "2",
      //       name: "Air Terjun Sekumpul",
      //       category: "Air Terjun",
      //       description: "Air terjun yang indah",
      //       price: "10000",
      //       location: "Desa Sekumpul",
      //       images: ["waterfall1.jpg"],
      //       rating: 4.7,
      //       totalReviews: 32 + Math.floor(Math.random() * 5),
      //       isActive: true,
      //       createdAt: new Date().toISOString(),
      //       updatedAt: new Date().toISOString(),
      //     },
      //   ],
      //   events: [
      //     {
      //       id: "1",
      //       name: "Festival Desa",
      //       category: "Budaya",
      //       description: "Festival tahunan desa",
      //       date: new Date().toISOString(),
      //       location: "Balai Desa",
      //       currentParticipants: 150 + Math.floor(Math.random() * 20),
      //       maxParticipants: 200,
      //       images: ["event1.jpg"],
      //       isActive: true,
      //       createdAt: new Date().toISOString(),
      //       updatedAt: new Date().toISOString(),
      //     },
      //     {
      //       id: "2",
      //       name: "Workshop Kerajinan",
      //       category: "Workshop",
      //       description: "Belajar membuat kerajinan lokal",
      //       date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      //       location: "Sanggar Seni",
      //       currentParticipants: 25 + Math.floor(Math.random() * 10),
      //       maxParticipants: 50,
      //       images: ["workshop1.jpg"],
      //       isActive: true,
      //       createdAt: new Date().toISOString(),
      //       updatedAt: new Date().toISOString(),
      //     },
      //   ],
      //   umkm: [
      //     {
      //       id: "1",
      //       name: "Kerajinan Bambu",
      //       category: "Kerajinan",
      //       description: "Produk kerajinan bambu lokal",
      //       price: "50000",
      //       stock: 20 + Math.floor(Math.random() * 10),
      //       images: ["umkm1.jpg"],
      //       contact: "081234567890",
      //       location: "RT 01 RW 02",
      //       isActive: true,
      //       createdAt: new Date().toISOString(),
      //       updatedAt: new Date().toISOString(),
      //     },
      //   ],
      //   basecamps: [
      //     {
      //       id: "1",
      //       namaBasecamp: "Basecamp Gunung",
      //       fasilitas: ["Parkir", "Toilet", "Warung"],
      //       dayaTampungKendaraan: 50,
      //       dayaTampungOrang: 100,
      //       nomorWa: "081234567890",
      //       images: ["basecamp1.jpg"],
      //       lokasi: "Kaki Gunung Tarubatang",
      //       pemilik: "Pak Sardi",
      //       menuMakanan: ["Nasi Gudeg", "Soto"],
      //       menuMinuman: ["Teh", "Kopi"],
      //       isActive: true,
      //       createdAt: new Date().toISOString(),
      //       updatedAt: new Date().toISOString(),
      //     },
      //   ],
      //   galleries: [
      //     {
      //       id: "1",
      //       title: "Pemandangan Desa",
      //       category: "Landscape",
      //       images: ["gallery1.jpg", "gallery2.jpg"],
      //       description: "Koleksi foto pemandangan desa",
      //       isActive: true,
      //       createdAt: new Date().toISOString(),
      //       updatedAt: new Date().toISOString(),
      //     },
      //   ],
      //   users: [
      //     {
      //       id: "1",
      //       name: "Admin User",
      //       email: "admin@example.com",
      //       role: "ADMIN",
      //       status: "ACTIVE",
      //       createdAt: new Date().toISOString(),
      //     },
      //     {
      //       id: "2",
      //       name: "Regular User",
      //       email: "user@example.com",
      //       role: "USER",
      //       status: "ACTIVE",
      //       createdAt: new Date().toISOString(),
      //     },
      //   ],
      // };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAnalyticsData(mockData);
    } catch (error) {
      console.error("Error loading analytics data:", error);
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

  // Enhanced refresh function
  const refreshStats = async () => {
    setIsRefreshing(true);
    try {
      // Update current time
      setCurrentTime(new Date());

      // Load dashboard data
      await loadDashboardData();

      // If analytics tab is active, refresh analytics data
      if (activeTab === "analytics") {
        await loadAnalyticsData();
      }

      // Increment refresh key to force child components to refresh
      setRefreshKey((prev) => prev + 1);

      // Dispatch custom event to notify child components
      window.dispatchEvent(
        new CustomEvent("dashboardRefresh", {
          detail: {
            timestamp: new Date().toISOString(),
            tab: activeTab,
            success: true,
          },
        })
      );

      // Show success feedback
      console.log("Dashboard refreshed successfully");
    } catch (error) {
      console.error("Error refreshing dashboard:", error);
      // Dispatch error event
      window.dispatchEvent(
        new CustomEvent("dashboardRefreshError", {
          detail: { error: error.message, timestamp: new Date().toISOString() },
        })
      );
    } finally {
      // Tambah minimum loading time untuk UX yang lebih baik
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

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
                  })}{" "}
                  -{" "}
                  {currentTime.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={refreshStats}
                disabled={isRefreshing}
                className="relative"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                {isRefreshing ? "Memuat..." : "Refresh"}
                {isRefreshing && (
                  <div className="absolute inset-0 bg-white/50 rounded-md"></div>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/")}
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
              <p className="text-green-200 text-sm mt-2">
                Terakhir diperbarui: {currentTime.toLocaleTimeString("id-ID")}
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
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto bg-gray-100">
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
                <AdminDestinations key={`destinations-${refreshKey}`} />
              </TabsContent>

              <TabsContent value="umkm" className="mt-0">
                <AdminUMKM key={`produk-${refreshKey}`} />
              </TabsContent>

              <TabsContent value="basecamp" className="mt-0">
                <AdminBasecamp key={`basecamp-${refreshKey}`} />
              </TabsContent>

              <TabsContent value="events" className="mt-0">
                <AdminEvents key={`events-${refreshKey}`} />
              </TabsContent>

              <TabsContent value="gallery" className="mt-0">
                <AdminGallery key={`gallery-${refreshKey}`} />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <ComprehensiveAnalytics
                  key={`analytics-${refreshKey}`}
                  data={analyticsData}
                  loading={analyticsLoading}
                  onRefresh={handleRefreshAnalytics}
                />
              </TabsContent>

              <TabsContent value="message" className="mt-0">
                <AdminSubmissions key={`submissions-${refreshKey}`} />
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Footer dengan informasi refresh terakhir */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Dashboard terakhir diperbarui:{" "}
            {currentTime.toLocaleTimeString("id-ID")}
          </p>
          <p className="mt-1">
            Klik tombol refresh untuk memperbarui data terbaru
          </p>
        </div>
      </div>
    </div>
  );
}

// Tambahan: Custom hook untuk refresh dashboard
export const useDashboardRefresh = () => {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Trigger refresh event
      window.dispatchEvent(
        new CustomEvent("dashboardRefresh", {
          detail: { timestamp: new Date().toISOString() },
        })
      );

      setLastRefresh(new Date());
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return { lastRefresh, isRefreshing, refresh };
};

// Enhanced refresh functionality dengan debounce
const useDebounce = (callback: () => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback();
    }, delay);
  }, [callback, delay]);
};

// Additional utility functions for the dashboard

// Function to show refresh success notification
const showRefreshNotification = (type: "success" | "error" = "success") => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("showNotification", {
      detail: {
        type,
        message:
          type === "success"
            ? "Dashboard berhasil diperbarui!"
            : "Gagal memperbarui dashboard",
        duration: 3000,
      },
    });
    window.dispatchEvent(event);
  }
};

// Enhanced analytics data loader with error handling
const loadAnalyticsDataWithRetry = async (
  retryCount = 3
): Promise<AnalyticsData> => {
  for (let i = 0; i < retryCount; i++) {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // In production, replace with actual API calls
      const responses = await Promise.allSettled([
        fetch("/api/destinations", { headers }),
        fetch("/api/events", { headers }),
        fetch("/api/produk", { headers }),
        fetch("/api/basecamps", { headers }),
        fetch("/api/galleries", { headers }),
        // fetch("/api/users", { headers }),
      ]);

      // For now, return enhanced mock data
      // return {
      //   destinations: [
      //     {
      //       id: "1",
      //       name: "Gunung Tarubatang",
      //       category: "Gunung",
      //       description: "Destinasi hiking populer dengan pemandangan indah",
      //       price: "Gratis",
      //       location: "Desa Tarubatang",
      //       images: ["mountain1.jpg"],
      //       rating: 4.5,
      //       totalReviews: 45 + Math.floor(Math.random() * 20),
      //       isActive: true,
      //       createdAt: new Date().toISOString(),
      //       updatedAt: new Date().toISOString(),
      //     },
      //     {
      //       id: "2",
      //       name: "Air Terjun Sekumpul",
      //       category: "Air Terjun",
      //       description:
      //         "Air terjun yang menakjubkan dengan ketinggian 50 meter",
      //       price: "15000",
      //       location: "Desa Sekumpul",
      //       images: ["waterfall1.jpg"],
      //       rating: 4.7,
      //       totalReviews: 32 + Math.floor(Math.random() * 15),
      //       isActive: true,
      //       createdAt: new Date().toISOString(),
      //       updatedAt: new Date().toISOString(),
      //     },
      //     {
      //       id: "3",
      //       name: "Pantai Sunrise",
      //       category: "Pantai",
      //       description:
      //         "Pantai dengan pemandangan matahari terbit yang spektakuler",
      //       price: "5000",
      //       location: "Pesisir Timur",
      //       images: ["beach1.jpg"],
      //       rating: 4.3,
      //       totalReviews: 67 + Math.floor(Math.random() * 25),
      //       isActive: true,
      //       createdAt: new Date().toISOString(),
      //       updatedAt: new Date().toISOString(),
      //     },
      //   ],
      //   events: [
      //     {
      //       id: "1",
      //       name: "Festival Budaya Tarubatang",
      //       category: "Budaya",
      //       description: "Festival tahunan untuk merayakan budaya lokal",
      //       date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      //       endDate: new Date(
      //         Date.now() + 17 * 24 * 60 * 60 * 1000
      //       ).toISOString(),
      //       location: "Balai Desa Tarubatang",
      //       currentParticipants: 150 + Math.floor(Math.random() * 30),
      //       maxParticipants: 300,
      //       price: "25000",
      //       images: ["festival1.jpg"],
      //       isActive: true,
      //       createdAt: new Date().toISOString(),
      //       updatedAt: new Date().toISOString(),
      //     },
      //     {
      //       id: "2",
      //       name: "Workshop Kerajinan Tradisional",
      //       category: "Workshop",
      //       description:
      //         "Belajar membuat kerajinan tangan tradisional dari pengrajin lokal",
      //       date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      //       location: "Sanggar Seni Desa",
      //       currentParticipants: 25 + Math.floor(Math.random() * 15),
      //       maxParticipants: 50,
      //       price: "50000",
      //       images: ["workshop1.jpg"],
      //       isActive: true,
      //       createdAt: new Date().toISOString(),
      //       updatedAt: new Date().toISOString(),
      //     },
      //   ],
      //   umkm: [
      //     {
      //       id: "1",
      //       name: "Kerajinan Bambu Berkah",
      //       category: "Kerajinan",
      //       description:
      //         "Produk kerajinan bambu berkualitas tinggi buatan tangan",
      //       price: "75000",
      //       stock: 20 + Math.floor(Math.random() * 15),
      //       images: ["bamboo1.jpg"],
      //       contact: "081234567890",
      //       location: "RT 01 RW 02, Desa Tarubatang",
      //       isActive: true,
      //       createdAt: new Date().toISOString(),
      //       updatedAt: new Date().toISOString(),
      //     },
      //     {
      //       id: "2",
      //       name: "Kopi Robusta Tarubatang",
      //       category: "Makanan & Minuman",
      //       description: "Kopi robusta premium hasil kebun lokal",
      //       price: "45000",
      //       stock: 50 + Math.floor(Math.random() * 20),
      //       images: ["coffee1.jpg"],
      //       contact: "081234567891",
      //       location: "RT 03 RW 01, Desa Tarubatang",
      //       isActive: true,
      //       createdAt: new Date().toISOString(),
      //       updatedAt: new Date().toISOString(),
      //     },
      //   ],
      //   basecamps: [
      //     {
      //       id: "1",
      //       namaBasecamp: "Basecamp Gunung Tarubatang",
      //       fasilitas: [
      //         "Tempat Parkir",
      //         "Toilet Umum",
      //         "Warung Makan",
      //         "Musholla",
      //         "Area Istirahat",
      //       ],
      //       dayaTampungKendaraan: 50,
      //       dayaTampungOrang: 150,
      //       nomorWa: "081234567890",
      //       images: ["basecamp1.jpg"],
      //       lokasi: "Kaki Gunung Tarubatang, Jalur Utama",
      //       pemilik: "Pak Sardi Wijaya",
      //       menuMakanan: ["Nasi Gudeg", "Soto Ayam", "Mie Ayam", "Nasi Rames"],
      //       menuMinuman: [
      //         "Teh Manis",
      //         "Kopi Tubruk",
      //         "Jus Jeruk",
      //         "Air Mineral",
      //       ],
      //       isActive: true,
      //       createdAt: new Date().toISOString(),
      //       updatedAt: new Date().toISOString(),
      //     },
      //     {
      //       id: "2",
      //       namaBasecamp: "Pos Pendakian Sekumpul",
      //       fasilitas: ["Tempat Parkir", "Toilet", "Warung", "Penyewaan Alat"],
      //       dayaTampungKendaraan: 30,
      //       dayaTampungOrang: 100,
      //       nomorWa: "081234567892",
      //       images: ["basecamp2.jpg"],
      //       lokasi: "Dekat Air Terjun Sekumpul",
      //       pemilik: "Bu Siti Aminah",
      //       menuMakanan: ["Nasi Pecel", "Bakso", "Gado-gado"],
      //       menuMinuman: ["Es Teh", "Kopi", "Jus Alpukat"],
      //       isActive: true,
      //       createdAt: new Date().toISOString(),
      //       updatedAt: new Date().toISOString(),
      //     },
      //   ],
      //   galleries: [
      //     {
      //       id: "1",
      //       title: "Keindahan Alam Tarubatang",
      //       category: "Landscape",
      //       images: ["landscape1.jpg", "landscape2.jpg", "landscape3.jpg"],
      //       description:
      //         "Koleksi foto pemandangan alam yang menakjubkan di sekitar Desa Tarubatang",
      //       isActive: true,
      //       createdAt: new Date().toISOString(),
      //       updatedAt: new Date().toISOString(),
      //     },
      //     {
      //       id: "2",
      //       title: "Budaya dan Tradisi",
      //       category: "Budaya",
      //       images: ["culture1.jpg", "culture2.jpg"],
      //       description:
      //         "Dokumentasi kegiatan budaya dan tradisi masyarakat Desa Tarubatang",
      //       isActive: true,
      //       createdAt: new Date().toISOString(),
      //       updatedAt: new Date().toISOString(),
      //     },
      //   ],
      //   users: [
      //     {
      //       id: "1",
      //       name: "Admin Utama",
      //       email: "admin@tarubatang.com",
      //       phone: "081234567890",
      //       role: "ADMIN",
      //       status: "ACTIVE",
      //       createdAt: new Date().toISOString(),
      //     },
      //     {
      //       id: "2",
      //       name: "Pengguna Regular",
      //       email: "user1@gmail.com",
      //       phone: "081234567891",
      //       role: "USER",
      //       status: "ACTIVE",
      //       createdAt: new Date().toISOString(),
      //     },
      //     {
      //       id: "3",
      //       name: "Moderator Konten",
      //       email: "moderator@tarubatang.com",
      //       phone: "081234567892",
      //       role: "ADMIN",
      //       status: "ACTIVE",
      //       createdAt: new Date().toISOString(),
      //     },
      //   ],
      // };
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retryCount - 1) throw error;

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw new Error("Max retries exceeded");
};

// Enhanced refresh function with better error handling and user feedback
const createEnhancedRefreshFunction = (
  setIsRefreshing: (loading: boolean) => void,
  setCurrentTime: (time: Date) => void,
  setStats: (stats: any) => void,
  setRefreshKey: (key: number | ((prev: number) => number)) => void,
  setAnalyticsData: (data: AnalyticsData) => void,
  activeTab: string
) => {
  return async () => {
    setIsRefreshing(true);

    try {
      // Show loading notification
      showRefreshNotification("success");

      // Update current time immediately
      const now = new Date();
      setCurrentTime(now);

      // Simulate stats update (replace with real API call)
      setStats((prevStats) => ({
        totalDestinations: Math.max(
          1,
          prevStats.totalDestinations + Math.floor(Math.random() * 3) - 1
        ),
        totalUsers: Math.max(
          1,
          prevStats.totalUsers + Math.floor(Math.random() * 10) - 5
        ),
        totalEvents: Math.max(
          1,
          prevStats.totalEvents + Math.floor(Math.random() * 2) - 1
        ),
        monthlyVisitors: Math.max(
          100,
          prevStats.monthlyVisitors + Math.floor(Math.random() * 200) - 100
        ),
      }));

      // If analytics tab is active, refresh analytics data
      if (activeTab === "analytics") {
        const newAnalyticsData = await loadAnalyticsDataWithRetry();
        setAnalyticsData(newAnalyticsData);
      }

      // Increment refresh key to force child components to refresh
      setRefreshKey((prev) => prev + 1);

      // Dispatch custom event to notify child components
      window.dispatchEvent(
        new CustomEvent("dashboardRefresh", {
          detail: {
            timestamp: now.toISOString(),
            tab: activeTab,
            success: true,
          },
        })
      );

      console.log(
        "Dashboard refreshed successfully at:",
        now.toLocaleTimeString("id-ID")
      );
    } catch (error) {
      console.error("Error refreshing dashboard:", error);
      showRefreshNotification("error");

      // Dispatch error event
      window.dispatchEvent(
        new CustomEvent("dashboardRefreshError", {
          detail: { error: error.message, timestamp: new Date().toISOString() },
        })
      );
    } finally {
      // Add minimum loading time for better UX
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };
};
