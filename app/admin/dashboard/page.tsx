"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import {
  Mountain,
  Users,
  MapPin,
  Calendar,
  BarChart3,
  LogOut,
  MessageSquare,
  Store,
  Image as ImageIcon,
  TrendingUp,
  Activity,
  Home,
  RefreshCw,
} from "lucide-react";

import AdminDestinations from "@/components/admin/admin-destinations";
import AdminEvents from "@/components/admin/admin-events";
import AdminGallery from "@/components/admin/admin-gallery";
// import AdminUsers from "@/components/admin/admin-users";
import AdminUMKM from "@/components/admin/admin-umkm";
import AdminBasecamp from "@/components/admin/admin-basecamp";
import AboutEditor from "@/components/admin/admin-about";
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
      const statsResponse = await fetch("/api/analytics", { headers });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

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
          fetch("/api/destinations", { headers }).then((res) => res.json()),
          fetch("/api/events", { headers }).then((res) => res.json()),
          fetch("/api/produk", { headers }).then((res) => res.json()),
          fetch("/api/basecamps", { headers }).then((res) => res.json()),
          fetch("/api/galleries", { headers }).then((res) => res.json()),
          fetch("/api/users", { headers }).then((res) => res.json()),
        ]);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAnalyticsData({
        totalDestinations: 10,
        totalEvents: 5,
        totalUMKM: 3,
        totalBasecamp: 2,
        totalGallery: 1,
        totalSubmissions: 7,
      });
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
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1 sm:p-2 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/logo-boyolali.png"
                    alt="Logo Boyolali"
                    width={40}
                    height={40}
                    className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 object-contain"
                    priority
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    Desa Tarubatang Management
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {/* User info - hidden on mobile */}
              <div className="hidden lg:block text-right">
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

              {/* Responsive buttons */}
              <Button
                variant="outline"
                size="sm"
                onClick={refreshStats}
                disabled={isRefreshing}
                className="hidden sm:flex relative"
              >
                <RefreshCw
                  className={`h-4 w-4 sm:mr-2 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                <span className="hidden sm:inline">
                  {isRefreshing ? "Memuat..." : "Refresh"}
                </span>
              </Button>

              {/* Mobile refresh button */}
              <Button
                variant="outline"
                size="sm"
                onClick={refreshStats}
                disabled={isRefreshing}
                className="sm:hidden p-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/")}
                className="hidden sm:flex"
              >
                <Home className="h-4 w-4 mr-2" />
                Lihat Website
              </Button>

              {/* Mobile home button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/")}
                className="sm:hidden p-2"
              >
                <Home className="h-4 w-4" />
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:flex"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>

              {/* Mobile logout button */}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="sm:hidden p-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile user info */}
          <div className="lg:hidden mt-2 pt-2 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              Selamat datang, {user.name}
            </p>
            <p className="text-xs text-gray-500">
              {currentTime.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}{" "}
              -{" "}
              {currentTime.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Welcome Banner */}
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl sm:rounded-2xl text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                Selamat datang kembali, {user.name}! 👋
              </h2>
              <p className="text-green-100 text-sm sm:text-base">
                Kelola website Desa Tarubatang dengan mudah dari dashboard ini
              </p>
              <p className="text-green-200 text-xs sm:text-sm mt-2">
                Terakhir diperbarui: {currentTime.toLocaleTimeString("id-ID")}
              </p>
            </div>
            <div className="hidden sm:block ml-4 flex-shrink-0">
              <div className="p-3 sm:p-4 bg-white/20 rounded-lg backdrop-blur-sm">
                <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center justify-between">
                <span className="truncate">Total Destinasi</span>
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="space-y-2">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats.totalDestinations}
                </p>
                <div className="space-y-1">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-green-100 text-green-800"
                  >
                    +2 bulan ini
                  </Badge>
                  <p className="text-xs text-gray-500">↗ 25% naik</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center justify-between">
                <span className="truncate">Total Users</span>
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="space-y-2">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats.totalUsers}
                </p>
                <div className="space-y-1">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-blue-100 text-blue-800"
                  >
                    +23 minggu ini
                  </Badge>
                  <p className="text-xs text-gray-500">↗ 15% naik</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center justify-between">
                <span className="truncate">Total Events</span>
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="space-y-2">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats.totalEvents}
                </p>
                <div className="space-y-1">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-purple-100 text-purple-800"
                  >
                    +1 bulan ini
                  </Badge>
                  <p className="text-xs text-gray-500">↗ 8% naik</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 col-span-2 lg:col-span-1">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center justify-between">
                <span className="truncate">Pengunjung Bulanan</span>
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="space-y-2">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats.monthlyVisitors.toLocaleString()}
                </p>
                <div className="space-y-1">
                  <Badge className="text-xs bg-green-100 text-green-800">
                    +12% dari bulan lalu
                  </Badge>
                  <p className="text-xs text-gray-500">↗ Trending naik</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Button
              variant="outline"
              className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 p-2"
              onClick={() => setActiveTab("destinations")}
            >
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm text-center">
                Tambah Destinasi
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 p-2"
              onClick={() => setActiveTab("events")}
            >
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm text-center">Buat Event</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 p-2"
              onClick={() => setActiveTab("gallery")}
            >
              <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm text-center">
                Upload Foto
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 p-2"
              onClick={() => setActiveTab("message")}
            >
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm text-center">
                Lihat Pesan
              </span>
            </Button>
          </div>
        </div>

        {/* Enhanced Main Content Tabs */}
        <Card className="shadow-sm">
          <Tabs
            value={activeTab}
            className="space-y-4 sm:space-y-6"
            onValueChange={handleTabChange}
          >
            <div className="p-4 sm:p-6 pb-0">
              <TabsList className="w-full h-auto bg-gray-100 p-1">
                {/* Mobile: Scrollable horizontal tabs */}
                <div className="flex sm:hidden overflow-x-auto scrollbar-hide w-full">
                  <div className="flex space-x-1 min-w-max">
                    {[
                      {
                        value: "destinations",
                        icon: MapPin,
                        label: "Destinasi",
                      },
                      { value: "umkm", icon: Store, label: "UMKM" },
                      { value: "basecamp", icon: Mountain, label: "Basecamp" },
                      { value: "events", icon: Calendar, label: "Events" },
                      { value: "gallery", icon: ImageIcon, label: "Galeri" },
                      {
                        value: "analytics",
                        icon: BarChart3,
                        label: "Analytics",
                      },
                      { value: "message", icon: MessageSquare, label: "Pesan" },
                    ].map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="flex items-center space-x-1 py-2 px-3 text-xs whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        <tab.icon className="h-3 w-3" />
                        <span>{tab.label}</span>
                      </TabsTrigger>
                    ))}
                  </div>
                </div>

                {/* Desktop: Grid layout */}
                <div className="hidden sm:grid grid-cols-4 lg:grid-cols-7 gap-1 w-full">
                  <TabsTrigger
                    value="destinations"
                    className="flex items-center space-x-2 py-3 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Destinasi</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="umkm"
                    className="flex items-center space-x-2 py-3 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Store className="h-4 w-4" />
                    <span>UMKM</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="basecamp"
                    className="flex items-center space-x-2 py-3 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Mountain className="h-4 w-4" />
                    <span>Basecamp</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="events"
                    className="flex items-center space-x-2 py-3 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Events</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="gallery"
                    className="flex items-center space-x-2 py-3 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Galeri</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="analytics"
                    className="flex items-center space-x-2 py-3 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="message"
                    className="flex items-center space-x-2 py-3 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Pesan</span>
                  </TabsTrigger>
                </div>
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
