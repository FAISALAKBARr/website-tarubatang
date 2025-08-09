"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import {
  Phone,
  MapPin,
  Search,
  Filter,
  Heart,
  X,
  User,
  Calendar,
  Package,
  Eye,
} from "lucide-react";
import Image from "next/image";

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
  userId: string;
  user: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
}

export default function UMKMPage() {
  const [umkmData, setUmkmData] = useState<UMKM[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [filteredUMKM, setFilteredUMKM] = useState<UMKM[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [selectedUMKM, setSelectedUMKM] = useState<UMKM | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Fetch UMKM data from API
  useEffect(() => {
    const fetchUMKMData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/produk");

        if (!response.ok) {
          throw new Error("Failed to fetch UMKM data");
        }

        const data = await response.json();
        setUmkmData(data.umkm || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUMKMData();
  }, []);

  // Set user if logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Filter UMKM
  useEffect(() => {
    let filtered = umkmData;

    if (searchTerm) {
      filtered = filtered.filter(
        (umkm) =>
          umkm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          umkm.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          umkm.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "Semua") {
      filtered = filtered.filter((umkm) => umkm.category === selectedCategory);
    }

    setFilteredUMKM(filtered);
  }, [searchTerm, selectedCategory, umkmData]);

  const categories = [
    "Semua",
    ...Array.from(new Set(umkmData.map((umkm) => umkm.category))),
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the useEffect above
  };

  const retryFetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/produk");

      if (!response.ok) {
        throw new Error("Failed to fetch UMKM data");
      }

      const data = await response.json();
      setUmkmData(data.umkm || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (umkm: UMKM) => {
    setSelectedUMKM(umkm);
    setCurrentImageIndex(0);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUMKM(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = "auto"; // Restore scrolling
  };

  const nextImage = () => {
    if (selectedUMKM && selectedUMKM.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === selectedUMKM.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedUMKM && selectedUMKM.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedUMKM.images.length - 1 : prev - 1
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleWhatsApp = (contact: string) => {
    const cleanContact = contact.replace(/[^0-9]/g, "");
    const message = selectedUMKM
      ? `Halo, saya tertarik dengan produk ${selectedUMKM.name}. Bisakah saya mendapatkan informasi lebih lanjut?`
      : "Halo, saya tertarik dengan produk Anda.";

    window.open(
      `https://wa.me/${cleanContact}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  // Close modal when clicking outside
  const handleModalClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;

      switch (e.key) {
        case "Escape":
          closeModal();
          break;
        case "ArrowRight":
          nextImage();
          break;
        case "ArrowLeft":
          prevImage();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, selectedUMKM]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b"></header>

      {/* Hero Section */}
      <section className="relative h-[300px] bg-gradient-to-r from-blue-800 to-blue-600">
        <div className="absolute inset-0 bg-black/40"></div>
        <Image
          src="/merbabuu.png"
          alt="UMKM Desa Tarubatang"
          fill
          className="object-cover"
          priority
        />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-4">UMKM Desa Tarubatang</h1>
            <p className="text-xl text-blue-100 max-w-2xl">
              Dukung ekonomi lokal dengan berbelanja produk UMKM dan menginap di
              basecamp warga desa
            </p>
          </div>
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
                  placeholder="Cari UMKM, produk, atau pemilik..."
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
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* UMKM Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {selectedCategory === "Semua"
                ? "Daftar UMKM"
                : `UMKM ${selectedCategory}`}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {searchTerm
                ? `Hasil pencarian untuk "${searchTerm}"`
                : "Temukan berbagai produk lokal berkualitas dan penginapan nyaman di Desa Tarubatang"}
            </p>
            {!loading && !error && (
              <p className="text-sm text-gray-500 mt-2">
                Menampilkan {filteredUMKM.length} dari {umkmData.length} UMKM
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Memuat UMKM...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={retryFetch}>Coba Lagi</Button>
            </div>
          ) : filteredUMKM.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {searchTerm || selectedCategory !== "Semua"
                  ? "Tidak ada UMKM yang ditemukan."
                  : "Belum ada UMKM yang tersedia."}
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("Semua");
                }}
                className="mt-4"
              >
                Reset Filter
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredUMKM.map((umkm) => (
                <Card
                  key={umkm.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div
                    className="relative h-48 cursor-pointer group"
                    onClick={() => openModal(umkm)}
                  >
                    <Image
                      src={
                        umkm.images?.[0] ||
                        "/placeholder.svg?height=200&width=200"
                      }
                      alt={umkm.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <Badge className="absolute top-4 left-4 bg-blue-500">
                      {umkm.category}
                    </Badge>
                    {umkm.images?.length > 1 && (
                      <Badge className="absolute top-4 right-4 bg-black/50 text-white">
                        +{umkm.images.length - 1}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold line-clamp-2">
                        {umkm.name}
                      </h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1 flex-shrink-0"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                      {umkm.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-2" />
                        {umkm.user.name}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        {umkm.location || "Desa Tarubatang"}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-4 w-4 mr-2" />
                        {umkm.contact}
                      </div>
                      {umkm.stock !== undefined && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Package className="h-4 w-4 mr-2" />
                          Stok: {umkm.stock}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-lg font-bold text-green-600">
                          {umkm.price}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleWhatsApp(umkm.contact)}
                      >
                        Hubungi
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openModal(umkm)}
                      >
                        Detail
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
      {isModalOpen && selectedUMKM && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleModalClick}
        >
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedUMKM.name}
              </h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={closeModal}
                className="p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div className="space-y-4">
                  <div className="relative h-80 bg-gray-100 rounded-lg overflow-hidden">
                    {selectedUMKM.images?.length > 0 ? (
                      <>
                        <Image
                          src={selectedUMKM.images[currentImageIndex]}
                          alt={`${selectedUMKM.name} - Gambar ${
                            currentImageIndex + 1
                          }`}
                          fill
                          className="object-cover"
                          onLoad={() => setIsImageLoading(false)}
                          onLoadStart={() => setIsImageLoading(true)}
                        />
                        {isImageLoading && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                        {selectedUMKM.images.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                            >
                              &#8249;
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                            >
                              &#8250;
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <Package className="h-16 w-16" />
                      </div>
                    )}
                  </div>

                  {/* Image Thumbnails */}
                  {selectedUMKM.images?.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto">
                      {selectedUMKM.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                            index === currentImageIndex
                              ? "border-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  <div>
                    <Badge className="bg-blue-500 mb-3">
                      {selectedUMKM.category}
                    </Badge>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {selectedUMKM.name}
                    </h3>
                    <p className="text-3xl font-bold text-green-600 mb-4">
                      {selectedUMKM.price}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Deskripsi
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedUMKM.description}
                    </p>
                  </div>

                  {selectedUMKM.stock !== undefined && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Ketersediaan Stok
                      </h4>
                      <p
                        className={`font-medium ${
                          selectedUMKM.stock > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {selectedUMKM.stock > 0
                          ? `${selectedUMKM.stock} unit tersedia`
                          : "Stok habis"}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">
                      Informasi Kontak
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-3" />
                        <span className="font-medium">
                          {selectedUMKM.pemilik} {/* Change this line */}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-3" />
                        <span>{selectedUMKM.contact}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-3" />
                        <span>
                          {selectedUMKM.location || "Desa Tarubatang"}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-3" />
                        <span>
                          Dibuat: {formatDate(selectedUMKM.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      className="flex-1"
                      onClick={() => handleWhatsApp(selectedUMKM.contact)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Hubungi via WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Add to favorites functionality can be implemented here
                      }}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
