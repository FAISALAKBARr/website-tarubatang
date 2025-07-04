import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const events = await prisma.event.findMany();
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newEvent = await prisma.event.create({ data });
  return NextResponse.json(newEvent, { status: 201 });
}