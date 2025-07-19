// File: app/api/gallery/[id]/route.ts
// Enhanced individual gallery item route handler

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to verify authentication (optional - add if you have auth)
const verifyAuth = (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
};

// GET single gallery item
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const galleryItem = await prisma.gallery.findUnique({
      where: { 
        id,
        isActive: true 
      }
    });

    if (!galleryItem) {
      return NextResponse.json(
        { error: "Gallery item not found" },
        { status: 404 }
      );
    }

    // Transform the response to ensure proper formatting
    const response = {
      ...galleryItem,
      images: Array.isArray(galleryItem.images) ? galleryItem.images : [galleryItem.images].filter(Boolean),
      createdAt: galleryItem.createdAt.toISOString(),
      updatedAt: galleryItem.updatedAt.toISOString()
    };

    return NextResponse.json(response);

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

// PUT - Update gallery item
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Optional: Verify authentication
    // const token = verifyAuth(req);
    // if (!token) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { id } = params;
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

// DELETE - Remove gallery item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Optional: Verify authentication
    // const token = verifyAuth(req);
    // if (!token) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { id } = params;

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
      console.log(`Deleting ${existingItem.images.length} images for gallery item: ${id}`);
      
      const deletePromises = existingItem.images.map(async (imageUrl: string) => {
        try {
          // Extract filename from Supabase URL
          const urlParts = imageUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          
          // Only delete if it's a Supabase-hosted image (contains gallery- prefix)
          if (imageUrl.includes('supabase') && fileName && fileName.startsWith('gallery-')) {
            const { error: deleteError } = await supabase.storage
              .from("media")
              .remove([fileName]);
            
            if (deleteError) {
              console.warn(`Failed to delete image ${fileName}:`, deleteError.message);
            } else {
              console.log(`Successfully deleted image: ${fileName}`);
            }
          } else {
            console.log(`Skipping external image: ${imageUrl}`);
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

    console.log(`Successfully deleted gallery item: ${id}`);

    return NextResponse.json(
      { 
        message: "Gallery item deleted successfully", 
        id,
        deletedImages: existingItem.images?.length || 0
      },
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

// PATCH - Toggle active status or partial updates
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Optional: Verify authentication
    // const token = verifyAuth(req);
    // if (!token) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { id } = params;
    const body = await req.json();
    const { isActive, ...otherUpdates } = body;

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

    // Update the gallery item with provided fields
    const updatedGallery = await prisma.gallery.update({
      where: { id },
      data: {
        ...(typeof isActive === 'boolean' && { isActive }),
        ...otherUpdates,
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
    console.error("Gallery patch failed:", error);
    return NextResponse.json(
      { 
        error: "Gagal memperbarui status galeri",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
}