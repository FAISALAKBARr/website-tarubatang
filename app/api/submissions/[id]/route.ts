import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = params;

  try {
    const submission = await prisma.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(submission, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}
