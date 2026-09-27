"use client";

import type { CSSProperties } from "react";
import { useLibrary } from "@/components/LibraryProvider";
import AlbumView from "./spotify/AlbumView";
import ArtistView from "./spotify/ArtistView";
import PlayerBar from "./spotify/PlayerBar";
import { DEFAULT_ACCENT, GREEN } from "./spotify/shared";

/** With a releaseId it shows that release's page, otherwise the artist page. */
export default function SpotifySkin({ releaseId }: { releaseId?: string }) {
  const { releases, artistHeader } = useLibrary();
  const release = releaseId
    ? (releases.find((r) => r.id === releaseId) ?? null)
    : null;
  const firstArt = releases.find((r) => r.art)?.art ?? null;
  // The artist page takes its colour from the header, like Spotify does;
  // a release page from its own cover.
  const image = release ? release.art : (artistHeader ?? firstArt);

  return (
    <div
      style={
        {
          "--accent": image?.color ?? DEFAULT_ACCENT,
          "--green": GREEN,
        } as CSSProperties
      }
      className="w-full max-w-7xl overflow-clip bg-[#121212] text-white max-sm:w-[calc(100%+2rem)] sm:rounded-xl"
    >
      {release ? <AlbumView release={release} /> : <ArtistView />}
      <PlayerBar />
    </div>
  );
}
