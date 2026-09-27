"use client";

import type { CSSProperties } from "react";
import { useLibrary } from "@/components/LibraryProvider";
import AlbumView from "./spotify/AlbumView";
import ArtistView from "./spotify/ArtistView";
import PlayerBar from "./spotify/PlayerBar";
import { DEFAULT_ACCENT, GREEN } from "./spotify/shared";

export type SpotifyView = "artist" | "album";

export default function SpotifySkin({ view }: { view: SpotifyView }) {
  const { albumArt, artistHeader } = useLibrary();
  // The artist page takes its colour from the header, like Spotify does.
  const image = view === "artist" ? (artistHeader ?? albumArt) : albumArt;

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
      {view === "album" ? <AlbumView /> : <ArtistView />}
      <PlayerBar />
    </div>
  );
}
