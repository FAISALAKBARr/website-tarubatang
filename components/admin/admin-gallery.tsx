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
  ImageIcon,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  Grid3X3,
  LayoutGrid,
  X,
  ChevronLeft,
  ChevronRight,
  Upload,
  AlertCircle,
  Eye,
  EyeOff,
  FolderOpen,
  Camera,
} from "lucide-react";
import Image from "next/image";

// Types with proper defaults
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

interface FormData {
  title: string;
  description: string;
  category: string;
  images: string[];
}

export default function AdminGallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // File upload states - Enhanced for edit
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("file");
  const [editUploadMethod, setEditUploadMethod] = useState<"url" | "file">(
    "url"
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editSelectedFiles, setEditSelectedFiles] = useState<File[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [editUploadErrors, setEditUploadErrors] = useState<string[]>([]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedView, setSelectedView] = useState<"grid" | "masonry">("grid");

  // Pagination with safe defaults
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 12,
  });

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Image preview states for edit
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    images: [],
  });

  // Available categories
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

  // Safe data normalization function
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

  // Create preview URL for file
  const createPreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  // Clean up preview URLs
  const cleanupPreviewUrls = (urls: string[]) => {
    urls.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
  };

  // Fetch gallery items from API
  const fetchGalleryItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: (pagination.currentPage || 1).toString(),
        limit: (pagination.limit || 12).toString(),
        includeInactive: "true", // Admin should see inactive items too
      });

      if (searchTerm?.trim()) {
        params.append("search", searchTerm.trim());
      }

      if (selectedCategory && selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      console.log("Admin fetching gallery with params:", params.toString());

      const response = await fetch(`/api/gallery?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Admin API Error:", errorText);

        let errorMessage = "Failed to fetch gallery items";
        let errorDetails = "";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
          errorDetails = errorData.details || "";

          if (errorData.suggestion) {
            errorDetails += ` (${errorData.suggestion})`;
          }
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          errorDetails = errorText;
        }

        throw new Error(
          `${errorMessage}${errorDetails ? ` - ${errorDetails}` : ""}`
        );
      }

      const data = await response.json();
      console.log("Gallery data received:", data);

      // Safely normalize the response data
      const normalizedItems = Array.isArray(data?.items)
        ? data.items.map(normalizeGalleryItem)
        : [];

      const normalizedPagination = normalizePagination(data?.pagination);

      console.log(
        "Successfully fetched gallery items:",
        normalizedItems.length
      );
      setGalleryItems(normalizedItems);
      setPagination(normalizedPagination);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
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

  // Fetch gallery items when dependencies change
  useEffect(() => {
    fetchGalleryItems();
  }, [fetchGalleryItems]);

  // Reset page when filters change
  useEffect(() => {
    if (pagination.currentPage !== 1) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }
  }, [searchTerm, selectedCategory]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      cleanupPreviewUrls(previewImages);
    };
  }, [previewImages]);

  // Reset form function
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      images: [],
    });
    setSelectedFiles([]);
    setUploadErrors([]);
    cleanupPreviewUrls(previewImages);
    setPreviewImages([]);
  };

  // Reset edit form function
  const resetEditForm = () => {
    setEditSelectedFiles([]);
    setEditUploadErrors([]);
    cleanupPreviewUrls(previewImages);
    setPreviewImages([]);
    setExistingImages([]);
    setImagesToRemove([]);
    setEditUploadMethod("url");
  };

  // Handle file selection for add
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

  // Handle file selection for edit
  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Clean up previous preview URLs
    cleanupPreviewUrls(previewImages);

    // Create new preview URLs
    const newPreviewImages = validFiles.map((file) => createPreviewUrl(file));
    setPreviewImages(newPreviewImages);

    setEditSelectedFiles(validFiles);
    setEditUploadErrors([]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeEditFile = (index: number) => {
    // Clean up the preview URL
    const urlToCleanup = previewImages[index];
    if (urlToCleanup && urlToCleanup.startsWith("blob:")) {
      URL.revokeObjectURL(urlToCleanup);
    }

    setEditSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle removing existing images in edit mode
  const handleRemoveExistingImage = (imageUrl: string) => {
    setImagesToRemove((prev) => [...prev, imageUrl]);
    setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
  };

  // Handle restoring removed image
  const handleRestoreExistingImage = (imageUrl: string) => {
    setImagesToRemove((prev) => prev.filter((img) => img !== imageUrl));
    setExistingImages((prev) => [...prev, imageUrl]);
  };

  // Handle form submission for adding new item
  const handleAddItem = async () => {
    if (!formData.title.trim() || !formData.category) {
      alert("Harap isi judul dan kategori");
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

      let response: Response;

      if (uploadMethod === "file") {
        // Use FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append("title", formData.title.trim());
        formDataToSend.append("description", formData.description.trim());
        formDataToSend.append("category", formData.category);

        // Add files
        selectedFiles.forEach((file) => {
          formDataToSend.append("images", file);
        });

        console.log(`Creating gallery item with ${selectedFiles.length} files`);

        response = await fetch("/api/gallery", {
          method: "POST",
          body: formDataToSend,
        });
      } else {
        // Use JSON for URL upload
        const payload = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          images: formData.images.filter((img) => img.trim() !== ""),
        };

        console.log("Creating gallery item with URLs");

        response = await fetch("/api/gallery", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create gallery item");
      }

      const result = await response.json();

      // Enhanced success message
      let successMessage = "Item galeri berhasil dibuat!";

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

      await fetchGalleryItems();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating gallery item:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat item galeri"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle editing an item - Enhanced
  const handleEditItem = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "",
      images: Array.isArray(item.images) ? item.images.filter(Boolean) : [],
    });

    // Set existing images for preview
    setExistingImages(
      Array.isArray(item.images) ? item.images.filter(Boolean) : []
    );
    setImagesToRemove([]);

    // Default to URL method but allow switching
    setEditUploadMethod("url");
    setEditSelectedFiles([]);
    setEditUploadErrors([]);
    cleanupPreviewUrls(previewImages);
    setPreviewImages([]);
  };

  // Handle updating an item - Enhanced to support file upload
  const handleUpdateItem = async () => {
    if (!editingItem) return;

    if (!formData.title.trim() || !formData.category) {
      alert("Harap isi judul dan kategori");
      return;
    }

    // Validate that there will be at least one image after update
    const remainingExistingImages = existingImages.length;
    const newFilesCount = editSelectedFiles.length;
    const newUrlsCount =
      editUploadMethod === "url"
        ? formData.images.filter((img) => img.trim() !== "").length
        : 0;

    if (remainingExistingImages + newFilesCount + newUrlsCount === 0) {
      alert("Item galeri harus memiliki minimal satu gambar");
      return;
    }

    try {
      setSubmitting(true);

      let response: Response;

      if (editUploadMethod === "file" && editSelectedFiles.length > 0) {
        // Use FormData for file upload with existing images
        const formDataToSend = new FormData();
        formDataToSend.append("title", formData.title.trim());
        formDataToSend.append("description", formData.description.trim());
        formDataToSend.append("category", formData.category);

        // Add existing images that should be kept
        formDataToSend.append("existingImages", JSON.stringify(existingImages));

        // Add images to remove
        if (imagesToRemove.length > 0) {
          formDataToSend.append(
            "imagesToRemove",
            JSON.stringify(imagesToRemove)
          );
        }

        // Add new files
        editSelectedFiles.forEach((file) => {
          formDataToSend.append("images", file);
        });

        console.log(
          `Updating gallery item with ${editSelectedFiles.length} new files`
        );

        response = await fetch(`/api/gallery/${editingItem.id}`, {
          method: "PUT",
          body: formDataToSend,
        });
      } else {
        // Use JSON for URL-only update
        const finalImages =
          editUploadMethod === "url"
            ? formData.images.filter((img) => img.trim() !== "")
            : existingImages;

        const payload = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          images: finalImages,
        };

        console.log("Updating gallery item with URLs only");

        response = await fetch(`/api/gallery/${editingItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update gallery item");
      }

      const result = await response.json();

      // Enhanced success message
      let successMessage = "Item galeri berhasil diperbarui!";

      if (result.uploadedCount && result.uploadedCount > 0) {
        successMessage += `\n\n✅ ${result.uploadedCount} gambar baru berhasil diupload`;
      }

      if (result.removedCount && result.removedCount > 0) {
        successMessage += `\n\n🗑️ ${result.removedCount} gambar berhasil dihapus`;
      }

      alert(successMessage);

      await fetchGalleryItems();
      setEditingItem(null);
      resetForm();
      resetEditForm();
    } catch (error) {
      console.error("Error updating gallery item:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memperbarui item galeri"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus item galeri ini?")) return;

    try {
      setDeleting(itemId);

      const response = await fetch(`/api/gallery/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete gallery item");
      }

      await fetchGalleryItems();
      alert("Item galeri berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghapus item galeri"
      );
    } finally {
      setDeleting(null);
    }
  };

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

  const handleRetry = () => {
    fetchGalleryItems();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
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
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Kelola Galeri</h2>
          <p className="text-sm md:text-base text-gray-600">
            Upload dan organisir foto-foto dokumentasi Desa Tarubatang
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={loading}
            className="text-xs md:text-sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 md:mr-2 ${
                loading ? "animate-spin" : ""
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="text-xs md:text-sm">
                <Plus className="h-4 w-4 mr-1 md:mr-2" />
                Tambah Foto
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg md:text-xl">
                  Tambah Foto Baru
                </DialogTitle>
                <DialogDescription className="text-sm md:text-base">
                  Isi form di bawah untuk menambah foto baru ke galeri
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Judul
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Masukkan judul foto"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Kategori
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map((category) => (
                        <SelectItem
                          key={category.value}
                          value={category.value}
                          className="text-sm"
                        >
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Deskripsi (Opsional)
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Masukkan deskripsi foto"
                    rows={3}
                    className="text-sm"
                  />
                </div>

                {/* Upload Method Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Metode Upload</Label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4">
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
                      <span className="text-sm">Upload File</span>
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
                      <span className="text-sm">URL Gambar</span>
                    </label>
                  </div>
                </div>

                {/* File Upload Section */}
                {uploadMethod === "file" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="images" className="text-sm font-medium">
                        Pilih Gambar
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center hover:border-gray-400 transition-colors">
                        <Input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*,.heic,.heif"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <label htmlFor="images" className="cursor-pointer">
                          <Upload className="h-6 w-6 md:h-8 md:w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs md:text-sm text-gray-600">
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
                        <div className="grid grid-cols-1 gap-2">
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
                                  <div className="flex items-center space-x-2 flex-wrap">
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
                                  className="ml-2 flex-shrink-0"
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
                    <Label className="text-sm font-medium">URL Gambar</Label>
                    {formData.images.map((image, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={image}
                          onChange={(e) =>
                            updateImageUrl(index, e.target.value)
                          }
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeImageUrl(index)}
                          className="flex-shrink-0"
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
                      className="text-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah URL Gambar
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                  disabled={submitting}
                  className="text-sm"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleAddItem}
                  disabled={submitting}
                  className="text-sm"
                >
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
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col lg:flex-row gap-3 md:gap-4 items-stretch lg:items-center">
            <div className="relative flex-1 max-w-full lg:max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari foto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-600 flex-shrink-0" />
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full sm:w-48 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.value}
                        value={category.value}
                        className="text-sm"
                      >
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between sm:justify-start space-x-2">
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant={selectedView === "grid" ? "default" : "outline"}
                    onClick={() => setSelectedView("grid")}
                    className="text-xs"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedView === "masonry" ? "default" : "outline"}
                    onClick={() => setSelectedView("masonry")}
                    className="text-xs"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-xs"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm md:text-base">Memuat galeri...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 md:py-12">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 md:h-8 md:w-8 text-red-600 mr-2" />
                <h3 className="text-base md:text-lg font-semibold text-red-800">
                  Error Loading Gallery
                </h3>
              </div>
              <p className="text-red-700 text-sm mb-4 max-w-2xl mx-auto">
                {error}
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2">
                <Button onClick={handleRetry} size="sm">
                  Coba Lagi
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  size="sm"
                >
                  Reset Filter
                </Button>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-left">
                <h4 className="font-semibold text-yellow-800 mb-2 text-sm">
                  Troubleshooting Tips:
                </h4>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Pastikan database sudah terhubung dengan benar</li>
                  <li>
                    • Jalankan{" "}
                    <code className="bg-yellow-100 px-1 rounded">
                      npx prisma db push
                    </code>{" "}
                    untuk membuat tabel
                  </li>
                  <li>• Periksa environment variables Supabase</li>
                  <li>• Lihat console browser untuk error detail</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : galleryItems.length > 0 ? (
        <div
          className={`grid gap-4 md:gap-6 ${
            selectedView === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "columns-1 sm:columns-2 lg:columns-3 xl:columns-4"
          }`}
        >
          {galleryItems.map((item, index) => (
            <Card
              key={item.id}
              className={`overflow-hidden hover:shadow-lg transition-shadow group ${
                selectedView === "masonry"
                  ? "mb-4 md:mb-6 break-inside-avoid"
                  : ""
              }`}
            >
              <div className="relative">
                <Image
                  src={getImageUrl(item) || "/placeholder.svg"}
                  alt={item.title || "Gallery image"}
                  width={400}
                  height={300}
                  className={`w-full object-cover cursor-pointer ${
                    selectedView === "grid" ? "h-36 sm:h-48" : "h-auto"
                  }`}
                  onClick={() => openLightbox(index)}
                  onError={(e) => {
                    e.currentTarget.src =
                      "/placeholder.svg?height=300&width=400";
                  }}
                />
                <div className="absolute top-2 left-2">
                  <Badge
                    className={`text-xs ${getCategoryColor(
                      item.category || "Other"
                    )}`}
                  >
                    {item.category || "Other"}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditItem(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={deleting === item.id}
                      className="h-8 w-8 p-0"
                    >
                      {deleting === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-3 md:p-4">
                <h3 className="font-semibold mb-2 line-clamp-2 text-sm md:text-base">
                  {item.title || "Untitled"}
                </h3>
                {item.description && (
                  <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs md:text-sm text-gray-500">
                  <span>{formatDate(item.createdAt)}</span>
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center">
                      <ImageIcon className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      {Array.isArray(item.images) ? item.images.length : 0}
                    </span>
                    <Badge
                      variant={item.active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {item.active ? "Aktif" : "Tidak Aktif"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 md:py-12">
          <ImageIcon className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4 text-sm md:text-base">
            {searchTerm || selectedCategory !== "all"
              ? "Tidak ada foto yang sesuai dengan pencarian."
              : "Belum ada foto di galeri."}
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2">
            {(searchTerm || selectedCategory !== "all") && (
              <Button variant="outline" onClick={handleResetFilters} size="sm">
                Reset Filter
              </Button>
            )}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Foto Pertama
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6 md:mt-8">
          <div className="flex items-center space-x-1 md:space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePaginationChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="text-xs md:text-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {/* Page numbers */}
            {Array.from(
              { length: Math.min(pagination.totalPages, 7) },
              (_, i) => {
                const pageNumber = i + 1;
                if (pagination.totalPages <= 7) {
                  return pageNumber;
                }

                if (pageNumber === 1 || pageNumber === pagination.totalPages) {
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
                  className="text-xs md:text-sm"
                >
                  {page}
                </Button>
              ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePaginationChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="text-xs md:text-sm"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Enhanced Edit Dialog */}
      <Dialog
        open={!!editingItem}
        onOpenChange={(open) => {
          if (!open) {
            setEditingItem(null);
            resetForm();
            resetEditForm();
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Edit Foto</DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              Perbarui informasi foto di galeri
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 md:space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-sm font-medium">
                  Judul
                </Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Masukkan judul foto"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category" className="text-sm font-medium">
                  Kategori
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((category) => (
                      <SelectItem
                        key={category.value}
                        value={category.value}
                        className="text-sm"
                      >
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm font-medium">
                Deskripsi (Opsional)
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Masukkan deskripsi foto"
                rows={3}
                className="text-sm"
              />
            </div>

            {/* Current Images Management */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Gambar Saat Ini</Label>
              {existingImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square relative rounded border overflow-hidden bg-gray-100">
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
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleRemoveExistingImage(image)}
                            disabled={
                              existingImages.length === 1 &&
                              editSelectedFiles.length === 0
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-center mt-1 text-gray-500 truncate">
                        Gambar {index + 1}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Tidak ada gambar tersisa
                </p>
              )}
            </div>

            {/* Removed Images (with restore option) */}
            {imagesToRemove.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-red-600">
                  Gambar yang Akan Dihapus
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {imagesToRemove.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square relative rounded border overflow-hidden bg-red-50 opacity-60">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Removed ${index + 1}`}
                          fill
                          className="object-cover grayscale"
                          onError={(e) => {
                            e.currentTarget.src =
                              "/placeholder.svg?height=100&width=100";
                          }}
                        />
                        <div className="absolute inset-0 bg-red-500 bg-opacity-30 flex items-center justify-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 bg-white"
                            onClick={() => handleRestoreExistingImage(image)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-center mt-1 text-red-500 truncate">
                        Akan dihapus
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Edit Upload Method Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tambah Gambar Baru</Label>
              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="file"
                    checked={editUploadMethod === "file"}
                    onChange={(e) =>
                      setEditUploadMethod(e.target.value as "file" | "url")
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">Upload File</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="url"
                    checked={editUploadMethod === "url"}
                    onChange={(e) =>
                      setEditUploadMethod(e.target.value as "file" | "url")
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">URL Gambar</span>
                </label>
              </div>
            </div>

            {/* Edit File Upload Section */}
            {editUploadMethod === "file" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-images" className="text-sm font-medium">
                    Pilih Gambar Baru
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center hover:border-gray-400 transition-colors">
                    <Input
                      id="edit-images"
                      type="file"
                      multiple
                      accept="image/*,.heic,.heif"
                      onChange={handleEditFileSelect}
                      className="hidden"
                    />
                    <label htmlFor="edit-images" className="cursor-pointer">
                      <Upload className="h-6 w-6 md:h-8 md:w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs md:text-sm text-gray-600">
                        Klik untuk memilih gambar atau drag & drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Mendukung JPG, PNG, GIF, WebP, HEIC (maksimal 10MB per
                        file)
                      </p>
                    </label>
                  </div>
                </div>

                {/* Preview of new files */}
                {editSelectedFiles.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 font-medium">
                      File baru terpilih ({editSelectedFiles.length}):
                    </p>

                    {/* File list view */}
                    <div className="space-y-2">
                      {editSelectedFiles.map((file, index) => {
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
                              <div className="flex items-center space-x-2 flex-wrap">
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
                              onClick={() => removeEditFile(index)}
                              className="ml-2 flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Image Preview Grid for new files */}
                    {previewImages.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 font-medium">
                          Preview gambar baru:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {previewImages.map((previewUrl, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square relative rounded border overflow-hidden bg-gray-100">
                                <Image
                                  src={previewUrl}
                                  alt={`Preview ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => removeEditFile(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-center mt-1 text-gray-500 truncate">
                                Baru {index + 1}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {editUploadErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800 font-medium mb-1">
                      Upload Errors:
                    </p>
                    <ul className="text-sm text-red-700 space-y-1">
                      {editUploadErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Edit URL Upload */}
            {editUploadMethod === "url" && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">URL Gambar</Label>
                {formData.images.map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={image}
                      onChange={(e) => updateImageUrl(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeImageUrl(index)}
                      disabled={
                        existingImages.length === 0 &&
                        formData.images.filter((img) => img.trim()).length ===
                          1 &&
                        editSelectedFiles.length === 0
                      }
                      className="flex-shrink-0"
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
                  className="text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah URL Gambar
                </Button>
              </div>
            )}

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2 text-sm">
                Summary Perubahan:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {existingImages.length}
                  </div>
                  <div className="text-xs text-gray-600">Gambar Tersisa</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {editSelectedFiles.length +
                      (editUploadMethod === "url"
                        ? formData.images.filter((img) => img.trim()).length
                        : 0)}
                  </div>
                  <div className="text-xs text-gray-600">Gambar Baru</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {imagesToRemove.length}
                  </div>
                  <div className="text-xs text-gray-600">Akan Dihapus</div>
                </div>
              </div>
              <div className="mt-2 text-center">
                <div className="text-sm text-gray-600">
                  Total akhir:{" "}
                  <span className="font-medium text-gray-800">
                    {existingImages.length +
                      editSelectedFiles.length +
                      (editUploadMethod === "url"
                        ? formData.images.filter((img) => img.trim()).length
                        : 0)}{" "}
                    gambar
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setEditingItem(null);
                resetForm();
                resetEditForm();
              }}
              disabled={submitting}
              className="text-sm order-2 sm:order-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdateItem}
              disabled={
                submitting ||
                (existingImages.length === 0 &&
                  editSelectedFiles.length === 0 &&
                  formData.images.filter((img) => img.trim()).length === 0)
              }
              className="text-sm order-1 sm:order-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {editSelectedFiles.length > 0
                    ? "Mengupload..."
                    : "Memperbarui..."}
                </>
              ) : (
                "Perbarui Foto"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxIndex !== null && galleryItems[lightboxIndex] && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 md:p-4">
          {/* Close Button */}
          <Button
            variant="ghost"
            className="absolute top-2 right-2 md:top-4 md:right-4 text-white hover:bg-white/20 z-10 h-10 w-10 p-0"
            onClick={closeLightbox}
          >
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </Button>

          {/* Navigation Buttons */}
          {galleryItems.length > 1 && (
            <>
              <Button
                variant="ghost"
                className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-10 h-12 w-12 p-0"
                onClick={prevImage}
              >
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
              <Button
                variant="ghost"
                className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-10 h-12 w-12 p-0"
                onClick={nextImage}
              >
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
            </>
          )}

          {/* Main Content Container */}
          <div className="w-full h-full flex flex-col max-w-7xl mx-auto">
            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center min-h-0 pb-2 md:pb-4">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={
                    getImageUrl(galleryItems[lightboxIndex]) ||
                    "/placeholder.svg"
                  }
                  alt={galleryItems[lightboxIndex].title || "Gallery image"}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                  style={{
                    maxWidth:
                      galleryItems.length > 1
                        ? "calc(100vw - 6rem)"
                        : "calc(100vw - 2rem)",
                    maxHeight: "calc(100vh - 8rem)",
                  }}
                  onError={(e) => {
                    e.currentTarget.src =
                      "/placeholder.svg?height=600&width=800";
                  }}
                />
              </div>
            </div>

            {/* Info Panel */}
            <div className="bg-black/70 text-white p-3 md:p-4 rounded-lg mx-2 md:mx-4 flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-2 md:gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-semibold mb-1 line-clamp-2">
                    {galleryItems[lightboxIndex].title || "Untitled"}
                  </h3>
                  {galleryItems[lightboxIndex].description && (
                    <p className="text-xs md:text-sm text-gray-300 line-clamp-2 md:line-clamp-3">
                      {galleryItems[lightboxIndex].description}
                    </p>
                  )}
                </div>
                <div className="text-left sm:text-right flex-shrink-0 w-full sm:w-auto">
                  <Badge
                    className={`text-xs mb-1 ${getCategoryColor(
                      galleryItems[lightboxIndex].category || "Other"
                    )}`}
                  >
                    {galleryItems[lightboxIndex].category || "Other"}
                  </Badge>
                  <p className="text-xs md:text-sm text-gray-300">
                    {formatDate(galleryItems[lightboxIndex].createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 md:mt-3 text-xs md:text-sm text-gray-400">
                <span>
                  {lightboxIndex + 1} dari {galleryItems.length} foto
                </span>
                <span className="flex items-center">
                  <ImageIcon className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  {Array.isArray(galleryItems[lightboxIndex].images)
                    ? galleryItems[lightboxIndex].images.length
                    : 0}{" "}
                  gambar
                </span>
              </div>
            </div>
          </div>

          {/* Touch/Swipe indicators for mobile */}
          {galleryItems.length > 1 && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 md:hidden">
              <div className="flex items-center space-x-1 bg-black/50 rounded-full px-3 py-1">
                {Array.from({ length: Math.min(galleryItems.length, 5) }).map(
                  (_, i) => {
                    const isActive = i === lightboxIndex % 5;
                    return (
                      <div
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full ${
                          isActive ? "bg-white" : "bg-white/40"
                        }`}
                      />
                    );
                  }
                )}
                {galleryItems.length > 5 && (
                  <span className="text-xs text-white/60 ml-2">
                    +{galleryItems.length - 5}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statistics Card */}
      <Card className="mt-6 md:mt-8">
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-center">
            <div className="p-2 md:p-0">
              <div className="text-lg md:text-2xl font-bold text-green-600">
                {pagination.totalItems || 0}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Total Foto</div>
            </div>
            <div className="p-2 md:p-0">
              <div className="text-lg md:text-2xl font-bold text-blue-600">
                {categories.slice(1).length}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Kategori</div>
            </div>
            <div className="p-2 md:p-0">
              <div className="text-lg md:text-2xl font-bold text-purple-600">
                {galleryItems.filter((item) => item.active).length}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Aktif</div>
            </div>
            <div className="p-2 md:p-0">
              <div className="text-lg md:text-2xl font-bold text-orange-600">
                {pagination.currentPage || 1}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Halaman</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
