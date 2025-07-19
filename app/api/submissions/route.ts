import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

// Inisialisasi Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // pakai service_role agar bisa tulis file
);

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;
  const type = formData.get("type") as string;
  const userId = formData.get("userId") as string | null;

  const file = formData.get("file") as File | null;
  let fileUrl: string | null = null;

  if (file) {
    const fileExt = file.name.split(".").pop();
    const fileName = `submission-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: "Gagal upload file ke Supabase" }, { status: 500 });
    }

    const { data } = supabase.storage.from("media").getPublicUrl(fileName);
    fileUrl = data.publicUrl;
  }

  try {
    const submission = await prisma.submission.create({
      data: {
        name,
        email,
        message,
        type,
        response: fileUrl,
        userId: userId || undefined,
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Gagal menyimpan submission" }, { status: 500 });
  }
}
