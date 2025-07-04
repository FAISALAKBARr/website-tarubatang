import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const umkm = await prisma.uMKM.findUnique({ where: { id: Number(params.id) }, include: { owner: true } });
  return umkm ? NextResponse.json(umkm) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const updated = await prisma.uMKM.update({ where: { id: Number(params.id) }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.uMKM.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ message: "Deleted" });
}