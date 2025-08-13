"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  WifiOff,
  TrendingUp,
  Store,
  Building,
  PartyPopper,
  Mountain,
  Users,
  FileText,
  Camera,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Updated interfaces matching the corrected schema
interface AnalyticsStats {
  destinations: {
    total: number;
    active: number;
    inactive: number;
    categories: number;
    withLocation: number;
    withImages: number;
    withFacilities: number;
    withContact: number;
    recentlyAdded: {
      last7Days: number;
      last30Days: number;
    };
    topCategories: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
  };
  events: {
    total: number;
    active: number;
    inactive: number;
    upcoming: number;
    past: number;
    ongoing: number;
    totalParticipants: number;
    avgParticipants: number;
    capacityUtilization: number;
    withPrice: number;
    recentlyAdded: {
      last7Days: number;
      last30Days: number;
    };
    topCategories: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
  };
  umkm: {
    total: number;
    active: number;
    inactive: number;
    withStock: number;
    outOfStock: number;
    totalStock: number;
    avgStock: number;
    withUsers: number;
    withLocation: number;
    withImages: number;
    categories: number;
    recentlyAdded: {
      last7Days: number;
      last30Days: number;
    };
    topCategories: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
  };
  basecamps: {
    total: number;
    active: number;
    inactive: number;
    totalCapacityPeople: number;
    totalCapacityVehicles: number;
    avgCapacityPeople: number;
    avgCapacityVehicles: number;
    withSocialMedia: number;
    withLocation: number;
    withMenus: number;
    withImages: number;
    recentlyAdded: {
      last7Days: number;
      last30Days: number;
    };
  };
  galleries: {
    total: number;
    active: number;
    inactive: number;
    totalImages: number;
    avgImagesPerGallery: number;
    categories: number;
    withDescription: number;
    recentlyAdded: {
      last7Days: number;
      last30Days: number;
    };
    topCategories: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
  };
  users: {
    total: number;
    admins: number;
    regularUsers: number;
    active: number;
    inactive: number;
    suspended: number;
    withUmkm: number;
    withSubmissions: number;
    totalUmkmProducts: number;
    totalHandledSubmissions: number;
    withPhone: number;
    recentlyJoined: {
      last7Days: number;
      last30Days: number;
    };
  };
  submissions: {
    total: number;
    pending: number;
    read: number;
    replied: number;
    closed: number;
    archived: number;
    byType: {
      guestbook: number;
      volunteer: number;
      feedback: number;
      complaint: number;
      business: number;
      inquiry: number;
      other: number;
    };
    byPriority: {
      low: number;
      normal: number;
      high: number;
      urgent: number;
    };
    withResponse: number;
    withHandler: number;
    withPhone: number;
    recentlySubmitted: {
      last7Days: number;
      last30Days: number;
    };
    responseRate: number;
  };
  analytics: {
    totalPageViews: number;
    totalVisitors: number;
    uniquePages: number;
    avgPageViewsPerDay: number;
    avgVisitorsPerDay: number;
    last7Days: number;
    last30Days: number;
    topPages: Array<{
      page: string;
      views: number;
      visitors: number;
    }>;
  };
}

interface MonthlyTrend {
  month: string;
  destinations: number;
  events: number;
  umkm: number;
  basecamps: number;
  galleries: number;
  total: number;
}

interface GrowthRates {
  destinations: number;
  events: number;
  umkm: number;
  basecamps: number;
  galleries: number;
  users: number;
  submissions: number;
}

interface AnalyticsResponse {
  stats: AnalyticsStats;
  monthlyTrends: MonthlyTrend[];
  growthRates: GrowthRates;
  summary: {
    totalItems: number;
    activeItems: number;
    totalUsers: number;
    totalSubmissions: number;
    totalPageViews: number;
    lastUpdated: string;
  };
}

// Enhanced Analytics Service
class AnalyticsService {
  private static baseUrl = "/api";
  private static cache: { data: AnalyticsResponse | null; timestamp: number } =
    {
      data: null,
      timestamp: 0,
    };
  private static readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

  private static async fetchWithRetry(
    url: string,
    retries = 3,
    delay = 1000
  ): Promise<AnalyticsResponse> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Validate response structure
        if (!data.stats || !data.summary) {
          throw new Error("Invalid response structure from analytics API");
        }

