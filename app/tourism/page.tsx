"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Clock,
  Users,
  Star,
  Camera,
  Mountain,
  TreePine,
  Tent,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Phone,
  Globe,
  Calendar,
  Eye,
} from "lucide-react";
import Image from "next/image";
import GoogleMapsComponent from "@/components/google-maps";

interface Destination {
  id: string;
  name: string;
  category: string;
  description: string;
  content?: string;
  price: string;
  facilities: string[];
  location: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  totalReviews: number;
  isActive: boolean;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Image Viewer Component
function ImageViewer({
  images,
  isOpen,
  onClose,
  startIndex = 0,
}: {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  startIndex?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "Escape":
        onClose();
        break;
      case "ArrowLeft":
        prevImage();
        break;
      case "ArrowRight":
        nextImage();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[60] p-4">
      <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-black/70 text-white rounded-full text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        )}

        {/* Main Image */}
        <div className="relative w-full h-full flex items-center justify-center p-8">
          <img
            src={images[currentIndex] || "/placeholder.svg"}
            alt={`Image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg?height=800&width=800";
            }}
          />
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-xs overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0 ${
                  index === currentIndex
                    ? "border-white"
                    : "border-white/30 hover:border-white/60"
                }`}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-4 right-4 text-white/70 text-sm hidden md:block">
          <div className="flex flex-col items-end gap-1">
            <span>ESC untuk tutup</span>
            {images.length > 1 && (
              <>
                <span>← → untuk navigasi</span>
                <span>Klik thumbnail untuk langsung ke gambar</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Detail Modal Component
function DestinationDetailModal({
  destination,
  isOpen,
  onClose,
}: {
  destination: Destination | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);

  if (!destination) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === destination.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? destination.images.length - 1 : prev - 1
    );
  };

  const openImageViewer = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageViewer(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Wisata Alam":
        return TreePine;
      case "Pendakian":
        return Mountain;
      case "Camping":
        return Tent;
      case "Spot Foto":
        return Camera;
      default:
        return MapPin;
    }
  };

  const getDifficultyColor = (category: string) => {
    switch (category) {
      case "Wisata Alam":
        return "bg-green-100 text-green-800";
      case "Pendakian":
        return "bg-red-100 text-red-800";
      case "Camping":
        return "bg-blue-100 text-blue-800";
      case "Spot Foto":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const IconComponent = getCategoryIcon(destination.category);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <IconComponent className="h-6 w-6 text-green-600" />
              {destination.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image Gallery */}
            <div className="relative">
              <div className="relative h-80 md:h-96 rounded-lg overflow-hidden">
                <button
                  onClick={() => openImageViewer(currentImageIndex)}
                  className="relative w-full h-full group"
                >
                  <Image
                    src={
                      destination.images[currentImageIndex] ||
                      "/placeholder.svg?height=400&width=800" ||
                      "/placeholder.svg"
                    }
                    alt={`${destination.name} - Gambar ${
                      currentImageIndex + 1
                    }`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Eye className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </button>

                {/* Image Navigation */}
                {destination.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {destination.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {destination.images.length}
                  </div>
                )}

                {/* Category Badge */}
                <Badge
                  className={`${getDifficultyColor(
                    destination.category
                  )} absolute top-4 left-4`}
                >
                  {destination.category}
                </Badge>
              </div>

              {/* Thumbnail Gallery */}
              {destination.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {destination.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentImageIndex(index);
                        openImageViewer(index);
                      }}
                      className={`relative h-16 w-20 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${
                        index === currentImageIndex
                          ? "border-green-500"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={image || "/placeholder.svg?height=80&width=100"}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Deskripsi</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {destination.description}
                  </p>
                </div>

                {destination.content && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Detail Lengkap
                    </h3>
                    <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {destination.content}
                    </div>
                  </div>
                )}

                {destination.facilities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Fasilitas Tersedia
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {destination.facilities.map((facility, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          {facility}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Info */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informasi Umum</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{destination.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-green-600">
                        {destination.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Buka 24 Jam</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => {
                      if (destination.latitude && destination.longitude) {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`;
                        window.open(url, "_blank");
                      }
                    }}
                    disabled={!destination.latitude || !destination.longitude}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Petunjuk Arah
                  </Button>

                  <Button variant="outline" className="w-full bg-transparent">
                    <Phone className="h-4 w-4 mr-2" />
                    Hubungi Pemandu
                  </Button>

                  <Button variant="outline" className="w-full bg-transparent">
                    <Globe className="h-4 w-4 mr-2" />
                    Bagikan
                  </Button>
                </div>

                {/* Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tips Berkunjung</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Datang pagi hari untuk cuaca terbaik</li>
                      <li>• Bawa kamera untuk dokumentasi</li>
                      <li>• Gunakan sepatu yang nyaman</li>
                      <li>• Jaga kebersihan lingkungan</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Viewer */}
      <ImageViewer
        images={destination.images}
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        startIndex={currentImageIndex}
      />
    </>
  );
}

