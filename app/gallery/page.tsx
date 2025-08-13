"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Grid3X3,
  LayoutGrid,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  AlertCircle,
  Eye,
  Calendar,
  Tag,
} from "lucide-react";
import Image from "next/image";

interface GalleryItem {
  id: string;
  title: string;
  description?: string | null;
  images: string[];
  category: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GalleryResponse {
  items: GalleryItem[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export default function GalleryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedView, setSelectedView] = useState<"grid" | "masonry">("grid");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 12,
  });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<GalleryItem | null>(null);

  const categories = [
    { value: "all", label: "Semua Kategori" },
    { value: "Wisata Alam", label: "Wisata Alam" },
    { value: "Budaya", label: "Budaya" },
    { value: "Event", label: "Event" },
    { value: "Kehidupan Desa", label: "Kehidupan Desa" },
    { value: "Pemandangan", label: "Pemandangan" },
    { value: "Arsitektur", label: "Arsitektur" },
    { value: "Camping", label: "Camping" },
    { value: "UMKM", label: "UMKM" },
  ];

  // Safe data normalization
  const normalizeGalleryItem = (item: any): GalleryItem => {
    return {
      id: item?.id?.toString() || "",
      title: item?.title?.toString() || "Untitled",
      description: item?.description?.toString() || null,
      images: Array.isArray(item?.images) ? item.images.filter(Boolean) : [],
      category: item?.category?.toString() || "Other",
      active: Boolean(item?.active),
      createdAt: item?.createdAt?.toString() || new Date().toISOString(),
      updatedAt: item?.updatedAt?.toString() || new Date().toISOString(),
    };
  };

  // Safe pagination normalization
  const normalizePagination = (pagination: any) => {
    return {
      totalItems: Number(pagination?.totalItems) || 0,
      totalPages: Number(pagination?.totalPages) || 1,
      currentPage: Number(pagination?.currentPage) || 1,
      limit: Number(pagination?.limit) || 12,
    };
  };

  const fetchGalleryItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: (pagination.currentPage || 1).toString(),
        limit: (pagination.limit || 12).toString(),
      });

      if (searchTerm?.trim()) {
        params.append("search", searchTerm.trim());
      }

      if (selectedCategory && selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      console.log("Fetching gallery with params:", params.toString());

      const response = await fetch(`/api/gallery?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);

        let errorMessage = "Failed to fetch gallery items";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Gallery data received:", data);

      // Safely normalize the response data
      const normalizedItems = Array.isArray(data?.items)
        ? data.items.map(normalizeGalleryItem)
        : [];

      const normalizedPagination = normalizePagination(data?.pagination);

      console.log(
        "Successfully processed gallery items:",
        normalizedItems.length
      );
      setGalleryItems(normalizedItems);
      setPagination(normalizedPagination);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan tak terduga"
      );
      setGalleryItems([]);
      setPagination({
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 12,
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, pagination.currentPage]);

  useEffect(() => {
    fetchGalleryItems();
  }, [fetchGalleryItems]);

  // Reset page when search/category changes
  useEffect(() => {
    if (pagination.currentPage !== 1) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }
  }, [searchTerm, selectedCategory]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Wisata Alam":
        return "bg-green-100 text-green-800";
      case "Budaya":
        return "bg-purple-100 text-purple-800";
      case "Event":
        return "bg-blue-100 text-blue-800";
      case "Kehidupan Desa":
        return "bg-orange-100 text-orange-800";
      case "Pemandangan":
        return "bg-teal-100 text-teal-800";
      case "Arsitektur":
        return "bg-gray-100 text-gray-800";
      case "Camping":
        return "bg-yellow-100 text-yellow-800";
      case "UMKM":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const openDetail = (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailItem(item);
  };
  const closeDetail = () => setDetailItem(null);
  const nextImage = () => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % galleryItems.length : null
    );
  };
  const prevImage = () => {
    setLightboxIndex((prev) =>
      prev !== null
        ? (prev - 1 + galleryItems.length) % galleryItems.length
        : null
    );
  };
  const handleRetry = () => fetchGalleryItems();
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  // Helper function to get image URL with error handling
  const getImageUrl = (item: GalleryItem): string => {
    if (
      Array.isArray(item?.images) &&
      item.images.length > 0 &&
      item.images[0]
    ) {
      return item.images[0];
    }
    return "/placeholder.svg?height=300&width=400";
  };

  const handlePaginationChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  // Safe date formatting
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString("id-ID");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[350px] bg-gradient-to-r from-teal-800 to-teal-600">
        <div className="absolute inset-0 bg-black/40" />
        <Image
          src="/merbabuu.png"
          alt="Galeri Desa Tarubatang"
          fill
          className="object-cover"
          priority
          onError={(e) => {
            // Fallback to gradient background if image fails to load
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-4">Galeri Desa Tarubatang</h1>
            <p className="text-xl text-teal-100 max-w-2xl">
              Kumpulan dokumentasi keindahan Desa Tarubatang
            </p>
          </div>
        </div>
      </section>

      {/* Filter & Search */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari foto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant={selectedView === "grid" ? "default" : "outline"}
                onClick={() => setSelectedView("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={selectedView === "masonry" ? "default" : "outline"}
                onClick={() => setSelectedView("masonry")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {selectedCategory === "all"
                ? "Semua Foto"
                : `Galeri ${selectedCategory}`}
            </h2>
            {!loading && !error && (
              <p className="text-sm text-gray-500 mt-2">
                Menampilkan {galleryItems.length} dari{" "}
                {pagination.totalItems || 0} foto
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Memuat galeri...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Card className="bg-red-50 border-red-200 max-w-2xl mx-auto">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600 mr-2" />
                    <h3 className="text-lg font-semibold text-red-800">
                      Error Loading Gallery
                    </h3>
                  </div>
                  <p className="text-red-700 text-sm mb-4">{error}</p>
                  <div className="space-x-2">
                    <Button onClick={handleRetry}>Coba Lagi</Button>
                    <Button variant="outline" onClick={handleResetFilters}>
                      Reset Filter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== "all"
                  ? "Tidak ada foto yang sesuai dengan pencarian."
                  : "Belum ada foto di galeri."}
              </p>
              <Button onClick={handleResetFilters}>Reset Filter</Button>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                selectedView === "grid"
                  ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "columns-1 md:columns-2 lg:columns-3 xl:columns-4"
              }`}
            >
              {galleryItems.map((item, index) => (
                <Card
                  key={item.id}
                  className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group ${
                    selectedView === "masonry" ? "mb-6 break-inside-avoid" : ""
                  }`}
                  onClick={() => openLightbox(index)}
                >
                  <div className="relative">
                    <Image
                      src={getImageUrl(item)}
                      alt={item.title || "Gallery image"}
                      width={400}
                      height={300}
                      className={`w-full object-cover ${
                        selectedView === "grid" ? "h-48" : "h-auto"
                      }`}
                      onError={(e) => {
                        e.currentTarget.src =
                          "/placeholder.svg?height=300&width=400";
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <Badge
                        className={getCategoryColor(item.category || "Other")}
                      >
                        {item.category || "Other"}
                      </Badge>
                    </div>
                    {!item.active && (
                      <div className="absolute top-4 right-4">
                        <Badge
                          variant="secondary"
                          className="bg-gray-800 text-white"
                        >
                          Tidak Aktif
                        </Badge>
                      </div>
                    )}

                    {/* Detail Button - appears on hover */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => openDetail(item, e)}
                        className="bg-white/90 hover:bg-white text-gray-800"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">
                      {item.title || "Untitled"}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatDate(item.createdAt)}</span>
                      <span className="flex items-center">
                        <ImageIcon className="h-4 w-4 mr-1" />
                        {Array.isArray(item.images) ? item.images.length : 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && pagination.totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePaginationChange(pagination.currentPage - 1)
                  }
                  disabled={pagination.currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                {/* Page numbers */}
                {Array.from(
                  { length: Math.min(pagination.totalPages, 7) },
                  (_, i) => {
                    const pageNumber = i + 1;
                    if (pagination.totalPages <= 7) {
                      return pageNumber;
                    }

                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.totalPages
                    ) {
                      return pageNumber;
                    }

                    if (Math.abs(pageNumber - pagination.currentPage) <= 1) {
                      return pageNumber;
                    }

                    if (pageNumber === 2 && pagination.currentPage > 4) {
                      return "...";
                    }

                    if (
                      pageNumber === pagination.totalPages - 1 &&
                      pagination.currentPage < pagination.totalPages - 3
                    ) {
                      return "...";
                    }

                    return null;
                  }
                )
                  .filter(Boolean)
                  .map((page, index) => (
                    <Button
                      key={index}
                      variant={
                        pagination.currentPage === page ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        typeof page === "number"
                          ? handlePaginationChange(page)
                          : undefined
                      }
                      disabled={typeof page !== "number"}
                    >
                      {page}
                    </Button>
                  ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePaginationChange(pagination.currentPage + 1)
                  }
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && galleryItems[lightboxIndex] && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          {/* Close Button */}
          <Button
            variant="ghost"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-10"
            onClick={prevImage}
            disabled={galleryItems.length <= 1}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-10"
            onClick={nextImage}
            disabled={galleryItems.length <= 1}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          {/* Main Content Container */}
          <div className="w-full h-full flex flex-col max-w-7xl">
            {/* Image Container - Full responsive */}
            <div className="flex-1 flex items-center justify-center min-h-0 pb-4">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={
                    getImageUrl(galleryItems[lightboxIndex]) ||
                    "/placeholder.svg"
                  }
                  alt={galleryItems[lightboxIndex].title || "Gallery image"}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                  style={{
                    maxWidth: "calc(100vw - 8rem)", // Account for navigation buttons
                    maxHeight: "calc(100vh - 12rem)", // Account for info panel
                  }}
                  onError={(e) => {
                    e.currentTarget.src =
                      "/placeholder.svg?height=600&width=800";
                  }}
                />
              </div>
            </div>

            {/* Info Panel - Fixed height */}
            <div className="bg-black/70 text-white p-4 rounded-lg mx-4 flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold mb-1 truncate">
                    {galleryItems[lightboxIndex].title || "Untitled"}
                  </h3>
                  {galleryItems[lightboxIndex].description && (
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {galleryItems[lightboxIndex].description}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge
                    className={getCategoryColor(
                      galleryItems[lightboxIndex].category || "Other"
                    )}
                  >
                    {galleryItems[lightboxIndex].category || "Other"}
                  </Badge>
                  <p className="text-sm text-gray-300 mt-1">
                    {formatDate(galleryItems[lightboxIndex].createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
                <span>
                  {lightboxIndex + 1} dari {galleryItems.length} foto
                </span>
                <span className="flex items-center">
                  <ImageIcon className="h-4 w-4 mr-1" />
                  {Array.isArray(galleryItems[lightboxIndex].images)
                    ? galleryItems[lightboxIndex].images.length
                    : 0}{" "}
                  gambar
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog
        open={!!detailItem}
        onOpenChange={(open) => !open && closeDetail()}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {detailItem?.title || "Detail Foto"}
            </DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang foto galeri
            </DialogDescription>
          </DialogHeader>

          {detailItem && (
            <div className="space-y-6">
              {/* Image Gallery */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Gambar (
                  {Array.isArray(detailItem.images)
                    ? detailItem.images.length
                    : 0}
                  )
                </h3>

                {Array.isArray(detailItem.images) &&
                detailItem.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detailItem.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video relative rounded-lg overflow-hidden border">
                          <Image
                            src={imageUrl || "/placeholder.svg"}
                            alt={`${detailItem.title} - Gambar ${index + 1}`}
                            fill
                            className="object-cover cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => {
                              closeDetail();
                              openLightbox(
                                galleryItems.findIndex(
                                  (item) => item.id === detailItem.id
                                )
                              );
                            }}
                            onError={(e) => {
                              e.currentTarget.src =
                                "/placeholder.svg?height=300&width=400";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <p className="text-sm text-center mt-2 text-gray-600">
                          Gambar {index + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Tidak ada gambar tersedia</p>
                  </div>
                )}
              </div>

              {/* Details Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informasi Dasar</h3>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Tag className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Kategori</p>
                        <Badge
                          className={getCategoryColor(
                            detailItem.category || "Other"
                          )}
                        >
                          {detailItem.category || "Other"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Tanggal Dibuat</p>
                        <p className="font-medium">
                          {formatDate(detailItem.createdAt)}
                        </p>
                      </div>
                    </div>

                    {detailItem.updatedAt &&
                      detailItem.updatedAt !== detailItem.createdAt && (
                        <div className="flex items-start space-x-3">
                          <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">
                              Terakhir Diperbarui
                            </p>
                            <p className="font-medium">
                              {formatDate(detailItem.updatedAt)}
                            </p>
                          </div>
                        </div>
                      )}

                    <div className="flex items-start space-x-3">
                      <div className="h-5 w-5 flex items-center justify-center mt-0.5">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            detailItem.active ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <Badge
                          variant={detailItem.active ? "default" : "secondary"}
                        >
                          {detailItem.active ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Deskripsi</h3>
                  {detailItem.description ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {detailItem.description}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-gray-500 italic">
                        Tidak ada deskripsi tersedia
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Statistik</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-teal-600">
                      {Array.isArray(detailItem.images)
                        ? detailItem.images.length
                        : 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Gambar</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">
                      {detailItem.title?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Karakter Judul</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-600">
                      {detailItem.description?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      Karakter Deskripsi
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">
                      {detailItem.id?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">ID Length</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    closeDetail();
                    const itemIndex = galleryItems.findIndex(
                      (item) => item.id === detailItem.id
                    );
                    if (itemIndex !== -1) {
                      openLightbox(itemIndex);
                    }
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Lihat di Lightbox
                </Button>
                <Button onClick={closeDetail}>Tutup</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
