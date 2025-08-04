"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Store,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  Eye,
  Star,
  RefreshCw,
  PieChart,
  BarChart3,
  Activity,
  Mountain,
  PartyPopper,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

// Enhanced interfaces matching the API response structure
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

interface AdminAnalyticsProps {
  data?: AnalyticsResponse;
  loading?: boolean;
  onRefresh?: () => void;
}

const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  data,
  loading = false,
  onRefresh,
}) => {
  const [selectedTab, setSelectedTab] = useState("overview");

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Data analytics tidak tersedia</p>
        </div>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Items</p>
                <p className="text-3xl font-bold">{data.summary.totalItems}</p>
                <p className="text-blue-100 text-sm">
                  {data.summary.activeItems} aktif
                </p>
              </div>
              <Package className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Users</p>
                <p className="text-3xl font-bold">{data.summary.totalUsers}</p>
                <p className="text-green-100 text-sm">
                  {data.stats.users.active} aktif
                </p>
              </div>
              <Users className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Submissions</p>
                <p className="text-3xl font-bold">
                  {data.summary.totalSubmissions}
                </p>
                <p className="text-purple-100 text-sm">
                  {data.stats.submissions.pending} pending
                </p>
              </div>
              <MessageSquare className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Page Views</p>
                <p className="text-3xl font-bold">
                  {data.summary.totalPageViews.toLocaleString()}
                </p>
                <p className="text-orange-100 text-sm">
                  {data.stats.analytics.last7Days} (7 hari)
                </p>
              </div>
              <Eye className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Destinations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mountain className="h-5 w-5 text-blue-600" />
              <span>Destinasi Wisata</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {data.stats.destinations.total}
                </p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {data.stats.destinations.active}
                </p>
                <p className="text-sm text-gray-600">Aktif</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Rating Rata-rata</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium">
                    {data.stats.destinations.avgRating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Review</span>
                <span className="font-medium">
                  {data.stats.destinations.totalReviews}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dengan Lokasi</span>
                <span className="font-medium">
                  {data.stats.destinations.withLocation}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600 mb-2">Aktivitas Terbaru</p>
              <div className="flex justify-between text-sm">
                <span>
                  7 hari:{" "}
                  <strong>
                    {data.stats.destinations.recentlyAdded.last7Days}
                  </strong>
                </span>
                <span>
                  30 hari:{" "}
                  <strong>
                    {data.stats.destinations.recentlyAdded.last30Days}
                  </strong>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PartyPopper className="h-5 w-5 text-purple-600" />
              <span>Event & Kegiatan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {data.stats.events.total}
                </p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {data.stats.events.upcoming}
                </p>
                <p className="text-sm text-gray-600">Mendatang</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Partisipan</span>
                <span className="font-medium">
                  {data.stats.events.totalParticipants}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rata-rata per Event</span>
                <span className="font-medium">
                  {data.stats.events.avgParticipants.toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Utilisasi Kapasitas</span>
                <span className="font-medium">
                  {data.stats.events.capacityUtilization.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600 mb-2">Status Event</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-green-50 rounded">
                  <p className="font-bold text-green-600">
                    {data.stats.events.upcoming}
                  </p>
                  <p className="text-gray-600">Mendatang</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <p className="font-bold text-blue-600">
                    {data.stats.events.ongoing}
                  </p>
                  <p className="text-gray-600">Berlangsung</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="font-bold text-gray-600">
                    {data.stats.events.past}
                  </p>
                  <p className="text-gray-600">Selesai</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* UMKM */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Store className="h-5 w-5 text-green-600" />
              <span>UMKM</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {data.stats.umkm.total}
                </p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {data.stats.umkm.totalStock}
                </p>
                <p className="text-sm text-gray-600">Total Stok</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Produk Tersedia</span>
                <span className="font-medium text-green-600">
                  {data.stats.umkm.withStock}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stok Habis</span>
                <span className="font-medium text-red-600">
                  {data.stats.umkm.outOfStock}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dengan User</span>
                <span className="font-medium">{data.stats.umkm.withUsers}</span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600 mb-2">Aktivitas Terbaru</p>
              <div className="flex justify-between text-sm">
                <span>
                  7 hari:{" "}
                  <strong>{data.stats.umkm.recentlyAdded.last7Days}</strong>
                </span>
                <span>
                  30 hari:{" "}
                  <strong>{data.stats.umkm.recentlyAdded.last30Days}</strong>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Analisis Submissions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Status Submissions</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <Badge variant="secondary">
                    {data.stats.submissions.pending}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Reviewed</span>
                  </div>
                  <Badge variant="secondary">
                    {data.stats.submissions.reviewed}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">Responded</span>
                  </div>
                  <Badge variant="secondary">
                    {data.stats.submissions.responded}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium">Closed</span>
                  </div>
                  <Badge variant="secondary">
                    {data.stats.submissions.closed}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-indigo-900">
                    Response Rate
                  </span>
                  <span className="text-lg font-bold text-indigo-600">
                    {data.stats.submissions.responseRate.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={data.stats.submissions.responseRate}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Tipe Submissions</h4>
              <div className="space-y-3">
                {Object.entries(data.stats.submissions.byType).map(
                  ([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm capitalize">{type}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (count / data.stats.submissions.total) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Rates */}
      {data.growthRates && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Tingkat Pertumbuhan (30 Hari Terakhir)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(data.growthRates).map(([key, value]) => (
                <div
                  key={key}
                  className="text-center p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-center mb-2">
                    {value > 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : value < 0 ? (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    ) : (
                      <div className="h-5 w-5" />
                    )}
                  </div>
                  <p
                    className={`text-xl font-bold ${
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
                  <p className="text-xs text-gray-600 capitalize">
                    {key === "umkm" ? "UMKM" : key}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCategoriesTab = () => (
    <div className="space-y-6">
      {/* Destinations Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mountain className="h-5 w-5 text-blue-600" />
            <span>Kategori Destinasi</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.stats.destinations.topCategories
              .slice(0, 8)
              .map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{category.category}</Badge>
                      <span className="text-sm text-gray-600">
                        {category.count} item ({category.percentage.toFixed(1)}
                        %)
                      </span>
                    </div>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Events Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PartyPopper className="h-5 w-5 text-purple-600" />
            <span>Kategori Event</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.stats.events.topCategories.slice(0, 8).map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{category.category}</Badge>
                    <span className="text-sm text-gray-600">
                      {category.count} item ({category.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* UMKM Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Store className="h-5 w-5 text-green-600" />
            <span>Kategori UMKM</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.stats.umkm.topCategories.slice(0, 8).map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{category.category}</Badge>
                    <span className="text-sm text-gray-600">
                      {category.count} item ({category.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTrendsTab = () => (
    <div className="space-y-6">
      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Trend Bulanan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.monthlyTrends.slice(-12).map((month) => (
              <div key={month.month} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    {new Date(month.month + "-01").toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                    })}
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
                    <p className="font-bold text-purple-600">{month.events}</p>
                    <p className="text-xs text-gray-600">Event</p>
                  </div>
                  <div className="text-center p-2 bg-green-100 rounded">
                    <p className="font-bold text-green-600">{month.umkm}</p>
                    <p className="text-xs text-gray-600">UMKM</p>
                  </div>
                  <div className="text-center p-2 bg-orange-100 rounded">
                    <p className="font-bold text-orange-600">
                      {month.basecamps}
                    </p>
                    <p className="text-xs text-gray-600">Basecamp</p>
                  </div>
                  <div className="text-center p-2 bg-pink-100 rounded">
                    <p className="font-bold text-pink-600">{month.galleries}</p>
                    <p className="text-xs text-gray-600">Galeri</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Web Analytics */}
      {data.stats.analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Web Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {data.stats.analytics.totalPageViews.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Page Views</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {data.stats.analytics.totalVisitors.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Visitors</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {data.stats.analytics.uniquePages}
                </p>
                <p className="text-sm text-gray-600">Unique Pages</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {data.stats.analytics.avgPageViewsPerDay.toFixed(0)}
                </p>
                <p className="text-sm text-gray-600">Avg Views/Day</p>
              </div>
            </div>

            {data.stats.analytics.topPages &&
              data.stats.analytics.topPages.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Top Pages</h4>
                  <div className="space-y-3">
                    {data.stats.analytics.topPages
                      .slice(0, 10)
                      .map((page, index) => (
                        <div
                          key={page.page}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="font-mono text-sm">
                              {page.page}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-600">
                              {page.views.toLocaleString()} views
                            </span>
                            <span className="text-gray-600">
                              {page.visitors.toLocaleString()} visitors
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Admin Analytics Dashboard
          </h2>
          <p className="text-gray-600">
            Analisis komprehensif dan mendalam untuk administrator
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">Data Summary</span>
          </div>
          <span className="text-sm text-blue-700">
            Last updated:{" "}
            {new Date(data.summary.lastUpdated).toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="flex items-center space-x-2"
          >
            <PieChart className="h-4 w-4" />
            <span>Categories</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Trends</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          {renderCategoriesTab()}
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          {renderTrendsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
