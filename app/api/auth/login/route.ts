import { type NextRequest, NextResponse } from "next/server"

// Mock admin data - in real app, this would come from database
const mockAdmin = {
  id: 1,
  name: "Admin Tarubatang",
  email: "admin@tarubatang.com",
  password: "admin123", // In real app, this would be hashed
  role: "admin",
  status: "active",
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Only check for admin user
    if (email !== mockAdmin.email || password !== mockAdmin.password || mockAdmin.status !== "active") {
      return NextResponse.json({ message: "Invalid admin credentials" }, { status: 401 })
    }

    // In real app, generate JWT token here
    const token = `mock-jwt-token-${mockAdmin.id}-${Date.now()}`

    // Return admin data without password
    const { password: _, ...adminWithoutPassword } = mockAdmin

    return NextResponse.json({
      message: "Admin login successful",
      token,
      user: adminWithoutPassword,
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}