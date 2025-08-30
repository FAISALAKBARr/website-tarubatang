"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Users,
  Filter,
  Search,
  Loader2,
  RefreshCw,
  X,
  Share2,
} from "lucide-react";
import Image from "next/image";

// Types based on Prisma schema
interface Event {
  id: string;
  name: string;
  slug: string;
  description: string;
  content?: string;
  category: string;
  date: string;
  endDate?: string;
  location: string;
  maxParticipants?: number;
  currentParticipants: number;
  price?: string;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    participants: number;
  };
}

interface EventsResponse {
  events: Event[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [user, setUser] = useState<User | null>(null);
  const [joining, setJoining] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Available categories from your data
  const categories = [
    { value: "all", label: "Semua" },
    { value: "Olahraga", label: "Olahraga" },
    { value: "Budaya", label: "Budaya" },
    { value: "Sosial", label: "Sosial" },
    { value: "Edukasi", label: "Edukasi" },
    { value: "Hiburan", label: "Hiburan" },
  ];

  const router = useRouter();

  const statuses = [
    { value: "all", label: "Semua Status" },
    { value: "upcoming", label: "Akan Datang" },
    { value: "ongoing", label: "Berlangsung" },
    { value: "completed", label: "Selesai" },
  ];

  // Initialize user data
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  // Fetch events from API with improved error handling
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      if (selectedStatus === "upcoming") {
        params.append("upcoming", "true");
      } else if (selectedStatus === "ongoing") {
        params.append("status", "ongoing");
      } else if (selectedStatus === "completed") {
        params.append("status", "completed");
      }

      const response = await fetch(`/api/event?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(user && localStorage.getItem("token")
            ? {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              }
            : {}),
        },
        // Add cache control for fresh data
        cache: "no-cache",
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to fetch events";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const data: EventsResponse = await response.json();

      // Validate response structure
      if (!data.events || !Array.isArray(data.events)) {
        throw new Error("Invalid response format: events array missing");
      }

      if (!data.pagination) {
        throw new Error("Invalid response format: pagination data missing");
      }

      setEvents(data.events);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setEvents([]);
      setPagination({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedStatus, pagination.page, user]);

  // Fetch events when dependencies change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Reset page when filters change
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [searchTerm, selectedCategory, selectedStatus]);

  const getStatusFromDate = (date: string, endDate?: string) => {
    const now = new Date();
    const eventDate = new Date(date);
    const eventEndDate = endDate ? new Date(endDate) : eventDate;

    if (now < eventDate) {
      return "upcoming";
    } else if (now > eventEndDate) {
      return "completed";
    } else {
      return "ongoing";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Akan Datang";
      case "ongoing":
        return "Berlangsung";
      case "completed":
        return "Selesai";
      default:
        return "Unknown";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Olahraga":
        return "bg-red-100 text-red-800";
      case "Budaya":
        return "bg-purple-100 text-purple-800";
      case "Sosial":
        return "bg-green-100 text-green-800";
      case "Edukasi":
        return "bg-blue-100 text-blue-800";
      case "Hiburan":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    if (!user) {
      // Redirect to login
      window.location.href = "/auth/login";
      return;
    }

    try {
      setJoining(eventId);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`/api/events/${eventId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();

      if (response.ok) {
        // Refresh events to update participant count
        await fetchEvents();
        alert("Berhasil mendaftar event!");
      } else {
        throw new Error(responseData.message || "Gagal mendaftar event");
      }
    } catch (error) {
      console.error("Error joining event:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mendaftar event"
      );
    } finally {
      setJoining(null);
    }
  };

  const handleRetry = () => {
    fetchEvents();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
  };

  const openEventModal = (event: Event) => {
    setSelectedEvent(event);
    setCurrentImageIndex(0);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  };

  const closeEventModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = "unset"; // Reset overflow
  };

