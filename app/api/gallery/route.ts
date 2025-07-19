// Enhanced gallery route with HEIC file type detection and validation
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import convert from "heic-convert";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function untuk konversi HEIC ke JPG
const convertHeicToJpg = async (file: File): Promise<Buffer> => {
  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);
  
  // Konversi HEIC ke JPG menggunakan heic-convert library
  const outputBuffer = await convert({
    buffer: inputBuffer,
    format: 'JPEG',
    quality: 0.92 // Kualitas 92%
  });
  
  return outputBuffer as Buffer;
};

// Helper function untuk menentukan apakah file perlu dikonversi
const isHeicFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();
  
  return fileName.endsWith('.heic') || 
         fileName.endsWith('.heif') || 
         mimeType.includes('heic') || 
         mimeType.includes('heif');
};

// Helper function to determine file type and extension
const getFileInfo = (file: File) => {
  const fileName = file.name.toLowerCase()
  const mimeType = file.type.toLowerCase()
  
  // Handle HEIC files (they might not have correct MIME type)
  if (fileName.endsWith('.heic') || mimeType.includes('heic')) {
    return {
      isHeic: true,
      ext: 'jpg', // Convert HEIC to JPG
      contentType: 'image/jpeg'
    }
  }
  
  // Handle other image types
  const ext = fileName.split('.').pop() || 'jpg'
  return {
    isHeic: false,
    ext,
    contentType: mimeType || `image/${ext}`
  }
}

