import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function deleteImages(imageUrls: string[]): Promise<void> {
  if (!imageUrls.length) return;

  try {
    // Extract file paths from URLs
    const filePaths = imageUrls
      .map((url) => {
        // Extract path after the bucket name from Supabase URL
        const urlParts = url.split("/storage/v1/object/public/media/");
        return urlParts[1] || null;
      })
      .filter((path) => path !== null);

    if (filePaths.length === 0) return;

    // Delete files from Supabase Storage
    const { error } = await supabase.storage.from("media").remove(filePaths);

    if (error) {
      console.error("Error deleting images:", error);
    } else {
      console.log(`Successfully deleted ${filePaths.length} images`);
    }
  } catch (error) {
    console.error("Error in deleteImages:", error);
  }
}

export function extractImagePath(imageUrl: string): string | null {
  try {
    const urlParts = imageUrl.split("/storage/v1/object/public/media/");
    return urlParts[1] || null;
  } catch {
    return null;
  }
}

export function isValidImageUrl(url: string): boolean {
  try {
    const validUrl = new URL(url);
    const isSupabaseUrl = validUrl.hostname.includes("supabase.co");
    const hasMediaPath = url.includes("/storage/v1/object/public/media/");
    return isSupabaseUrl && hasMediaPath;
  } catch {
    return false;
  }
}
