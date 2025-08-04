// // lib/supabase.ts
// import { createClient } from '@supabase/supabase-js';

// export const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility function to upload file to Supabase Storage
export const uploadFileToSupabase = async (
  file: File,
  folder: string = "umkm"
) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("media")
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("media").getPublicUrl(filePath);

  return publicUrl;
};

// Utility function to delete file from Supabase Storage
export const deleteFileFromSupabase = async (url: string) => {
  if (!url.includes("supabase")) return;

  // Extract file path from URL
  const urlParts = url.split("/storage/v1/object/public/media/");
  if (urlParts.length < 2) return;

  const filePath = urlParts[1];

  const { error } = await supabase.storage.from("media").remove([filePath]);

  if (error) {
    console.error("Error deleting file:", error);
  }
};