// Helper function to validate image files
const validateImageFile = (file: File): { isValid: boolean, error?: string } => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
    'image/webp', 'image/heic', 'image/heif'
  ]
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `File ${file.name} terlalu besar. Maksimal 10MB.` 
    }
  }
  
  // Check if file is empty
  if (file.size === 0) {
    return { 
      isValid: false, 
      error: `File ${file.name} kosong.` 
    }
  }
  
  // Check file type (including HEIC detection by filename)
  const fileName = file.name.toLowerCase()
  const mimeType = file.type.toLowerCase()
  
  const isValidType = ALLOWED_TYPES.includes(mimeType) || 
                     fileName.endsWith('.heic') || 
                     fileName.endsWith('.heif')
  
  if (!isValidType) {
    return { 
      isValid: false, 
      error: `File ${file.name} bukan format gambar yang didukung.` 
    }
  }
  
  return { isValid: true }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type");
    
    // Handle file upload (FormData)
    if (contentType?.includes("multipart/form-data")) {
      const formData = await req.formData();
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const category = formData.get("category") as string;

      const files = formData.getAll("images") as File[];
      const uploadedUrls: string[] = [];
      const errors: string[] = [];
      const convertedFiles: string[] = [];

      console.log(`Processing ${files.length} files for gallery upload`);

      for (const file of files) {
        // Validate each file
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          errors.push(validation.error!);
          continue;
        }

        try {
          const fileInfo = getFileInfo(file);
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).slice(2);
          // const fileName = `gallery-${timestamp}-${randomId}.${fileInfo.ext}`;
          const isHeic = isHeicFile(file);

          let fileToUpload: File | Buffer;
          let fileName: string;
          let contentType: string;
          if (isHeic) {
            // Convert HEIC to JPG
            console
            const convertedBuffer = await convertHeicToJpg(file);
            fileToUpload = convertedBuffer;
            fileName = `gallery-${timestamp}-${randomId}.jpg`;
            contentType = 'image/jpeg';
            convertedFiles.push(file.name);
          } else {
            fileToUpload = file;
            const ext = file.name.split('.').pop() || 'jpg';
            fileName = `gallery-${timestamp}-${randomId}.${ext}`;
            contentType = file.type || `image/${ext}`;
          }
          
          console.log(`Uploading file: ${file.name} as ${fileName} (${fileInfo.isHeic ? 'converted from HEIC' : ''})`);
          
          // Upload to Supabase Storage
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from("media")
            .upload(fileName, file, {
              contentType,
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error(`Upload failed for ${file.name}:`, uploadError.message);
            errors.push(`Gagal mengupload ${file.name}: ${uploadError.message}`);
            continue;
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
          if (fileError instanceof Error && fileError.message.includes('heic')) 
            errors.push(`Gagal mengkonversi HEIC ${file.name}. Pastikan file tidak rusak.`);
          else{
            errors.push(`Gagal memproses ${file.name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
          }
        }
      }

      // Check if we have any successful uploads
      if (uploadedUrls.length === 0) {
        const errorMessage = errors.length > 0 
          ? `Gagal mengupload semua file: ${errors.join(', ')}`
          : "Tidak ada file valid yang berhasil diupload";
          
        return NextResponse.json(
          { error: errorMessage }, 
          { status: 400 }
        );
      }

      // Create gallery entry
      const gallery = await prisma.gallery.create({
        data: {
          title,
          description: description || "",
          category,
          images: uploadedUrls,
          isActive: true
        }
      });

      // Return success response with any warnings
      const response: any = {
        ...gallery,
        uploadedCount: uploadedUrls.length,
        totalFiles: files.length,
        convertedFiles: convertedFiles
      };

      if (errors.length > 0) {
        response.warnings = errors;
      }

      return NextResponse.json(response, { status: 201 });
    } 
    // Handle JSON data (URL-based) - unchanged
    else if (contentType?.includes("application/json")) {
      const body = await req.json();
      const { title, description, category, images } = body;

      // Validate required fields
      if (!title || !category || !images || images.length === 0) {
        return NextResponse.json(
          { error: "Missing required fields: title, category, and at least one image" },
          { status: 400 }
        );
      }

      // Filter out empty URLs
      const validImages = images.filter((img: string) => img.trim() !== "");
      if (validImages.length === 0) {
        return NextResponse.json(
          { error: "At least one valid image URL is required" },
          { status: 400 }
        );
      }

      const gallery = await prisma.gallery.create({
        data: {
          title: title.trim(),
          description: description?.trim() || "",
          category,
          images: validImages,
          isActive: true
        }
      });

      return NextResponse.json(gallery, { status: 201 });
    }
    
    return NextResponse.json(
      { error: "Unsupported content type" }, 
      { status: 400 }
    );

  } catch (error) {
    console.error("Gallery creation failed:", error);
    return NextResponse.json(
      { 
        error: "Gagal menambah galeri",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
}

// GET method with enhanced error handling
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const category = searchParams.get("category");
    const search = searchParams.get("search") || "";

    const where: any = {
      isActive: true,
      ...(category && category !== "all" && { category }),
      ...(search && {
        title: {
          contains: search,
          mode: "insensitive"
        }
      })
    };

    const [items, total] = await Promise.all([
      prisma.gallery.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.gallery.count({ where })
    ]);

    // Transform items to ensure images is always an array
    const transformedItems = items.map(item => ({
      ...item,
      images: Array.isArray(item.images) ? item.images : [item.images].filter(Boolean),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }));

    return NextResponse.json({
      items: transformedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Gallery fetch failed:", error);
    return NextResponse.json(
      { 
        error: "Gagal mengambil data galeri",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
}

// PUT method for updating gallery items
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, description, category, images } = body;

    // Validate required fields
    if (!id || !title || !category || !images || images.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: id, title, category, and at least one image" },
        { status: 400 }
      );
    }

    // Filter out empty URLs
    const validImages = images.filter((img: string) => img.trim() !== "");
    if (validImages.length === 0) {
      return NextResponse.json(
        { error: "At least one valid image URL is required" },
        { status: 400 }
      );
    }

    // Check if gallery item exists
    const existingItem = await prisma.gallery.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Gallery item not found" },
        { status: 404 }
      );
    }

    // Update the gallery item
    const updatedGallery = await prisma.gallery.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || "",
        category,
        images: validImages,
        updatedAt: new Date()
      }
    });

    // Transform the response to ensure proper formatting
    const response = {
      ...updatedGallery,
      images: Array.isArray(updatedGallery.images) ? updatedGallery.images : [updatedGallery.images].filter(Boolean),
      createdAt: updatedGallery.createdAt.toISOString(),
      updatedAt: updatedGallery.updatedAt.toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Gallery update failed:", error);
    return NextResponse.json(
      { 
        error: "Gagal memperbarui galeri",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
}

// DELETE method for removing gallery items
export async function DELETE(req: NextRequest) {
  try {
    // Extract the gallery ID from the URL
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
      return NextResponse.json(
        { error: "Gallery ID is required" },
        { status: 400 }
      );
    }

    // Check if gallery item exists
    const existingItem = await prisma.gallery.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Gallery item not found" },
        { status: 404 }
      );
    }

    // Delete associated images from Supabase if they exist
    if (existingItem.images && Array.isArray(existingItem.images)) {
      const deletePromises = existingItem.images.map(async (imageUrl: string) => {
        try {
          // Extract filename from Supabase URL
          const urlParts = imageUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          
          // Only delete if it's a Supabase-hosted image
          if (imageUrl.includes('supabase') && fileName) {
            const { error: deleteError } = await supabase.storage
              .from("media")
              .remove([fileName]);
            
            if (deleteError) {
              console.warn(`Failed to delete image ${fileName}:`, deleteError.message);
            } else {
              console.log(`Successfully deleted image: ${fileName}`);
            }
          }
        } catch (error) {
          console.warn(`Error deleting image ${imageUrl}:`, error);
        }
      });

      // Wait for all image deletions to complete (but don't fail if some fail)
      await Promise.allSettled(deletePromises);
    }

    // Delete the gallery item from database
    await prisma.gallery.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "Gallery item deleted successfully", id },
      { status: 200 }
    );

  } catch (error) {
    console.error("Gallery deletion failed:", error);
    return NextResponse.json(
      { 
        error: "Gagal menghapus galeri",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
}