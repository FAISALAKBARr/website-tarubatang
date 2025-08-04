import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// File utility functions
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

// GET handler - Fetch gallery items
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const includeInactive = searchParams.get("includeInactive") === "true";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (!includeInactive) {
      where.active = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "all") {
      where.category = category;
    }

    // Fetch items and total count
    const [items, totalItems] = await Promise.all([
      prisma.gallery.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.gallery.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      items,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery items" },
      { status: 500 }
    );
  }
}

// POST handler - Create new gallery item
export async function POST(req: NextRequest) {
  try {
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
      // Handle file upload
      const formData = await req.formData();

      title = formData.get("title") as string;
      description = (formData.get("description") as string) || "";
      category = formData.get("category") as string;

      const files = formData.getAll("images") as File[];

      if (!title || !category) {
        return NextResponse.json(
          { error: "Title and category are required" },
          { status: 400 }
        );
      }

      if (files.length === 0) {
        return NextResponse.json(
          { error: "At least one image is required" },
          { status: 400 }
        );
      }

      // Process each file
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

      images = uploadedUrls;
    } else {
      // Handle JSON request (URL-based images)
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

    // Create gallery item in database
    const galleryItem = await prisma.gallery.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category,
        images,
        active: true,
      },
    });

    console.log(`Created gallery item: ${galleryItem.id}`);

    return NextResponse.json({
      success: true,
      item: galleryItem,
      uploadedCount: uploadedUrls.length,
      convertedFiles,
      warnings: warnings.length > 0 ? warnings : undefined,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error creating gallery item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
