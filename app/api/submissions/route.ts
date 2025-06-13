import { type NextRequest, NextResponse } from "next/server"

// Mock storage - in production, use a database
const submissions: Array<{
  id: number
  type: string
  name: string
  email: string
  message: string
  timestamp: string
  status: "new" | "read" | "replied"
}> = [
  {
    id: 1,
    type: "guestbook",
    name: "Ahmad Wijaya",
    email: "ahmad@email.com",
    message: "Terima kasih atas pengalaman wisata yang luar biasa di Desa Tarubatang. Air terjunnya sangat indah!",
    timestamp: "2024-06-01T10:30:00Z",
    status: "new",
  },
  {
    id: 2,
    type: "volunteer",
    name: "Siti Nurhaliza",
    email: "siti@email.com",
    message: "Saya tertarik untuk menjadi relawan dalam kegiatan pengembangan wisata desa. Bagaimana caranya?",
    timestamp: "2024-06-02T14:15:00Z",
    status: "read",
  },
  {
    id: 3,
    type: "feedback",
    name: "Budi Santoso",
    email: "budi@email.com",
    message: "Saran untuk menambah papan petunjuk arah di jalur pendakian agar lebih mudah bagi pendaki pemula.",
    timestamp: "2024-06-03T09:45:00Z",
    status: "replied",
  },
]

export async function GET() {
  return NextResponse.json(
    submissions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  )
}

export async function POST(request: NextRequest) {
  try {
    const newSubmission = await request.json()
    const submission = {
      id: Date.now(),
      ...newSubmission,
      status: "new" as const,
    }
    submissions.push(submission)
    return NextResponse.json({ message: "Submission received successfully" })
  } catch (error) {
    return NextResponse.json({ message: "Failed to save submission" }, { status: 500 })
  }
}
