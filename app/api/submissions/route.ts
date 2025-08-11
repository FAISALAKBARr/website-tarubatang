import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Security headers middleware
function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

// CORS middleware for submissions endpoint
function handleCORS(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowedOrigins = [
    "http://localhost:3000",
    "https://website-tarubatang.vercel.app", // Ganti dengan domain production Anda
  ];

  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 });
    response.headers.set(
      "Access-Control-Allow-Origin",
      origin && allowedOrigins.includes(origin) ? origin : "null"
    );
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
    response.headers.set("Access-Control-Max-Age", "86400");
    return addSecurityHeaders(response);
  }

  return null;
}

interface CreateSubmissionRequest {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  type?: string;
}

const prisma = new PrismaClient();

// Simple rate limiting in memory (for production use Redis)
const requestCounts = new Map<
  string,
  { count: number; resetTime: number; blocked: boolean }
>();

function rateLimitCheck(
  ip: string,
  limit: number = 5,
  windowMs: number = 60000
): { allowed: boolean; remainingRequests: number; resetTime: number } {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    const newResetTime = now + windowMs;
    requestCounts.set(ip, {
      count: 1,
      resetTime: newResetTime,
      blocked: false,
    });
    return {
      allowed: true,
      remainingRequests: limit - 1,
      resetTime: newResetTime,
    };
  }

  if (record.count >= limit) {
    record.blocked = true;
    return {
      allowed: false,
      remainingRequests: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  return {
    allowed: true,
    remainingRequests: limit - record.count,
    resetTime: record.resetTime,
  };
}

// Fungsi untuk mendapatkan IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  if (cfConnectingIp) return cfConnectingIp;
  if (realIp) return realIp;
  if (forwarded) return forwarded.split(",")[0].trim();

  return "unknown";
}

// Enhanced input sanitization
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove basic HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .substring(0, 2000); // Limit length
}

// Enhanced email validation
function isValidEmail(email: string): boolean {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Spam detection
function detectSpam(name: string, email: string, message: string): boolean {
  const spamKeywords = [
    "bitcoin",
    "crypto",
    "investment",
    "forex",
    "loan",
    "debt",
    "credit",
    "viagra",
    "casino",
    "gambling",
    "win money",
    "make money fast",
    "click here",
    "urgent",
    "congratulations",
    "winner",
    "prize",
  ];

  const text = (name + " " + email + " " + message).toLowerCase();

  // Check for spam keywords
  const spamScore = spamKeywords.reduce((score, keyword) => {
    return score + (text.includes(keyword) ? 1 : 0);
  }, 0);

  // Check for suspicious patterns
  const hasMultipleUrls = (text.match(/https?:\/\//g) || []).length > 2;
  const hasExcessiveCaps =
    (message.match(/[A-Z]/g) || []).length > message.length * 0.5;
  const hasRepeatedChars = /(.)\1{4,}/.test(message);

  return (
    spamScore > 2 || hasMultipleUrls || hasExcessiveCaps || hasRepeatedChars
  );
}

// Fungsi untuk menentukan prioritas berdasarkan kata kunci
// Modified priority determination
function determinePriority(
  message: string,
  subject?: string,
  type?: string
): string {
  const text = (message + " " + (subject || "")).toLowerCase();

  // Type-based priority
  if (type === "COMPLAINT") return "HIGH";
  if (type === "BUSINESS") return "HIGH";

  const urgentKeywords = [
    "mendesak",
    "urgent",
    "penting",
    "segera",
    "darurat",
    "emergency",
    "bantuan",
    "help",
    "tolong",
    "masalah besar",
  ];

  const highKeywords = [
    "komplain",
    "keluhan",
    "masalah",
    "problem",
    "rusak",
    "error",
    "tidak bisa",
    "tidak berfungsi",
    "gagal",
  ];

  if (urgentKeywords.some((keyword) => text.includes(keyword))) {
    return "URGENT";
  }

  if (highKeywords.some((keyword) => text.includes(keyword))) {
    return "HIGH";
  }

  return "NORMAL";
}

// GET - Ambil submissions (untuk admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (type && type !== "all") {
      where.type = type;
    }

    if (priority && priority !== "all") {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: {
          handler: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [
          { priority: "desc" },
          { status: "asc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.submission.count({ where }),
    ]);

    // Get summary stats
    const stats = await prisma.submission.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      data: {
        submissions,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
        stats: statusCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data submissions" },
      { status: 500 }
    );
  }
}

// POST - Buat submission baru dari guest
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (!rateLimitCheck(clientIP, 5)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Terlalu banyak permintaan. Silakan tunggu sebentar sebelum mengirim lagi.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
          },
        }
      );
    }

    let body: CreateSubmissionRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Format data tidak valid. Pastikan Anda mengirim data JSON yang benar.",
        },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message, type = "GUESTBOOK" } = body;

    // Validasi input
    const errors: string[] = [];

    // Validate name
    if (!name || typeof name !== "string") {
      errors.push("Nama harus diisi");
    } else if (name.trim().length < 2) {
      errors.push("Nama harus minimal 2 karakter");
    } else if (name.length > 100) {
      errors.push("Nama maksimal 100 karakter");
    }

    // Validate email
    if (!email || typeof email !== "string") {
      errors.push("Email harus diisi");
    } else if (!isValidEmail(email)) {
      errors.push("Format email tidak valid");
    }

    // Validate message
    if (!message || typeof message !== "string") {
      errors.push("Pesan harus diisi");
    } else if (message.trim().length < 10) {
      errors.push("Pesan minimal 10 karakter");
    } else if (message.length > 2000) {
      errors.push("Pesan maksimal 2000 karakter");
    }

    // Validate optional fields
    if (subject && (typeof subject !== "string" || subject.length > 200)) {
      errors.push("Subjek maksimal 200 karakter");
    }

    if (phone && (typeof phone !== "string" || phone.length > 20)) {
      errors.push("Nomor telepon tidak valid");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak valid",
          errors,
        },
        { status: 400 }
      );
    }

    // Validate submission type
    const validTypes = [
      "GUESTBOOK",
      "FEEDBACK",
      "COMPLAINT",
      "INQUIRY",
      "BUSINESS",
      "VOLUNTEER",
      "OTHER",
    ];
    const submissionType = type.toUpperCase();
    if (!validTypes.includes(submissionType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Tipe submission tidak valid",
        },
        { status: 400 }
      );
    }

    // Check for recent submissions from same email
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentSubmission = await prisma.submission.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        createdAt: {
          gte: fiveMinutesAgo,
        },
      },
      select: { id: true, createdAt: true },
    });

    if (recentSubmission) {
      const waitTime = Math.ceil(
        (5 * 60 * 1000 - (Date.now() - recentSubmission.createdAt.getTime())) /
          1000 /
          60
      );
      return NextResponse.json(
        {
          success: false,
          message: `Anda baru saja mengirim pesan. Silakan tunggu ${waitTime} menit lagi sebelum mengirim pesan baru.`,
        },
        { status: 429 }
      );
    }
    // Ambil metadata dari request
    const userAgent = request.headers.get("user-agent") || "unknown";
    const referer = request.headers.get("referer");
    const acceptLanguage = request.headers.get("accept-language");

    // Tentukan prioritas berdasarkan konten
    const priority = determinePriority(message, subject);

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        name: sanitizeInput(name.trim()),
        email: email.toLowerCase().trim(),
        phone: phone ? sanitizeInput(phone.trim()) : null,
        subject: subject ? sanitizeInput(subject.trim()) : null,
        message: sanitizeInput(message.trim()),
        type: submissionType as any,
        priority: priority as any,
        status: "PENDING",
        ipAddress: clientIP,
        userAgent: userAgent.substring(0, 500), // Limit length
        source: referer ? "website" : "direct",
      },
    });

    // Log successful submission (optional - for analytics)
    console.log(
      `New submission created: ${submission.id} from ${submission.email}`
    );

    return NextResponse.json({
      success: true,
      message:
        "Pesan Anda berhasil dikirim! Terima kasih atas partisipasi Anda. Tim kami akan segera merespons pesan Anda.",
      data: {
        id: submission.id,
        status: submission.status,
        createdAt: submission.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating submission:", error);

    // Check if it's a database constraint error
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        {
          success: false,
          message: "Terjadi konflik data. Silakan coba lagi.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan saat mengirim pesan. Silakan coba lagi dalam beberapa saat.",
      },
      { status: 500 }
    );
  }
}

