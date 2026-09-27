export type Track = {
  id: string;
  title: string;
  /** Duration in seconds; null until the audio metadata has loaded. */
  duration: number | null;
  /** Object URL from URL.createObjectURL(); revoke when the track is removed. */
  url: string;
  file: File;
};

export type AlbumArt = {
  /** Object URL from URL.createObjectURL(); revoke when the art is replaced. */
  url: string;
  file: File;
  /** Dominant colour as "r, g, b"; null until read (or if it can't be). */
  color: string | null;
  /** The uncropped upload, so the image can be re-cropped from scratch. */
  source: File;
  /** The last crop, in source-image pixels; undefined if never cropped. */
  cropArea?: CropArea;
};

export type CropArea = { x: number; y: number; width: number; height: number };
