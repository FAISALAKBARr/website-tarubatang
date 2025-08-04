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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Enhanced interfaces matching the API response
interface AnalyticsStats {
  destinations: {
    total: number;
    active: number;
    inactive: number;
    categories: number;
    avgRating: number;
    totalReviews: number;
    withLocation: number;
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
    active: number;
    inactive: number;
    suspended: number;
    withUmkm: number;
    withSubmissions: number;
    totalUmkmProducts: number;
    totalSubmissions: number;
    recentlyJoined: {
      last7Days: number;
      last30Days: number;
    };
  };
  submissions: {
    total: number;
    pending: number;
    reviewed: number;
    responded: number;
    closed: number;
    byType: {
      guestbook: number;
      volunteer: number;
      feedback: number;
      complaint: number;
      business: number;
    };
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

  // Loading state
  if (loading && !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4 p-8">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Memuat Data Analytics
            </h3>
            <p className="text-gray-600 mt-2">
              Mengumpulkan data statistik platform...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analytics Platform Desa Tarubatang
          </h1>
          <p className="text-gray-600">
            Statistik dan analisis data platform pariwisata dan UMKM
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Error:</strong> {error}
                  {retryCount > 0 && (
                    <div className="text-sm mt-1">
                      Percobaan ke-{retryCount}/3
                      {retryCount < 3 && " (otomatis mencoba ulang...)"}
                    </div>
                  )}
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
                  Coba Lagi
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Status Bar */}
        {analyticsData && (
          <div className="mb-6 flex items-center justify-between text-sm bg-white p-4 rounded-lg shadow-sm">
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
        )}

        {/* No Data State */}
        {!loading && !error && !analyticsData && (
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <WifiOff className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tidak Ada Data
              </h3>
              <p className="text-gray-600 mb-4">
                Belum ada data yang tersedia untuk ditampilkan.
              </p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Muat Ulang
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {analyticsData && (
          <div className="space-y-8">
            {/* Summary Cards */}
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
                        {analyticsData.stats.destinations.avgRating.toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-600">Rating Rata-rata</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {analyticsData.stats.destinations.totalReviews}
                      </p>
                      <p className="text-sm text-gray-600">Total Review</p>
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
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    <span>Aktivitas Terbaru (7 Hari)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Mountain className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium">
                          Destinasi Baru
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {
                          analyticsData.stats.destinations.recentlyAdded
                            .last7Days
                        }
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <PartyPopper className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium">Event Baru</span>
                      </div>
                      <Badge variant="secondary">
                        {analyticsData.stats.events.recentlyAdded.last7Days}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Store className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium">UMKM Baru</span>
                      </div>
                      <Badge variant="secondary">
                        {analyticsData.stats.umkm.recentlyAdded.last7Days}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-orange-600" />
                        <span className="text-sm font-medium">
                          Basecamp Baru
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {analyticsData.stats.basecamps.recentlyAdded.last7Days}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trends */}
            {analyticsData.monthlyTrends &&
              analyticsData.monthlyTrends.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Trend Bulanan</span>
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
                            {key === "umkm" ? "UMKM" : key}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestAnalyticsPage;
