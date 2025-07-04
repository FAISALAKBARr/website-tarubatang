import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reviews = await prisma.review.findMany({ include: { user: true, wisata: true } });
  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newReview = await prisma.review.create({ data });
  return NextResponse.json(newReview, { status: 201 });
}