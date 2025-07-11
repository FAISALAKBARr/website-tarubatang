import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const where: any = {
      isActive: true,
    }

    if (category && category !== "all") {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ]
    }

    const destinations = await prisma.destination.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { reviews: true, bookmarks: true },
        },
      },
    })

    const total = await prisma.destination.count({ where })

    return NextResponse.json({
      destinations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching destinations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, description, content, price, facilities, location, latitude, longitude, images } = body

    // In a real app, verify admin authentication here
    const token = request.headers.get("authorization")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const destination = await prisma.destination.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category,
        description,
        content,
        price,
        facilities: facilities || [],
        location,
        latitude,
        longitude,
        images: images || [],
      },
    })

    return NextResponse.json(destination)
  } catch (error) {
    console.error("Error creating destination:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
