"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  MapPin,
  Calendar,
  Camera,
  Mountain,
  TreePine,
  Tent,
  Upload,
  X,
  ImageIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";

interface Destination {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  content?: string;
  price: string;
  facilities: string[];
  location: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  rating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DestinationForm {
  name: string;
  category: string;
  description: string;
  contact: string;
  content: string;
  price: string;
  facilities: string[];
  location: string;
  latitude?: number;
  longitude?: number;
}

const initialFormData: DestinationForm = {
  name: "",
  category: "",
  description: "",
  contact: "",
  content: "",
  price: "",
  facilities: [],
  location: "",
  latitude: undefined,
  longitude: undefined,
};

const categories = [
  { value: "Wisata Alam", label: "Wisata Alam", icon: TreePine },
  { value: "Pendakian", label: "Pendakian", icon: Mountain },
  { value: "Camping", label: "Camping", icon: Tent },
  { value: "Spot Foto", label: "Spot Foto", icon: Camera },
];

const validateContact = (contact: string): boolean => {
  if (!contact) return true;
  return /^(62)[0-9]{8,}$/.test(contact);
};

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Image states
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [converting, setConverting] = useState<string[]>([]);

  // Image viewer states
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewerImages, setViewerImages] = useState<string[]>([]);

  const [formData, setFormData] = useState<DestinationForm>(initialFormData);

  // File validation
  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/heic",
      "image/heif",
    ];

    if (file.size > maxSize) {
      return "File terlalu besar. Maksimal 5MB.";
    }

    if (file.size === 0) {
      return "File kosong.";
    }

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.toLowerCase().endsWith(".heic")
    ) {
      return "Format file tidak didukung. Gunakan JPG, PNG, atau HEIC.";
    }

    return null;
  };

  // Convert HEIC to JPG using browser API
  const convertHeicToJpg = async (file: File): Promise<File> => {
    if (
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      file.name.toLowerCase().endsWith(".heic")
    ) {
      try {
        setConverting((prev) => [...prev, file.name]);

        // Dynamic import to avoid SSR issues
        const heic2any = (await import("heic2any")).default;

        const convertedBlob = (await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8,
        })) as Blob;

        const convertedFile = new File(
          [convertedBlob],
          file.name.replace(/\.heic$/i, ".jpg"),
          {
            type: "image/jpeg",
          }
        );

        setConverting((prev) => prev.filter((name) => name !== file.name));
        return convertedFile;
      } catch (error) {
        setConverting((prev) => prev.filter((name) => name !== file.name));
        console.error("Error converting HEIC to JPG:", error);
        throw new Error(`Failed to convert HEIC image: ${file.name}`);
      }
    }
    return file;
  };

  // Handle file selection
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || formLoading) return;

    const newFiles: File[] = [];
    const errors: string[] = [];

    for (const file of Array.from(files)) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        continue;
      }

      try {
        const processedFile = await convertHeicToJpg(file);
        newFiles.push(processedFile);
      } catch (error) {
        errors.push(`${file.name}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      showNotification(
        "error",
        `Beberapa file tidak dapat diproses:\n${errors.join("\n")}`
      );
    }

    if (newFiles.length > 0) {
      const totalFiles =
        selectedFiles.length + newFiles.length + existingImages.length;
      if (totalFiles > 5) {
        showNotification("error", "Maksimal 5 gambar per destinasi");
        return;
      }

      setSelectedFiles((prev) => [...prev, ...newFiles]);
      showNotification(
        "success",
        `${newFiles.length} file berhasil ditambahkan`
      );
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (formLoading) return;

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (formLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing image
  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Fetch destinations
  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);

      const response = await fetch(`/api/destinations?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDestinations(data.destinations || []);
      } else {
        throw new Error("Gagal memuat data");
      }
    } catch (error) {
      showNotification("error", "Gagal memuat data destinasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, [searchTerm, selectedCategory]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setExistingImages([]);
    setSelectedFiles([]);
  };

  const handleAdd = () => {
    resetForm();
    setModalMode("add");
    setSelectedDestination(null);
    setShowModal(true);
  };

  const handleEdit = (destination: Destination) => {
    setSelectedDestination(destination);
    setFormData({
      name: destination.name,
      category: destination.category,
      description: destination.description,
      contact: destination.contact || "",
      content: destination.content || "",
      price: destination.price,
      facilities: destination.facilities,
      location: destination.location,
      latitude: destination.latitude,
      longitude: destination.longitude,
    });

    setExistingImages([...destination.images]);
    setSelectedFiles([]);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error("Nama destinasi harus diisi");
      }
      if (!formData.category) {
        throw new Error("Kategori harus dipilih");
      }
      if (!formData.description.trim()) {
        throw new Error("Deskripsi harus diisi");
      }
      if (!formData.location.trim()) {
        throw new Error("Lokasi harus diisi");
      }

      const totalImages = existingImages.length + selectedFiles.length;
      if (totalImages === 0) {
        throw new Error("Minimal harus ada 1 gambar");
      }

      const url =
        modalMode === "add"
          ? "/api/destinations"
          : `/api/destinations/${selectedDestination?.id}`;
      const method = modalMode === "add" ? "POST" : "PUT";

      // Always use FormData for consistency
      const formDataToSend = new FormData();

      // Add form fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("contact", formData.contact);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("facilities", JSON.stringify(formData.facilities));
      formDataToSend.append("location", formData.location);
      if (formData.latitude !== undefined && formData.latitude !== null) {
        formDataToSend.append("latitude", formData.latitude.toString());
      }
      if (formData.longitude !== undefined && formData.longitude !== null) {
        formDataToSend.append("longitude", formData.longitude.toString());
      }

      // Add existing images (for edit mode)
      if (modalMode === "edit" && existingImages.length > 0) {
        formDataToSend.append("existingImages", JSON.stringify(existingImages));
      }

      // Add new files
      selectedFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });

      const token = localStorage.getItem("token");
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Gagal menyimpan destinasi";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      await fetchDestinations();
      setShowModal(false);
      setSelectedDestination(null);
      resetForm();

      showNotification(
        "success",
        result.message ||
          (modalMode === "edit"
            ? "Destinasi berhasil diperbarui"
            : "Destinasi berhasil ditambahkan")
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menyimpan destinasi";
      showNotification("error", errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Yakin ingin menghapus destinasi "${name}"? Tindakan ini tidak dapat dibatalkan.`
      )
    )
      return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/destinations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        showNotification("success", "Destinasi berhasil dihapus");
        fetchDestinations();
      } else {
        throw new Error("Gagal menghapus destinasi");
      }
    } catch (error) {
      showNotification("error", "Gagal menghapus destinasi");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/destinations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        showNotification(
          "success",
          `Destinasi berhasil ${
            !currentStatus ? "diaktifkan" : "dinonaktifkan"
          }`
        );
        fetchDestinations();
      } else {
        throw new Error("Gagal mengubah status");
      }
    } catch (error) {
      showNotification("error", "Gagal mengubah status destinasi");
    } finally {
      setLoading(false);
    }
  };

  // Image viewer functions
  const openImageViewer = (images: string[], startIndex = 0) => {
    setViewerImages(images);
    setCurrentImageIndex(startIndex);
    setShowImageViewer(true);
  };

  const closeImageViewer = () => {
    setShowImageViewer(false);
    setViewerImages([]);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % viewerImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + viewerImages.length) % viewerImages.length
    );
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!showImageViewer) return;

    switch (e.key) {
      case "Escape":
        closeImageViewer();
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
  }, [showImageViewer, viewerImages.length]);

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find((c) => c.value === category);
    return categoryData ? categoryData.icon : MapPin;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalImages = existingImages.length + selectedFiles.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Manajemen Destinasi
        </h1>
        <p className="text-gray-600">Kelola destinasi wisata Desa Tarubatang</p>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari destinasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchDestinations}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Tambah Destinasi
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Destinasi</p>
              <p className="text-2xl font-bold text-gray-900">
                {destinations.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Destinasi Aktif</p>
              <p className="text-2xl font-bold text-green-600">
                {destinations.filter((d) => d.isActive).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Destinasi Tidak Aktif</p>
              <p className="text-2xl font-bold text-red-600">
                {destinations.filter((d) => !d.isActive).length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destinasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lokasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dibuat
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                      <span className="text-gray-500">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : destinations.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {searchTerm || selectedCategory !== "all"
                      ? "Tidak ada data yang sesuai dengan filter"
                      : "Belum ada data destinasi"}
                  </td>
                </tr>
              ) : (
                destinations.map((destination) => {
                  const IconComponent = getCategoryIcon(destination.category);
                  return (
                    <tr key={destination.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="relative h-12 w-16 rounded-lg overflow-hidden mr-4">
                            <button
                              onClick={() =>
                                openImageViewer(destination.images, 0)
                              }
                              className="w-full h-full"
                            >
                              <Image
                                src={
                                  destination.images[0] ||
                                  "/placeholder.svg?height=48&width=64" ||
                                  "/placeholder.svg"
                                }
                                alt={destination.name}
                                fill
                                className="object-cover hover:opacity-80 transition-opacity"
                              />
                            </button>
                            {destination.images.length > 1 && (
                              <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl">
                                +{destination.images.length - 1}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {destination.name}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {destination.description}
                            </div>
                            <div className="text-sm text-green-600 font-medium">
                              {destination.price}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
                            destination.category
                          )}`}
                        >
                          <IconComponent className="h-3 w-3 mr-1" />
                          {destination.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                          {destination.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            destination.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {destination.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Aktif
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Tidak Aktif
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          {formatDate(destination.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              handleToggleStatus(
                                destination.id,
                                destination.isActive
                              )
                            }
                            className={`p-2 rounded-lg ${
                              destination.isActive
                                ? "text-red-600 hover:bg-red-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                            title={
                              destination.isActive ? "Nonaktifkan" : "Aktifkan"
                            }
                          >
                            {destination.isActive ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(destination)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(destination.id, destination.name)
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === "add" ? "Tambah Destinasi" : "Edit Destinasi"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Destinasi *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={formLoading}
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={formLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konten Detail
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={formLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga *
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="Gratis / Rp 10.000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasi *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        latitude: e.target.value
                          ? Number.parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        longitude: e.target.value
                          ? Number.parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fasilitas
                </label>
                <input
                  type="text"
                  value={formData.facilities.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      facilities: e.target.value
                        .split(",")
                        .map((f) => f.trim())
                        .filter((f) => f),
                    })
                  }
                  placeholder="Toilet, Parkir, Mushola (pisahkan dengan koma)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={formLoading}
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Kontak Pemandu
                </label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) =>
                    setFormData({ ...formData, contact: e.target.value })
                  }
                  placeholder="Format: 628123456789"
                  className={`w-full px-3 py-2 border ${
                    !validateContact(formData.contact)
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />
                {!validateContact(formData.contact) && (
                  <p className="text-red-500 text-xs mt-1">
                    Format nomor tidak valid. Gunakan format: 628xxx
                  </p>
                )}
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Gambar Destinasi *
                </label>

                {/* Converting Status */}
                {converting.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
                      <span className="text-sm text-blue-800">
                        Mengkonversi HEIC: {converting.join(", ")}
                      </span>
                    </div>
                  </div>
                )}

                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  } ${formLoading ? "opacity-50 pointer-events-none" : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drag & drop gambar di sini
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    atau klik untuk memilih file
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.heic"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                    id="file-upload"
                    disabled={formLoading}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                    disabled={formLoading || totalImages >= 5}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {totalImages >= 5 ? "Maksimal Tercapai" : "Pilih File"}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Format: JPG, PNG, HEIC (maks. 5MB per file, {totalImages}/5
                    file)
                  </p>
                </div>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">
                      Gambar Existing ({existingImages.length}):
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {existingImages.map((imageUrl, index) => (
                        <div
                          key={`existing-${index}`}
                          className="relative group"
                        >
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() =>
                                openImageViewer(existingImages, index)
                              }
                              className="w-full h-full"
                            >
                              <Image
                                src={imageUrl || "/placeholder.svg"}
                                alt={`Existing ${index + 1}`}
                                fill
                                className="object-cover hover:opacity-80 transition-opacity"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src =
                                    "/placeholder.svg?height=200&width=200";
                                }}
                              />
                            </button>
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openImageViewer(existingImages, index)
                                }
                                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                disabled={formLoading}
                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-center mt-1 text-green-600">
                            Existing
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">
                      File Baru ({selectedFiles.length}):
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedFiles.map((file, index) => {
                        const isConverted =
                          file.name.endsWith(".jpg") &&
                          file.type === "image/jpeg";

                        return (
                          <div key={`new-${index}`} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                              </div>
                            </div>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                disabled={formLoading}
                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="text-xs text-center mt-1 truncate">
                              {file.name}
                              {isConverted && (
                                <span className="text-blue-600">
                                  {" "}
                                  (HEIC→JPG)
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-center text-blue-600">
                              Baru
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Total: {totalImages}/5 gambar</span>
                  {totalImages >= 5 && (
                    <div className="flex items-center text-orange-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      <span>Maksimal tercapai</span>
                    </div>
                  )}
                  {totalImages === 0 && (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      <span>Minimal 1 gambar diperlukan</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={formLoading}
                  className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading || totalImages === 0}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {formLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  {modalMode === "add"
                    ? "Tambah Destinasi"
                    : "Perbarui Destinasi"}
                </button>
              </div>
            </form>
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
                {currentImageIndex + 1} / {viewerImages.length}
              </div>
            )}

            {/* Previous Button */}
            {viewerImages.length > 1 && (
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Next Button */}
            {viewerImages.length > 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Main Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={viewerImages[currentImageIndex] || "/placeholder.svg"}
                alt={`Image ${currentImageIndex + 1}`}
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
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentImageIndex
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
    </div>
  );
}
