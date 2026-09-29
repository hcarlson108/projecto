export type Track = {
  id: string;
  title: string;
  /** Duration in seconds; null until the audio metadata has loaded. */
  duration: number | null;
  /** Object URL from URL.createObjectURL(); revoke when the track is removed. */
  url: string;
  file: File;
  /** Featured in the artist page's "Popular" list. */
  popular: boolean;
  /** True once the browser reports it can't decode this file (e.g. .caf). */
  unplayable?: boolean;
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

export type ReleaseType = "Album" | "EP" | "Single";

export type Release = {
  id: string;
  title: string;
  /** "auto" follows Spotify's rules from the track count and length. */
  type: ReleaseType | "auto";
  /** YYYY-MM-DD; empty means today. */
  releaseDate: string;
  art: AlbumArt | null;
  tracks: Track[];
};
