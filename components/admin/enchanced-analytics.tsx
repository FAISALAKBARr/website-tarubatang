"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Store,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  RefreshCw,
  BarChart3,
  Activity,
  Mountain,
  Building,
  PartyPopper,
  CheckCircle,
  Clock,
  MessageSquare,
  Globe,
} from "lucide-react";

// Enhanced interfaces matching the improved API
interface EnhancedStats {
  destinations: {
    total: number;
    active: number;
    inactive: number;
    categories: number;
    avgRating: number;
    totalReviews: number;
    withLocation: number;
    recentlyAdded: { last7Days: number; last30Days: number };
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
    recentlyAdded: { last7Days: number; last30Days: number };
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
    recentlyAdded: { last7Days: number; last30Days: number };
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
    recentlyAdded: { last7Days: number; last30Days: number };
  };
  galleries: {
    total: number;
    active: number;
    inactive: number;
    totalImages: number;
    avgImagesPerGallery: number;
    categories: number;
    recentlyAdded: { last7Days: number; last30Days: number };
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
    recentlyJoined: { last7Days: number; last30Days: number };
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
    recentlySubmitted: { last7Days: number; last30Days: number };
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
    topPages: Array<{ page: string; views: number; visitors: number }>;
  };
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

interface MonthlyTrend {
  month: string;
  destinations: number;
  events: number;
  umkm: number;
  basecamps: number;
  galleries: number;
  total: number;
}

interface EnhancedAnalyticsProps {
  data: any;
  stats: EnhancedStats;
  monthlyTrends: MonthlyTrend[];
  growthRates: GrowthRates;
  loading?: boolean;
  onRefresh?: () => void;
}

const EnhancedAnalytics: React.FC<EnhancedAnalyticsProps> = ({
  data,
  stats,
  monthlyTrends,
  growthRates,
  loading = false,
  onRefresh,
}) => {
  const [selectedView, setSelectedView] = useState<string>("overview");
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "7d" | "30d" | "all"
  >("30d");

  // Helper function to format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Helper function to get growth indicator
  const getGrowthIndicator = (rate: number) => {
    if (rate > 0)
      return { icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" };
    if (rate < 0)
      return { icon: TrendingDown, color: "text-red-600", bg: "bg-red-50" };
    return { icon: Activity, color: "text-gray-600", bg: "bg-gray-50" };
  };

  // Overview Dashboard
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Destinations Card */}
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">
                  Destinasi Wisata
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.destinations.total}
                </p>
                <div className="flex items-center space-x-2 text-xs">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    {stats.destinations.active} aktif
                  </Badge>
                  <span className="text-gray-500">
                    +{stats.destinations.recentlyAdded.last30Days} bulan ini
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Mountain className="h-8 w-8 text-blue-500" />
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  <span className="text-xs font-medium">
                    {stats.destinations.avgRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Card */}
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">
                  Event & Kegiatan
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.events.total}
                </p>
                <div className="flex items-center space-x-2 text-xs">
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800"
                  >
                    {stats.events.upcoming} mendatang
                  </Badge>
                  <span className="text-gray-500">
                    {formatNumber(stats.events.totalParticipants)} partisipan
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <PartyPopper className="h-8 w-8 text-purple-500" />
                <div className="text-xs text-center">
                  <div className="font-medium">
                    {stats.events.capacityUtilization.toFixed(0)}%
                  </div>
                  <div className="text-gray-500">kapasitas</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* UMKM Card */}
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">UMKM</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.umkm.total}
                </p>
                <div className="flex items-center space-x-2 text-xs">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    {formatNumber(stats.umkm.totalStock)} stok
                  </Badge>
                  <span className="text-gray-500">
                    {stats.umkm.withStock} tersedia
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Store className="h-8 w-8 text-green-500" />
                <div className="text-xs text-center">
                  <div className="font-medium">{stats.umkm.categories}</div>
                  <div className="text-gray-500">kategori</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basecamps Card */}
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Basecamp</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.basecamps.total}
                </p>
                <div className="flex items-center space-x-2 text-xs">
                  <Badge
                    variant="secondary"
                    className="bg-indigo-100 text-indigo-800"
                  >
                    {formatNumber(stats.basecamps.totalCapacityPeople)}{" "}
                    kapasitas
                  </Badge>
                  <span className="text-gray-500">
                    {stats.basecamps.withMenus} dengan menu
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Building className="h-8 w-8 text-orange-500" />
                <div className="text-xs text-center">
                  <div className="font-medium">
                    {stats.basecamps.avgCapacityPeople.toFixed(0)}
                  </div>
                  <div className="text-gray-500">rata-rata</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Pertumbuhan 30 Hari Terakhir</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Object.entries(growthRates).map(([key, rate]) => {
              const { icon: Icon, color, bg } = getGrowthIndicator(rate);
              return (
                <div key={key} className={`p-3 rounded-lg ${bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className={`text-sm font-bold ${color}`}>
                      {rate > 0 ? "+" : ""}
                      {rate.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-700 capitalize">
                    {key === "umkm" ? "UMKM" : key}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Admin & System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Admin Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Admin Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Admin</span>
                <span className="font-bold text-xl">{stats.users.total}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600">Aktif</span>
                  <span className="font-medium">{stats.users.active}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tidak Aktif</span>
                  <span className="font-medium">{stats.users.inactive}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-600">Suspended</span>
                  <span className="font-medium">{stats.users.suspended}</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Dengan UMKM</span>
                  <span className="font-medium">{stats.users.withUmkm}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Submissions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-bold text-xl">
                  {stats.submissions.total}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-yellow-500" />
                    <span>Pending</span>
                  </div>
                  <span className="font-medium">
                    {stats.submissions.pending}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Responded</span>
                  </div>
                  <span className="font-medium">
                    {stats.submissions.responded}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Response Rate</span>
                  <span className="font-medium">
                    {stats.submissions.responseRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Website Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Website Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Page Views</span>
                <span className="font-bold text-xl">
                  {formatNumber(stats.analytics.totalPageViews)}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Unique Visitors</span>
                  <span className="font-medium">
                    {formatNumber(stats.analytics.totalVisitors)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Unique Pages</span>
                  <span className="font-medium">
                    {stats.analytics.uniquePages}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Avg. Daily Views</span>
                  <span className="font-medium">
                    {formatNumber(stats.analytics.avgPageViewsPerDay)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Trend Bulanan (12 Bulan Terakhir)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyTrends.slice(-6).map((month) => (
              <div key={month.month} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-gray-900">{month.month}</p>
                  <p className="text-sm font-bold text-gray-900">
                    {month.total} total
                  </p>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  <div className="text-center">
                    <div className="w-full bg-blue-200 rounded-full h-2 mb-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(month.destinations / month.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="font-medium text-blue-600 text-sm">
                      {month.destinations}
                    </p>
                    <p className="text-xs text-gray-500">Destinasi</p>
                  </div>
                  <div className="text-center">
                    <div className="w-full bg-purple-200 rounded-full h-2 mb-1">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${(month.events / month.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="font-medium text-purple-600 text-sm">
                      {month.events}
                    </p>
                    <p className="text-xs text-gray-500">Event</p>
                  </div>
                  <div className="text-center">
                    <div className="w-full bg-green-200 rounded-full h-2 mb-1">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(month.umkm / month.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="font-medium text-green-600 text-sm">
                      {month.umkm}
                    </p>
                    <p className="text-xs text-gray-500">UMKM</p>
                  </div>
                  <div className="text-center">
                    <div className="w-full bg-orange-200 rounded-full h-2 mb-1">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{
                          width: `${(month.basecamps / month.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="font-medium text-orange-600 text-sm">
                      {month.basecamps}
                    </p>
                    <p className="text-xs text-gray-500">Basecamp</p>
                  </div>
                  <div className="text-center">
                    <div className="w-full bg-pink-200 rounded-full h-2 mb-1">
                      <div
                        className="bg-pink-600 h-2 rounded-full"
                        style={{
                          width: `${(month.galleries / month.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="font-medium text-pink-600 text-sm">
                      {month.galleries}
                    </p>
                    <p className="text-xs text-gray-500">Galeri</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Enhanced Analytics Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Analisis komprehensif platform Desa Tarubatang dengan data real-time
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center space-x-2 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs
        value={selectedView}
        onValueChange={setSelectedView}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="destinations"
            className="flex items-center space-x-2"
          >
            <Mountain className="h-4 w-4" />
            <span>Destinasi</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center space-x-2">
            <PartyPopper className="h-4 w-4" />
            <span>Event</span>
          </TabsTrigger>
          <TabsTrigger value="umkm" className="flex items-center space-x-2">
            <Store className="h-4 w-4" />
            <span>UMKM</span>
          </TabsTrigger>
          <TabsTrigger
            value="basecamps"
            className="flex items-center space-x-2"
          >
            <Building className="h-4 w-4" />
            <span>Basecamp</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>System</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        {/* Other tab contents would be implemented similarly */}
        <TabsContent value="destinations" className="mt-6">
          <div className="text-center py-8">
            <Mountain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              Detailed destination analytics coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <div className="text-center py-8">
            <PartyPopper className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              Detailed event analytics coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="umkm" className="mt-6">
          <div className="text-center py-8">
            <Store className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              Detailed UMKM analytics coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="basecamps" className="mt-6">
          <div className="text-center py-8">
            <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              Detailed basecamp analytics coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">System analytics coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAnalytics;
