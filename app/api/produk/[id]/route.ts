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
  folder = "umkm"
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

    // Upload to Supabase Storage - using 'media' bucket
    const { data, error } = await supabase.storage
      .from("media") // Changed from "images" to "media"
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
    } = supabase.storage.from("media").getPublicUrl(fileName); // Changed to "media"

    console.log(`File uploaded successfully: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

// GET single UMKM by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const umkm = await prisma.uMKM.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!umkm) {
      return NextResponse.json({ error: "UMKM not found" }, { status: 404 });
    }

    return NextResponse.json(umkm);
  } catch (error) {
    console.error("Error fetching UMKM:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update UMKM
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authorization
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if UMKM exists
    const existingUMKM = await prisma.uMKM.findUnique({
      where: { id: params.id },
    });

    if (!existingUMKM) {
      return NextResponse.json({ error: "UMKM not found" }, { status: 404 });
    }

    console.log("Updating UMKM:", params.id);

    const contentType = request.headers.get("content-type");
    let formData: any = {};
    let finalImageUrls: string[] = [];

    if (contentType?.includes("multipart/form-data")) {
      // Handle FormData (file upload)
      const data = await request.formData();

      console.log("Processing FormData...");

      // Extract form fields - FIXED: Added pemilik mapping
      formData = {
        name: data.get("name") as string,
        category: data.get("category") as string,
        description: data.get("description") as string,
        price: data.get("price") as string,
        stock: Number.parseInt(data.get("stock") as string) || 0,
        contact: data.get("contact") as string,
        location: data.get("location") as string,
        userId: data.get("userId") as string,
        pemilik: data.get("pemilik") as string, // ADDED THIS LINE
      };

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
      const imagesToDelete = existingUMKM.images.filter(
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
              return uploadFileToSupabase(file, "umkm");
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
      const imagesToDelete = existingUMKM.images.filter(
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

    // Validate required fields
    if (
      !formData.name ||
      !formData.category ||
      !formData.description ||
      !formData.price ||
      !formData.contact
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate at least one image
    if (finalImageUrls.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    // Update UMKM
    const updatedUMKM = await prisma.uMKM.update({
      where: { id: params.id },
      data: {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        images: finalImageUrls,
        contact: formData.contact,
        location: formData.location,
        // FIXED: Use the pemilik from formData with proper fallback
        pemilik:
          formData.pemilik || existingUMKM.pemilik || "Pemilik tidak diketahui",
        userId: formData.userId || existingUMKM.userId,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    console.log("UMKM updated successfully");

    return NextResponse.json({
      ...updatedUMKM,
      message: "UMKM berhasil diperbarui",
      uploadedImages: finalImageUrls.length,
    });
  } catch (error) {
    console.error("Error updating UMKM:", error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE UMKM
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authorization
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if UMKM exists
    const existingUMKM = await prisma.uMKM.findUnique({
      where: { id: params.id },
    });

    if (!existingUMKM) {
      return NextResponse.json({ error: "UMKM not found" }, { status: 404 });
    }

    // Delete associated images from storage
    if (existingUMKM.images && existingUMKM.images.length > 0) {
      try {
        await Promise.all(
          existingUMKM.images.map((imageUrl) =>
            deleteFileFromSupabase(imageUrl)
          )
        );
      } catch (error) {
        console.error("Error deleting images from storage:", error);
      }
    }

    // Delete UMKM
    await prisma.uMKM.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "UMKM berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting UMKM:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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

    // Verify authorization
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if UMKM exists
    const existingUMKM = await prisma.uMKM.findUnique({
      where: { id: params.id },
    });

    if (!existingUMKM) {
      return NextResponse.json({ error: "UMKM not found" }, { status: 404 });
    }

    // Update active status
    const updatedUMKM = await prisma.uMKM.update({
      where: { id: params.id },
      data: {
        isActive: isActive !== undefined ? isActive : !existingUMKM.isActive,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...updatedUMKM,
      message: `UMKM berhasil ${
        updatedUMKM.isActive ? "diaktifkan" : "dinonaktifkan"
      }`,
    });
  } catch (error) {
    console.error("Error updating UMKM status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
