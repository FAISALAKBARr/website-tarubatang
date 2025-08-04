import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

// File utility functions (duplicated to avoid import issues)
const generateFileName = (originalName: string, isHeic = false): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = isHeic
    ? "jpg"
    : originalName.split(".").pop()?.toLowerCase() || "jpg";
  const baseName = originalName.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_");

  return `gallery/${timestamp}_${randomString}_${baseName}.${extension}`;
};

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

const isHeicFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();

  return (
    mimeType.includes("heic") ||
    mimeType.includes("heif") ||
    fileName.endsWith(".heic") ||
    fileName.endsWith(".heif")
  );
};

// HEIC conversion
let convert: any = null;

const loadHeicConverter = async () => {
  if (!convert) {
    try {
      convert = (await import("heic-convert")).default;
    } catch (error) {
      console.warn("heic-convert not available:", error);
      throw new Error("HEIC conversion not supported");
    }
  }
  return convert;
};

const convertHeicToJpg = async (file: File): Promise<Buffer> => {
  try {
    const heicConvert = await loadHeicConverter();
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const outputBuffer = await heicConvert({
      buffer: inputBuffer,
      format: "JPEG",
      quality: 0.92,
    });

    return outputBuffer as Buffer;
  } catch (error) {
    console.error("HEIC conversion failed:", error);
    throw new Error("Gagal mengkonversi file HEIC");
  }
};

// Initialize Supabase client
const getSupabaseClient = () => {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("Missing required Supabase environment variables");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

// Helper function to validate ID format
const isValidId = (id: string): boolean => {
  // UUID v4 format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  // CUID format (used by Prisma default)
  const cuidRegex = /^c[a-z0-9]{24}$/i;
  // CUID2 format (newer version)
  const cuid2Regex = /^[a-z][a-z0-9]*$/i;

  return (
    uuidRegex.test(id) ||
    cuidRegex.test(id) ||
    (cuid2Regex.test(id) && id.length >= 8 && id.length <= 32)
  );
};

// GET handler - Get single gallery item
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid gallery ID" },
        { status: 400 }
      );
    }

    const item = await prisma.gallery.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Gallery item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error fetching gallery item:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery item" },
      { status: 500 }
    );
  }
}

