import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

// Add these imports and utility functions at the top of the file
const generateFileName = (originalName: string, isHeic = false): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = isHeic
    ? "jpg"
    : originalName.split(".").pop()?.toLowerCase() || "jpg";
  const baseName = originalName.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_");

  return `events/${timestamp}_${randomString}_${baseName}.${extension}`;
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

// HEIC conversion function
let convert: any = null;

const loadHeicConverter = async () => {
  if (!convert) {
    try {
      convert = (await import("heic-convert")).default;
    } catch (error) {
      console.warn("heic-convert not available:", error);
      throw new Error(
        "HEIC conversion not supported. Please install heic-convert package."
      );
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
    throw new Error(
      "Gagal mengkonversi file HEIC. Pastikan file tidak rusak atau install heic-convert package."
    );
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
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
    // In a real app, verify admin authentication here
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const supabase = getSupabaseClient();
    const contentType = request.headers.get("content-type") || "";

    let name: string;
    let description: string;
    let content: string;
    let category: string;
    let date: string;
    let endDate: string | null = null;
    let location: string;
    let maxParticipants: number | null = null;
    let price: string;
    let images: string[] = [];

    const uploadedUrls: string[] = [];
    const errors: string[] = [];
    const convertedFiles: string[] = [];
    const warnings: string[] = [];

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload with existing images
      const formData = await request.formData();

      name = formData.get("name") as string;
      description = (formData.get("description") as string) || "";
      content = (formData.get("content") as string) || "";
      category = formData.get("category") as string;
      date = formData.get("date") as string;
      const endDateValue = formData.get("endDate") as string;
      if (endDateValue) {
        endDate = endDateValue;
      }
      location = formData.get("location") as string;
      const maxParticipantsValue = formData.get("maxParticipants") as string;
      if (maxParticipantsValue) {
        maxParticipants = Number.parseInt(maxParticipantsValue);
      }
      price = (formData.get("price") as string) || "0";

      // Get existing images
      const existingImages = formData.getAll("existingImages") as string[];
      images = [...existingImages.filter((img) => img.trim())];

      // Get new files to upload
      const files = formData.getAll("images") as File[];

      if (!name || !description || !category || !date || !location) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Process new files if any
      if (files.length > 0) {
        for (const file of files) {
          const validation = validateImageFile(file);
          if (!validation.isValid) {
            errors.push(validation.error!);
            continue;
          }

          try {
            const isHeic = isHeicFile(file);
            let fileName = generateFileName(file.name, isHeic);

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
                warnings.push(
                  `Gagal mengkonversi ${file.name}, diupload sebagai file asli`
                );
                fileToUpload = file;
                uploadContentType = file.type || "image/heic";
              }
            } else {
              fileToUpload = file;
              uploadContentType =
                file.type || `image/${file.name.split(".").pop()}`;
            }

            console.log(`Uploading file: ${file.name} as ${fileName}`);

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

              // Handle duplicate file names
              if (uploadError.message.includes("duplicate")) {
                const retryFileName = generateFileName(
                  file.name + "-retry",
                  isHeic
                );
                const { error: retryError } = await supabase.storage
                  .from("media")
                  .upload(retryFileName, fileToUpload, {
                    contentType: uploadContentType,
                    cacheControl: "3600",
                    upsert: false,
                  });

                if (retryError) {
                  errors.push(
                    `Gagal mengupload ${file.name}: ${retryError.message}`
                  );
                  continue;
                } else {
                  fileName = retryFileName;
                }
              } else {
                errors.push(
                  `Gagal mengupload ${file.name}: ${uploadError.message}`
                );
                continue;
              }
            }

            // Get public URL
            const { data: urlData } = supabase.storage
              .from("media")
              .getPublicUrl(fileName);

            if (urlData.publicUrl) {
              uploadedUrls.push(urlData.publicUrl);
              console.log(`Successfully uploaded: ${fileName}`);
            } else {
              errors.push(`Gagal mendapatkan URL untuk ${file.name}`);
            }
          } catch (fileError) {
            console.error(`Error processing ${file.name}:`, fileError);
            errors.push(
              `Gagal memproses ${file.name}: ${
                fileError instanceof Error ? fileError.message : "Unknown error"
              }`
            );
          }
        }
      }

      // Combine existing and new images
      images = [...images, ...uploadedUrls];
    } else {
      // Handle JSON request (URL-based images only)
      const body = await request.json();
      name = body.name;
      description = body.description || "";
      content = body.content || "";
      category = body.category;
      date = body.date;
      endDate = body.endDate || null;
      location = body.location;
      maxParticipants = body.maxParticipants || null;
      price = body.price || "0";
      images = body.images || [];

      if (!name || !description || !category || !date || !location) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      if (images.length === 0) {
        return NextResponse.json(
          { error: "At least one image URL is required" },
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

    // If there are critical errors, return them
    if (errors.length > 0 && images.length === 0) {
      return NextResponse.json(
        { error: "No images could be processed", errors },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();

    const updatedEvent = await prisma.event.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
        content: content || "",
        category,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        location,
        maxParticipants: maxParticipants
          ? Number.parseInt(maxParticipants.toString())
          : null,
        price: price || "Gratis",
        images: images || [],
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      uploadedCount: uploadedUrls.length,
      convertedFiles,
      warnings: warnings.length > 0 ? warnings : undefined,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
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

    // Get event to delete associated files
    const event = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const supabase = getSupabaseClient();
    const warnings: string[] = [];
    let deletedImages = 0;

    // Delete associated images from storage
    if (event.images && event.images.length > 0) {
      for (const imageUrl of event.images) {
        try {
          // Extract file path from Supabase URL
          const url = new URL(imageUrl);
          const pathParts = url.pathname.split("/");
          const fileName = pathParts[pathParts.length - 1];
          const filePath = `events/${fileName}`;

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

    // Delete event from database
    await prisma.event.delete({
      where: { id: params.id },
    });

    console.log(`Deleted event: ${params.id}`);

    return NextResponse.json({
      success: true,
      deletedImages,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
