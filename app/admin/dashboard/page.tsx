"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import {
  Mountain,
  MapPin,
  Calendar,
  LogOut,
  MessageSquare,
  Store,
  Image as ImageIcon,
  Activity,
  Home,
  RefreshCw,
  Menu,
  X,
} from "lucide-react";

import AdminDestinations from "@/components/admin/admin-destinations";
import AdminEvents from "@/components/admin/admin-events";
import AdminGallery from "@/components/admin/admin-gallery";
import AdminUMKM from "@/components/admin/admin-umkm";
import AdminBasecamp from "@/components/admin/admin-basecamp";
import AdminSubmissions from "@/components/admin/admin-submissions";

// Core interfaces
interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

interface DashboardStats {
  activeDestinations: number;
  activeUMKM: number;
  activeBasecamps: number;
  activeGalleries: number;
  unreadMessages: number;
  totalMessages: number;
  upcomingEvents: number;
  totalUsers: number;
}

const safeNumber = (value: any, fallback = 0): number => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

const formatNumber = (value: any): string => {
  const num = safeNumber(value);
  return num.toLocaleString("id-ID");
};

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "destinations";

  // States
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [stats, setStats] = useState<DashboardStats>({
    activeDestinations: 0,
    activeUMKM: 0,
    activeBasecamps: 0,
    activeGalleries: 0,
    unreadMessages: 0,
    totalMessages: 0,
    upcomingEvents: 0,
    totalUsers: 0,
  });

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Initialize dashboard
  useEffect(() => {
    checkAuthAndLoadData();
  }, [router]);

  // Tab change listener
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      setActiveTab(event.detail);
      setMobileMenuOpen(false);
    };

    window.addEventListener("changeAdminTab", handleTabChange as EventListener);
    return () => {
      window.removeEventListener(
        "changeAdminTab",
        handleTabChange as EventListener
      );
    };
  }, []);

  // Authentication check
  const checkAuthAndLoadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (!token || !userData) {
        router.push("/auth/login");
        return;
      }

      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "ADMIN" && parsedUser.role !== "admin") {
        router.push("/");
        return;
      }

      setUser(parsedUser);
      await loadDashboardData();
    } catch (error) {
      console.error("Error in auth check:", error);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setStatsError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // API calls with error handling
      const apiCalls = [
        fetch("/api/destinations", { headers })
          .then(async (res) => {
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? data : [];
          })
          .catch(() => []),

        fetch("/api/produk", { headers })
          .then(async (res) => {
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? data : [];
          })
          .catch(() => []),

        fetch("/api/basecamp", { headers })
          .then(async (res) => {
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? data : [];
          })
          .catch(() => []),

        fetch("/api/gallery", { headers })
          .then(async (res) => {
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? data : [];
          })
          .catch(() => []),

        fetch("/api/submissions", { headers })
          .then(async (res) => {
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? data : [];
          })
          .catch(() => []),

        fetch("/api/event", { headers })
          .then(async (res) => {
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? data : [];
          })
          .catch(() => []),

        fetch("/api/users", { headers })
          .then(async (res) => {
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? data : [];
          })
          .catch(() => []),
      ];

      const [
        destinations,
        umkmData,
        basecamps,
        galleries,
        submissions,
        events,
        users,
      ] = await Promise.all(apiCalls);

      // Calculate stats
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newStats = {
        activeDestinations: destinations.filter(
          (dest: any) => dest.isActive === true
        ).length,
        activeUMKM: umkmData.filter((item: any) => item.isActive === true)
          .length,
        activeBasecamps: basecamps.filter((camp: any) => camp.isActive === true)
          .length,
        activeGalleries: galleries.filter(
          (gallery: any) => gallery.active === true
        ).length,
        unreadMessages: submissions.filter(
          (sub: any) =>
            sub.status === "PENDING" ||
            sub.readAt === null ||
            sub.readAt === undefined
        ).length,
        totalMessages: submissions.length,
        upcomingEvents: events.filter((event: any) => {
          if (!event.isActive) return false;
          try {
            const eventDate = new Date(event.date);
            return eventDate >= now && eventDate < nextMonth;
          } catch {
            return false;
          }
        }).length,
        totalUsers: users.filter((user: any) => user.status === "ACTIVE")
          .length,
      };

      setStats({
        activeDestinations: safeNumber(newStats.activeDestinations),
        activeUMKM: safeNumber(newStats.activeUMKM),
        activeBasecamps: safeNumber(newStats.activeBasecamps),
        activeGalleries: safeNumber(newStats.activeGalleries),
        unreadMessages: safeNumber(newStats.unreadMessages),
        totalMessages: safeNumber(newStats.totalMessages),
        upcomingEvents: safeNumber(newStats.upcomingEvents),
        totalUsers: safeNumber(newStats.totalUsers),
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setStatsError("Gagal memuat data dashboard");
      setStats({
        activeDestinations: 0,
        activeUMKM: 0,
        activeBasecamps: 0,
        activeGalleries: 0,
        unreadMessages: 0,
        totalMessages: 0,
        upcomingEvents: 0,
        totalUsers: 0,
      });
    }
  };

  // Refresh function
  const refreshStats = async () => {
    setIsRefreshing(true);
    try {
      setCurrentTime(new Date());
      await loadDashboardData();
      setRefreshKey((prev) => prev + 1);

      window.dispatchEvent(
        new CustomEvent("dashboardRefresh", {
          detail: {
            timestamp: new Date().toISOString(),
            tab: activeTab,
            success: true,
          },
        })
      );
    } catch (error) {
      console.error("Error refreshing dashboard:", error);
      setStatsError("Gagal memuat ulang data");
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  // Logout function
  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        router.replace("/auth/login");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setMobileMenuOpen(false);
  };

  // Update stats from submissions component
  const handleStatsUpdate = (unread: number, total: number) => {
    setStats((prevStats) => ({
      ...prevStats,
      unreadMessages: safeNumber(unread),
      totalMessages: safeNumber(total),
    }));
  };

  // Loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center p-6 bg-white rounded-2xl shadow-lg max-w-sm w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">
            Memuat dashboard...
          </p>
          <p className="text-gray-400 text-sm mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <Image
                  src="/logo-boyolali.png"
                  alt="Logo Boyolali"
                  width={40}
                  height={40}
                  className="h-8 w-8 sm:h-10 sm:w-10 object-contain flex-shrink-0"
                  priority
                />
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    Desa Tarubatang
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  Selamat datang, {user?.name || "Admin"}
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
                {isRefreshing ? "Memuat..." : "Refresh"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/")}
              >
                <Home className="h-4 w-4 mr-2" />
                Website
              </Button>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-100 space-y-3">
              <div className="text-sm">
                <p className="font-medium text-gray-900">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {currentTime.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  -{" "}
                  {currentTime.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshStats}
                  disabled={isRefreshing}
                  className="flex-1 min-w-0"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      isRefreshing ? "animate-spin" : ""
                    }`}
                  />
                  {isRefreshing ? "Memuat..." : "Refresh"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = "/")}
                  className="flex-1 min-w-0"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Website
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  className="flex-1 min-w-0"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="mb-6 p-4 sm:p-6 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                Selamat datang, {user?.name || "Admin"}!
              </h2>
              <p className="text-green-100 text-sm sm:text-base mb-2">
                Kelola website Desa Tarubatang dengan mudah dari dashboard ini
              </p>
              <p className="text-green-200 text-xs">
                Terakhir diperbarui: {currentTime.toLocaleTimeString("id-ID")}
              </p>
            </div>
            <div className="hidden sm:block ml-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {statsError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-red-600 text-sm flex-1">
                {statsError}. Silakan refresh untuk mencoba lagi.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshStats}
                className="self-start"
              >
                Refresh
              </Button>
            </div>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          {/* Desktop Tabs */}
          <div className="hidden sm:block">
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger
                value="destinations"
                className="flex items-center space-x-2"
              >
                <Mountain className="h-4 w-4" />
                <span>Destinasi</span>
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Event</span>
              </TabsTrigger>
              <TabsTrigger value="umkm" className="flex items-center space-x-2">
                <Store className="h-4 w-4" />
                <span>UMKM</span>
              </TabsTrigger>
              <TabsTrigger
                value="basecamp"
                className="flex items-center space-x-2"
              >
                <MapPin className="h-4 w-4" />
                <span>Basecamp</span>
              </TabsTrigger>
              <TabsTrigger
                value="gallery"
                className="flex items-center space-x-2"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Galeri</span>
              </TabsTrigger>
              <TabsTrigger
                value="submissions"
                className="flex items-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Pesan</span>
                {stats.unreadMessages > 0 && (
                  <Badge
                    variant="destructive"
                    className="text-xs px-1 py-0 h-4"
                  >
                    {stats.unreadMessages > 99 ? "99+" : stats.unreadMessages}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Mobile Tabs */}
          <div className="sm:hidden mb-6">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={activeTab === "destinations" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTabChange("destinations")}
                className="flex items-center space-x-1"
              >
                <Mountain className="h-4 w-4" />
                <span className="text-xs">Destinasi</span>
              </Button>
              <Button
                variant={activeTab === "events" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTabChange("events")}
                className="flex items-center space-x-1"
              >
                <Calendar className="h-4 w-4" />
                <span className="text-xs">Event</span>
              </Button>
              <Button
                variant={activeTab === "umkm" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTabChange("umkm")}
                className="flex items-center space-x-1"
              >
                <Store className="h-4 w-4" />
                <span className="text-xs">UMKM</span>
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button
                variant={activeTab === "basecamp" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTabChange("basecamp")}
                className="flex items-center space-x-1"
              >
                <MapPin className="h-4 w-4" />
                <span className="text-xs">Basecamp</span>
              </Button>
              <Button
                variant={activeTab === "gallery" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTabChange("gallery")}
                className="flex items-center space-x-1"
              >
                <ImageIcon className="h-4 w-4" />
                <span className="text-xs">Galeri</span>
              </Button>
              <Button
                variant={activeTab === "submissions" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTabChange("submissions")}
                className="flex items-center space-x-1 relative"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">Pesan</span>
                {stats.unreadMessages > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 text-xs px-1 py-0 h-4 min-w-4"
                  >
                    {stats.unreadMessages > 9 ? "9+" : stats.unreadMessages}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Tab Contents */}
          <TabsContent value="destinations" className="mt-6">
            <AdminDestinations key={`destinations-${refreshKey}`} />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <AdminEvents key={`events-${refreshKey}`} />
          </TabsContent>

          <TabsContent value="umkm" className="mt-6">
            <AdminUMKM key={`umkm-${refreshKey}`} />
          </TabsContent>

          <TabsContent value="basecamp" className="mt-6">
            <AdminBasecamp key={`basecamp-${refreshKey}`} />
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            <AdminGallery key={`gallery-${refreshKey}`} />
          </TabsContent>

          <TabsContent value="submissions" className="mt-6">
            <AdminSubmissions
              key={`submissions-${refreshKey}`}
              onStatsUpdate={handleStatsUpdate}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button for Mobile Refresh */}
      <div className="fixed bottom-6 right-6 sm:hidden z-30">
        <Button
          onClick={refreshStats}
          disabled={isRefreshing}
          className="h-14 w-14 rounded-full shadow-lg bg-green-600 hover:bg-green-700 border-4 border-white"
        >
          <RefreshCw
            className={`h-6 w-6 text-white ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </Button>
      </div>

      {/* Loading Overlay */}
      {isRefreshing && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl flex items-center space-x-3 max-w-sm w-full">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent flex-shrink-0"></div>
            <span className="text-gray-700 font-medium">
              Memperbarui data...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