        return data;
      } catch (error) {
        console.warn(`Attempt ${attempt}/${retries} failed for ${url}:`, error);

        if (attempt === retries) {
          throw new Error(
            `Failed to fetch ${url} after ${retries} attempts: ${
              error instanceof Error ? error.message : "Network error"
            }`
          );
        }

        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
    throw new Error("Unexpected error in fetchWithRetry");
  }

  static async getAnalyticsData(
    forceRefresh = false
  ): Promise<AnalyticsResponse> {
    const now = Date.now();
    if (
      !forceRefresh &&
      this.cache.data &&
      now - this.cache.timestamp < this.CACHE_DURATION
    ) {
      console.log("Returning cached analytics data");
      return this.cache.data;
    }

    try {
      console.log("Fetching fresh analytics data...");
      const data = await this.fetchWithRetry(`${this.baseUrl}/analytics`);

      this.cache = {
        data,
        timestamp: now,
      };

      console.log("Analytics data loaded and cached:", data.summary);
      return data;
    } catch (error) {
      console.error("Error fetching analytics data:", error);

      if (this.cache.data) {
        console.warn("Returning stale cached data due to fetch error");
        return this.cache.data;
      }

      throw error;
    }
  }

  static clearCache(): void {
    this.cache = { data: null, timestamp: 0 };
  }
}

