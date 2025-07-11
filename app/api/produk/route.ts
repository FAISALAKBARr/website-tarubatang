import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const userId = searchParams.get("userId") // Filter berdasarkan user tertentu
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const where: any = { isActive: true }
    
    // Filter berdasarkan user ID jika ada
    if (userId) {
      where.userId = userId
    }
    
    // Filter berdasarkan kategori
    if (category && category !== "Semua" && category !== "all") {
      where.category = category
    }
    
    // Filter berdasarkan pencarian
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
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
    })

    return NextResponse.json({ umkm: umkmProducts })
  } catch (error) {
    console.error("Error fetching UMKM:", error)
    return NextResponse.json({ umkm: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, description, price, stock, images, contact, location, userId } = body

    // In a real app, verify user authentication here
    const token = request.headers.get("authorization")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const umkmProduct = await prisma.uMKM.create({
      data: {
        name,
        category,
        description,
        price,
        stock,
        images: images || [],
        contact,
        location,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    })

    return NextResponse.json(umkmProduct)
  } catch (error) {
    console.error("Error creating UMKM product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}