// PUT handler - Update gallery item
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid gallery ID" },
        { status: 400 }
      );
    }

    // Check if item exists
    const existingItem = await prisma.gallery.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Gallery item not found" },
        { status: 404 }
      );
    }

    const supabase = getSupabaseClient();
    const contentType = req.headers.get("content-type") || "";

    let title: string;
    let description: string;
    let category: string;
    let images: string[] = [];

    const uploadedUrls: string[] = [];
    const errors: string[] = [];
    const convertedFiles: string[] = [];
    const warnings: string[] = [];

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload for update
      const formData = await req.formData();

      title = formData.get("title") as string;
      description = (formData.get("description") as string) || "";
      category = formData.get("category") as string;
      const keepExistingImages = formData.get("keepExistingImages") === "true";

      const newFiles = formData.getAll("newImages") as File[];
      const existingImages = formData.getAll("existingImages") as string[];

      if (!title || !category) {
        return NextResponse.json(
          { error: "Title and category are required" },
          { status: 400 }
        );
      }

      // Start with existing images if keeping them
      if (keepExistingImages) {
        images = existingImages.filter((img) => img.trim() !== "");
      }

      // Process new files
      for (const file of newFiles) {
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          errors.push(validation.error!);
          continue;
        }

        try {
          const isHeic = isHeicFile(file);
          const fileName = generateFileName(file.name, isHeic);

          let fileToUpload: File | Buffer;
          let uploadContentType: string;

          if (isHeic) {
            console.log(`Converting HEIC file: ${file.name}`);
            try {
              const convertedBuffer = await convertHeicToJpg(file);
              fileToUpload = convertedBuffer;
              uploadContentType = "image/jpeg";
              convertedFiles.push(file.name);
            } catch (conversionError) {
              console.error(
                `HEIC conversion failed for ${file.name}:`,
                conversionError
              );
              warnings.push(`Gagal mengkonversi ${file.name}`);
              fileToUpload = file;
              uploadContentType = file.type || "image/heic";
            }
          } else {
            fileToUpload = file;
            uploadContentType =
              file.type || `image/${file.name.split(".").pop()}`;
          }

          const { error: uploadError } = await supabase.storage
            .from("media")
            .upload(fileName, fileToUpload, {
              contentType: uploadContentType,
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
            console.error(
              `Upload failed for ${file.name}:`,
              uploadError.message
            );
            errors.push(
              `Gagal mengupload ${file.name}: ${uploadError.message}`
            );
            continue;
          }

          const { data: urlData } = supabase.storage
            .from("media")
            .getPublicUrl(fileName);

          if (urlData.publicUrl) {
            uploadedUrls.push(urlData.publicUrl);
            images.push(urlData.publicUrl);
          }
        } catch (fileError) {
          console.error(`Error processing ${file.name}:`, fileError);
          errors.push(`Gagal memproses ${file.name}`);
        }
      }
    } else {
      // Handle JSON request
      const body = await req.json();
      title = body.title;
      description = body.description || "";
      category = body.category;
      images = body.images || [];

      if (!title || !category) {
        return NextResponse.json(
          { error: "Title and category are required" },
          { status: 400 }
        );
      }

      if (images.length === 0) {
        return NextResponse.json(
          { error: "At least one image is required" },
          { status: 400 }
        );
      }

      // Validate URLs
      for (const imageUrl of images) {
        try {
          new URL(imageUrl);
        } catch {
          errors.push(`Invalid URL: ${imageUrl}`);
        }
      }
    }

    // Ensure we have at least one image
    if (images.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    // Update gallery item in database
    const updatedItem = await prisma.gallery.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description.trim(),
        category,
        images,
        updatedAt: new Date(),
      },
    });

    console.log(`Updated gallery item: ${updatedItem.id}`);

    return NextResponse.json({
      success: true,
      item: updatedItem,
      uploadedCount: uploadedUrls.length,
      convertedFiles,
      warnings: warnings.length > 0 ? warnings : undefined,
      errors: errors.length > 0 ? errors : undefined,
      keptExistingImages: contentType.includes("multipart/form-data"),
    });
  } catch (error) {
    console.error("Error updating gallery item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE handler - Delete gallery item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid gallery ID" },
        { status: 400 }
      );
    }

    // Get item to delete associated files
    const item = await prisma.gallery.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Gallery item not found" },
        { status: 404 }
      );
    }

    const supabase = getSupabaseClient();
    const warnings: string[] = [];
    let deletedImages = 0;

    // Delete associated images from storage
    if (item.images && item.images.length > 0) {
      for (const imageUrl of item.images) {
        try {
          // Extract file path from Supabase URL
          const url = new URL(imageUrl);
          const pathParts = url.pathname.split("/");
          const fileName = pathParts[pathParts.length - 1];
          const filePath = `gallery/${fileName}`;

          const { error: deleteError } = await supabase.storage
            .from("media")
            .remove([filePath]);

          if (deleteError) {
            console.warn(
              `Failed to delete file ${filePath}:`,
              deleteError.message
            );
            warnings.push(`Gagal menghapus file: ${fileName}`);
          } else {
            deletedImages++;
          }
        } catch (urlError) {
          console.warn(`Invalid image URL: ${imageUrl}`);
          warnings.push(`URL gambar tidak valid: ${imageUrl}`);
        }
      }
    }

    // Delete item from database
    await prisma.gallery.delete({
      where: { id },
    });

    console.log(`Deleted gallery item: ${id}`);

    return NextResponse.json({
      success: true,
      deletedImages,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
