import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const destination = await prisma.destination.findUnique({
      where: { id: params.id },
      // Removed _count since reviews and bookmarks relations don't exist in schema
    })

    if (!destination) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 })
    }

    return NextResponse.json(destination)
  } catch (error) {
    console.error("Error fetching destination:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, category, description, content, price, facilities, location, latitude, longitude, images } = body

    // Validate required fields
    if (!name || !category || !description || !location) {
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

    const updatedDestination = await prisma.destination.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        category,
        description,
        content: content || "",
        price: price || "Gratis",
        facilities: facilities || [],
        location,
        latitude: latitude ? parseFloat(latitude.toString()) : null,
        longitude: longitude ? parseFloat(longitude.toString()) : null,
        images: images || [],
      },
      // Removed _count since reviews and bookmarks relations don't exist in schema
    })

    return NextResponse.json(updatedDestination)
  } catch (error) {
    console.error("Error updating destination:", error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In a real app, verify admin authentication here
    const token = request.headers.get("authorization")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.destination.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Destination deleted successfully" })
  } catch (error) {
    console.error("Error deleting destination:", error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}