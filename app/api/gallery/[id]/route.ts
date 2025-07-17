import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT /api/gallery/[id] - Update gallery item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get auth token from headers
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Verify token and check if user is admin
    
    const { id } = params
    const body = await request.json()
    const { title, description, category, images } = body

    console.log('PUT Gallery API called with ID:', id)
    console.log('Request body:', body)

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

    // Check if gallery item exists
    const existingItem = await prisma.gallery.findUnique({
      where: { id }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      )
    }

    // Update gallery item
    const galleryItem = await prisma.gallery.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || '',
        category,
        images: validImages,
        updatedAt: new Date()
      }
    })

    console.log('Updated gallery item:', galleryItem)

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
    console.error('Gallery PUT API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/gallery/[id] - Delete gallery item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get auth token from headers
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Verify token and check if user is admin
    
    const { id } = params

    console.log('DELETE Gallery API called with ID:', id)

    if (!id) {
      return NextResponse.json(
        { error: 'Missing gallery item ID' },
        { status: 400 }
      )
    }

    // Check if gallery item exists
    const existingItem = await prisma.gallery.findUnique({
      where: { id }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      )
    }

    // Delete gallery item
    await prisma.gallery.delete({
      where: { id }
    })

    console.log('Deleted gallery item with ID:', id)

    return NextResponse.json({ 
      message: 'Gallery item deleted successfully',
      id: id
    })

  } catch (error) {
    console.error('Gallery DELETE API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET /api/gallery/[id] - Get single gallery item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('GET Gallery API called with ID:', id)

    if (!id) {
      return NextResponse.json(
        { error: 'Missing gallery item ID' },
        { status: 400 }
      )
    }

    // Get gallery item
    const galleryItem = await prisma.gallery.findUnique({
      where: { id }
    })

    if (!galleryItem) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      )
    }

    // Transform data to match frontend expectations
    const transformedItem = {
      id: galleryItem.id,
      title: galleryItem.title,
      description: galleryItem.description || '',
      images: Array.isArray(galleryItem.images) ? galleryItem.images : [galleryItem.images].filter(Boolean),
      category: galleryItem.category,
      isActive: galleryItem.isActive,
      createdAt: galleryItem.createdAt.toISOString(),
      updatedAt: galleryItem.updatedAt.toISOString()
    }

    console.log('Retrieved gallery item:', transformedItem)

    return NextResponse.json(transformedItem, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Gallery GET API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}