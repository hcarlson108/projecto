export type Platform = {
  id: string;
  name: string;
  /** Brand accent, used for the picker swatch. */
  color: string;
  /** False until the platform has a skin component. */
  available: boolean;
};

export const platforms: Platform[] = [
  { id: "spotify", name: "Spotify", color: "#1DD75F", available: true },
  { id: "apple-music", name: "Apple Music", color: "#FA2D48", available: true },
  { id: "youtube-music", name: "YouTube Music", color: "#FF0000", available: false },
  { id: "tidal", name: "Tidal", color: "#000000", available: false },
  { id: "soundcloud", name: "SoundCloud", color: "#FF5500", available: false },
  { id: "amazon-music", name: "Amazon Music", color: "#25D1DA", available: false },
];

export function getPlatform(id: string | undefined) {
  return platforms.find((p) => p.id === id && p.available);
}
