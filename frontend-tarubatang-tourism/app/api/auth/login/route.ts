import { type NextRequest, NextResponse } from "next/server"

// Mock user data - in real app, this would come from database
const mockUsers = [
  {
    id: 1,
    name: "Admin Tarubatang",
    email: "admin@tarubatang.com",
    password: "admin123", // In real app, this would be hashed
    role: "admin",
    status: "active",
  },
  {
    id: 2,
    name: "User Demo",
    email: "user@tarubatang.com",
    password: "user123", // In real app, this would be hashed
    role: "user",
    status: "active",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    // Find user by email and role
    const user = mockUsers.find((u) => u.email === email && u.role === role && u.status === "active")

    if (!user || user.password !== password) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // In real app, generate JWT token here
    const token = `mock-jwt-token-${user.id}-${Date.now()}`

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
