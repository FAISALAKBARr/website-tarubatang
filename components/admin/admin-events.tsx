"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  MapPin,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  Upload,
  X,
  AlertCircle,
  ImageIcon,
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

interface FormData {
  name: string;
  date: string;
  endDate: string;
  location: string;
  description: string;
  content: string;
  maxParticipants: string;
  price: string;
  category: string;
  images: string[];
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // File upload states
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("file");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [formData, setFormData] = useState<FormData>({
    name: "",
    date: "",
    endDate: "",
    location: "",
    description: "",
    content: "",
    maxParticipants: "",
    price: "",
    category: "",
    images: [],
  });

  // Available categories
  const categories = [
    { value: "all", label: "Semua Kategori" },
    { value: "Olahraga", label: "Olahraga" },
    { value: "Budaya", label: "Budaya" },
    { value: "Sosial", label: "Sosial" },
    { value: "Edukasi", label: "Edukasi" },
    { value: "Hiburan", label: "Hiburan" },
  ];

  const statuses = [
    { value: "all", label: "Semua Status" },
    { value: "upcoming", label: "Akan Datang" },
    { value: "ongoing", label: "Berlangsung" },
    { value: "completed", label: "Selesai" },
  ];

  // Helper function to validate image files
  const validateImageFile = (
    file: File
  ): { isValid: boolean; error?: string } => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/heic",
      "image/heif",
    ];

    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File ${file.name} terlalu besar. Maksimal 10MB.`,
      };
    }

    if (file.size === 0) {
      return {
        isValid: false,
        error: `File ${file.name} kosong.`,
      };
    }

    const fileName = file.name.toLowerCase();
    const mimeType = file.type.toLowerCase();

    const isValidType =
      ALLOWED_TYPES.includes(mimeType) ||
      fileName.endsWith(".heic") ||
      fileName.endsWith(".heif");

    if (!isValidType) {
      return {
        isValid: false,
        error: `File ${file.name} bukan format gambar yang didukung.`,
      };
    }

    return { isValid: true };
  };

  // Fetch events from API
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
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/event?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedStatus, pagination.page]);

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

  const resetForm = () => {
    setFormData({
      name: "",
      date: "",
      endDate: "",
      location: "",
      description: "",
      content: "",
      maxParticipants: "",
      price: "",
      category: "",
      images: [],
    });
    setSelectedFiles([]);
    setUploadErrors([]);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      const validation = validateImageFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(validation.error!);
      }
    });

    if (errors.length > 0) {
      alert(`Beberapa file tidak valid:\n${errors.join("\n")}`);
    }

    setSelectedFiles(validFiles);
    setUploadErrors([]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddEvent = async () => {
    if (
      !formData.name.trim() ||
      !formData.category ||
      !formData.date ||
      !formData.location
    ) {
      alert("Harap isi nama event, kategori, tanggal, dan lokasi");
      return;
    }

    if (uploadMethod === "file") {
      if (selectedFiles.length === 0) {
        alert("Harap pilih file gambar");
        return;
      }
    } else if (uploadMethod === "url") {
      if (formData.images.filter((img) => img.trim()).length === 0) {
        alert("Harap masukkan minimal satu URL gambar");
        return;
      }
    }

    try {
      setSubmitting(true);
      setUploadErrors([]);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      let response: Response;

      if (uploadMethod === "file") {
        // Use FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name.trim());
        formDataToSend.append("description", formData.description.trim());
        formDataToSend.append("content", formData.content.trim());
        formDataToSend.append("category", formData.category);
        formDataToSend.append("date", new Date(formData.date).toISOString());
        if (formData.endDate) {
          formDataToSend.append(
            "endDate",
            new Date(formData.endDate).toISOString()
          );
        }
        formDataToSend.append("location", formData.location.trim());
        if (formData.maxParticipants) {
          formDataToSend.append("maxParticipants", formData.maxParticipants);
        }
        formDataToSend.append("price", formData.price || "0");

        // Add files
        selectedFiles.forEach((file) => {
          formDataToSend.append("images", file);
        });

        console.log(`Creating event with ${selectedFiles.length} files`);

        response = await fetch("/api/event", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        });
      } else {
        // Use JSON for URL upload
        const payload = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          content: formData.content.trim(),
          category: formData.category,
          date: new Date(formData.date).toISOString(),
          endDate: formData.endDate
            ? new Date(formData.endDate).toISOString()
            : null,
          location: formData.location.trim(),
          maxParticipants: formData.maxParticipants
            ? Number.parseInt(formData.maxParticipants)
            : null,
          price: formData.price || "0",
          images: formData.images.filter((img) => img.trim() !== ""),
        };

        console.log("Creating event with URLs");

        response = await fetch("/api/event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create event");
      }

      const result = await response.json();

      // Enhanced success message
      let successMessage = "Event berhasil dibuat!";

      if (result.convertedFiles && result.convertedFiles.length > 0) {
        successMessage += `\n\n📸 File HEIC yang dikonversi ke JPG:\n${result.convertedFiles.join(
          "\n"
        )}`;
      }

      if (result.warnings && result.warnings.length > 0) {
        successMessage += `\n\n⚠️ Peringatan:\n${result.warnings.join("\n")}`;
      }

      if (result.uploadedCount && result.uploadedCount > 0) {
        successMessage += `\n\n✅ ${result.uploadedCount} gambar berhasil diupload`;
      }

      alert(successMessage);

      await fetchEvents();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating event:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat event"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      date: event.date.split("T")[0], // Format for date input
      endDate: event.endDate ? event.endDate.split("T")[0] : "",
      location: event.location,
      description: event.description,
      content: event.content || "",
      maxParticipants: event.maxParticipants?.toString() || "",
      price: event.price || "",
      category: event.category,
      images: event.images || [],
    });
    setUploadMethod("url"); // Default to URL method for editing, but allow switching
    setSelectedFiles([]);
    setUploadErrors([]);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;

    if (
      !formData.name.trim() ||
      !formData.category ||
      !formData.date ||
      !formData.location
    ) {
      alert("Harap isi nama event, kategori, tanggal, dan lokasi");
      return;
    }

    // Validate images based on upload method
    if (uploadMethod === "file") {
      if (
        selectedFiles.length === 0 &&
        formData.images.filter((img) => img.trim()).length === 0
      ) {
        alert("Harap pilih file gambar atau masukkan URL gambar");
        return;
      }
    } else if (uploadMethod === "url") {
      if (formData.images.filter((img) => img.trim()).length === 0) {
        alert("Harap masukkan minimal satu URL gambar");
        return;
      }
    }

    try {
      setSubmitting(true);
      setUploadErrors([]);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      let response: Response;

      if (uploadMethod === "file" && selectedFiles.length > 0) {
        // Use FormData for file upload - combine with existing data
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name.trim());
        formDataToSend.append("description", formData.description.trim());
        formDataToSend.append("content", formData.content.trim());
        formDataToSend.append("category", formData.category);
        formDataToSend.append("date", new Date(formData.date).toISOString());
        if (formData.endDate) {
          formDataToSend.append(
            "endDate",
            new Date(formData.endDate).toISOString()
          );
        }
        formDataToSend.append("location", formData.location.trim());
        if (formData.maxParticipants) {
          formDataToSend.append("maxParticipants", formData.maxParticipants);
        }
        formDataToSend.append("price", formData.price || "0");

        // Add existing image URLs
        formData.images
          .filter((img) => img.trim())
          .forEach((imageUrl) => {
            formDataToSend.append("existingImages", imageUrl);
          });

        // Add new files
        selectedFiles.forEach((file) => {
          formDataToSend.append("images", file);
        });

        console.log(
          `Updating event with ${selectedFiles.length} new files and ${formData.images.length} existing images`
        );

        response = await fetch(`/api/event/${editingEvent.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        });
      } else {
        // Use JSON for URL-only updates
        const payload = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          content: formData.content.trim(),
          category: formData.category,
          date: new Date(formData.date).toISOString(),
          endDate: formData.endDate
            ? new Date(formData.endDate).toISOString()
            : null,
          location: formData.location.trim(),
          maxParticipants: formData.maxParticipants
            ? Number.parseInt(formData.maxParticipants)
            : null,
          price: formData.price || "0",
          images: formData.images.filter((img) => img.trim() !== ""),
        };

        response = await fetch(`/api/event/${editingEvent.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to update event";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Enhanced success message
      let successMessage = "Event berhasil diperbarui!";

      if (result.convertedFiles && result.convertedFiles.length > 0) {
        successMessage += `\n\n📸 File HEIC yang dikonversi ke JPG:\n${result.convertedFiles.join(
          "\n"
        )}`;
      }

      if (result.warnings && result.warnings.length > 0) {
        successMessage += `\n\n⚠️ Peringatan:\n${result.warnings.join("\n")}`;
      }

      if (uploadMethod === "file" && selectedFiles.length > 0) {
        successMessage += `\n\n✅ ${selectedFiles.length} gambar baru berhasil diupload`;
      }

      alert(successMessage);

      await fetchEvents();
      setEditingEvent(null);
      resetForm();
    } catch (error) {
      console.error("Error updating event:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memperbarui event"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus event ini?")) return;

    try {
      setDeleting(eventId);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`/api/event/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete event");
      }

      await fetchEvents();
      alert("Event berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghapus event"
      );
    } finally {
      setDeleting(null);
    }
  };

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

  const handleRetry = () => {
    fetchEvents();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
  };

  const addImageUrl = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }));
  };

  const removeImageUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const updateImageUrl = (index: number, url: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? url : img)),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Kelola Event & Acara</h2>
          <p className="text-gray-600">
            Buat dan kelola event serta acara Desa Tarubatang
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Event Baru</DialogTitle>
                <DialogDescription>
                  Isi form di bawah untuk menambah event baru
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="name">Nama Event</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Masukkan nama event"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Tanggal Mulai</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Tanggal Selesai (Opsional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="location">Lokasi</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="Masukkan lokasi event"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Harga</Label>
                    <Input
                      id="price"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="Gratis atau Rp 50.000"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="maxParticipants">Maksimal Peserta</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxParticipants: e.target.value,
                        })
                      }
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Deskripsi Singkat</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Masukkan deskripsi singkat event"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="content">Konten Detail (Opsional)</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      placeholder="Masukkan konten detail event"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Upload Method Selection */}
                <div className="space-y-2">
                  <Label>Metode Upload Gambar</Label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="file"
                        checked={uploadMethod === "file"}
                        onChange={(e) =>
                          setUploadMethod(e.target.value as "file" | "url")
                        }
                        className="mr-2"
                      />
                      Upload File
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="url"
                        checked={uploadMethod === "url"}
                        onChange={(e) =>
                          setUploadMethod(e.target.value as "file" | "url")
                        }
                        className="mr-2"
                      />
                      URL Gambar
                    </label>
                  </div>
                </div>

                {/* File Upload Section */}
                {uploadMethod === "file" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="images">Pilih Gambar Event</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <Input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*,.heic,.heif"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <label htmlFor="images" className="cursor-pointer">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            Klik untuk memilih gambar atau drag & drop
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Mendukung JPG, PNG, GIF, WebP, HEIC (maksimal 10MB
                            per file)
                          </p>
                        </label>
                      </div>
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          File terpilih ({selectedFiles.length}):
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedFiles.map((file, index) => {
                            const isHeic =
                              file.name.toLowerCase().endsWith(".heic") ||
                              file.name.toLowerCase().endsWith(".heif") ||
                              file.type.toLowerCase().includes("heic");
                            const fileSize = (file.size / 1024 / 1024).toFixed(
                              2
                            );

                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-gray-50 p-3 rounded border"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium truncate">
                                      {file.name}
                                    </span>
                                    {isHeic && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs bg-blue-100 text-blue-800"
                                      >
                                        HEIC → JPG
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {fileSize} MB
                                  </p>
                                  {isHeic && (
                                    <p className="text-xs text-blue-600 font-medium mt-1">
                                      ⚡ Akan dikonversi ke JPG saat upload
                                    </p>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="ml-2"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {uploadErrors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-sm text-red-800 font-medium mb-1">
                          Upload Errors:
                        </p>
                        <ul className="text-sm text-red-700 space-y-1">
                          {uploadErrors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* URL Upload */}
                {uploadMethod === "url" && (
                  <div className="space-y-2">
                    <Label>URL Gambar Event</Label>
                    {formData.images.map((image, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={image}
                          onChange={(e) =>
                            updateImageUrl(index, e.target.value)
                          }
                          placeholder="https://example.com/image.jpg"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeImageUrl(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addImageUrl}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah URL Gambar
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                  disabled={submitting}
                >
                  Batal
                </Button>
                <Button onClick={handleAddEvent} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Memuat data Events...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold text-red-800">
                  Error Loading Events
                </h3>
              </div>
              <p className="text-red-700 text-sm mb-4">{error}</p>
              <div className="space-y-2">
                <Button onClick={handleRetry}>Coba Lagi</Button>
                <Button variant="outline" onClick={handleResetFilters}>
                  Reset Filter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500 text-lg mb-4">
                Tidak ada event yang ditemukan
              </p>
              <Button onClick={handleResetFilters}>Reset Filter</Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const eventStatus = getStatusFromDate(event.date, event.endDate);
            const participantCount =
              event._count?.participants ?? event.currentParticipants ?? 0;

            return (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold">{event.name}</h3>
                        <Badge className={getStatusColor(eventStatus)}>
                          {getStatusText(eventStatus)}
                        </Badge>
                        <Badge className={getCategoryColor(event.category)}>
                          {event.category}
                        </Badge>
                        {event.price === "0" ||
                        event.price === "Gratis" ||
                        !event.price ? (
                          <Badge className="bg-green-100 text-green-800">
                            Gratis
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800">
                            {event.price}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4">{event.description}</p>

                      {/* Event Images Preview */}
                      {event.images && event.images.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <ImageIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {event.images.length} gambar
                            </span>
                          </div>
                          <div className="flex space-x-2 overflow-x-auto">
                            {event.images.slice(0, 4).map((imageUrl, index) => (
                              <div
                                key={index}
                                className="relative flex-shrink-0"
                              >
                                <Image
                                  src={imageUrl || "/placeholder.svg"}
                                  alt={`${event.name} - Image ${index + 1}`}
                                  width={80}
                                  height={60}
                                  className="rounded border object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "/placeholder.svg?height=60&width=80";
                                  }}
                                />
                                {index === 3 && event.images.length > 4 && (
                                  <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">
                                      +{event.images.length - 4}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
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
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>
                            {participantCount}
                            {event.maxParticipants &&
                              `/${event.maxParticipants}`}{" "}
                            peserta
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditEvent(event)}
                        disabled={submitting}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteEvent(event.id)}
                        disabled={deleting === event.id}
                      >
                        {deleting === event.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1 || loading}
            >
              Previous
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant={pagination.page === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPagination((prev) => ({ ...prev, page }))}
                  disabled={loading}
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page === pagination.totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingEvent}
        onOpenChange={() => {
          setEditingEvent(null);
          resetForm();
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update informasi event</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-name">Nama Event</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Tanggal Mulai</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">Tanggal Selesai</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-location">Lokasi</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Harga</Label>
                <Input
                  id="edit-price"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-maxParticipants">Maksimal Peserta</Label>
                <Input
                  id="edit-maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxParticipants: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-description">Deskripsi</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-content">Konten Detail (Opsional)</Label>
                <Textarea
                  id="edit-content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={4}
                />
              </div>
            </div>

            {/* Current Images Preview */}
            {editingEvent &&
              editingEvent.images &&
              editingEvent.images.length > 0 && (
                <div className="space-y-2">
                  <Label>Gambar Saat Ini</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {formData.images
                      .filter((img) => img?.trim())
                      .map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square relative rounded border overflow-hidden">
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`Current ${index + 1}`}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/placeholder.svg?height=100&width=100";
                              }}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImageUrl(index)}
                              disabled={formData.images.length === 1}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-center mt-1 text-gray-500 truncate">
                            Gambar {index + 1}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* Upload Method Selection for Edit */}
            <div className="space-y-2">
              <Label>Metode Upload Gambar</Label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="url"
                    checked={uploadMethod === "url"}
                    onChange={(e) =>
                      setUploadMethod(e.target.value as "file" | "url")
                    }
                    className="mr-2"
                  />
                  Edit URL Gambar
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="file"
                    checked={uploadMethod === "file"}
                    onChange={(e) =>
                      setUploadMethod(e.target.value as "file" | "url")
                    }
                    className="mr-2"
                  />
                  Upload Gambar Baru
                </label>
              </div>
            </div>

            {/* File Upload Section for Edit */}
            {uploadMethod === "file" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-images">Tambah Gambar Baru</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Input
                      id="edit-images"
                      type="file"
                      multiple
                      accept="image/*,.heic,.heif"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label htmlFor="edit-images" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Klik untuk memilih gambar tambahan
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Mendukung JPG, PNG, GIF, WebP, HEIC (maksimal 10MB per
                        file)
                      </p>
                    </label>
                  </div>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      File baru yang akan diupload ({selectedFiles.length}):
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedFiles.map((file, index) => {
                        const isHeic =
                          file.name.toLowerCase().endsWith(".heic") ||
                          file.name.toLowerCase().endsWith(".heif") ||
                          file.type.toLowerCase().includes("heic");
                        const fileSize = (file.size / 1024 / 1024).toFixed(2);

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded border"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium truncate">
                                  {file.name}
                                </span>
                                {isHeic && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-blue-100 text-blue-800"
                                  >
                                    HEIC → JPG
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {fileSize} MB
                              </p>
                              {isHeic && (
                                <p className="text-xs text-blue-600 font-medium mt-1">
                                  ⚡ Akan dikonversi ke JPG saat upload
                                </p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="ml-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {uploadErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800 font-medium mb-1">
                      Upload Errors:
                    </p>
                    <ul className="text-sm text-red-700 space-y-1">
                      {uploadErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setEditingEvent(null);
                resetForm();
              }}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button onClick={handleUpdateEvent} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
