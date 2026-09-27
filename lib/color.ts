/**
 * Average colour of an image, nudged into a range that works as a dark-UI
 * backdrop (the way Spotify tints an album header). Returns "r, g, b" so it
 * can be dropped into rgb()/rgba().
 */
export function readAccentColor(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const size = 16;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      let r = 0, g = 0, b = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }
      const n = data.length / 4;
      resolve(clampLightness(r / n, g / n, b / n));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/** Scales the colour so its brightest channel lands between 70 and 170. */
function clampLightness(r: number, g: number, b: number) {
  const max = Math.max(r, g, b, 1);
  const target = Math.min(Math.max(max, 70), 170);
  const k = target / max;
  return [r, g, b].map((c) => Math.round(Math.min(c * k, 255))).join(", ");
}
