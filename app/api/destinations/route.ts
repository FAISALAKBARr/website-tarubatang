import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to upload file to Supabase Storage
async function uploadFileToSupabase(
  file: File,
  folder = "destinations"
): Promise<string> {
  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

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
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const page = Number.parseInt(searchParams.get("page") || "1");

    const where: any = {
      isActive: true,
    };

    if (category && category !== "all") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const destinations = await prisma.destination.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.destination.count({ where });

    return NextResponse.json({
      destinations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type");
    let formData: any = {};
    let uploadedImageUrls: string[] = [];

    if (contentType?.includes("multipart/form-data")) {
      // Handle FormData (file upload)
      const data = await request.formData();

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

        // Check total image limit
        if (uploadedImageUrls.length + validFiles.length > 5) {
          return NextResponse.json(
            { error: "Maksimal 5 gambar per destinasi" },
            { status: 400 }
          );
        }

        if (validFiles.length > 0) {
          try {
            const uploadPromises = validFiles.map((file) =>
              uploadFileToSupabase(file, "destinations")
            );
            const newImageUrls = await Promise.all(uploadPromises);
            uploadedImageUrls.push(...newImageUrls);
          } catch (error) {
            console.error("Error uploading files:", error);
            return NextResponse.json(
              { error: `Failed to upload images: ${error.message}` },
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

    // Validate required fields
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
    if (uploadedImageUrls.length === 0) {
      return NextResponse.json(
        { error: "Minimal 1 gambar diperlukan" },
        { status: 400 }
      );
    }

    // Validate image limit
    if (uploadedImageUrls.length > 5) {
      return NextResponse.json(
        { error: "Maksimal 5 gambar per destinasi" },
        { status: 400 }
      );
    }

    // In a real app, verify admin authentication here
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate slug from name
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();

    const destination = await prisma.destination.create({
      data: {
        name: formData.name,
        slug,
        category: formData.category,
        description: formData.description,
        contact: formData.contact || "",
        content: formData.content || "",
        price: formData.price || "Gratis",
        facilities: formData.facilities || [],
        location: formData.location,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
        images: uploadedImageUrls,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        message: "Destinasi berhasil ditambahkan",
        destination,
        uploadedImages: uploadedImageUrls.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating destination:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