  const nextImage = () => {
    if (selectedEvent && selectedEvent.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === selectedEvent.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const previousImage = () => {
    if (selectedEvent && selectedEvent.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedEvent.images.length - 1 : prev - 1
      );
    }
  };

  const shareEvent = (event: Event) => {
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: event.description,
        url: `${window.location.origin}/events/${event.slug}`,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `${window.location.origin}/events/${event.slug}`
      );
      alert("Link berhasil disalin ke clipboard!");
    }
  };

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeEventModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b"></header>

      {/* Hero Section */}
      <section id="beranda" className="hero-section">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="hero-video"
        >
          <source src="/opening-web.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Fallback Image for when video doesn't load */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/merbabuu.png')",
            display: "none",
          }}
        ></div>

        {/* Dark Overlay for better text readability and aesthetic */}
        <div className="absolute inset-0 bg-black/50 bg-gradient-to-b from-black/30 via-black/40 to-black/70"></div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white max-w-4xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
              Event & Acara Desa Tarubatang
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-green-100 max-w-2xl leading-relaxed">
              Ikuti berbagai acara menarik dan bergabunglah dengan komunitas
              Desa Tarubatang
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari event atau acara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={loading}
                className="flex items-center space-x-1"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Daftar Event & Acara
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Temukan berbagai acara menarik yang diselenggarakan di Desa
              Tarubatang
            </p>
            {!loading && !error && (
              <p className="text-sm text-gray-500 mt-2">
                Menampilkan {events.length} dari {pagination.total} events
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Memuat events...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={handleRetry}>Coba Lagi</Button>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {searchTerm ||
                selectedCategory !== "all" ||
                selectedStatus !== "all"
                  ? "Tidak ada event yang ditemukan."
                  : "Belum ada event yang tersedia."}
              </p>
              <Button onClick={handleResetFilters} className="mt-4">
                Reset Filter
              </Button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => {
                  const eventStatus = getStatusFromDate(
                    event.date,
                    event.endDate
                  );
                  const participantCount =
                    event._count?.participants ??
                    event.currentParticipants ??
                    0;

                  return (
                    <Card
                      key={event.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div
                        className="relative h-48 cursor-pointer"
                        onClick={() => openEventModal(event)}
                      >
                        <Image
                          src={
                            event.images?.[0] ||
                            "/placeholder.svg?height=200&width=300"
                          }
                          alt={event.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300"></div>
                        <div className="absolute top-4 left-4 flex space-x-2">
                          <Badge className={getCategoryColor(event.category)}>
                            {event.category}
                          </Badge>
                          <Badge className={getStatusColor(eventStatus)}>
                            {getStatusText(eventStatus)}
                          </Badge>
                        </div>
                        {event.price === "0" ||
                        event.price === "Gratis" ||
                        !event.price ? (
                          <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                            Gratis
                          </Badge>
                        ) : (
                          <Badge className="absolute top-4 right-4 bg-blue-500 text-white">
                            {event.price}
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-2">
                          {event.name}
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                          {event.description}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(event.date).toLocaleDateString("id-ID")}
                            {event.endDate && event.endDate !== event.date && (
                              <span>
                                {" "}
                                -{" "}
                                {new Date(event.endDate).toLocaleDateString(
                                  "id-ID"
                                )}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="h-4 w-4 mr-2" />
                            {participantCount}
                            {event.maxParticipants &&
                              `/${event.maxParticipants}`}{" "}
                            peserta
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {eventStatus === "upcoming" && (
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleJoinEvent(event.id)}
                              disabled={
                                joining === event.id ||
                                (!!event.maxParticipants &&
                                  participantCount >= event.maxParticipants)
                              }
                            >
                              {joining === event.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Mendaftar...
                                </>
                              ) : event.maxParticipants &&
                                participantCount >= event.maxParticipants ? (
                                "Penuh"
                              ) : (
                                "Daftar"
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEventModal(event)}
                          >
                            Detail
                          </Button>
                        </div>
                      </CardContent>
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
                      size="sm"
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page - 1,
                        }))
                      }
                      disabled={pagination.page === 1 || loading}
                    >
                      Previous
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
                        size="sm"
                        onClick={() =>
                          setPagination((prev) => ({ ...prev, page }))
                        }
                        disabled={loading}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page + 1,
                        }))
                      }
                      disabled={
                        pagination.page === pagination.totalPages || loading
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ingin Mengadakan Event di Tarubatang?
          </h2>
          <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
            Hubungi kami untuk informasi pengajuan event atau kerjasama acara di
            Desa Tarubatang
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              Ajukan Event
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-purple-600 bg-transparent"
            >
              Panduan Event
            </Button>
          </div>
        </div>
      </section>

      {/* Event Detail Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeEventModal}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Close Button */}
            <button
              onClick={closeEventModal}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col md:flex-row max-h-[90vh]">
              {/* Image Section */}
              <div className="md:w-1/2 relative">
                {selectedEvent.images && selectedEvent.images.length > 0 ? (
                  <div className="relative h-64 md:h-full">
                    <Image
                      src={selectedEvent.images[currentImageIndex]}
                      alt={selectedEvent.name}
                      fill
                      className="object-cover"
                    />

                    {/* Image Navigation */}
                    {selectedEvent.images.length > 1 && (
                      <>
                        <button
                          onClick={previousImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                        >
                          ←
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                        >
                          →
                        </button>

                        {/* Image Indicators */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {selectedEvent.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentImageIndex
                                  ? "bg-white"
                                  : "bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="h-64 md:h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="md:w-1/2 p-6 overflow-y-auto">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getCategoryColor(selectedEvent.category)}>
                    {selectedEvent.category}
                  </Badge>
                  <Badge
                    className={getStatusColor(
                      getStatusFromDate(
                        selectedEvent.date,
                        selectedEvent.endDate
                      )
                    )}
                  >
                    {getStatusText(
                      getStatusFromDate(
                        selectedEvent.date,
                        selectedEvent.endDate
                      )
                    )}
                  </Badge>
                  {selectedEvent.price === "0" ||
                  selectedEvent.price === "Gratis" ||
                  !selectedEvent.price ? (
                    <Badge className="bg-green-500 text-white">Gratis</Badge>
                  ) : (
                    <Badge className="bg-blue-500 text-white">
                      {selectedEvent.price}
                    </Badge>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {selectedEvent.name}
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-3" />
                    <span>
                      {new Date(selectedEvent.date).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                      {selectedEvent.endDate &&
                        selectedEvent.endDate !== selectedEvent.date && (
                          <span>
                            {" "}
                            -{" "}
                            {new Date(selectedEvent.endDate).toLocaleDateString(
                              "id-ID",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        )}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-3" />
                    <span>{selectedEvent.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-3" />
                    <span>
                      {selectedEvent._count?.participants ??
                        selectedEvent.currentParticipants ??
                        0}
                      {selectedEvent.maxParticipants &&
                        `/${selectedEvent.maxParticipants}`}{" "}
                      peserta
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Deskripsi</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>

                {selectedEvent.content && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      Detail Lengkap
                    </h3>
                    <div
                      className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: selectedEvent.content,
                      }}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  {getStatusFromDate(
                    selectedEvent.date,
                    selectedEvent.endDate
                  ) === "upcoming" && (
                    <Button
                      className="flex-1"
                      onClick={() => {
                        closeEventModal();
                        handleJoinEvent(selectedEvent.id);
                      }}
                      disabled={
                        joining === selectedEvent.id ||
                        (!!selectedEvent.maxParticipants &&
                          (selectedEvent._count?.participants ??
                            selectedEvent.currentParticipants ??
                            0) >= selectedEvent.maxParticipants)
                      }
                    >
                      {joining === selectedEvent.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Mendaftar...
                        </>
                      ) : selectedEvent.maxParticipants &&
                        (selectedEvent._count?.participants ??
                          selectedEvent.currentParticipants ??
                          0) >= selectedEvent.maxParticipants ? (
                        "Penuh"
                      ) : (
                        "Daftar Event"
                      )}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => shareEvent(selectedEvent)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Bagikan
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      closeEventModal(); // Tutup modal dan reset overflow
                      router.push("/kontak"); // Navigasi ke kontak
                    }}
                  >
                    Ajukan Event
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
