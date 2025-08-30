"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Phone,
  MapPin,
  Search,
  Filter,
  Users,
  Car,
  Utensils,
  Coffee,
  Wifi,
  Tv,
  Bed,
  Bath,
  Info,
  Star,
  Clock,
  CheckCircle,
  X,
  ExternalLink,
  Navigation,
  Calendar,
  Shield,
  Award,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import Image from "next/image";

interface Basecamp {
  id: string;
  namaBasecamp: string;
  fasilitas: string[];
  dayaTampungKendaraan: number;
  dayaTampungOrang: number;
  nomorWa: string;
  images: string[];
  sosialMedia: string[];
  lokasi: string;
  latitude?: number;
  longitude?: number;
  pemilik: string;
  menuMakanan: string[];
  menuMinuman: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BasecampPage() {
  const [basecampData, setBasecampData] = useState<Basecamp[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Semua");
  const [filteredBasecamp, setFilteredBasecamp] = useState<Basecamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBasecamp, setSelectedBasecamp] = useState<Basecamp | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Image viewer states
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerImageIndex, setViewerImageIndex] = useState(0);

  // Fetch Basecamp data from API
  useEffect(() => {
    const fetchBasecampData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/basecamp");

        if (!response.ok) {
          throw new Error("Gagal memuat data basecamp");
        }

        const data = await response.json();
        setBasecampData(data.basecamp || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchBasecampData();
  }, []);

  // Filter Basecamp
  useEffect(() => {
    let filtered = basecampData.filter((basecamp) => basecamp.isActive);

    if (searchTerm) {
      filtered = filtered.filter(
        (basecamp) =>
          basecamp.namaBasecamp
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          basecamp.lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
          basecamp.pemilik.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedFilter !== "Semua") {
      if (selectedFilter === "Kapasitas Besar") {
        filtered = filtered.filter(
          (basecamp) => basecamp.dayaTampungOrang >= 20
        );
      } else if (selectedFilter === "Kapasitas Sedang") {
        filtered = filtered.filter(
          (basecamp) =>
            basecamp.dayaTampungOrang >= 10 && basecamp.dayaTampungOrang < 20
        );
      } else if (selectedFilter === "Kapasitas Kecil") {
        filtered = filtered.filter(
          (basecamp) => basecamp.dayaTampungOrang < 10
        );
      }
    }

    setFilteredBasecamp(filtered);
  }, [searchTerm, selectedFilter, basecampData]);

  const filterOptions = [
    "Semua",
    "Kapasitas Besar",
    "Kapasitas Sedang",
    "Kapasitas Kecil",
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the useEffect above
  };

  const retryFetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/basecamp");

      if (!response.ok) {
        throw new Error("Gagal memuat data basecamp");
      }

      const data = await response.json();
      setBasecampData(data.basecamp || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (basecamp: Basecamp) => {
    setSelectedBasecamp(basecamp);
    setCurrentImageIndex(0);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBasecamp(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = "unset";
  };

  const nextImage = () => {
    if (selectedBasecamp && selectedBasecamp.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === selectedBasecamp.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const previousImage = () => {
    if (selectedBasecamp && selectedBasecamp.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedBasecamp.images.length - 1 : prev - 1
      );
    }
  };

  // Image viewer functions
  const openImageViewer = (images: string[], startIndex = 0) => {
    setViewerImages(images);
    setViewerImageIndex(startIndex);
    setShowImageViewer(true);
    document.body.style.overflow = "hidden";
  };

  const closeImageViewer = () => {
    setShowImageViewer(false);
    setViewerImages([]);
    setViewerImageIndex(0);
    document.body.style.overflow = "unset";
  };

  const nextViewerImage = () => {
    setViewerImageIndex((prev) => (prev + 1) % viewerImages.length);
  };

  const prevViewerImage = () => {
    setViewerImageIndex(
      (prev) => (prev - 1 + viewerImages.length) % viewerImages.length
    );
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (showImageViewer) {
      switch (e.key) {
        case "Escape":
          closeImageViewer();
          break;
        case "ArrowLeft":
          prevViewerImage();
          break;
        case "ArrowRight":
          nextViewerImage();
          break;
      }
    }
  };

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [showImageViewer, viewerImages.length]);

  const getFacilityIcon = (facility: string) => {
    const facilityLower = facility.toLowerCase();
    if (facilityLower.includes("wifi") || facilityLower.includes("internet"))
      return <Wifi className="h-4 w-4" />;
    if (facilityLower.includes("tv") || facilityLower.includes("televisi"))
      return <Tv className="h-4 w-4" />;
    if (
      facilityLower.includes("kamar") ||
      facilityLower.includes("bed") ||
      facilityLower.includes("tidur")
    )
      return <Bed className="h-4 w-4" />;
    if (
      facilityLower.includes("mandi") ||
      facilityLower.includes("bath") ||
      facilityLower.includes("kamar mandi")
    )
      return <Bath className="h-4 w-4" />;
    if (
      facilityLower.includes("makan") ||
      facilityLower.includes("dapur") ||
      facilityLower.includes("kitchen")
    )
      return <Utensils className="h-4 w-4" />;
    if (
      facilityLower.includes("coffee") ||
      facilityLower.includes("kopi") ||
      facilityLower.includes("warung")
    )
      return <Coffee className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) {
      return "62" + cleaned.substring(1);
    }
    return cleaned.startsWith("62") ? cleaned : "62" + cleaned;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const openGoogleMaps = (basecamp: Basecamp) => {
    if (basecamp.latitude && basecamp.longitude) {
      window.open(
        `https://www.google.com/maps?q=${basecamp.latitude},${basecamp.longitude}`,
        "_blank"
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/${encodeURIComponent(
          basecamp.lokasi
        )}`,
        "_blank"
      );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[400px] bg-gradient-to-r from-green-800 to-green-600">
        <div className="absolute inset-0 bg-black/40"></div>
        <Image
          src="/menuju basecamp.jpg"
          alt="Basecamp Desa Tarubatang"
          fill
          className="object-cover"
          priority
        />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white max-w-4xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
              Basecamp Tarubatang
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-green-100 max-w-2xl leading-relaxed">
              Temukan penginapan nyaman dan terjangkau di basecamp warga Desa
              Tarubatang. Nikmati pengalaman menginap autentik dengan fasilitas
              lengkap dan pemandangan alam yang menakjubkan.
            </p>
            <div className="flex items-center gap-4 text-green-100">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>{basecampData.length} Basecamp Tersedia</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <span>Pengalaman Otentik</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-6 bg-amber-50 border-b border-amber-200">
        <div className="container mx-auto px-4">
          <Alert className="bg-white border-amber-300">
            <Info className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <div className="space-y-2">
                <p className="font-semibold text-lg">
                  📋 Informasi Penting Sebelum Memilih Basecamp
                </p>
                <div className="bg-amber-100 p-4 rounded-lg">
                  <p className="mb-3 font-medium">
                    Pastikan untuk membayar tiket masuk terlebih dahulu dengan
                    rincian:
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-white p-3 rounded">
                      <Users className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-semibold">Tiket Masuk</p>
                        <p className="text-gray-600">Rp 5.000/orang</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-3 rounded">
                      <Car className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-semibold">Parkir Motor</p>
                        <p className="text-gray-600">Rp 10.000/unit</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-3 rounded">
                      <Car className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="font-semibold">Parkir Mobil</p>
                        <p className="text-gray-600">Rp 30.000/unit</p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-center font-medium text-green-700">
                    ✨ Setelah membayar tiket masuk, Anda dapat memilih basecamp
                    sesuai keinginan secara GRATIS!
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari basecamp, lokasi, atau pemilik..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                <Search className="h-4 w-4 mr-2" />
                Cari
              </Button>
            </form>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {filterOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Basecamp Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {selectedFilter === "Semua"
                ? "Daftar Basecamp"
                : `Basecamp ${selectedFilter}`}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {searchTerm
                ? `Hasil pencarian untuk "${searchTerm}"`
                : "Pilih basecamp yang sesuai dengan kebutuhan dan keinginan Anda. Semua basecamp telah terverifikasi dan siap memberikan pengalaman menginap terbaik."}
            </p>
            {!loading && !error && (
              <p className="text-sm text-gray-500 mt-2">
                Menampilkan {filteredBasecamp.length} dari {basecampData.length}{" "}
                basecamp
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-6 text-lg">
                Memuat daftar basecamp...
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Mohon tunggu sebentar
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
                <div className="text-red-400 mb-4">
                  <svg
                    className="h-16 w-16 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Gagal Memuat Data
                </h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button
                  onClick={retryFetch}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Coba Lagi
                </Button>
              </div>
            </div>
          ) : filteredBasecamp.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="h-16 w-16 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Tidak Ada Basecamp Ditemukan
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedFilter !== "Semua"
                    ? "Coba ubah kata kunci pencarian atau filter yang digunakan."
                    : "Belum ada basecamp yang tersedia saat ini."}
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedFilter("Semua");
                  }}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  Reset Filter
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBasecamp.map((basecamp) => (
                <Card
                  key={basecamp.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg group"
                >
                  <div className="relative h-56 overflow-hidden">
                    <button
                      onClick={() => openImageViewer(basecamp.images, 0)}
                      className="relative w-full h-full group/image"
                    >
                      <Image
                        src={
                          basecamp.images?.[0] ||
                          "/placeholder.svg?height=224&width=400" ||
                          "/placeholder.svg"
                        }
                        alt={basecamp.namaBasecamp}
                        fill
                        className="object-cover group-hover/image:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 bg-black/20">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                          <Eye className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                    </button>
                    <Badge className="absolute top-4 left-4 bg-green-500 hover:bg-green-600 text-white border-0">
                      <Bed className="h-3 w-3 mr-1" />
                      Basecamp
                    </Badge>
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        <span>Tersedia 24/7</span>
                      </div>
                    </div>
                    {basecamp.images.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                        +{basecamp.images.length - 1} foto
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                        {basecamp.namaBasecamp}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <MapPin className="h-4 w-4 mr-2 text-red-500" />
                        {basecamp.lokasi}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-2 text-blue-500" />
                        Dikelola oleh {basecamp.pemilik}
                      </div>
                    </div>

                    {/* Capacity Info */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Users className="h-4 w-4 text-green-600 mr-1" />
                          <span className="text-sm font-medium text-gray-700">
                            Kapasitas
                          </span>
                        </div>
                        <p className="font-bold text-green-600">
                          {basecamp.dayaTampungOrang} orang
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Car className="h-4 w-4 text-blue-600 mr-1" />
                          <span className="text-sm font-medium text-gray-700">
                            Parkir
                          </span>
                        </div>
                        <p className="font-bold text-blue-600">
                          {basecamp.dayaTampungKendaraan} unit
                        </p>
                      </div>
                    </div>

                    {/* Facilities */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Fasilitas Unggulan:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {basecamp.fasilitas
                          .slice(0, 4)
                          .map((facility, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs"
                            >
                              {getFacilityIcon(facility)}
                              <span className="ml-1 font-medium">
                                {facility}
                              </span>
                            </div>
                          ))}
                        {basecamp.fasilitas.length > 4 && (
                          <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                            +{basecamp.fasilitas.length - 4} lainnya
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Food & Beverage Menu */}
                    {(basecamp.menuMakanan.length > 0 ||
                      basecamp.menuMinuman.length > 0) && (
                      <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                        <p className="text-sm font-semibold text-orange-800 mb-2">
                          Menu Tersedia:
                        </p>
                        <div className="flex items-center gap-3">
                          {basecamp.menuMakanan.length > 0 && (
                            <div className="flex items-center bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                              <Utensils className="h-3 w-3 mr-1" />
                              <span className="font-medium">
                                {basecamp.menuMakanan.length} Makanan
                              </span>
                            </div>
                          )}
                          {basecamp.menuMinuman.length > 0 && (
                            <div className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                              <Coffee className="h-3 w-3 mr-1" />
                              <span className="font-medium">
                                {basecamp.menuMinuman.length} Minuman
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center text-sm text-blue-700">
                        <Phone className="h-4 w-4 mr-2" />
                        <span className="font-medium">{basecamp.nomorWa}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() =>
                          window.open(
                            `https://wa.me/${formatPhoneNumber(
                              basecamp.nomorWa
                            )}?text=Halo,%20saya%20tertarik%20dengan%20basecamp%20${encodeURIComponent(
                              basecamp.namaBasecamp
                            )}`,
                            "_blank"
                          )
                        }
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Hubungi via WA
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
                        onClick={() => openModal(basecamp)}
                      >
                        Lihat Detail
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      {isModalOpen && selectedBasecamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedBasecamp.namaBasecamp}
                  </h2>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{selectedBasecamp.lokasi}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Image Gallery */}
              <div className="relative h-64 md:h-80 mb-6 rounded-lg overflow-hidden">
                <button
                  onClick={() =>
                    openImageViewer(selectedBasecamp.images, currentImageIndex)
                  }
                  className="relative w-full h-full group/modal-image"
                >
                  <Image
                    src={
                      selectedBasecamp.images[currentImageIndex] ||
                      "/placeholder.svg?height=320&width=600" ||
                      "/placeholder.svg"
                    }
                    alt={`${selectedBasecamp.namaBasecamp} - Gambar ${
                      currentImageIndex + 1
                    }`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/modal-image:opacity-100 transition-opacity duration-300 bg-black/20">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                      <Eye className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </button>
                {selectedBasecamp.images.length > 1 && (
                  <>
                    <button
                      onClick={previousImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {selectedBasecamp.images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Basecamp Info Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
                    <h3 className="font-semibold text-lg text-green-800 mb-3 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Informasi Kapasitas
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center bg-white p-4 rounded-lg shadow-sm">
                        <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-600">
                          {selectedBasecamp.dayaTampungOrang}
                        </p>
                        <p className="text-sm text-gray-600">Orang</p>
                      </div>
                      <div className="text-center bg-white p-4 rounded-lg shadow-sm">
                        <Car className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedBasecamp.dayaTampungKendaraan}
                        </p>
                        <p className="text-sm text-gray-600">Kendaraan</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <h3 className="font-semibold text-lg text-blue-800 mb-3 flex items-center">
                      <Phone className="h-5 w-5 mr-2" />
                      Kontak Pemilik
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">
                            {selectedBasecamp.pemilik}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedBasecamp.nomorWa}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            window.open(
                              `https://wa.me/${formatPhoneNumber(
                                selectedBasecamp.nomorWa
                              )}?text=Halo%20${encodeURIComponent(
                                selectedBasecamp.pemilik
                              )},%20saya%20tertarik%20dengan%20basecamp%20${encodeURIComponent(
                                selectedBasecamp.namaBasecamp
                              )}%20di%20${encodeURIComponent(
                                selectedBasecamp.lokasi
                              )}.%20Bisakah%20saya%20mendapatkan%20informasi%20lebih%20lanjut?`,
                              "_blank"
                            )
                          }
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Chat WA
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                    <h3 className="font-semibold text-lg text-red-800 mb-3 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Lokasi & Navigasi
                    </h3>
                    <div className="space-y-3">
                      <p className="text-gray-700 bg-white p-3 rounded-lg">
                        {selectedBasecamp.lokasi}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
                        onClick={() => openGoogleMaps(selectedBasecamp)}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Buka di Google Maps
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Facilities & Menu */}
                <div className="space-y-4">
                  <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                    <h3 className="font-semibold text-lg text-purple-800 mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Fasilitas Lengkap
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedBasecamp.fasilitas.map((facility, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-white p-3 rounded-lg shadow-sm"
                        >
                          {getFacilityIcon(facility)}
                          <span className="ml-3 text-gray-700 font-medium">
                            {facility}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Menu Section */}
                  {(selectedBasecamp.menuMakanan.length > 0 ||
                    selectedBasecamp.menuMinuman.length > 0) && (
                    <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                      <h3 className="font-semibold text-lg text-orange-800 mb-3 flex items-center">
                        <Utensils className="h-5 w-5 mr-2" />
                        Menu Tersedia
                      </h3>

                      {selectedBasecamp.menuMakanan.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-orange-700 mb-2 flex items-center">
                            <Utensils className="h-4 w-4 mr-2" />
                            Makanan ({selectedBasecamp.menuMakanan.length} item)
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {selectedBasecamp.menuMakanan.map((menu, index) => (
                              <div
                                key={index}
                                className="bg-white p-3 rounded-lg shadow-sm"
                              >
                                <span className="text-gray-700">{menu}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedBasecamp.menuMinuman.length > 0 && (
                        <div>
                          <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                            <Coffee className="h-4 w-4 mr-2" />
                            Minuman ({selectedBasecamp.menuMinuman.length} item)
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {selectedBasecamp.menuMinuman.map((menu, index) => (
                              <div
                                key={index}
                                className="bg-white p-3 rounded-lg shadow-sm"
                              >
                                <span className="text-gray-700">{menu}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Social Media Links */}
                  {selectedBasecamp.sosialMedia.length > 0 && (
                    <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                      <h3 className="font-semibold text-lg text-indigo-800 mb-3 flex items-center">
                        <ExternalLink className="h-5 w-5 mr-2" />
                        Media Sosial
                      </h3>
                      <div className="space-y-2">
                        {selectedBasecamp.sosialMedia.map((social, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start border-indigo-200 text-indigo-700 hover:bg-indigo-50 bg-transparent"
                            onClick={() =>
                              window.open(
                                social.startsWith("http")
                                  ? social
                                  : `https://${social}`,
                                "_blank"
                              )
                            }
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {social}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-6">
                <h3 className="font-semibold text-lg text-gray-800 mb-3 flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Informasi Tambahan
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span>
                      Terdaftar: {formatDate(selectedBasecamp.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-green-500" />
                    <span>
                      Diperbarui: {formatDate(selectedBasecamp.updatedAt)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-purple-500" />
                    <span>
                      Status:{" "}
                      {selectedBasecamp.isActive ? "Aktif" : "Tidak Aktif"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-yellow-500" />
                    <span>Terverifikasi Desa Tarubatang</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12"
                  onClick={() =>
                    window.open(
                      `https://wa.me/${formatPhoneNumber(
                        selectedBasecamp.nomorWa
                      )}?text=Halo%20${encodeURIComponent(
                        selectedBasecamp.pemilik
                      )},%20saya%20tertarik%20untuk%20menginap%20di%20basecamp%20${encodeURIComponent(
                        selectedBasecamp.namaBasecamp
                      )}%20di%20${encodeURIComponent(
                        selectedBasecamp.lokasi
                      )}.%0A%0ABisakah%20saya%20mendapatkan%20informasi%20tentang:%0A-%20Ketersediaan%20kamar%0A-%20Harga%20menginap%0A-%20Aturan%20dan%20ketentuan%0A%0ATerima%20kasih!`,
                      "_blank"
                    )
                  }
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Hubungi Pemilik untuk Reservasi
                </Button>
                <Button
                  variant="outline"
                  className="sm:w-auto border-red-300 text-red-700 hover:bg-red-50 h-12 bg-transparent"
                  onClick={() => openGoogleMaps(selectedBasecamp)}
                >
                  <Navigation className="h-5 w-5 mr-2" />
                  Navigasi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4">
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeImageViewer}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Image Counter */}
            {viewerImages.length > 1 && (
              <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/50 text-white rounded-full text-sm">
                {viewerImageIndex + 1} / {viewerImages.length}
              </div>
            )}

            {/* Previous Button */}
            {viewerImages.length > 1 && (
              <button
                onClick={prevViewerImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Next Button */}
            {viewerImages.length > 1 && (
              <button
                onClick={nextViewerImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Main Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={viewerImages[viewerImageIndex] || "/placeholder.svg"}
                alt={`Image ${viewerImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg?height=800&width=800";
                }}
              />
            </div>

            {/* Image Navigation Dots */}
            {viewerImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {viewerImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setViewerImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === viewerImageIndex
                        ? "bg-white"
                        : "bg-white/50 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Instructions */}
            <div className="absolute bottom-4 right-4 text-white/70 text-sm hidden md:block">
              <div className="flex flex-col items-end gap-1">
                <span>ESC untuk tutup</span>
                {viewerImages.length > 1 && (
                  <>
                    <span>← → untuk navigasi</span>
                    <span>Klik titik untuk langsung ke gambar</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips & Important Information */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Tips Menginap di Basecamp
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pastikan pengalaman menginap Anda nyaman dan menyenangkan dengan
              mengikuti tips berikut
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                Hubungi Pemilik Terlebih Dahulu Lebih Baik
              </h3>
              <p className="text-gray-600 text-sm">
                Untuk konfirmasi ketersediaan dan detail menginap dengan pemilik
                basecamp sebelum datang. Tanyakan tentang aturan khusus dan
                fasilitas yang tersedia.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                Perhatikan Kapasitas
              </h3>
              <p className="text-gray-600 text-sm">
                Pastikan jumlah tamu dan kendaraan sesuai dengan kapasitas
                basecamp. Jangan melebihi batas yang telah ditetapkan untuk
                kenyamanan bersama.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                Hormati Aturan Setempat
              </h3>
              <p className="text-gray-600 text-sm">
                Ikuti aturan dan tata tertib yang berlaku di basecamp. Jaga
                kebersihan, keamanan, dan kenyamanan untuk pengalaman yang
                menyenangkan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        {/* <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Basecamp Desa Tarubatang</h3>
            <p className="text-gray-400 mb-4">
              Platform resmi untuk menemukan penginapan basecamp di Desa
              Tarubatang
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Desa Tarubatang, Kecamatan Panyabungan</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>Layanan 24/7</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
              <p>
                &copy; 2024 Desa Tarubatang. Semua hak dilindungi undang-undang.
              </p>
            </div>
          </div>
        </div> */}
      </footer>
    </div>
  );
}