// PUT - Update submission (untuk admin)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      status,
      response,
      handlerId,
      priority,
      markAsRead = false,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID submission diperlukan" },
        { status: 400 }
      );
    }

    // Ambil submission yang ada
    const existingSubmission = await prisma.submission.findUnique({
      where: { id },
    });

    if (!existingSubmission) {
      return NextResponse.json(
        { success: false, message: "Submission tidak ditemukan" },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    // Update status
    if (status) {
      updateData.status = status;
    }

    // Mark as read
    if (markAsRead && !existingSubmission.readAt) {
      updateData.readAt = new Date();
      if (existingSubmission.status === "PENDING") {
        updateData.status = "READ";
      }
    }

    // Update priority
    if (priority) {
      updateData.priority = priority;
    }

    // Add response
    if (response) {
      updateData.response = sanitizeInput(response);
      updateData.responseAt = new Date();
      updateData.status = "REPLIED";

      if (handlerId) {
        updateData.responseBy = handlerId;
        updateData.handlerId = handlerId;
      }
    }

    // Update handler
    if (handlerId && !response) {
      updateData.handlerId = handlerId;
    }

    const submission = await prisma.submission.update({
      where: { id },
      data: updateData,
      include: {
        handler: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Submission berhasil diupdate",
      data: submission,
    });
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate submission" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus submission (untuk admin)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const action = searchParams.get("action"); // 'delete' or 'archive'

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID submission diperlukan" },
        { status: 400 }
      );
    }

    if (action === "archive") {
      // Archive instead of delete
      const submission = await prisma.submission.update({
        where: { id },
        data: {
          status: "ARCHIVED",
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Submission berhasil diarsipkan",
        data: submission,
      });
    } else {
      // Permanent delete
      await prisma.submission.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: "Submission berhasil dihapus",
      });
    }
  } catch (error) {
    console.error("Error deleting submission:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus submission" },
      { status: 500 }
    );
  }
}

// PATCH - Bulk actions untuk admin
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, action, handlerId } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "IDs submission diperlukan" },
        { status: 400 }
      );
    }

    let updateData: any = {
      updatedAt: new Date(),
    };

    switch (action) {
      case "mark_read":
        updateData.readAt = new Date();
        updateData.status = "READ";
        break;
      case "mark_replied":
        updateData.status = "REPLIED";
        break;
      case "archive":
        updateData.status = "ARCHIVED";
        break;
      case "assign":
        if (!handlerId) {
          return NextResponse.json(
            { success: false, message: "Handler ID diperlukan untuk assign" },
            { status: 400 }
          );
        }
        updateData.handlerId = handlerId;
        break;
      default:
        return NextResponse.json(
          { success: false, message: "Action tidak valid" },
          { status: 400 }
        );
    }

    const result = await prisma.submission.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} submission berhasil diupdate`,
      data: { updatedCount: result.count },
    });
  } catch (error) {
    console.error("Error bulk updating submissions:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate submissions" },
      { status: 500 }
    );
  }
}
