import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const feedbacks = await prisma.feedback.findMany();
  return NextResponse.json(feedbacks);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newFeedback = await prisma.feedback.create({ data });
  return NextResponse.json(newFeedback, { status: 201 });
}