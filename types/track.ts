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
};
