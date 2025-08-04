import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to get userId from token
async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    const cleanToken = token.replace("Bearer ", "");
    const decoded = jwt.verify(
      cleanToken,
      process.env.JWT_SECRET ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptYmxvcHNjYm5nb2FweWxmcnBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTUzMTU5NiwiZXhwIjoyMDY3MTA3NTk2fQ.k0Y9h1rOTEYXeXZKmPetvf5zpjishXLG5IO8DswJ5aAeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptYmxvcHNjYm5nb2FweWxmcnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzE1OTYsImV4cCI6MjA2NzEwNzU5Nn0.7i6EsvwjcTikfS_MSx5EUqYDufqSf9Du8hJcJ91ZrAI"
    ) as any;

    return decoded.userId || decoded.id || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

// Helper function to upload file to Supabase Storage
async function uploadFileToSupabase(
  file: File,
  folder = "umkm"
): Promise<string> {
  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("images")
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
    } = supabase.storage.from("images").getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const userId = searchParams.get("userId");
    const limit = Number.parseInt(searchParams.get("limit") || "100");
    const page = Number.parseInt(searchParams.get("page") || "1");

    const where: any = { isActive: true };

    if (userId) {
      where.userId = userId;
    }

    if (category && category !== "Semua" && category !== "all") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const umkmProducts = await prisma.uMKM.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json({ umkm: umkmProducts });
  } catch (error) {
    console.error("Error fetching UMKM:", error);
    return NextResponse.json({ umkm: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type");
    let formData: any = {};
    let uploadedImageUrls: string[] = [];

    if (contentType?.includes("multipart/form-data")) {
      // Handle FormData (file upload)
      const data = await request.formData();

      // Extract form fields
      formData = {
        name: data.get("name") as string,
        category: data.get("category") as string,
        description: data.get("description") as string,
        price: data.get("price") as string,
        stock: Number.parseInt(data.get("stock") as string) || 0,
        contact: data.get("contact") as string,
        location: data.get("location") as string,
        userId: data.get("userId") as string,
      };

      // Handle existing images (URLs)
      const existingImages = data.get("existingImages");
      if (existingImages) {
        try {
          const existingImageUrls = JSON.parse(existingImages as string);
          if (Array.isArray(existingImageUrls)) {
            uploadedImageUrls.push(...existingImageUrls);
          }
        } catch (error) {
          console.error("Error parsing existing images:", error);
        }
      }

      // Handle file uploads
      const files = data.getAll("images") as File[];
      if (files && files.length > 0) {
        const validFiles = files.filter((file) => file.size > 0);

        if (validFiles.length > 0) {
          try {
            const uploadPromises = validFiles.map((file) =>
              uploadFileToSupabase(file, "umkm")
            );
            const newImageUrls = await Promise.all(uploadPromises);
            uploadedImageUrls.push(...newImageUrls);
          } catch (error) {
            console.error("Error uploading files:", error);
            return NextResponse.json(
              { error: "Failed to upload images" },
              { status: 500 }
            );
          }
        }
      }
    } else {
      // Handle JSON (URL-based images)
      const body = await request.json();
      formData = body;
      uploadedImageUrls = body.images || [];
    }

    // Get userId from token if not provided in body
    let finalUserId = formData.userId;
    if (!finalUserId) {
      finalUserId = await getUserIdFromToken(token);
    }

    // If we still don't have a userId, check if there's a default admin user
    if (!finalUserId) {
      const adminUser = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      });

      if (adminUser) {
        finalUserId = adminUser.id;
      } else {
        finalUserId = null;
      }
    }

    // Verify the user exists if we have a userId
    if (finalUserId) {
      const userExists = await prisma.user.findUnique({
        where: { id: finalUserId },
      });

      if (!userExists) {
        return NextResponse.json({ error: "User not found" }, { status: 400 });
      }
    }

    const umkmProduct = await prisma.uMKM.create({
      data: {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        images: uploadedImageUrls,
        contact: formData.contact,
        location: formData.location,
        ...(finalUserId && { userId: finalUserId }),
      },
      include: {
        user: finalUserId
          ? {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            }
          : undefined,
      },
    });

    return NextResponse.json({
      ...umkmProduct,
      message: "UMKM berhasil ditambahkan",
      uploadedImages: uploadedImageUrls.length,
    });
  } catch (error) {
    console.error("Error creating UMKM product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
