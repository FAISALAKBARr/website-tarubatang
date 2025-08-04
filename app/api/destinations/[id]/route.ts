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
  folder = "destinations"
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const destination = await prisma.destination.findUnique({
      where: { id: params.id },
    });

    if (!destination) {
      return NextResponse.json(
        { error: "Destination not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(destination);
  } catch (error) {
    console.error("Error fetching destination:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if destination exists
    const existingDestination = await prisma.destination.findUnique({
      where: { id: params.id },
    });

    if (!existingDestination) {
      return NextResponse.json(
        { error: "Destination not found" },
        { status: 404 }
      );
    }

    console.log("Updating Destination:", params.id);

    const contentType = request.headers.get("content-type");
    let formData: any = {};
    let finalImageUrls: string[] = [];

    if (contentType?.includes("multipart/form-data")) {
      // Handle FormData (file upload)
      const data = await request.formData();

      console.log("Processing FormData...");

      // Extract form fields
      try {
        formData = {
          name: data.get("name") as string,
          category: data.get("category") as string,
          description: data.get("description") as string,
          content: data.get("content") as string,
          price: data.get("price") as string,
          facilities: JSON.parse((data.get("facilities") as string) || "[]"),
          location: data.get("location") as string,
          latitude: data.get("latitude")
            ? Number.parseFloat(data.get("latitude") as string)
            : null,
          longitude: data.get("longitude")
            ? Number.parseFloat(data.get("longitude") as string)
            : null,
        };
      } catch (parseError) {
        console.error("Error parsing form data:", parseError);
        return NextResponse.json(
          { error: "Invalid form data format" },
          { status: 400 }
        );
      }

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
      const imagesToDelete = existingDestination.images.filter(
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

        // Check total image limit
        if (finalImageUrls.length + validFiles.length > 5) {
          return NextResponse.json(
            { error: "Maksimal 5 gambar per destinasi" },
            { status: 400 }
          );
        }

        if (validFiles.length > 0) {
          try {
            const uploadPromises = validFiles.map((file, index) => {
              console.log(
                `Uploading file ${index + 1}: ${file.name} (${file.size} bytes)`
              );
              return uploadFileToSupabase(file, "destinations");
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

      // Validate image limit
      if (finalImageUrls.length > 5) {
        return NextResponse.json(
          { error: "Maksimal 5 gambar per destinasi" },
          { status: 400 }
        );
      }

      // Delete removed images from storage
      const imagesToDelete = existingDestination.images.filter(
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
      !formData.name ||
      !formData.category ||
      !formData.description ||
      !formData.location
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate image requirement
    if (finalImageUrls.length === 0) {
      return NextResponse.json(
        { error: "Minimal 1 gambar diperlukan" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();

    // Update destination
    const updatedDestination = await prisma.destination.update({
      where: { id: params.id },
      data: {
        name: formData.name,
        slug,
        category: formData.category,
        description: formData.description,
        content: formData.content || "",
        price: formData.price || "Gratis",
        facilities: formData.facilities || [],
        location: formData.location,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
        images: finalImageUrls,
        updatedAt: new Date(),
      },
    });

    console.log("Destination updated successfully");

    return NextResponse.json({
      message: "Destinasi berhasil diperbarui",
      destination: updatedDestination,
      uploadedImages: finalImageUrls.length,
    });
  } catch (error) {
    console.error("Error updating destination:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Destination not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In a real app, verify admin authentication here
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First, get the destination to retrieve image URLs
    const destination = await prisma.destination.findUnique({
      where: { id: params.id },
      select: { images: true },
    });

    if (!destination) {
      return NextResponse.json(
        { error: "Destination not found" },
        { status: 404 }
      );
    }

    // Delete the destination from database
    await prisma.destination.delete({
      where: { id: params.id },
    });

    // Delete associated images from Supabase Storage
    if (destination.images && destination.images.length > 0) {
      try {
        await Promise.all(
          destination.images.map((imageUrl) => deleteFileFromSupabase(imageUrl))
        );
      } catch (imageError) {
        console.error("Error deleting images:", imageError);
        // Don't fail the request if image deletion fails
      }
    }

    return NextResponse.json({ message: "Destination deleted successfully" });
  } catch (error) {
    console.error("Error deleting destination:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Destination not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
