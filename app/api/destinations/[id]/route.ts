import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const wisata = await prisma.wisata.findUnique({ where: { id: Number(params.id) } });
  return wisata ? NextResponse.json(wisata) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const updated = await prisma.wisata.update({ where: { id: Number(params.id) }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.wisata.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ message: "Deleted" });
}
