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
  folder = "basecamp"
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
    const search = searchParams.get("search");
    const capacity = searchParams.get("capacity");
    const status = searchParams.get("status"); // all, active, inactive
    const limit = Number.parseInt(searchParams.get("limit") || "100");
    const page = Number.parseInt(searchParams.get("page") || "1");

    const where: any = {};

    // Filter berdasarkan status (untuk admin)
    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    } else if (!status || status === "public") {
      // Default untuk public hanya tampilkan yang active
      where.isActive = true;
    }

    // Filter berdasarkan pencarian
    if (search) {
      where.OR = [
        { namaBasecamp: { contains: search, mode: "insensitive" } },
        { lokasi: { contains: search, mode: "insensitive" } },
        { pemilik: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filter berdasarkan kapasitas
    if (capacity) {
      if (capacity === "besar") {
        where.dayaTampungOrang = { gte: 20 };
      } else if (capacity === "sedang") {
        where.dayaTampungOrang = { gte: 10, lt: 20 };
      } else if (capacity === "kecil") {
        where.dayaTampungOrang = { lt: 10 };
      }
    }

    const [basecamps, total] = await Promise.all([
      prisma.basecamp.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.basecamp.count({ where }),
    ]);

    return NextResponse.json({
      basecamp: basecamps,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching basecamps:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch basecamps",
        basecamp: [],
        pagination: { total: 0, page: 1, limit: 100, totalPages: 0 },
      },
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
              uploadFileToSupabase(file, "basecamp")
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

    const basecamp = await prisma.basecamp.create({
      data: {
        namaBasecamp: formData.namaBasecamp,
        fasilitas: formData.fasilitas || [],
        dayaTampungKendaraan: Number(formData.dayaTampungKendaraan),
        dayaTampungOrang: Number(formData.dayaTampungOrang),
        nomorWa: formData.nomorWa,
        images: uploadedImageUrls,
        sosialMedia: formData.sosialMedia || [],
        lokasi: formData.lokasi,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
        pemilik: formData.pemilik,
        menuMakanan: formData.menuMakanan || [],
        menuMinuman: formData.menuMinuman || [],
      },
    });

    return NextResponse.json({
      message: "Basecamp berhasil ditambahkan",
      basecamp,
      uploadedImages: uploadedImageUrls.length,
    });
  } catch (error) {
    console.error("Error creating basecamp:", error);

    // Better error response
    const errorMessage =
      error instanceof Error ? error.message : "Gagal menambahkan basecamp";
    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