// Guest Analytics Page Component
const GuestAnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadAnalyticsData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const data = await AnalyticsService.getAnalyticsData(forceRefresh);
      setAnalyticsData(data);
      setLastUpdated(new Date());
      setRetryCount(0);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memuat data analytics";
      setError(errorMessage);
      setRetryCount((prev) => prev + 1);
      console.error("Analytics loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  useEffect(() => {
    if (error && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Auto-retry attempt ${retryCount + 1}/3`);
        loadAnalyticsData();
      }, 3000 * retryCount);

      return () => clearTimeout(timer);
    }
  }, [error, retryCount]);

  const handleRefresh = () => {
    AnalyticsService.clearCache();
    loadAnalyticsData(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Analytics Platform Desa Tarubatang
        </h1>
        <p className="text-gray-600 mb-3">
          Statistik dan analisis data platform pariwisata dan UMKM
        </p>

        {/* Loading state - consistent with UMKM page */}
        {/* Loading state - centered on page */}
        {/* Loading state - responsive centered on page */}
        {loading && !analyticsData ? (
          <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
            <div className="text-center px-4">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 border-b-2 sm:border-b-3 md:border-b-4 lg:border-b-4 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4 sm:mt-6 md:mt-8 text-sm sm:text-base md:text-lg lg:text-xl font-medium">
                Memuat data analytics...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                Percobaan ke-{retryCount}/3
                {retryCount < 3 && " (otomatis mencoba ulang...)"}
              </p>
            )}
            <Button onClick={handleRefresh} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Coba Lagi
            </Button>
          </div>
        ) : !analyticsData ? (
          <div className="text-center py-12">
            <WifiOff className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              Belum ada data yang tersedia untuk ditampilkan.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Muat Ulang
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Status Bar */}
            <div className="flex items-center justify-between text-sm bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-gray-600">
                Terakhir diperbarui:{" "}
                {lastUpdated?.toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Data Terkini</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>

            {/* Summary Cards Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Destinasi</p>
                      <p className="text-3xl font-bold">
                        {analyticsData.stats.destinations.total}
                      </p>
                      <p className="text-blue-100 text-sm">
                        {analyticsData.stats.destinations.active} aktif
                      </p>
                    </div>
                    <Mountain className="h-12 w-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Total Event</p>
                      <p className="text-3xl font-bold">
                        {analyticsData.stats.events.total}
                      </p>
                      <p className="text-purple-100 text-sm">
                        {analyticsData.stats.events.upcoming} mendatang
                      </p>
                    </div>
                    <PartyPopper className="h-12 w-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Total UMKM</p>
                      <p className="text-3xl font-bold">
                        {analyticsData.stats.umkm.total}
                      </p>
                      <p className="text-green-100 text-sm">
                        {analyticsData.stats.umkm.totalStock} stok tersedia
                      </p>
                    </div>
                    <Store className="h-12 w-12 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Total Basecamp</p>
                      <p className="text-3xl font-bold">
                        {analyticsData.stats.basecamps.total}
                      </p>
                      <p className="text-orange-100 text-sm">
                        {analyticsData.stats.basecamps.totalCapacityPeople}{" "}
                        kapasitas
                      </p>
                    </div>
                    <Building className="h-12 w-12 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Cards Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-100 text-sm">Total Galeri</p>
                      <p className="text-3xl font-bold">
                        {analyticsData.stats.galleries.total}
                      </p>
                      <p className="text-pink-100 text-sm">
                        {analyticsData.stats.galleries.totalImages} foto
                      </p>
                    </div>
                    <Camera className="h-12 w-12 text-pink-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 text-sm">Total Pengguna</p>
                      <p className="text-3xl font-bold">
                        {analyticsData.stats.users.total}
                      </p>
                      <p className="text-indigo-100 text-sm">
                        {analyticsData.stats.users.admins} admin
                      </p>
                    </div>
                    <Users className="h-12 w-12 text-indigo-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-teal-100 text-sm">Total Submission</p>
                      <p className="text-3xl font-bold">
                        {analyticsData.stats.submissions.total}
                      </p>
                      <p className="text-teal-100 text-sm">
                        {analyticsData.stats.submissions.pending} pending
                      </p>
                    </div>
                    <FileText className="h-12 w-12 text-teal-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Destinations Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mountain className="h-5 w-5 text-blue-600" />
                    <span>Statistik Destinasi Wisata</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {analyticsData.stats.destinations.categories}
                      </p>
                      <p className="text-sm text-gray-600">Total Kategori</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {analyticsData.stats.destinations.withLocation}
                      </p>
                      <p className="text-sm text-gray-600">Dengan Lokasi</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">
                      Kategori Populer
                    </h4>
                    {analyticsData.stats.destinations.topCategories
                      .slice(0, 3)
                      .map((category) => (
                        <div key={category.category} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary">
                              {category.category}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {category.count} ({category.percentage.toFixed(1)}
                              %)
                            </span>
                          </div>
                          <Progress
                            value={category.percentage}
                            className="h-2"
                          />
                        </div>
                      ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dengan Gambar</span>
                      <span className="font-medium text-blue-600">
                        {analyticsData.stats.destinations.withImages}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dengan Kontak</span>
                      <span className="font-medium text-green-600">
                        {analyticsData.stats.destinations.withContact}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Events Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PartyPopper className="h-5 w-5 text-purple-600" />
                    <span>Statistik Event & Kegiatan</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {analyticsData.stats.events.totalParticipants}
                      </p>
                      <p className="text-sm text-gray-600">Total Partisipan</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {analyticsData.stats.events.capacityUtilization.toFixed(
                          1
                        )}
                        %
                      </p>
                      <p className="text-sm text-gray-600">
                        Utilisasi Kapasitas
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Status Event</h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="font-bold text-green-600">
                          {analyticsData.stats.events.upcoming}
                        </p>
                        <p className="text-gray-600">Mendatang</p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="font-bold text-blue-600">
                          {analyticsData.stats.events.ongoing}
                        </p>
                        <p className="text-gray-600">Berlangsung</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="font-bold text-gray-600">
                          {analyticsData.stats.events.past}
                        </p>
                        <p className="text-gray-600">Selesai</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Rata-rata Partisipan
                      </span>
                      <span className="font-medium">
                        {analyticsData.stats.events.avgParticipants.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Event Berbayar</span>
                      <span className="font-medium text-green-600">
                        {analyticsData.stats.events.withPrice}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* UMKM Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Store className="h-5 w-5 text-green-600" />
                    <span>Statistik UMKM</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {analyticsData.stats.umkm.totalStock}
                      </p>
                      <p className="text-sm text-gray-600">Total Stok</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {analyticsData.stats.umkm.categories}
                      </p>
                      <p className="text-sm text-gray-600">Kategori</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Produk Tersedia</span>
                      <span className="font-medium text-green-600">
                        {analyticsData.stats.umkm.withStock}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stok Habis</span>
                      <span className="font-medium text-red-600">
                        {analyticsData.stats.umkm.outOfStock}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rata-rata Stok</span>
                      <span className="font-medium">
                        {analyticsData.stats.umkm.avgStock.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dengan Pemilik</span>
                      <span className="font-medium text-blue-600">
                        {analyticsData.stats.umkm.withUsers}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Kategori UMKM</h4>
                    {analyticsData.stats.umkm.topCategories
                      .slice(0, 2)
                      .map((category) => (
                        <div key={category.category} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary">
                              {category.category}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {category.count} ({category.percentage.toFixed(1)}
                              %)
                            </span>
                          </div>
                          <Progress
                            value={category.percentage}
                            className="h-2"
                          />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Submissions Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-teal-600" />
                    <span>Statistik Submission</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">
                      Tipe Submission
                    </h4>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div className="flex justify-between p-2 bg-purple-50 rounded">
                        <span className="text-gray-600">Buku Tamu</span>
                        <span className="font-medium text-purple-600">
                          {analyticsData.stats.submissions.byType.guestbook}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-blue-50 rounded">
                        <span className="text-gray-600">Volunteer</span>
                        <span className="font-medium text-blue-600">
                          {analyticsData.stats.submissions.byType.volunteer}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-green-50 rounded">
                        <span className="text-gray-600">Feedback</span>
                        <span className="font-medium text-green-600">
                          {analyticsData.stats.submissions.byType.feedback}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-orange-50 rounded">
                        <span className="text-gray-600">Keluhan</span>
                        <span className="font-medium text-orange-600">
                          {analyticsData.stats.submissions.byType.complaint}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Prioritas</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Normal</span>
                        <span className="font-medium text-blue-600">
                          {analyticsData.stats.submissions.byPriority.normal}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tinggi</span>
                        <span className="font-medium text-orange-600">
                          {analyticsData.stats.submissions.byPriority.high}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rendah</span>
                        <span className="font-medium text-gray-600">
                          {analyticsData.stats.submissions.byPriority.low}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mendesak</span>
                        <span className="font-medium text-red-600">
                          {analyticsData.stats.submissions.byPriority.urgent}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics & Traffic Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    <span>Statistik Website</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <p className="text-2xl font-bold text-indigo-600">
                        {analyticsData.stats.analytics.totalPageViews.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Total Page Views</p>
                    </div>
                    <div className="text-center p-4 bg-cyan-50 rounded-lg">
                      <p className="text-2xl font-bold text-cyan-600">
                        {analyticsData.stats.analytics.totalVisitors.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Total Visitors</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Rata-rata Views/Hari
                      </span>
                      <span className="font-medium text-indigo-600">
                        {analyticsData.stats.analytics.avgPageViewsPerDay.toFixed(
                          0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Rata-rata Visitors/Hari
                      </span>
                      <span className="font-medium text-cyan-600">
                        {analyticsData.stats.analytics.avgVisitorsPerDay.toFixed(
                          0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Halaman Unik</span>
                      <span className="font-medium text-blue-600">
                        {analyticsData.stats.analytics.uniquePages}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">
                      Traffic Terbaru
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded">
                        <p className="text-lg font-bold text-green-600">
                          {analyticsData.stats.analytics.last7Days.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">7 Hari Terakhir</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <p className="text-lg font-bold text-blue-600">
                          {analyticsData.stats.analytics.last30Days.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          30 Hari Terakhir
                        </p>
                      </div>
                    </div>
                  </div>

                  {analyticsData.stats.analytics.topPages.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">
                        Halaman Populer
                      </h4>
                      {analyticsData.stats.analytics.topPages
                        .slice(0, 3)
                        .map((page, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm"
                          >
                            <span className="text-gray-700 truncate max-w-[150px]">
                              {page.page || "Unknown"}
                            </span>
                            <div className="flex space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {page.views} views
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {page.visitors} visitors
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Users Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>Statistik Pengguna</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {analyticsData.stats.users.admins}
                      </p>
                      <p className="text-sm text-gray-600">Admin</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {analyticsData.stats.users.regularUsers}
                      </p>
                      <p className="text-sm text-gray-600">User Biasa</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Status User</h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="font-bold text-green-600">
                          {analyticsData.stats.users.active}
                        </p>
                        <p className="text-gray-600">Aktif</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="font-bold text-gray-600">
                          {analyticsData.stats.users.inactive}
                        </p>
                        <p className="text-gray-600">Tidak Aktif</p>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded">
                        <p className="font-bold text-red-600">
                          {analyticsData.stats.users.suspended}
                        </p>
                        <p className="text-gray-600">Suspended</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dengan UMKM</span>
                      <span className="font-medium text-green-600">
                        {analyticsData.stats.users.withUmkm}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Handle Submission</span>
                      <span className="font-medium text-blue-600">
                        {analyticsData.stats.users.withSubmissions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Produk UMKM</span>
                      <span className="font-medium text-purple-600">
                        {analyticsData.stats.users.totalUmkmProducts}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Submission Ditangani
                      </span>
                      <span className="font-medium text-orange-600">
                        {analyticsData.stats.users.totalHandledSubmissions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dengan No. HP</span>
                      <span className="font-medium text-teal-600">
                        {analyticsData.stats.users.withPhone}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Basecamps & Galleries Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-orange-600" />
                    <span>Basecamp & Galeri</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basecamp Stats */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Statistik Basecamp
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-xl font-bold text-orange-600">
                          {analyticsData.stats.basecamps.totalCapacityPeople}
                        </p>
                        <p className="text-xs text-gray-600">
                          Total Kapasitas Orang
                        </p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-xl font-bold text-blue-600">
                          {analyticsData.stats.basecamps.totalCapacityVehicles}
                        </p>
                        <p className="text-xs text-gray-600">
                          Kapasitas Kendaraan
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Rata-rata Kapasitas
                        </span>
                        <span className="font-medium">
                          {analyticsData.stats.basecamps.avgCapacityPeople.toFixed(
                            0
                          )}{" "}
                          org
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dengan Sosmed</span>
                        <span className="font-medium text-blue-600">
                          {analyticsData.stats.basecamps.withSocialMedia}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dengan Menu</span>
                        <span className="font-medium text-green-600">
                          {analyticsData.stats.basecamps.withMenus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dengan Gambar</span>
                        <span className="font-medium text-purple-600">
                          {analyticsData.stats.basecamps.withImages}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Gallery Stats */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Statistik Galeri
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-pink-50 rounded-lg">
                        <p className="text-xl font-bold text-pink-600">
                          {analyticsData.stats.galleries.totalImages}
                        </p>
                        <p className="text-xs text-gray-600">Total Gambar</p>
                      </div>
                      <div className="text-center p-3 bg-indigo-50 rounded-lg">
                        <p className="text-xl font-bold text-indigo-600">
                          {analyticsData.stats.galleries.avgImagesPerGallery.toFixed(
                            1
                          )}
                        </p>
                        <p className="text-xs text-gray-600">
                          Rata-rata per Galeri
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Kategori</span>
                        <span className="font-medium text-blue-600">
                          {analyticsData.stats.galleries.categories}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dengan Deskripsi</span>
                        <span className="font-medium text-green-600">
                          {analyticsData.stats.galleries.withDescription}
                        </span>
                      </div>
                    </div>

                    {analyticsData.stats.galleries.topCategories.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">
                          Kategori Galeri
                        </h5>
                        {analyticsData.stats.galleries.topCategories
                          .slice(0, 2)
                          .map((category) => (
                            <div
                              key={category.category}
                              className="space-y-1 mb-2"
                            >
                              <div className="flex justify-between items-center">
                                <Badge variant="outline" className="text-xs">
                                  {category.category}
                                </Badge>
                                <span className="text-xs text-gray-600">
                                  {category.count} (
                                  {category.percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <Progress
                                value={category.percentage}
                                className="h-1"
                              />
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  <span>Aktivitas Terbaru (30 Hari Terakhir)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Konten Baru</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                        <span className="text-sm text-gray-600">Destinasi</span>
                        <Badge variant="secondary">
                          {
                            analyticsData.stats.destinations.recentlyAdded
                              .last30Days
                          }
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                        <span className="text-sm text-gray-600">Event</span>
                        <Badge variant="secondary">
                          {analyticsData.stats.events.recentlyAdded.last30Days}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                        <span className="text-sm text-gray-600">UMKM</span>
                        <Badge variant="secondary">
                          {analyticsData.stats.umkm.recentlyAdded.last30Days}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Fasilitas</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                        <span className="text-sm text-gray-600">Basecamp</span>
                        <Badge variant="secondary">
                          {
                            analyticsData.stats.basecamps.recentlyAdded
                              .last30Days
                          }
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-pink-50 rounded">
                        <span className="text-sm text-gray-600">Galeri</span>
                        <Badge variant="secondary">
                          {
                            analyticsData.stats.galleries.recentlyAdded
                              .last30Days
                          }
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Pengguna</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-indigo-50 rounded">
                        <span className="text-sm text-gray-600">User Baru</span>
                        <Badge variant="secondary">
                          {analyticsData.stats.users.recentlyJoined.last30Days}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Submission</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-teal-50 rounded">
                        <span className="text-sm text-gray-600">
                          Submission
                        </span>
                        <Badge variant="secondary">
                          {
                            analyticsData.stats.submissions.recentlySubmitted
                              .last30Days
                          }
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Trends */}
            {analyticsData.monthlyTrends &&
              analyticsData.monthlyTrends.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Trend Bulanan (6 Bulan Terakhir)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.monthlyTrends.slice(-6).map((month) => (
                        <div
                          key={month.month}
                          className="p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">
                              {new Date(month.month + "-01").toLocaleDateString(
                                "id-ID",
                                {
                                  year: "numeric",
                                  month: "long",
                                }
                              )}
                            </h4>
                            <Badge variant="outline">{month.total} total</Badge>
                          </div>
                          <div className="grid grid-cols-5 gap-3 text-sm">
                            <div className="text-center p-2 bg-blue-100 rounded">
                              <p className="font-bold text-blue-600">
                                {month.destinations}
                              </p>
                              <p className="text-xs text-gray-600">Destinasi</p>
                            </div>
                            <div className="text-center p-2 bg-purple-100 rounded">
                              <p className="font-bold text-purple-600">
                                {month.events}
                              </p>
                              <p className="text-xs text-gray-600">Event</p>
                            </div>
                            <div className="text-center p-2 bg-green-100 rounded">
                              <p className="font-bold text-green-600">
                                {month.umkm}
                              </p>
                              <p className="text-xs text-gray-600">UMKM</p>
                            </div>
                            <div className="text-center p-2 bg-orange-100 rounded">
                              <p className="font-bold text-orange-600">
                                {month.basecamps}
                              </p>
                              <p className="text-xs text-gray-600">Basecamp</p>
                            </div>
                            <div className="text-center p-2 bg-pink-100 rounded">
                              <p className="font-bold text-pink-600">
                                {month.galleries}
                              </p>
                              <p className="text-xs text-gray-600">Galeri</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Growth Rates */}
            {analyticsData.growthRates && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Tingkat Pertumbuhan (30 Hari Terakhir)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(analyticsData.growthRates).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="text-center p-4 bg-gray-50 rounded-lg"
                        >
                          <p
                            className={`text-2xl font-bold ${
                              value > 0
                                ? "text-green-600"
                                : value < 0
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {value > 0 ? "+" : ""}
                            {value.toFixed(1)}%
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {key === "umkm"
                              ? "UMKM"
                              : key === "submissions"
                              ? "Submission"
                              : key}
                          </p>
                        </div>
                      )
                    )}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Interpretasi Growth Rate
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">
                          Positif: Pertumbuhan bagus
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <span className="text-gray-600">
                          0%: Tidak ada perubahan
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-gray-600">
                          Negatif: Penurunan
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary Footer */}
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className="text-center p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                    <p className="text-3xl font-bold text-blue-600">
                      {analyticsData.summary.totalItems}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Total Konten</p>
                  </div>
                  <div className="text-center p-4 border-2 border-green-200 rounded-lg bg-green-50">
                    <p className="text-3xl font-bold text-green-600">
                      {analyticsData.summary.activeItems}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Konten Aktif</p>
                  </div>
                  <div className="text-center p-4 border-2 border-teal-200 rounded-lg bg-teal-50">
                    <p className="text-3xl font-bold text-teal-600">
                      {analyticsData.summary.totalSubmissions}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Total Submission
                    </p>
                  </div>
                  <div className="text-center p-4 border-2 border-indigo-200 rounded-lg bg-indigo-50">
                    <p className="text-3xl font-bold text-indigo-600">
                      {analyticsData.summary.totalPageViews.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Page Views</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Data terakhir diperbarui pada:{" "}
                      {new Date(
                        analyticsData.summary.lastUpdated
                      ).toLocaleString("id-ID", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestAnalyticsPage;
