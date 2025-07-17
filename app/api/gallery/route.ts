import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/gallery - Get all gallery items with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''

    console.log('Gallery API called with params:', {
      page,
      limit,
      search,
      category
    })

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      )
    }

    // Calculate offset
    const offset = (page - 1) * limit

    // Build where clause
    const whereClause: any = {
      isActive: true
    }

    if (search) {
      whereClause.title = {
        contains: search,
        mode: 'insensitive'
      }
    }

    if (category && category !== 'all') {
      whereClause.category = category
    }

    console.log('Where clause:', whereClause)

    // Get total count
    const total = await prisma.gallery.count({
      where: whereClause
    })

    // Get gallery items
    const galleryItems = await prisma.gallery.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    })

    console.log('Raw gallery items from DB:', galleryItems)

    // Transform data to match frontend expectations
    const transformedItems = galleryItems.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      images: Array.isArray(item.images) ? item.images : [item.images].filter(Boolean),
      category: item.category,
      isActive: item.isActive,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }))

    const totalPages = Math.ceil(total / limit)

    const response = {
      items: transformedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    }

    console.log('API Response:', response)

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Gallery API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    )
  }
}

// POST /api/gallery - Create new gallery item
export async function POST(request: NextRequest) {
  try {
    // Get auth token from headers
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Verify token and check if user is admin
    
    const body = await request.json()
    const { title, description, category, images } = body

    console.log('POST Gallery API called with body:', body)

    // Validate required fields
    if (!title || !category || !images || images.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: title, category, and at least one image' },
        { status: 400 }
      )
    }

    // Validate image URLs
    const validImages = images.filter((img: string) => img.trim() !== '')
    if (validImages.length === 0) {
      return NextResponse.json(
        { error: 'At least one valid image URL is required' },
        { status: 400 }
      )
    }

    // Create gallery item
    const galleryItem = await prisma.gallery.create({
      data: {
        title: title.trim(),
        description: description?.trim() || '',
        category,
        images: validImages,
        isActive: true
      }
    })

    console.log('Created gallery item:', galleryItem)

    return NextResponse.json({
      id: galleryItem.id,
      title: galleryItem.title,
      description: galleryItem.description,
      images: galleryItem.images,
      category: galleryItem.category,
      isActive: galleryItem.isActive,
      createdAt: galleryItem.createdAt.toISOString(),
      updatedAt: galleryItem.updatedAt.toISOString()
    })

  } catch (error) {
    console.error('Gallery POST API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}