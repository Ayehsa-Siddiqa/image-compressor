import type { BlogImage } from "@/content/blogs";
import { uploadBlogImage } from "@/lib/admin/actions";
import { MAX_IMAGE_BYTES } from "@/lib/blog/limits";

/** Uploads an image to blog storage and returns its public URL and pixel size. */
export async function uploadImageFile(file: File): Promise<{ image?: BlogImage; error?: string }> {
  if (file.size > MAX_IMAGE_BYTES) return { error: "Images can be up to 4 MB. Compress it on the home page first." };
  let size: { width: number; height: number };
  try {
    size = await measure(file);
  } catch {
    return { error: "Couldn't read this image. Try a JPG, PNG or WebP." };
  }
  const data = new FormData();
  data.set("file", file);
  data.set("width", String(size.width));
  data.set("height", String(size.height));
  return uploadBlogImage(data);
}

function measure(file: File): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  return img
    .decode()
    .then(() => ({ width: img.naturalWidth, height: img.naturalHeight }))
    .finally(() => URL.revokeObjectURL(url));
}
