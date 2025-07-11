import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const destinationId = searchParams.get("destinationId")
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const where: any = {}

    if (destinationId) {
      where.destinationId = destinationId
    }

    if (userId) {
      where.userId = userId
    }

    const reviews = await prisma.review.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        destination: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
      },
    })

    const total = await prisma.review.count({ where })

    return NextResponse.json({
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rating, comment, images, userId, destinationId } = body

    // In a real app, verify user authentication here
    const token = request.headers.get("authorization")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        images: images || [],
        userId,
        destinationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        destination: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
      },
    })

    // Update destination rating
    const avgRating = await prisma.review.aggregate({
      where: { destinationId },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await prisma.destination.update({
      where: { id: destinationId },
      data: {
        rating: avgRating._avg.rating || 0,
        totalReviews: avgRating._count.rating || 0,
      },
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
