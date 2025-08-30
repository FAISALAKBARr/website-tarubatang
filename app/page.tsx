"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  Phone,
  Calendar,
  Users,
  Mountain,
  Star,
  Send,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  Car,
  Home,
  Utensils,
  Coffee,
  ExternalLink,
  Shield,
  Clock,
  Mail,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// API Response Types
interface Destination {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  images: string[];
  price: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UMKM {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  images: string[];
  price: string;
  contact: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Basecamp {
  id: string;
  namaBasecamp: string;
  slug?: string;
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

interface Event {
  id: string;
  name: string;
  slug: string;
  date: string;
  location: string;
  description: string;
  category: string;
  images: string[];
  price?: string;
  maxParticipants?: number;
  currentParticipants: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Gallery {
  id: string;
  title: string;
  images: string[];
  category: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WebsiteStats {
  totalDestinations: number;
  totalEvents: number;
  totalUMKM: number;
  totalBasecamp: number;
  totalGallery: number;
  totalSubmissions: number;
}

// Modal Component for Gallery Images
interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  title: string;
  onNext: () => void;
  onPrev: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  title,
  onNext,
  onPrev,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="relative max-w-[95vw] max-w-4xl max-h-[95vh] w-full">
        <button
          onClick={onClose}
          className="absolute -top-8 sm:-top-12 right-0 text-white hover:text-gray-300 z-10 p-2"
        >
          <X className="h-6 w-6 sm:h-8 sm:w-8" />
        </button>

        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={
              images[currentIndex] || "/placeholder.svg?height=600&width=800"
            }
            alt={title}
            width={800}
            height={600}
            className="object-contain max-h-[80vh] w-auto max-w-full"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={onPrev}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full"
              >
                <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
              </button>
              <button
                onClick={onNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full"
              >
                <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
              </button>
            </>
          )}
        </div>

        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 bg-black/70 text-white p-2 sm:p-4 rounded">
          <h3 className="font-semibold text-sm sm:text-base">{title}</h3>
          {images.length > 1 && (
            <p className="text-xs sm:text-sm text-gray-300">
              {currentIndex + 1} dari {images.length}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Detail Modal Components
interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-background rounded-lg max-w-full sm:max-w-2xl max-h-[95vh] overflow-y-auto w-full mx-2 sm:mx-0">
        <div className="sticky top-0 bg-background border-b p-3 sm:p-4 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold">Detail</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [umkm, setUMKM] = useState<UMKM[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [gallery, setGallery] = useState<Gallery[]>([]);
  const [basecamp, setBasecamp] = useState<Basecamp[]>([]);
  const [stats, setStats] = useState<WebsiteStats>({
    totalDestinations: 0,
    totalEvents: 0,
    totalUMKM: 0,
    totalBasecamp: 0,
    totalGallery: 0,
    totalSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [modalState, setModalState] = useState({
    isOpen: false,
    images: [] as string[],
    currentIndex: 0,
    title: "",
  });

  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    type: "destination" | "umkm" | "basecamp" | "event" | "gallery" | null;
    data: any;
  }>({
    isOpen: false,
    type: null,
    data: null,
  });

  const [guestbookForm, setGuestbookForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    type: "guestbook",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const validateForm = () => {
    const errors: string[] = [];

    if (!guestbookForm.name.trim() || guestbookForm.name.trim().length < 2) {
      errors.push("Nama harus diisi minimal 2 karakter");
    }

    if (!guestbookForm.email.trim()) {
      errors.push("Email harus diisi");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestbookForm.email)) {
      errors.push("Format email tidak valid");
    }

    if (!guestbookForm.subject.trim()) {
      errors.push("Subjek harus diisi");
    }

    if (
      !guestbookForm.message.trim() ||
      guestbookForm.message.trim().length < 10
    ) {
      errors.push("Pesan harus diisi minimal 10 karakter");
    }

    if (guestbookForm.phone && guestbookForm.phone.length > 20) {
      errors.push("Nomor telepon terlalu panjang");
    }

    if (guestbookForm.name.length > 100) {
      errors.push("Nama terlalu panjang (maksimal 100 karakter)");
    }

    if (guestbookForm.subject.length > 200) {
      errors.push("Subjek terlalu panjang (maksimal 200 karakter)");
    }

    if (guestbookForm.message.length > 2000) {
      errors.push("Pesan terlalu panjang (maksimal 2000 karakter)");
    }

    return errors;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setGuestbookForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Modal handlers
  const openImageModal = (images: string[], index: number, title: string) => {
    setModalState({
      isOpen: true,
      images,
      currentIndex: index,
      title,
    });
  };

  const closeImageModal = () => {
    setModalState({
      isOpen: false,
      images: [],
      currentIndex: 0,
      title: "",
    });
  };

  const nextImage = () => {
    setModalState((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length,
    }));
  };

  const prevImage = () => {
    setModalState((prev) => ({
      ...prev,
      currentIndex:
        prev.currentIndex === 0
          ? prev.images.length - 1
          : prev.currentIndex - 1,
    }));
  };

  // Detail modal handlers
  const openDetailModal = (
    type: "destination" | "umkm" | "basecamp" | "event" | "gallery",
    data: any
  ) => {
    setDetailModal({
      isOpen: true,
      type,
      data,
    });
  };

  const closeDetailModal = () => {
    setDetailModal({
      isOpen: false,
      type: null,
      data: null,
    });
  };

  // Individual API fetch functions with error handling
  const fetchDestinations = async () => {
    try {
      const response = await fetch("/api/destinations");
      if (response.ok) {
        const data = await response.json();
        return {
          items: data.destinations?.slice(0, 6) || [],
          total: data.destinations?.length || 0,
        };
      }
      return { items: [], total: 0 };
    } catch (error) {
      console.error("Error fetching destinations:", error);
      return { items: [], total: 0 };
    }
  };

  const fetchUMKM = async () => {
    try {
      const response = await fetch("/api/produk");
      if (response.ok) {
        const data = await response.json();
        return {
          items: data.umkm?.slice(0, 6) || [],
          total: data.umkm?.length || 0,
        };
      }
      return { items: [], total: 0 };
    } catch (error) {
      console.error("Error fetching UMKM:", error);
      return { items: [], total: 0 };
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/event");
      if (response.ok) {
        const data = await response.json();
        return {
          items: data.events?.slice(0, 6) || [],
          total: data.events?.length || 0,
        };
      }
      return { items: [], total: 0 };
    } catch (error) {
      console.error("Error fetching events:", error);
      return { items: [], total: 0 };
    }
  };

  const fetchGallery = async () => {
    try {
      const response = await fetch("/api/gallery");
      if (response.ok) {
        const data = await response.json();
        return {
          items: data.items?.slice(0, 8) || [],
          total: data.items?.length || 0,
        };
      }
      return { items: [], total: 0 };
    } catch (error) {
      console.error("Error fetching gallery:", error);
      return { items: [], total: 0 };
    }
  };

  const fetchBasecamp = async () => {
    try {
      const response = await fetch("/api/basecamp");
      if (response.ok) {
        const data = await response.json();
        return {
          items: data.basecamp?.slice(0, 6) || [],
          total: data.basecamp?.length || 0,
        };
      }
      return { items: [], total: 0 };
    } catch (error) {
      console.error("Error fetching basecamp:", error);
      return { items: [], total: 0 };
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching stats:", error);
      return null;
    }
  };

  // Load all data with better error handling
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          destinationsData,
          umkmData,
          eventsData,
          galleryData,
          basecampData,
          statsData,
        ] = await Promise.all([
          fetchDestinations(),
          fetchUMKM(),
          fetchEvents(),
          fetchGallery(),
          fetchBasecamp(),
          fetchStats(),
        ]);

        setDestinations(destinationsData.items);
        setUMKM(umkmData.items);
        setEvents(eventsData.items);
        setGallery(galleryData.items);
        setBasecamp(basecampData.items);

        setStats({
          totalDestinations: destinationsData.total,
          totalEvents: eventsData.total,
          totalUMKM: umkmData.total,
          totalBasecamp: basecampData.total,
          totalGallery: galleryData.total,
          totalSubmissions: statsData?.totalSubmissions || 0,
        });
      } catch (error) {
        console.error("Failed to load data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memuat data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Keyboard navigation for modals
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (modalState.isOpen) {
        if (e.key === "Escape") {
          closeImageModal();
        } else if (e.key === "ArrowLeft") {
          prevImage();
        } else if (e.key === "ArrowRight") {
          nextImage();
        }
      }
      if (detailModal.isOpen && e.key === "Escape") {
        closeDetailModal();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [modalState.isOpen, detailModal.isOpen]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitStatus({ type: null, message: "" });

    const errors = validateForm();
    if (errors.length > 0) {
      setSubmitStatus({
        type: "error",
        message: errors.join(". "),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...guestbookForm,
          type: "guestbook",
          timestamp: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus({
          type: "success",
          message:
            result.message ||
            "Pesan berhasil dikirim! Terima kasih, kami akan merespons dalam 1-2 hari kerja.",
        });

        setGuestbookForm({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          type: "guestbook",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message: result.message || "Terjadi kesalahan. Silakan coba lagi.",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus({
        type: "error",
        message:
          "Terjadi kesalahan jaringan. Silakan periksa koneksi dan coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render detail modal content based on type
  const renderDetailContent = () => {
    if (!detailModal.data) return null;

    switch (detailModal.type) {
      case "destination":
        const destination = detailModal.data as Destination;
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              {destination.images?.map((image, index) => (
                <Image
                  key={index}
                  src={image || "/placeholder.svg?height=200&width=300"}
                  alt={destination.name}
                  width={300}
                  height={200}
                  className="rounded-lg object-cover cursor-pointer hover:opacity-80 w-full h-32 sm:h-48"
                  onClick={() =>
                    openImageModal(destination.images, index, destination.name)
                  }
                />
              ))}
            </div>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <h3 className="text-xl sm:text-2xl font-bold">
                  {destination.name}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
                <Badge>{destination.category}</Badge>
                <span className="text-base sm:text-lg font-semibold text-green-600">
                  {destination.price}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                {destination.description}
              </p>
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/tourism">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Lihat Detail Destinasi
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        );

      case "umkm":
        const umkmItem = detailModal.data as UMKM;
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              {umkmItem.images?.map((image, index) => (
                <Image
                  key={index}
                  src={image || "/placeholder.svg?height=200&width=300"}
                  alt={umkmItem.name}
                  width={300}
                  height={200}
                  className="rounded-lg object-cover cursor-pointer hover:opacity-80 w-full h-32 sm:h-48"
                  onClick={() =>
                    openImageModal(umkmItem.images, index, umkmItem.name)
                  }
                />
              ))}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4">
                {umkmItem.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
                <Badge>{umkmItem.category}</Badge>
                <span className="text-base sm:text-lg font-semibold text-green-600">
                  {umkmItem.price}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4 text-sm sm:text-base">
                {umkmItem.description}
              </p>
              {umkmItem.contact && (
                <div className="flex items-center space-x-2 mb-4">
                  <Phone className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm break-all">{umkmItem.contact}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/umkm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Lihat Detail UMKM
                  </Link>
                </Button>
                {umkmItem.contact && (
                  <Button
                    variant="outline"
                    asChild
                    className="w-full sm:w-auto"
                  >
                    <a
                      href={`https://wa.me/${umkmItem.contact.replace(
                        /\D/g,
                        ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Hubungi via WhatsApp
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        );

      case "basecamp":
        const basecampItem = detailModal.data as Basecamp;
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              {basecampItem.images?.map((image, index) => (
                <Image
                  key={index}
                  src={image || "/placeholder.svg?height=200&width=300"}
                  alt={basecampItem.namaBasecamp}
                  width={300}
                  height={200}
                  className="rounded-lg object-cover cursor-pointer hover:opacity-80 w-full h-32 sm:h-48"
                  onClick={() =>
                    openImageModal(
                      basecampItem.images,
                      index,
                      basecampItem.namaBasecamp
                    )
                  }
                />
              ))}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4">
                {basecampItem.namaBasecamp}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-4">
                <div className="flex items-start sm:items-center space-x-2">
                  <MapPin className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span className="text-sm break-words">
                    {basecampItem.lokasi}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">
                    Kapasitas: {basecampItem.dayaTampungOrang} orang
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">
                    Parkir: {basecampItem.dayaTampungKendaraan} kendaraan
                  </span>
                </div>
                <div className="flex items-start sm:items-center space-x-2">
                  <Phone className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span className="text-sm break-all">
                    {basecampItem.nomorWa}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Pemilik:</h4>
                <p className="text-muted-foreground text-sm sm:text-base">
                  {basecampItem.pemilik}
                </p>
              </div>
              {basecampItem.fasilitas && basecampItem.fasilitas.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Fasilitas:</h4>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {basecampItem.fasilitas.map((fasilitas, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {fasilitas}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {basecampItem.menuMakanan &&
                basecampItem.menuMakanan.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Utensils className="h-4 w-4 mr-2" />
                      Menu Makanan:
                    </h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {basecampItem.menuMakanan.map((menu, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {menu}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              {basecampItem.menuMinuman &&
                basecampItem.menuMinuman.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Coffee className="h-4 w-4 mr-2" />
                      Menu Minuman:
                    </h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {basecampItem.menuMinuman.map((menu, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {menu}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/basecamp">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Lihat Detail Basecamp
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <a
                    href={`https://wa.me/${basecampItem.nomorWa.replace(
                      /\D/g,
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Hubungi via WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        );

      case "event":
        const eventItem = detailModal.data as Event;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {eventItem.images?.map((image, index) => (
                <Image
                  key={index}
                  src={image || "/placeholder.svg?height=200&width=300"}
                  alt={eventItem.name}
                  width={300}
                  height={200}
                  className="rounded-lg object-cover cursor-pointer hover:opacity-80"
                  onClick={() =>
                    openImageModal(eventItem.images, index, eventItem.name)
                  }
                />
              ))}
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">{eventItem.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    {new Date(eventItem.date).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{eventItem.location}</span>
                </div>
                {eventItem.price && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-green-600">
                      {eventItem.price}
                    </span>
                  </div>
                )}
                {eventItem.maxParticipants && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      {eventItem.currentParticipants}/
                      {eventItem.maxParticipants} peserta
                    </span>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <Badge>{eventItem.category}</Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {eventItem.description}
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/events">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Lihat Detail Event
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        );
      case "gallery":
        const galleryItem = detailModal.data as Gallery;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {galleryItem.images?.map((image, index) => (
                <Image
                  key={index}
                  src={image || "/placeholder.svg?height=200&width=300"}
                  alt={galleryItem.title}
                  width={300}
                  height={200}
                  className="rounded-lg object-cover cursor-pointer hover:opacity-80"
                  onClick={() =>
                    openImageModal(galleryItem.images, index, galleryItem.title)
                  }
                />
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">{galleryItem.title}</h3>
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <Badge>{galleryItem.category}</Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(galleryItem.createdAt).toLocaleDateString("id-ID")}
                </span>
              </div>
              {galleryItem.description && (
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {galleryItem.description}
                </p>
              )}
              <div className="text-sm text-muted-foreground">
                <p>Total gambar: {galleryItem.images?.length || 0}</p>
              </div>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/gallery">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Lihat Detail Galeri
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-muted-foreground mt-4">Memuat halaman...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Image Modal */}
      <ImageModal
        isOpen={modalState.isOpen}
        onClose={closeImageModal}
        images={modalState.images}
        currentIndex={modalState.currentIndex}
        title={modalState.title}
        onNext={nextImage}
        onPrev={prevImage}
      />

      {/* Detail Modal */}
      <DetailModal isOpen={detailModal.isOpen} onClose={closeDetailModal}>
        {renderDetailContent()}
      </DetailModal>

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

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50 bg-gradient-to-b from-black/30 via-black/40 to-black/70 z-10"></div>

        {/* Content */}
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center sm:justify-start z-20">
          <div className="text-white max-w-full sm:max-w-2xl text-center sm:text-left">
            <Badge className="mb-3 sm:mb-4 bg-green-500 hover:bg-green-600 text-xs sm:text-sm">
              Kawasan Taman Nasional Gunung Merbabu
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 leading-tight">
              Desa Tarubatang
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-green-100 max-w-2xl leading-relaxed mb-6 sm:mb-8">
              Destinasi wisata alam terbaik di kaki Gunung Merbabu dengan
              keindahan yang memukau dan budaya yang kaya
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-center">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-600 w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8"
                asChild
              >
                <Link href="/tourism">Jelajahi Wisata</Link>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8"
                asChild
              >
                <Link href="/events">Lihat Acara</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Error Display */}
      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ Beberapa data mungkin tidak dapat dimuat: {error}
            </p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <section id="tentang" className="py-12 bg-background scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Data Sumber Daya Aktif di Desa Tarubatang
            </h2>
            <p className="text-muted-foreground">
              Statistik lengkap destinasi wisata dan aktivitas di desa kami
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Mountain className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalDestinations}
              </div>
              <div className="text-sm text-muted-foreground">
                Destinasi Wisata
              </div>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalEvents}
              </div>
              <div className="text-sm text-muted-foreground">Event Aktif</div>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Home className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalUMKM}
              </div>
              <div className="text-sm text-muted-foreground">UMKM Lokal</div>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 dark:bg-orange-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Mountain className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {stats.totalBasecamp} {/* Ubah dari basecamp.length */}
              </div>
              <div className="text-sm text-muted-foreground">Basecamp</div>
            </div>
            <div className="text-center">
              <div className="bg-pink-100 dark:bg-pink-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Star className="h-8 w-8 text-pink-600" />
              </div>
              <div className="text-2xl font-bold text-pink-600">
                {stats.totalGallery}
              </div>
              <div className="text-sm text-muted-foreground">Foto Galeri</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section id="wisata" className="py-16 bg-muted/50 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Destinasi Wisata Populer
            </h2>
            <p className="text-muted-foreground">
              Jelajahi keindahan alam dan budaya yang menawan di Desa Tarubatang
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {destinations.map((destination) => (
              <Card
                key={destination.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={
                      destination.images?.[0] ||
                      "/placeholder.svg?height=200&width=400" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={destination.name}
                    fill
                    className="object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() =>
                      openImageModal(destination.images, 0, destination.name)
                    }
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-black hover:bg-white">
                      {destination.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">
                      {destination.name}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {destination.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 font-semibold">
                      {destination.price}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        openDetailModal("destination", destination)
                      }
                    >
                      Detail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button asChild size="lg">
              <Link href="/tourism">Lihat Semua Destinasi</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* UMKM Section */}
      <section id="umkm" className="py-16 bg-background scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">UMKM Lokal</h2>
            <p className="text-muted-foreground">
              Dukung produk dan layanan dari masyarakat lokal Desa Tarubatang
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {umkm.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={
                      item.images?.[0] ||
                      "/placeholder.svg?height=200&width=400" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={item.name}
                    fill
                    className="object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => openImageModal(item.images, 0, item.name)}
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-black hover:bg-white">
                      {item.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 font-semibold">
                      {item.price}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDetailModal("umkm", item)}
                    >
                      Detail
                    </Button>
                  </div>
                  {item.contact && (
                    <div className="mt-2 flex items-center text-xs text-muted-foreground">
                      <Phone className="h-3 w-3 mr-1" />
                      {item.contact}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button asChild size="lg">
              <Link href="/umkm">Lihat Semua UMKM</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Basecamp Section */}
      <section id="basecamp" className="py-16 bg-muted/50 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Basecamp & Penginapan</h2>
            <p className="text-muted-foreground">
              Tempat istirahat terbaik untuk pendaki dan wisatawan
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {basecamp.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={
                      item.images?.[0] ||
                      "/placeholder.svg?height=200&width=400" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={item.namaBasecamp}
                    fill
                    className="object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() =>
                      openImageModal(item.images, 0, item.namaBasecamp)
                    }
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">
                    {item.namaBasecamp}
                  </h3>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 text-green-600" />
                      {item.lokasi}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2 text-green-600" />
                      Kapasitas: {item.dayaTampungOrang} orang
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2 text-green-600" />
                      {item.nomorWa}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDetailModal("basecamp", item)}
                    >
                      Detail
                    </Button>
                    <Button size="sm" asChild>
                      <a
                        href={`https://wa.me/${item.nomorWa.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Hubungi
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button asChild size="lg">
              <Link href="/basecamp">Lihat Semua Basecamp</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="acara" className="py-16 bg-background scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Acara & Event</h2>
            <p className="text-muted-foreground">
              Ikuti berbagai acara menarik di Desa Tarubatang
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {events.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={
                      event.images?.[0] ||
                      "/placeholder.svg?height=200&width=400" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={event.name}
                    fill
                    className="object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => openImageModal(event.images, 0, event.name)}
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-black hover:bg-white">
                      {event.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{event.name}</h3>
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2 text-green-600" />
                      {new Date(event.date).toLocaleDateString("id-ID")}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 text-green-600" />
                      {event.location}
                    </div>
                    {event.maxParticipants && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2 text-green-600" />
                        {event.currentParticipants}/{event.maxParticipants}{" "}
                        peserta
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    {event.price && (
                      <span className="text-green-600 font-semibold">
                        {event.price}
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDetailModal("event", event)}
                    >
                      Detail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button asChild size="lg">
              <Link href="/events">Lihat Semua Event</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="galeri" className="py-16 bg-muted/50 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Galeri Foto</h2>
            <p className="text-muted-foreground">
              Saksikan keindahan Desa Tarubatang melalui lensa fotografer
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {gallery.map((item, index) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="relative h-48 overflow-hidden cursor-pointer">
                  <Image
                    src={
                      item.images?.[0] ||
                      "/placeholder.svg?height=200&width=300"
                    }
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    onClick={() => openImageModal(item.images, 0, item.title)}
                  />
                  {/* Badge untuk menampilkan jumlah gambar jika lebih dari 1 */}
                  {item.images && item.images.length > 1 && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-black/70 text-white hover:bg-black/80 text-xs">
                        +{item.images.length - 1}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm mb-1 line-clamp-1 cursor-pointer hover:text-green-600 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {item.images?.length || 0} foto
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs px-2 py-1 h-7 flex-1"
                      onClick={() => openDetailModal("gallery", item)}
                    >
                      Detail
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs px-2 py-1 h-7 flex-1"
                      onClick={() => openImageModal(item.images, 0, item.title)}
                    >
                      Lihat Foto
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button asChild size="lg">
              <Link href="/gallery">Lihat Semua Foto</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact/Guestbook Section */}
      <section id="kontak" className="py-16 bg-background scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Tinggalkan Pesan</h2>
              <p className="text-muted-foreground">
                Bagikan pengalaman atau tanyakan informasi tentang Desa
                Tarubatang
              </p>
            </div>
            <Card className="shadow-lg border-0">
              <CardContent className="p-8">
                {/* Status Message */}
                {submitStatus.type && (
                  <div
                    className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
                      submitStatus.type === "success"
                        ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800"
                        : "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
                    }`}
                  >
                    {submitStatus.type === "success" ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          submitStatus.type === "success"
                            ? "text-green-800 dark:text-green-400"
                            : "text-red-800 dark:text-red-400"
                        }`}
                      >
                        {submitStatus.type === "success"
                          ? "Berhasil!"
                          : "Gagal!"}
                      </p>
                      <p
                        className={`text-sm ${
                          submitStatus.type === "success"
                            ? "text-green-600 dark:text-green-300"
                            : "text-red-600 dark:text-red-300"
                        }`}
                      >
                        {submitStatus.message}
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={guestbookForm.name}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        placeholder="Masukkan nama lengkap"
                        className="h-11"
                        maxLength={100}
                      />
                      <p className="text-xs text-muted-foreground">
                        {guestbookForm.name.length}/100 karakter
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={guestbookForm.email}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        placeholder="nama@email.com"
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Nomor Telepon
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={guestbookForm.phone}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        placeholder="08xx-xxxx-xxxx (opsional)"
                        className="h-11"
                        maxLength={20}
                      />
                      <p className="text-xs text-muted-foreground">
                        Opsional - untuk kemudahan follow up
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium">
                        Subjek <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        value={guestbookForm.subject}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        placeholder="Topik/subjek pesan"
                        className="h-11"
                        maxLength={200}
                      />
                      <p className="text-xs text-muted-foreground">
                        {guestbookForm.subject.length}/200 karakter
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">
                      Pesan <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={guestbookForm.message}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      placeholder="Tulis pesan, pengalaman, saran, atau pertanyaan Anda di sini..."
                      rows={6}
                      className="resize-none"
                      maxLength={2000}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Minimal 10 karakter</span>
                      <span>{guestbookForm.message.length}/2000 karakter</span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-4">
                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-medium"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Mengirim Pesan...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Kirim Pesan
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      <span className="text-red-500">*</span> Field wajib diisi
                    </p>
                  </div>
                </form>

                {/* Help Text */}
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-green-600" />
                      Informasi Anda aman dan tidak akan dibagikan kepada pihak
                      ketiga
                    </p>
                    <p className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-blue-600" />
                      Tim kami akan merespons dalam 1-2 hari kerja
                    </p>
                    <p className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-purple-600" />
                      Untuk pertanyaan mendesak, kunjungi halaman{" "}
                      <Link
                        href="/kontak"
                        className="text-blue-600 hover:underline ml-1"
                      >
                        Kontak
                      </Link>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
