"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  MapPin,
  Users,
  Car,
  Phone,
  ImageIcon,
  Utensils,
  Wifi,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Bed,
  Bath,
  Tv,
  Globe,
  Home,
  Upload,
  Loader2,
} from "lucide-react";

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

interface BasecampFormData {
  namaBasecamp: string;
  fasilitas: string[];
  dayaTampungKendaraan: number;
  dayaTampungOrang: number;
  nomorWa: string;
  sosialMedia: string[];
  lokasi: string;
  latitude?: number;
  longitude?: number;
  pemilik: string;
  menuMakanan: string[];
  menuMinuman: string[];
}

export default function AdminBasecampPage() {
  const [basecamps, setBasecamps] = useState<Basecamp[]>([]);
  const [filteredBasecamps, setFilteredBasecamps] = useState<Basecamp[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedBasecamp, setSelectedBasecamp] = useState<Basecamp | null>(
    null
  );
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Image states - separated for better control
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [converting, setConverting] = useState<string[]>([]);

  // Image viewer states
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewerImages, setViewerImages] = useState<string[]>([]);

  const [formData, setFormData] = useState<BasecampFormData>({
    namaBasecamp: "",
    fasilitas: [],
    dayaTampungKendaraan: 0,
    dayaTampungOrang: 0,
    nomorWa: "",
    sosialMedia: [],
    lokasi: "",
    latitude: undefined,
    longitude: undefined,
    pemilik: "",
    menuMakanan: [],
    menuMinuman: [],
  });

  // Form input states for dynamic arrays
  const [newFacility, setNewFacility] = useState("");
  const [newSocialMedia, setNewSocialMedia] = useState("");
  const [newFood, setNewFood] = useState("");
  const [newDrink, setNewDrink] = useState("");

  // Common facilities options
  const facilityOptions = [
    "WiFi Gratis",
    "TV",
    "Kamar Mandi Dalam",
    "AC",
    "Kasur",
    "Lemari",
    "Dapur",
    "Kulkas",
    "Kompor",
    "Alat Masak",
    "Parkir Motor",
    "Parkir Mobil",
    "Mushola",
    "Ruang Tamu",
    "Teras",
    "Pemandangan Bagus",
    "Air Panas",
    "Laundry",
    "Breakfast",
    "Antar Jemput",
  ];

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
        showNotification("error", "Maksimal 5 gambar per basecamp");
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

  // Fetch basecamps
  const fetchBasecamps = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/basecamp?status=all");
      if (response.ok) {
        const data = await response.json();
        setBasecamps(data.basecamp || []);
      } else {
        throw new Error("Gagal memuat data");
      }
    } catch (error) {
      showNotification("error", "Gagal memuat data basecamp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBasecamps();
  }, []);

  // Filter basecamps
  useEffect(() => {
    let filtered = basecamps;

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

    if (filterStatus !== "all") {
      filtered = filtered.filter((basecamp) =>
        filterStatus === "active" ? basecamp.isActive : !basecamp.isActive
      );
    }

    setFilteredBasecamps(filtered);
  }, [basecamps, searchTerm, filterStatus]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      namaBasecamp: "",
      fasilitas: [],
      dayaTampungKendaraan: 0,
      dayaTampungOrang: 0,
      nomorWa: "",
      sosialMedia: [],
      lokasi: "",
      latitude: undefined,
      longitude: undefined,
      pemilik: "",
      menuMakanan: [],
      menuMinuman: [],
    });
    setExistingImages([]);
    setSelectedFiles([]);
    setNewFacility("");
    setNewSocialMedia("");
    setNewFood("");
    setNewDrink("");
  };

  const handleAdd = () => {
    resetForm();
    setModalMode("add");
    setSelectedBasecamp(null);
    setShowModal(true);
  };

  const handleEdit = (basecamp: Basecamp) => {
    console.log("Editing Basecamp:", basecamp);

    setSelectedBasecamp(basecamp);
    setFormData({
      namaBasecamp: basecamp.namaBasecamp,
      fasilitas: basecamp.fasilitas,
      dayaTampungKendaraan: basecamp.dayaTampungKendaraan,
      dayaTampungOrang: basecamp.dayaTampungOrang,
      nomorWa: basecamp.nomorWa,
      sosialMedia: basecamp.sosialMedia,
      lokasi: basecamp.lokasi,
      latitude: basecamp.latitude,
      longitude: basecamp.longitude,
      pemilik: basecamp.pemilik,
      menuMakanan: basecamp.menuMakanan,
      menuMinuman: basecamp.menuMinuman,
    });

    // Set existing images
    setExistingImages([...basecamp.images]);

    // Clear selected files
    setSelectedFiles([]);

    setModalMode("edit");
    setShowModal(true);
  };

  // Handle form submission with improved error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Validate form data
      if (!formData.namaBasecamp.trim()) {
        throw new Error("Nama basecamp harus diisi");
      }
      if (!formData.lokasi.trim()) {
        throw new Error("Lokasi harus diisi");
      }
      if (!formData.pemilik.trim()) {
        throw new Error("Pemilik harus diisi");
      }
      if (!formData.nomorWa.trim()) {
        throw new Error("Nomor WA harus diisi");
      }
      if (formData.dayaTampungOrang < 1) {
        throw new Error("Daya tampung orang harus lebih dari 0");
      }
      if (formData.dayaTampungKendaraan < 1) {
        throw new Error("Daya tampung kendaraan harus lebih dari 0");
      }

      // Check if we have at least one image (existing or new)
      const totalImages = existingImages.length + selectedFiles.length;
      if (totalImages === 0) {
        throw new Error("Minimal harus ada 1 gambar");
      }

      const url =
        modalMode === "add"
          ? "/api/basecamp"
          : `/api/basecamp/${selectedBasecamp?.id}`;
      const method = modalMode === "add" ? "POST" : "PUT";

      // Always use FormData for consistency
      const formDataToSend = new FormData();

      // Add form fields
      formDataToSend.append("namaBasecamp", formData.namaBasecamp);
      formDataToSend.append("fasilitas", JSON.stringify(formData.fasilitas));
      formDataToSend.append(
        "dayaTampungKendaraan",
        formData.dayaTampungKendaraan.toString()
      );
      formDataToSend.append(
        "dayaTampungOrang",
        formData.dayaTampungOrang.toString()
      );
      formDataToSend.append("nomorWa", formData.nomorWa);
      formDataToSend.append(
        "sosialMedia",
        JSON.stringify(formData.sosialMedia)
      );
      formDataToSend.append("lokasi", formData.lokasi);
      if (formData.latitude !== undefined && formData.latitude !== null) {
        formDataToSend.append("latitude", formData.latitude.toString());
      }
      if (formData.longitude !== undefined && formData.longitude !== null) {
        formDataToSend.append("longitude", formData.longitude.toString());
      }
      formDataToSend.append("pemilik", formData.pemilik);
      formDataToSend.append(
        "menuMakanan",
        JSON.stringify(formData.menuMakanan)
      );
      formDataToSend.append(
        "menuMinuman",
        JSON.stringify(formData.menuMinuman)
      );

      // Add existing images (for edit mode)
      if (modalMode === "edit" && existingImages.length > 0) {
        formDataToSend.append("existingImages", JSON.stringify(existingImages));
      }

      // Add new files
      selectedFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });

      console.log(`Submitting ${method} to ${url}`);
      console.log(
        `Files: ${selectedFiles.length}, Existing: ${existingImages.length}`
      );

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", response.status, errorText);

        let errorMessage = "Gagal menyimpan basecamp";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Submit successful:", result);

      // Refresh data and close dialog
      await fetchBasecamps();
      setShowModal(false);
      setSelectedBasecamp(null);
      resetForm();

      showNotification(
        "success",
        result.message ||
          (modalMode === "edit"
            ? "Basecamp berhasil diperbarui"
            : "Basecamp berhasil ditambahkan")
      );
    } catch (err) {
      console.error("Submit error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menyimpan basecamp";
      showNotification("error", errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Yakin ingin menghapus basecamp "${name}"? Tindakan ini tidak dapat dibatalkan.`
      )
    )
      return;

    setLoading(true);
    try {
      const response = await fetch(`/api/basecamp/${id}`, { method: "DELETE" });
      if (response.ok) {
        showNotification("success", "Basecamp berhasil dihapus");
        fetchBasecamps();
      } else {
        throw new Error("Gagal menghapus basecamp");
      }
    } catch (error) {
      showNotification("error", "Gagal menghapus basecamp");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/basecamp/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        showNotification(
          "success",
          `Basecamp berhasil ${!currentStatus ? "diaktifkan" : "dinonaktifkan"}`
        );
        fetchBasecamps();
      } else {
        throw new Error("Gagal mengubah status");
      }
    } catch (error) {
      showNotification("error", "Gagal mengubah status basecamp");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const addArrayItem = (field: keyof BasecampFormData, value: string) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()],
      }));
    }
  };

  const removeArrayItem = (field: keyof BasecampFormData, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  const addFacilityFromOptions = (facility: string) => {
    if (!formData.fasilitas.includes(facility)) {
      setFormData((prev) => ({
        ...prev,
        fasilitas: [...prev.fasilitas, facility],
      }));
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

  const getFacilityIcon = (facility: string) => {
    const facilityLower = facility.toLowerCase();
    if (facilityLower.includes("wifi")) return <Wifi className="h-3 w-3" />;
    if (facilityLower.includes("tv")) return <Tv className="h-3 w-3" />;
    if (facilityLower.includes("kasur") || facilityLower.includes("bed"))
      return <Bed className="h-3 w-3" />;
    if (facilityLower.includes("mandi")) return <Bath className="h-3 w-3" />;
    if (facilityLower.includes("dapur") || facilityLower.includes("masak"))
      return <Utensils className="h-3 w-3" />;
    if (facilityLower.includes("parkir")) return <Car className="h-3 w-3" />;
    return <CheckCircle className="h-3 w-3" />;
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

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [showImageViewer, viewerImages.length]);

  const totalImages = existingImages.length + selectedFiles.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Manajemen Basecamp
        </h1>
        <p className="text-gray-600">Kelola data basecamp Desa Tarubatang</p>
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
                placeholder="Cari basecamp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchBasecamps}
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
              Tambah Basecamp
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Basecamp</p>
              <p className="text-2xl font-bold text-gray-900">
                {basecamps.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Home className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Basecamp Aktif</p>
              <p className="text-2xl font-bold text-green-600">
                {basecamps.filter((b) => b.isActive).length}
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
              <p className="text-sm text-gray-600">Basecamp Tidak Aktif</p>
              <p className="text-2xl font-bold text-red-600">
                {basecamps.filter((b) => !b.isActive).length}
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
                  Basecamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kapasitas
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
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                      <span className="text-gray-500">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBasecamps.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {searchTerm || filterStatus !== "all"
                      ? "Tidak ada data yang sesuai dengan filter"
                      : "Belum ada data basecamp"}
                  </td>
                </tr>
              ) : (
                filteredBasecamps.map((basecamp) => (
                  <React.Fragment key={basecamp.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleExpandRow(basecamp.id)}
                            className="mr-3 p-1 hover:bg-gray-100 rounded"
                          >
                            {expandedRows.has(basecamp.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {basecamp.namaBasecamp}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {basecamp.lokasi}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Users className="h-3 w-3 mr-1" />
                              {basecamp.pemilik}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <Users className="h-3 w-3 mr-1 text-blue-500" />
                            {basecamp.dayaTampungOrang} orang
                          </div>
                          <div className="flex items-center">
                            <Car className="h-3 w-3 mr-1 text-green-500" />
                            {basecamp.dayaTampungKendaraan} kendaraan
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            basecamp.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {basecamp.isActive ? (
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
                          {formatDate(basecamp.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              handleToggleStatus(basecamp.id, basecamp.isActive)
                            }
                            className={`p-2 rounded-lg ${
                              basecamp.isActive
                                ? "text-red-600 hover:bg-red-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                            title={
                              basecamp.isActive ? "Nonaktifkan" : "Aktifkan"
                            }
                          >
                            {basecamp.isActive ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(basecamp)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(basecamp.id, basecamp.namaBasecamp)
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has(basecamp.id) && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Contact Info */}
                            <div className="bg-white p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Phone className="h-4 w-4 mr-2" />
                                Kontak
                              </h4>
                              <p className="text-sm text-gray-600">
                                {basecamp.nomorWa}
                              </p>
                            </div>

                            {/* Facilities */}
                            <div className="bg-white p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">
                                Fasilitas
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {basecamp.fasilitas
                                  .slice(0, 3)
                                  .map((facility, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                    >
                                      {getFacilityIcon(facility)}
                                      <span className="ml-1">{facility}</span>
                                    </span>
                                  ))}
                                {basecamp.fasilitas.length > 3 && (
                                  <span className="text-xs text-gray-400">
                                    +{basecamp.fasilitas.length - 3} lainnya
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Images */}
                            {basecamp.images.length > 0 && (
                              <div className="bg-white p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                  <ImageIcon className="h-4 w-4 mr-2" />
                                  Gambar ({basecamp.images.length})
                                </h4>
                                <div className="flex gap-2 overflow-x-auto">
                                  {basecamp.images
                                    .slice(0, 3)
                                    .map((image, index) => (
                                      <button
                                        key={index}
                                        onClick={() =>
                                          openImageViewer(
                                            basecamp.images,
                                            index
                                          )
                                        }
                                        className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden hover:opacity-80 transition-opacity group"
                                      >
                                        <img
                                          src={image || "/placeholder.svg"}
                                          alt={`Gambar ${index + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <Eye className="h-4 w-4 text-white" />
                                        </div>
                                      </button>
                                    ))}
                                  {basecamp.images.length > 3 && (
                                    <button
                                      onClick={() =>
                                        openImageViewer(basecamp.images, 3)
                                      }
                                      className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 hover:bg-gray-200 transition-colors"
                                    >
                                      +{basecamp.images.length - 3}
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Menu */}
                            {(basecamp.menuMakanan.length > 0 ||
                              basecamp.menuMinuman.length > 0) && (
                              <div className="bg-white p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                  <Utensils className="h-4 w-4 mr-2" />
                                  Menu
                                </h4>
                                <div className="space-y-2">
                                  {basecamp.menuMakanan.length > 0 && (
                                    <div>
                                      <span className="text-xs text-gray-500">
                                        Makanan:
                                      </span>
                                      <p className="text-sm text-gray-600">
                                        {basecamp.menuMakanan
                                          .slice(0, 2)
                                          .join(", ")}
                                        {basecamp.menuMakanan.length > 2 &&
                                          "..."}
                                      </p>
                                    </div>
                                  )}
                                  {basecamp.menuMinuman.length > 0 && (
                                    <div>
                                      <span className="text-xs text-gray-500">
                                        Minuman:
                                      </span>
                                      <p className="text-sm text-gray-600">
                                        {basecamp.menuMinuman
                                          .slice(0, 2)
                                          .join(", ")}
                                        {basecamp.menuMinuman.length > 2 &&
                                          "..."}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Social Media */}
                            {basecamp.sosialMedia.length > 0 && (
                              <div className="bg-white p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                  <Globe className="h-4 w-4 mr-2" />
                                  Sosial Media
                                </h4>
                                <div className="space-y-1">
                                  {basecamp.sosialMedia
                                    .slice(0, 2)
                                    .map((social, index) => (
                                      <p
                                        key={index}
                                        className="text-sm text-blue-600 hover:underline"
                                      >
                                        <a
                                          href={social}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {social.length > 30
                                            ? `${social.substring(0, 30)}...`
                                            : social}
                                        </a>
                                      </p>
                                    ))}
                                  {basecamp.sosialMedia.length > 2 && (
                                    <p className="text-xs text-gray-400">
                                      +{basecamp.sosialMedia.length - 2} lainnya
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
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
                {modalMode === "add" ? "Tambah Basecamp" : "Edit Basecamp"}
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
                    Nama Basecamp *
                  </label>
                  <input
                    type="text"
                    value={formData.namaBasecamp}
                    onChange={(e) =>
                      setFormData({ ...formData, namaBasecamp: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pemilik *
                  </label>
                  <input
                    type="text"
                    value={formData.pemilik}
                    onChange={(e) =>
                      setFormData({ ...formData, pemilik: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi *
                </label>
                <input
                  type="text"
                  value={formData.lokasi}
                  onChange={(e) =>
                    setFormData({ ...formData, lokasi: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={formLoading}
                />
              </div>

              {/* Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daya Tampung Orang *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.dayaTampungOrang}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dayaTampungOrang: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daya Tampung Kendaraan *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.dayaTampungKendaraan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dayaTampungKendaraan:
                          Number.parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={formLoading}
                  />
                </div>
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor WhatsApp *
                </label>
                <input
                  type="text"
                  value={formData.nomorWa}
                  onChange={(e) =>
                    setFormData({ ...formData, nomorWa: e.target.value })
                  }
                  placeholder="628123456789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={formLoading}
                />
              </div>

              {/* Coordinates */}
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

              {/* Facilities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fasilitas
                </label>

                {/* Quick facility buttons */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">
                    Pilih fasilitas umum:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {facilityOptions.map((facility) => (
                      <button
                        key={facility}
                        type="button"
                        onClick={() => addFacilityFromOptions(facility)}
                        disabled={
                          formData.fasilitas.includes(facility) || formLoading
                        }
                        className={`px-3 py-1 text-sm rounded-full border ${
                          formData.fasilitas.includes(facility)
                            ? "bg-blue-100 text-blue-800 border-blue-200 cursor-not-allowed"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {facility}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom facility input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    placeholder="Tambah fasilitas custom"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={formLoading}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArrayItem("fasilitas", newFacility);
                        setNewFacility("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addArrayItem("fasilitas", newFacility);
                      setNewFacility("");
                    }}
                    disabled={formLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Selected facilities */}
                {formData.fasilitas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.fasilitas.map((facility, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {getFacilityIcon(facility)}
                        <span className="ml-1">{facility}</span>
                        <button
                          type="button"
                          onClick={() => removeArrayItem("fasilitas", index)}
                          disabled={formLoading}
                          className="ml-2 hover:text-blue-600 disabled:opacity-50"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Gambar Basecamp *
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
                              <img
                                src={imageUrl || "/placeholder.svg"}
                                alt={`Existing ${index + 1}`}
                                className="w-full h-full object-cover hover:opacity-80 transition-opacity"
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

              {/* Social Media */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sosial Media
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    value={newSocialMedia}
                    onChange={(e) => setNewSocialMedia(e.target.value)}
                    placeholder="https://instagram.com/basecamp"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={formLoading}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArrayItem("sosialMedia", newSocialMedia);
                        setNewSocialMedia("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addArrayItem("sosialMedia", newSocialMedia);
                      setNewSocialMedia("");
                    }}
                    disabled={formLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {formData.sosialMedia.length > 0 && (
                  <div className="space-y-2">
                    {formData.sosialMedia.map((social, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm text-blue-600 truncate">
                          {social}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeArrayItem("sosialMedia", index)}
                          disabled={formLoading}
                          className="p-1 text-red-500 hover:bg-red-50 rounded disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Menu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Food Menu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Menu Makanan
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newFood}
                      onChange={(e) => setNewFood(e.target.value)}
                      placeholder="Nasi Gudeg"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={formLoading}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addArrayItem("menuMakanan", newFood);
                          setNewFood("");
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addArrayItem("menuMakanan", newFood);
                        setNewFood("");
                      }}
                      disabled={formLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {formData.menuMakanan.length > 0 && (
                    <div className="space-y-1">
                      {formData.menuMakanan.map((food, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-orange-50 rounded"
                        >
                          <span className="text-sm">{food}</span>
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayItem("menuMakanan", index)
                            }
                            disabled={formLoading}
                            className="p-1 text-red-500 hover:bg-red-50 rounded disabled:opacity-50"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Drink Menu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Menu Minuman
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newDrink}
                      onChange={(e) => setNewDrink(e.target.value)}
                      placeholder="Teh Hangat"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={formLoading}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addArrayItem("menuMinuman", newDrink);
                          setNewDrink("");
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addArrayItem("menuMinuman", newDrink);
                        setNewDrink("");
                      }}
                      disabled={formLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {formData.menuMinuman.length > 0 && (
                    <div className="space-y-1">
                      {formData.menuMinuman.map((drink, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-blue-50 rounded"
                        >
                          <span className="text-sm">{drink}</span>
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayItem("menuMinuman", index)
                            }
                            disabled={formLoading}
                            className="p-1 text-red-500 hover:bg-red-50 rounded disabled:opacity-50"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
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
                    <Save className="h-4 w-4" />
                  )}
                  {modalMode === "add"
                    ? "Tambah Basecamp"
                    : "Perbarui Basecamp"}
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
