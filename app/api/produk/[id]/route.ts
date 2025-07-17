// app/api/produk/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET single UMKM by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const umkm = await prisma.uMKM.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    })

    if (!umkm) {
      return NextResponse.json({ error: "UMKM not found" }, { status: 404 })
    }

    return NextResponse.json(umkm)
  } catch (error) {
    console.error("Error fetching UMKM:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT update UMKM
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, category, description, price, stock, images, contact, location, userId } = body

    // Verify authorization
    const token = request.headers.get("authorization")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if UMKM exists
    const existingUMKM = await prisma.uMKM.findUnique({
      where: { id: params.id }
    })

    if (!existingUMKM) {
      return NextResponse.json({ error: "UMKM not found" }, { status: 404 })
    }

    // Update UMKM
    const updatedUMKM = await prisma.uMKM.update({
      where: { id: params.id },
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
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(updatedUMKM)
  } catch (error) {
    console.error("Error updating UMKM:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE UMKM
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authorization
    const token = request.headers.get("authorization")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if UMKM exists
    const existingUMKM = await prisma.uMKM.findUnique({
      where: { id: params.id }
    })

    if (!existingUMKM) {
      return NextResponse.json({ error: "UMKM not found" }, { status: 404 })
    }

    // Delete UMKM
    await prisma.uMKM.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "UMKM deleted successfully" })
  } catch (error) {
    console.error("Error deleting UMKM:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH toggle active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { isActive } = body

    // Verify authorization
    const token = request.headers.get("authorization")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if UMKM exists
    const existingUMKM = await prisma.uMKM.findUnique({
      where: { id: params.id }
    })

    if (!existingUMKM) {
      return NextResponse.json({ error: "UMKM not found" }, { status: 404 })
    }

    // Update active status
    const updatedUMKM = await prisma.uMKM.update({
      where: { id: params.id },
      data: {
        isActive: isActive !== undefined ? isActive : !existingUMKM.isActive,
        updatedAt: new Date(),
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

    return NextResponse.json(updatedUMKM)
  } catch (error) {
    console.error("Error updating UMKM status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}