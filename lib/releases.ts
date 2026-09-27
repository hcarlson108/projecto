import type { Release, ReleaseType, Track } from "@/types/track";

/** How many tracks the artist page's "Popular" list shows when expanded. */
export const POPULAR_LIMIT = 10;

/** Spotify's release rules: 1–3 tracks under 30 min is a single, 4–6 an EP. */
export function releaseType(tracks: Track[]): ReleaseType {
  const minutes = tracks.reduce((sum, t) => sum + (t.duration ?? 0), 0) / 60;
  if (minutes < 30 && tracks.length <= 3) return "Single";
  if (minutes < 30 && tracks.length <= 6) return "EP";
  return "Album";
}

export function effectiveType(release: Release): ReleaseType {
  return release.type === "auto" ? releaseType(release.tracks) : release.type;
}

/** Today as YYYY-MM-DD in the user's own timezone. */
export function todayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Parsed as a local date, so "2026-01-01" doesn't slip to Dec 31 in the US. */
export function releaseDateOf(release: Release) {
  const [y, m, d] = (release.releaseDate || todayISO()).split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Newest first, like a streaming service's discography. */
export function byNewest(releases: Release[]) {
  return [...releases].sort(
    (a, b) => releaseDateOf(b).getTime() - releaseDateOf(a).getTime()
  );
}

/**
 * The artist page's "Popular" list: starred tracks first (in upload order),
 * topped up with the rest so there's always something to show.
 */
export function popularTracks(tracks: Track[]) {
  const starred = tracks.filter((t) => t.popular);
  const rest = tracks.filter((t) => !t.popular);
  return [...starred, ...rest].slice(0, POPULAR_LIMIT);
}
