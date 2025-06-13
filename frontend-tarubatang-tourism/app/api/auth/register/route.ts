import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, address, role = "user" } = await request.json()

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Name, email, and password are required" }, { status: 400 })
    }

    // Check if email already exists (mock check)
    // In real app, check against database
    if (email === "admin@tarubatang.com" || email === "user@tarubatang.com") {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 })
    }

    // In real app, hash password and save to database
    const newUser = {
      id: Date.now(), // Mock ID
      name,
      email,
      phone,
      address,
      role,
      status: "active",
      createdAt: new Date().toISOString(),
    }

    // In real app, generate JWT token here
    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`

    return NextResponse.json({
      message: "Registration successful",
      token,
      user: newUser,
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
