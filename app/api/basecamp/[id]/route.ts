import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to delete file from Supabase Storage
async function deleteFileFromSupabase(imageUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/");
    const fileName = pathParts.slice(-2).join("/"); // Get folder/filename

    const { error } = await supabase.storage.from("media").remove([fileName]);

    if (error) {
      console.error("Error deleting file from Supabase:", error);
    }
  } catch (error) {
    console.error("Error parsing image URL:", error);
  }
}

// Helper function to upload file to Supabase Storage
async function uploadFileToSupabase(
  file: File,
  folder = "basecamp"
): Promise<string> {
  try {
    // Validate file
    if (!file || file.size === 0) {
      throw new Error("Invalid file");
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    console.log(
      `Uploading file: ${file.name} (${file.size} bytes) as ${fileName}`
    );

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("media")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("media").getPublicUrl(fileName);

    console.log(`File uploaded successfully: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

// GET single Basecamp by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const basecamp = await prisma.basecamp.findUnique({
      where: { id: params.id },
    });

    if (!basecamp) {
      return NextResponse.json(
        { error: "Basecamp tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(basecamp);
  } catch (error) {
    console.error("Error fetching basecamp:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data basecamp" },
      { status: 500 }
    );
  }
}

// PUT update Basecamp
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if Basecamp exists
    const existingBasecamp = await prisma.basecamp.findUnique({
      where: { id: params.id },
    });

    if (!existingBasecamp) {
      return NextResponse.json(
        { error: "Basecamp tidak ditemukan" },
        { status: 404 }
      );
    }

    console.log("Updating Basecamp:", params.id);

    const contentType = request.headers.get("content-type");
    let formData: any = {};
    let finalImageUrls: string[] = [];

    if (contentType?.includes("multipart/form-data")) {
      // Handle FormData (file upload)
      const data = await request.formData();

      console.log("Processing FormData...");

      // Extract form fields with better error handling
      try {
        formData = {
          namaBasecamp: data.get("namaBasecamp") as string,
          fasilitas: JSON.parse((data.get("fasilitas") as string) || "[]"),
          dayaTampungKendaraan:
            Number.parseInt(data.get("dayaTampungKendaraan") as string) || 0,
          dayaTampungOrang:
            Number.parseInt(data.get("dayaTampungOrang") as string) || 0,
          nomorWa: data.get("nomorWa") as string,
          sosialMedia: JSON.parse((data.get("sosialMedia") as string) || "[]"),
          lokasi: data.get("lokasi") as string,
          latitude: data.get("latitude")
            ? Number.parseFloat(data.get("latitude") as string)
            : null,
          longitude: data.get("longitude")
            ? Number.parseFloat(data.get("longitude") as string)
            : null,
          pemilik: data.get("pemilik") as string,
          menuMakanan: JSON.parse((data.get("menuMakanan") as string) || "[]"),
          menuMinuman: JSON.parse((data.get("menuMinuman") as string) || "[]"),
        };
      } catch (parseError) {
        console.error("Error parsing form data:", parseError);
        return NextResponse.json(
          { error: "Invalid form data format" },
          { status: 400 }
        );
      }

      console.log("Form data:", formData);

      // Handle existing images (URLs to keep)
      const existingImages = data.get("existingImages");
      if (existingImages) {
        try {
          const existingImageUrls = JSON.parse(existingImages as string);
          if (Array.isArray(existingImageUrls)) {
            finalImageUrls.push(...existingImageUrls);
            console.log(`Keeping ${existingImageUrls.length} existing images`);
          }
        } catch (error) {
          console.error("Error parsing existing images:", error);
        }
      }

      // Delete removed images from storage
      const imagesToDelete = existingBasecamp.images.filter(
        (oldImage) => !finalImageUrls.includes(oldImage)
      );
      if (imagesToDelete.length > 0) {
        console.log(`Deleting ${imagesToDelete.length} removed images`);
        try {
          await Promise.all(
            imagesToDelete.map((imageUrl) => deleteFileFromSupabase(imageUrl))
          );
        } catch (error) {
          console.error("Error deleting old images:", error);
          // Continue even if deletion fails
        }
      }

      // Handle new file uploads
      const files = data.getAll("images") as File[];
      console.log(`Processing ${files.length} new files`);

      if (files && files.length > 0) {
        const validFiles = files.filter((file) => file && file.size > 0);
        console.log(`Found ${validFiles.length} valid files`);

        if (validFiles.length > 0) {
          try {
            const uploadPromises = validFiles.map((file, index) => {
              console.log(
                `Uploading file ${index + 1}: ${file.name} (${file.size} bytes)`
              );
              return uploadFileToSupabase(file, "basecamp");
            });

            const newImageUrls = await Promise.all(uploadPromises);
            finalImageUrls.push(...newImageUrls);
            console.log(
              `Successfully uploaded ${newImageUrls.length} new images`
            );
          } catch (error) {
            console.error("Error uploading new files:", error);
            return NextResponse.json(
              { error: `Failed to upload new images: ${error.message}` },
              { status: 500 }
            );
          }
        }
      }
    } else {
      // Handle JSON (URL-based images)
      const body = await request.json();
      formData = body;
      finalImageUrls = body.images || [];

      // Delete removed images from storage
      const imagesToDelete = existingBasecamp.images.filter(
        (oldImage) => !finalImageUrls.includes(oldImage)
      );
      if (imagesToDelete.length > 0) {
        try {
          await Promise.all(
            imagesToDelete.map((imageUrl) => deleteFileFromSupabase(imageUrl))
          );
        } catch (error) {
          console.error("Error deleting old images:", error);
        }
      }
    }

    console.log(`Final image count: ${finalImageUrls.length}`);

    // Validation
    if (
      !formData.namaBasecamp ||
      !formData.lokasi ||
      !formData.pemilik ||
      !formData.nomorWa
    ) {
      return NextResponse.json(
        {
          error: "Nama basecamp, lokasi, pemilik, dan nomor WA wajib diisi",
        },
        { status: 400 }
      );
    }

    if (formData.dayaTampungOrang < 1 || formData.dayaTampungKendaraan < 1) {
      return NextResponse.json(
        {
          error: "Daya tampung harus lebih dari 0",
        },
        { status: 400 }
      );
    }

    // Update Basecamp
    const updatedBasecamp = await prisma.basecamp.update({
      where: { id: params.id },
      data: {
        namaBasecamp: formData.namaBasecamp,
        fasilitas: formData.fasilitas || [],
        dayaTampungKendaraan: Number(formData.dayaTampungKendaraan),
        dayaTampungOrang: Number(formData.dayaTampungOrang),
        nomorWa: formData.nomorWa,
        images: finalImageUrls,
        sosialMedia: formData.sosialMedia || [],
        lokasi: formData.lokasi,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
        pemilik: formData.pemilik,
        menuMakanan: formData.menuMakanan || [],
        menuMinuman: formData.menuMinuman || [],
        updatedAt: new Date(),
      },
    });

    console.log("Basecamp updated successfully");

    return NextResponse.json({
      message: "Basecamp berhasil diperbarui",
      basecamp: updatedBasecamp,
      uploadedImages: finalImageUrls.length,
    });
  } catch (error) {
    console.error("Error updating basecamp:", error);

    // Better error response
    const errorMessage =
      error instanceof Error ? error.message : "Gagal memperbarui basecamp";
    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// DELETE Basecamp
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if Basecamp exists
    const existingBasecamp = await prisma.basecamp.findUnique({
      where: { id: params.id },
    });

    if (!existingBasecamp) {
      return NextResponse.json(
        { error: "Basecamp tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete associated images from storage
    if (existingBasecamp.images && existingBasecamp.images.length > 0) {
      try {
        await Promise.all(
          existingBasecamp.images.map((imageUrl) =>
            deleteFileFromSupabase(imageUrl)
          )
        );
      } catch (error) {
        console.error("Error deleting images from storage:", error);
      }
    }

    // Delete Basecamp
    await prisma.basecamp.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Basecamp berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting basecamp:", error);
    return NextResponse.json(
      { error: "Gagal menghapus basecamp" },
      { status: 500 }
    );
  }
}

// PATCH toggle active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { isActive } = body;

    // Check if Basecamp exists
    const existingBasecamp = await prisma.basecamp.findUnique({
      where: { id: params.id },
    });

    if (!existingBasecamp) {
      return NextResponse.json(
        { error: "Basecamp tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update active status
    const updatedBasecamp = await prisma.basecamp.update({
      where: { id: params.id },
      data: {
        isActive:
          isActive !== undefined ? isActive : !existingBasecamp.isActive,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: `Basecamp berhasil ${
        updatedBasecamp.isActive ? "diaktifkan" : "dinonaktifkan"
      }`,
      basecamp: updatedBasecamp,
    });
  } catch (error) {
    console.error("Error updating basecamp status:", error);
    return NextResponse.json(
      { error: "Gagal mengubah status basecamp" },
      { status: 500 }
    );
  }
}
