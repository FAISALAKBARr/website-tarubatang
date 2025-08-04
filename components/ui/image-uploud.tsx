"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { uploadFileToSupabase, deleteFileFromSupabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export default function ImageUpload({
  images,
  onChange,
  maxImages = 5,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || disabled) return;

      const remainingSlots = maxImages - images.length;
      if (remainingSlots <= 0) {
        toast.error(`Maksimal ${maxImages} gambar`);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remainingSlots);
      const uploadPromises: Promise<string>[] = [];
      const tempIds: string[] = [];

      filesToUpload.forEach((file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} bukan file gambar`);
          return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} terlalu besar (maksimal 5MB)`);
          return;
        }

        const tempId = `temp-${Date.now()}-${Math.random()}`;
        tempIds.push(tempId);

        uploadPromises.push(
          uploadFileToSupabase(file, "umkm")
            .then((url) => {
              setUploading((prev) => prev.filter((id) => id !== tempId));
              return url;
            })
            .catch((error) => {
              setUploading((prev) => prev.filter((id) => id !== tempId));
              toast.error(`Gagal upload ${file.name}: ${error.message}`);
              throw error;
            })
        );
      });

      if (uploadPromises.length === 0) return;

      setUploading((prev) => [...prev, ...tempIds]);

      try {
        const uploadedUrls = await Promise.allSettled(uploadPromises);
        const successfulUrls = uploadedUrls
          .filter((result) => result.status === "fulfilled")
          .map((result) => (result as PromiseFulfilledResult<string>).value);

        if (successfulUrls.length > 0) {
          onChange([...images, ...successfulUrls]);
          toast.success(`${successfulUrls.length} gambar berhasil diupload`);
        }
      } catch (error) {
        console.error("Upload error:", error);
      }
    },
    [images, onChange, maxImages, disabled]
  );

  const handleRemoveImage = useCallback(
    async (index: number) => {
      if (disabled) return;

      const imageUrl = images[index];
      const newImages = images.filter((_, i) => i !== index);
      onChange(newImages);

      // Delete from Supabase Storage
      try {
        await deleteFileFromSupabase(imageUrl);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    },
    [images, onChange, disabled]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileUpload(e.dataTransfer.files);
      }
    },
    [handleFileUpload]
  );

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
        } ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:border-gray-400"
        }`}
      >
        <CardContent className="p-6">
          <div
            className="text-center"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => {
              if (!disabled) {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.multiple = true;
                input.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  handleFileUpload(target.files);
                };
                input.click();
              }
            }}
          >
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              {uploading.length > 0 ? (
                <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
              ) : (
                <Upload className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {uploading.length > 0 ? "Mengupload..." : "Upload Gambar"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Drag & drop gambar atau klik untuk memilih
            </p>
            <p className="text-xs text-gray-400">
              PNG, JPG, JPEG hingga 5MB • Maksimal {maxImages} gambar
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {images.length}/{maxImages} gambar diupload
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Grid */}
      {(images.length > 0 || uploading.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={imageUrl}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {!disabled && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}

          {/* Loading placeholders */}
          {uploading.map((tempId) => (
            <Card key={tempId} className="relative overflow-hidden">
              <div className="aspect-square bg-gray-100 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Uploading...</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && uploading.length === 0 && (
        <div className="text-center py-8">
          <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Belum ada gambar diupload</p>
        </div>
      )}
    </div>
  );
}
