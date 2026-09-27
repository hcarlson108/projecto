import type { CropArea } from "@/types/track";

/**
 * Cuts `area` (in source pixels) out of an image file, scaling it down so it
 * is at most `maxWidth` wide. Runs entirely in the browser via a canvas.
 * PNGs stay PNG (to keep transparency); everything else becomes JPEG.
 */
export async function cropImage(
  file: File,
  area: CropArea,
  maxWidth: number
): Promise<File> {
  // createImageBitmap applies EXIF orientation, matching what the cropper
  // showed (browsers render <img> EXIF-rotated too).
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / area.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width * scale);
  canvas.height = Math.round(area.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    bitmap,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height
  );
  bitmap.close();

  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, 0.92)
  );
  if (!blob) throw new Error("Could not crop image");

  const name = file.name.replace(/\.[^.]+$/, "") + (type === "image/png" ? ".png" : ".jpg");
  return new File([blob], name, { type });
}
