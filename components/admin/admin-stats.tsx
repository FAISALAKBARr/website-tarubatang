import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Store, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package,
  Phone,
  MapPin,
  Calendar,
  Eye,
  ShoppingCart,
  Star,
  RefreshCw,
  Filter,
  PieChart,
  BarChart3,
  Activity
} from 'lucide-react';

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
  user: {
    id: string;
    name: string;
    phone: string;
  };
}

interface UMKMStatisticsProps {
  umkmData: UMKM[];
  loading?: boolean;
  onRefresh?: () => void;
}

interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
  activeCount: number;
  totalStock: number;
}

interface MonthlyStats {
  month: string;
  count: number;
  growth: number;
}

const UMKMStatistics: React.FC<UMKMStatisticsProps> = ({ 
  umkmData, 
  loading = false, 
  onRefresh 
}) => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Calculate basic statistics
  const totalUMKM = umkmData.length;
  const activeUMKM = umkmData.filter(umkm => umkm.isActive).length;
  const inactiveUMKM = totalUMKM - activeUMKM;
  const activationRate = totalUMKM > 0 ? (activeUMKM / totalUMKM) * 100 : 0;

  // Calculate category statistics
  const categoryStats: CategoryStats[] = React.useMemo(() => {
    const categoryMap = new Map<string, { count: number; activeCount: number; totalStock: number }>();
    
    umkmData.forEach(umkm => {
      const existing = categoryMap.get(umkm.category) || { count: 0, activeCount: 0, totalStock: 0 };
      categoryMap.set(umkm.category, {
        count: existing.count + 1,
        activeCount: existing.activeCount + (umkm.isActive ? 1 : 0),
        totalStock: existing.totalStock + (umkm.stock || 0)
      });
    });

    return Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      count: stats.count,
      activeCount: stats.activeCount,
      totalStock: stats.totalStock,
      percentage: totalUMKM > 0 ? (stats.count / totalUMKM) * 100 : 0
    })).sort((a, b) => b.count - a.count);
  }, [umkmData, totalUMKM]);

  // Calculate monthly growth
  const monthlyStats: MonthlyStats[] = React.useMemo(() => {
    const monthMap = new Map<string, number>();
    
    umkmData.forEach(umkm => {
      const date = new Date(umkm.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
    });

    const months = Array.from(monthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return months.map((item, index) => ({
      ...item,
      growth: index > 0 ? ((item.count - months[index - 1].count) / months[index - 1].count) * 100 : 0
    }));
  }, [umkmData]);

  // Calculate recent activity
  const recentActivity = React.useMemo(() => {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      last7Days: umkmData.filter(umkm => new Date(umkm.createdAt) >= last7Days).length,
      last30Days: umkmData.filter(umkm => new Date(umkm.createdAt) >= last30Days).length,
      updated7Days: umkmData.filter(umkm => new Date(umkm.updatedAt) >= last7Days).length
    };
  }, [umkmData]);

  // Get top performing categories
  const topCategories = categoryStats.slice(0, 5);

  // Calculate total stock
  const totalStock = umkmData.reduce((sum, umkm) => sum + (umkm.stock || 0), 0);
  const averageStock = totalUMKM > 0 ? totalStock / totalUMKM : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Statistik UMKM</h2>
          <p className="text-gray-600">Analisis detail performa UMKM Desa Tarubatang</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total UMKM</p>
                <p className="text-2xl font-bold text-gray-900">{totalUMKM}</p>
                <p className="text-xs text-gray-500">+{recentActivity.last30Days} bulan ini</p>
              </div>
              <Store className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">UMKM Aktif</p>
                <p className="text-2xl font-bold text-green-600">{activeUMKM}</p>
                <p className="text-xs text-green-600">{activationRate.toFixed(1)}% dari total</p>
              </div>
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kategori</p>
                <p className="text-2xl font-bold text-purple-600">{categoryStats.length}</p>
                <p className="text-xs text-gray-500">Beragam kategori</p>
              </div>
              <PieChart className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Stok</p>
                <p className="text-2xl font-bold text-orange-600">{totalStock.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Rata-rata {averageStock.toFixed(0)} per UMKM</p>
              </div>
              <Package className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Aktivitas Terbaru</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{recentActivity.last7Days}</p>
              <p className="text-sm text-gray-600">UMKM baru (7 hari)</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{recentActivity.last30Days}</p>
              <p className="text-sm text-gray-600">UMKM baru (30 hari)</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{recentActivity.updated7Days}</p>
              <p className="text-sm text-gray-600">Update terakhir (7 hari)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Distribusi Kategori</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{category.category}</Badge>
                    <span className="text-sm text-gray-600">
                      {category.count} UMKM ({category.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className="text-green-600">{category.activeCount} aktif</span>
                    <span>•</span>
                    <span>{category.totalStock} stok</span>
                  </div>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Growth Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Trend Pertumbuhan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyStats.slice(-6).map((month, index) => (
              <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{month.month}</p>
                  <p className="text-sm text-gray-600">{month.count} UMKM baru</p>
                </div>
                <div className="flex items-center space-x-2">
                  {month.growth > 0 ? (
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">+{month.growth.toFixed(1)}%</span>
                    </div>
                  ) : month.growth < 0 ? (
                    <div className="flex items-center text-red-600">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">{month.growth.toFixed(1)}%</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">0%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status UMKM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Aktif</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">{activeUMKM}</p>
                  <p className="text-sm text-gray-500">{activationRate.toFixed(1)}%</p>
                </div>
              </div>
              <Progress value={activationRate} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>Tidak Aktif</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-600">{inactiveUMKM}</p>
                  <p className="text-sm text-gray-500">{(100 - activationRate).toFixed(1)}%</p>
                </div>
              </div>
              <Progress value={100 - activationRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Inventori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Stok</span>
                <span className="font-bold text-xl">{totalStock.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Rata-rata per UMKM</span>
                <span className="font-medium">{averageStock.toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">UMKM dengan Stok > 0</span>
                <span className="font-medium">
                  {umkmData.filter(umkm => (umkm.stock || 0) > 0).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Stok Tertinggi</span>
                <span className="font-medium">
                  {Math.max(...umkmData.map(umkm => umkm.stock || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UMKMStatistics;