export default function TourismPage() {
  const [user, setUser] = useState<any>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
  }, [searchTerm, selectedCategory, pagination.page]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);

      const response = await fetch(`/api/destinations?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch destinations");
      }

      const data = await response.json();
      setDestinations(data.destinations);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const openDetailModal = (destination: Destination) => {
    setSelectedDestination(destination);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDestination(null);
  };

  const openImageViewer = (images: string[], startIndex = 0) => {
    setViewerImages(images);
    setViewerStartIndex(startIndex);
    setShowImageViewer(true);
  };

  const closeImageViewer = () => {
    setShowImageViewer(false);
    setViewerImages([]);
    setViewerStartIndex(0);
  };

  const getDifficultyColor = (category: string) => {
    switch (category) {
      case "Wisata Alam":
        return "bg-green-100 text-green-800";
      case "Pendakian":
        return "bg-red-100 text-red-800";
      case "Camping":
        return "bg-blue-100 text-blue-800";
      case "Spot Foto":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Wisata Alam":
        return TreePine;
      case "Pendakian":
        return Mountain;
      case "Camping":
        return Tent;
      case "Spot Foto":
        return Camera;
      default:
        return MapPin;
    }
  };

  const categories = [
    { value: "all", label: "Semua Kategori" },
    { value: "Wisata Alam", label: "Wisata Alam" },
    { value: "Pendakian", label: "Pendakian" },
    { value: "Camping", label: "Camping" },
    { value: "Spot Foto", label: "Spot Foto" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[400px] bg-gradient-to-r from-green-800 to-green-600">
        <div className="absolute inset-0 bg-black/40"></div>
        <Image
          src="/merbabuu.png"
          alt="Destinasi Wisata Tarubatang"
          fill
          className="object-cover"
          priority
        />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-4">
              Destinasi Wisata Tarubatang
            </h1>
            <p className="text-xl text-green-100 max-w-2xl">
              Jelajahi keindahan alam yang menakjubkan di kaki Gunung Merbabu
              dengan berbagai destinasi wisata yang memikat hati
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari destinasi wisata..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Cari
              </Button>
            </form>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Peta Lokasi Wisata
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Temukan lokasi semua destinasi wisata di Desa Tarubatang dengan
              peta interaktif di bawah ini
            </p>
          </div>
          <GoogleMapsComponent />
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {selectedCategory === "all"
                ? "Semua Destinasi Wisata"
                : `Destinasi ${selectedCategory}`}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {searchTerm
                ? `Hasil pencarian untuk "${searchTerm}"`
                : "Pilih destinasi yang sesuai dengan minat dan kemampuan Anda"}
            </p>
            {!loading && (
              <p className="text-sm text-gray-500 mt-2">
                Menampilkan {destinations.length} dari {pagination.total}{" "}
                destinasi
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Memuat destinasi...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchDestinations}>Coba Lagi</Button>
            </div>
          ) : destinations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                Tidak ada destinasi yang ditemukan.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="mt-4"
              >
                Reset Filter
              </Button>
            </div>
          ) : (
            <>
              <div className="grid lg:grid-cols-2 gap-8">
                {destinations.map((destination) => {
                  const IconComponent = getCategoryIcon(destination.category);
                  return (
                    <Card
                      key={destination.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="md:flex">
                        <div className="md:w-1/2 relative h-64 md:h-auto">
                          <button
                            onClick={() =>
                              openImageViewer(destination.images, 0)
                            }
                            className="relative w-full h-full group"
                          >
                            <Image
                              src={
                                destination.images[0] ||
                                "/placeholder.svg?height=300&width=400" ||
                                "/placeholder.svg"
                              }
                              alt={destination.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Eye className="h-6 w-6 text-green-600" />
                              </div>
                            </div>
                          </button>

                          <Badge
                            className={`${getDifficultyColor(
                              destination.category
                            )} absolute top-4 left-4`}
                          >
                            {destination.category}
                          </Badge>

                          {/* Image count indicator */}
                          {destination.images.length > 1 && (
                            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                              <Camera className="h-3 w-3" />
                              {destination.images.length}
                            </div>
                          )}
                        </div>

                        <div className="md:w-1/2 p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <IconComponent className="h-5 w-5 text-green-600" />
                              <h3
                                className="text-xl font-semibold cursor-pointer hover:text-green-600 transition-colors"
                                onClick={() => openDetailModal(destination)}
                              >
                                {destination.name}
                              </h3>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                {destination.price}
                              </p>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">
                            {destination.description}
                          </p>

                          <div className="space-y-3 mb-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-4 w-4 mr-2" />
                              {destination.location}
                            </div>
                          </div>

                          {destination.facilities.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium text-sm mb-2">
                                Fasilitas:
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {destination.facilities
                                  .slice(0, 3)
                                  .map((facility, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {facility}
                                    </Badge>
                                  ))}
                                {destination.facilities.length > 3 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    +{destination.facilities.length - 3} lainnya
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                if (
                                  destination.latitude &&
                                  destination.longitude
                                ) {
                                  const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`;
                                  window.open(url, "_blank");
                                }
                              }}
                              disabled={
                                !destination.latitude || !destination.longitude
                              }
                            >
                              Petunjuk Arah
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDetailModal(destination)}
                            >
                              Detail
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page - 1,
                        }))
                      }
                      disabled={pagination.page === 1}
                    >
                      Sebelumnya
                    </Button>
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    ).map((page) => (
                      <Button
                        key={page}
                        variant={
                          pagination.page === page ? "default" : "outline"
                        }
                        onClick={() =>
                          setPagination((prev) => ({ ...prev, page }))
                        }
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page + 1,
                        }))
                      }
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Tips Berwisata
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Panduan penting untuk pengalaman wisata yang aman dan menyenangkan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="h-5 w-5 mr-2 text-green-600" />
                  Waktu Terbaik
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Pagi hari (06:00-10:00) untuk sunrise</li>
                  <li>• Sore hari (15:00-18:00) untuk sunset</li>
                  <li>• Hindari musim hujan (Nov-Mar)</li>
                  <li>• Weekend lebih ramai pengunjung</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Persiapan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Bawa jaket (suhu dingin di malam hari)</li>
                  <li>• Sepatu trekking yang nyaman</li>
                  <li>• Air minum dan snack secukupnya</li>
                  <li>• Power bank untuk dokumentasi</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TreePine className="h-5 w-5 mr-2 text-green-600" />
                  Etika Wisata
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Jaga kebersihan lingkungan</li>
                  <li>• Tidak merusak tanaman/fasilitas</li>
                  <li>• Hormati budaya lokal</li>
                  <li>• Gunakan jasa pemandu lokal</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Siap Menjelajahi Tarubatang?
          </h2>
          <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
            Hubungi kami untuk informasi lebih lanjut atau bantuan perencanaan
            perjalanan wisata Anda
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100"
            >
              Hubungi Pemandu Wisata
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-green-600 bg-transparent"
            >
              Lihat Paket Wisata
            </Button>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      <DestinationDetailModal
        destination={selectedDestination}
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
      />

      {/* Image Viewer */}
      <ImageViewer
        images={viewerImages}
        isOpen={showImageViewer}
        onClose={closeImageViewer}
        startIndex={viewerStartIndex}
      />
    </div>
  );
}
