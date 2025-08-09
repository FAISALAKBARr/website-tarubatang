"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Store,
  Loader2,
  Upload,
  X,
  ImageIcon,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

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
  user: {
    id: string;
    name: string;
    phone: string;
  };
}

interface UMKMFormData {
  name: string;
  category: string;
  description: string;
  price: string;
  stock: number;
  contact: string;
  location: string;
  pemilik: string;
}

export default function AdminUMKM() {
  const [umkmData, setUmkmData] = useState<UMKM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUMKM, setEditingUMKM] = useState<UMKM | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState<UMKMFormData>({
    name: "",
    category: "",
    description: "",
    price: "",
    stock: 0,
    contact: "",
    location: "",
    pemilik: "",
  });

  // Image states
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [converting, setConverting] = useState<string[]>([]);

  const categories = [
    "Kuliner",
    "Kerajinan",
    "Basecamp",
    "Pertanian",
    "Peternakan",
    "Jasa",
    "Lainnya",
  ];

  // Check Supabase bucket exists
  const checkBucketExists = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/check-bucket", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.warn("Could not verify bucket existence");
      }
    } catch (error) {
      console.warn("Could not check bucket:", error);
    }
  };

  // Fetch UMKM data
  const fetchUMKM = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const queryParams = new URLSearchParams({
        limit: "100",
        page: "1",
      });

      if (searchTerm) {
        queryParams.append("search", searchTerm);
      }

      if (selectedCategory !== "all") {
        queryParams.append("category", selectedCategory);
      }

      const response = await fetch(`/api/produk?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch UMKM data");
      }

      const data = await response.json();
      setUmkmData(data.umkm || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setUmkmData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBucketExists();
    fetchUMKM();
  }, [searchTerm, selectedCategory]);

  // File validation
  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/heic",
      "image/heif",
      "image/webp",
    ];

    if (file.size > maxSize) {
      return "File terlalu besar. Maksimal 5MB.";
    }

    if (file.size === 0) {
      return "File kosong.";
    }

    // FIXED: Check both MIME type and file extension
    const fileName = file.name.toLowerCase();
    const isValidMimeType = allowedTypes.includes(file.type);
    const isValidExtension =
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png") ||
      fileName.endsWith(".heic") ||
      fileName.endsWith(".heif") ||
      fileName.endsWith(".webp");

    if (!isValidMimeType && !isValidExtension) {
      return "Format file tidak didukung. Gunakan JPG, JPEG, PNG, WEBP, atau HEIC.";
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

    console.log("Files selected:", files.length);

    const newFiles: File[] = [];
    const errors: string[] = [];

    for (const file of Array.from(files)) {
      console.log(
        `Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`
      );

      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        continue;
      }

      try {
        // Only convert HEIC files, process others normally
        let processedFile = file;
        if (
          file.type === "image/heic" ||
          file.type === "image/heif" ||
          file.name.toLowerCase().endsWith(".heic") ||
          file.name.toLowerCase().endsWith(".heif")
        ) {
          console.log(`Converting HEIC file: ${file.name}`);
          processedFile = await convertHeicToJpg(file);
        } else {
          console.log(`Processing regular image: ${file.name}`);
        }

        newFiles.push(processedFile);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        errors.push(`${file.name}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      toast.error(errors.join("\n"));
      return;
    }

    const totalFiles =
      selectedFiles.length + newFiles.length + existingImages.length;
    if (totalFiles > 5) {
      toast.error("Maksimal 5 gambar per produk");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    if (newFiles.length > 0) {
      toast.success(`${newFiles.length} file berhasil ditambahkan`);
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

  // Handle form submission with improved error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authorization token found");
      }

      // Validate form data
      if (!formData.name.trim()) {
        throw new Error("Nama UMKM harus diisi");
      }
      if (!formData.category) {
        throw new Error("Kategori harus dipilih");
      }
      if (!formData.description.trim()) {
        throw new Error("Deskripsi harus diisi");
      }
      if (!formData.price.trim()) {
        throw new Error("Harga harus diisi");
      }
      if (!formData.contact.trim()) {
        throw new Error("Kontak harus diisi");
      }
      if (!formData.pemilik.trim()) {
        throw new Error("Nama pemilik harus diisi");
      }

      // Check if we have at least one image (existing or new)
      const totalImages = existingImages.length + selectedFiles.length;
      if (totalImages === 0) {
        throw new Error("Minimal harus ada 1 gambar");
      }

      const url = editingUMKM ? `/api/produk/${editingUMKM.id}` : "/api/produk";
      const method = editingUMKM ? "PUT" : "POST";

      // Always use FormData for consistency
      const formDataToSend = new FormData();

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });

      // Add existing images (for edit mode)
      if (editingUMKM && existingImages.length > 0) {
        formDataToSend.append("existingImages", JSON.stringify(existingImages));
      }

      // Add new files
      selectedFiles.forEach((file, index) => {
        formDataToSend.append(`images`, file);
        console.log(
          `Adding file ${index + 1}:`,
          file.name,
          file.size,
          file.type
        );
      });

      console.log(`Submitting ${method} to ${url}`);
      console.log(
        `Files: ${selectedFiles.length}, Existing: ${existingImages.length}`
      );

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formDataToSend,
      });

      // Get response text first for better error handling
      const responseText = await response.text();
      console.log("Server response:", response.status, responseText);

      if (!response.ok) {
        let errorMessage = "Failed to save UMKM";
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }

        // Special handling for bucket not found error
        if (errorMessage.includes("Bucket not found")) {
          errorMessage =
            "Storage bucket 'media' tidak ditemukan. Pastikan bucket 'media' sudah dibuat di Supabase Storage.";
        }

        throw new Error(errorMessage);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { message: "UMKM berhasil disimpan" };
      }

      console.log("Submit successful:", result);

      // Refresh data and close dialog
      await fetchUMKM();
      setIsDialogOpen(false);
      setEditingUMKM(null);
      resetForm();

      toast.success(
        result.message ||
          (editingUMKM
            ? "UMKM berhasil diperbarui"
            : "UMKM berhasil ditambahkan")
      );
    } catch (err) {
      console.error("Submit error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save UMKM";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus UMKM ini?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/produk/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete UMKM");
      }

      const result = await response.json();
      await fetchUMKM();
      toast.success(result.message || "UMKM berhasil dihapus");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete UMKM";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Handle edit
  const handleEdit = (umkm: UMKM) => {
    console.log("Editing UMKM:", umkm);

    setEditingUMKM(umkm);
    setFormData({
      name: umkm.name,
      category: umkm.category,
      description: umkm.description,
      price: umkm.price,
      stock: umkm.stock || 0,
      contact: umkm.contact,
      location: umkm.location || "",
      pemilik: umkm.pemilik,
    });

    // Set existing images
    setExistingImages([...umkm.images]);

    // Clear selected files
    setSelectedFiles([]);

    setIsDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      price: "",
      stock: 0,
      contact: "",
      location: "",
      pemilik: "",
    });
    setExistingImages([]);
    setSelectedFiles([]);
  };

  // Handle add new
  const handleAdd = () => {
    setEditingUMKM(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredUMKM = umkmData.filter((umkm) => {
    const matchesSearch =
      !searchTerm ||
      umkm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      umkm.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      umkm.user.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || umkm.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalImages = existingImages.length + selectedFiles.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen UMKM</h1>
          <p className="text-gray-600">
            Kelola produk dan layanan UMKM Desa Tarubatang
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Tambah UMKM
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total UMKM</p>
                <p className="text-2xl font-bold">{umkmData.length}</p>
              </div>
              <Store className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktif</p>
                <p className="text-2xl font-bold text-green-600">
                  {umkmData.filter((u) => u.isActive).length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kategori</p>
                <p className="text-2xl font-bold">
                  {new Set(umkmData.map((u) => u.category)).size}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Filter className="h-4 w-4 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bulan Ini</p>
                <p className="text-2xl font-bold text-orange-600">
                  {
                    umkmData.filter((u) => {
                      const created = new Date(u.createdAt);
                      const now = new Date();
                      return (
                        created.getMonth() === now.getMonth() &&
                        created.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Plus className="h-4 w-4 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari UMKM, produk, atau pemilik..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <div>
                <p className="text-red-600 font-medium">Error:</p>
                <p className="text-red-600">{error}</p>
                {error.includes("Storage bucket") && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>Solusi:</strong> Jalankan script SQL berikut di
                      Supabase SQL Editor:
                    </p>
                    <code className="text-xs bg-gray-100 p-1 rounded mt-1 block">
                      INSERT INTO storage.buckets (id, name, public) VALUES
                      ('images', 'images', true);
                    </code>
                  </div>
                )}
              </div>
            </div>
            <Button onClick={fetchUMKM} className="mt-2" size="sm">
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      )}

      {/* UMKM Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Daftar UMKM
            {!loading && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredUMKM.length} dari {umkmData.length} UMKM)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Memuat data UMKM...</p>
            </div>
          ) : filteredUMKM.length === 0 ? (
            <div className="text-center py-8">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Tidak ada UMKM yang ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>UMKM</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Pemilik</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUMKM.map((umkm) => (
                    <TableRow key={umkm.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                            <Image
                              src={
                                umkm.images?.[0] ||
                                "/placeholder.svg?height=48&width=48"
                              }
                              alt={umkm.name}
                              fill
                              className="object-cover"
                            />
                            {umkm.images?.length > 1 && (
                              <div className="absolute top-0 right-0 bg-black/70 text-white text-xs px-1 rounded-bl">
                                +{umkm.images.length - 1}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{umkm.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {umkm.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{umkm.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{umkm.pemilik}</p>
                          <p className="text-sm text-gray-500">
                            {umkm.contact}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {umkm.price}
                      </TableCell>
                      <TableCell>
                        {umkm.stock !== null ? umkm.stock : "Tidak terbatas"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={umkm.isActive ? "default" : "secondary"}
                        >
                          {umkm.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(umkm)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(umkm.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUMKM ? "Edit UMKM" : "Tambah UMKM Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingUMKM
                ? "Perbarui informasi UMKM"
                : "Tambahkan UMKM baru ke database"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nama UMKM *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  disabled={formLoading}
                />
              </div>
              <div>
                <Label htmlFor="category">Kategori *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  disabled={formLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Deskripsi *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                required
                disabled={formLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Harga *</Label>
                <Input
                  id="price"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="Contoh: Rp 50.000"
                  required
                  disabled={formLoading}
                />
              </div>
              <div>
                <Label htmlFor="stock">Stok</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  disabled={formLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pemilik">Nama Pemilik *</Label>
                <Input
                  id="pemilik"
                  value={formData.pemilik}
                  onChange={(e) =>
                    setFormData({ ...formData, pemilik: e.target.value })
                  }
                  placeholder="Nama pemilik UMKM"
                  required
                  disabled={formLoading}
                />
              </div>
              <div>
                <Label htmlFor="contact">Kontak *</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) =>
                    setFormData({ ...formData, contact: e.target.value })
                  }
                  placeholder="Contoh: 08123456789"
                  required
                  disabled={formLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Lokasi</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Contoh: Jl. Raya Tarubatang"
                  disabled={formLoading}
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <Label>Gambar Produk *</Label>

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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  disabled={formLoading || totalImages >= 5}
                >
                  {totalImages >= 5 ? "Maksimal Tercapai" : "Pilih File"}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Format: JPG, PNG, HEIC (maks. 5MB per file, {totalImages}/5
                  file)
                </p>
              </div>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">
                    Gambar Existing ({existingImages.length}):
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {existingImages.map((imageUrl, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={imageUrl || "/placeholder.svg"}
                            alt={`Existing ${index + 1}`}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "/placeholder.svg?height=200&width=200";
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => removeExistingImage(index)}
                            disabled={formLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
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
                  <Label className="text-sm">
                    File Baru ({selectedFiles.length}):
                  </Label>
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
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => removeFile(index)}
                              disabled={formLoading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-center mt-1 truncate">
                            {file.name}
                            {isConverted && (
                              <span className="text-blue-600"> (HEIC→JPG)</span>
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={formLoading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={formLoading || totalImages === 0}>
                {formLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingUMKM ? "Memperbarui..." : "Menyimpan..."}
                  </>
                ) : editingUMKM ? (
                  "Update"
                ) : (
                  "Simpan"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
