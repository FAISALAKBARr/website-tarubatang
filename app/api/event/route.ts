import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const upcoming = searchParams.get("upcoming") === "true"
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

    if (upcoming) {
      where.date = {
        gte: new Date(),
      }
    }

    const events = await prisma.event.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { date: "asc" },
      // Removed _count since participants relation doesn't exist in schema
    })

    const total = await prisma.event.count({ where })

    return NextResponse.json({
      events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, content, category, date, endDate, location, maxParticipants, price, images } = body

    // Validate required fields
    if (!name || !description || !category || !date || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In a real app, verify admin authentication here
    const token = request.headers.get("authorization")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()

    const event = await prisma.event.create({
      data: {
        name,
        slug,
        description,
        content: content || "",
        category,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        location,
        maxParticipants: maxParticipants ? parseInt(maxParticipants.toString()) : null,
        currentParticipants: 0, // Initialize to 0
        price: price || "Gratis",
        images: images || [],
        isActive: true,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}