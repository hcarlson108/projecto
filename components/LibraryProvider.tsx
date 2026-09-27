"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createTrack, readDuration } from "@/lib/audio-utils";
import type { AlbumArt, Track } from "@/types/track";

type Library = {
  tracks: Track[];
  albumArt: AlbumArt | null;
  addTracks: (files: File[]) => void;
  removeTrack: (id: string) => void;
  setAlbumArt: (file: File | null) => void;
};

const LibraryContext = createContext<Library | null>(null);

/**
 * Holds the uploaded tracks and album art for the whole app, so they survive
 * navigating from the upload screen to the preview screen. Object URLs are
 * revoked only when an item is removed or replaced; a full page reload frees
 * them anyway.
 */
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albumArt, setAlbumArtState] = useState<AlbumArt | null>(null);

  function addTracks(files: File[]) {
    const added = files.map(createTrack);
    setTracks((prev) => [...prev, ...added]);

    for (const track of added) {
      readDuration(track.url).then((duration) =>
        setTracks((prev) =>
          prev.map((t) => (t.id === track.id ? { ...t, duration } : t))
        )
      );
    }
  }

  function removeTrack(id: string) {
    const track = tracks.find((t) => t.id === id);
    if (track) URL.revokeObjectURL(track.url);
    setTracks((prev) => prev.filter((t) => t.id !== id));
  }

  function setAlbumArt(file: File | null) {
    if (albumArt) URL.revokeObjectURL(albumArt.url);
    setAlbumArtState(file ? { file, url: URL.createObjectURL(file) } : null);
  }

  return (
    <LibraryContext.Provider
      value={{ tracks, albumArt, addTracks, removeTrack, setAlbumArt }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const library = useContext(LibraryContext);
  if (!library) throw new Error("useLibrary must be used within LibraryProvider");
  return library;
}
