import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const feedback = await prisma.feedback.findUnique({ where: { id: Number(params.id) } });
  return feedback ? NextResponse.json(feedback) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const updated = await prisma.feedback.update({ where: { id: Number(params.id) }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.feedback.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ message: "Deleted" });
}