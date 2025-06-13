import { type NextRequest, NextResponse } from "next/server"

// This would be imported from the main submissions route in a real app
const submissions: Array<{
  id: number
  type: string
  name: string
  email: string
  message: string
  timestamp: string
  status: "new" | "read" | "replied"
}> = []

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const submissionId = Number.parseInt(params.id)

    const submissionIndex = submissions.findIndex((sub) => sub.id === submissionId)
    if (submissionIndex === -1) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 })
    }

    submissions[submissionIndex].status = status
    return NextResponse.json({ message: "Status updated successfully" })
  } catch (error) {
    return NextResponse.json({ message: "Failed to update status" }, { status: 500 })
  }
}
