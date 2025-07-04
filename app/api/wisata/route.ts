import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const wisata = await prisma.wisata.findMany();
  return NextResponse.json(wisata);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newWisata = await prisma.wisata.create({ data });
  return NextResponse.json(newWisata, { status: 201 });
}
