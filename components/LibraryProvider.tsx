"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createTrack, readDuration } from "@/lib/audio-utils";
import { readAccentColor } from "@/lib/color";
import type { AlbumArt, CropArea, Track } from "@/types/track";

type Library = {
  tracks: Track[];
  albumArt: AlbumArt | null;
  /** Wide banner for the artist page; skins fall back to the album art. */
  artistHeader: AlbumArt | null;
  /** As typed; empty strings mean "not set". Use displayTitle/displayArtist. */
  albumTitle: string;
  artist: string;
  addTracks: (files: File[]) => void;
  removeTrack: (id: string) => void;
  /** Moves a track to where another currently sits (drag-and-drop). */
  moveTrack: (id: string, overId: string) => void;
  setAlbumArt: (file: File | null, crop?: ImageCrop) => void;
  setArtistHeader: (file: File | null, crop?: ImageCrop) => void;
  setAlbumTitle: (title: string) => void;
  setArtist: (artist: string) => void;

  /** The loaded track, whether playing or paused. */
  currentId: string | null;
  isPlaying: boolean;
  /** Playback position of the current track, in seconds. */
  currentTime: number;
  togglePlay: (id: string) => void;
  /** Plays from the first track, or toggles whatever is loaded. */
  togglePlayAll: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (seconds: number) => void;
};

export const displayTitle = (title: string) => title.trim() || "Untitled";
export const displayArtist = (artist: string) =>
  artist.trim() || "Unknown Artist";

/** Passed with a cropped image: the original upload and the area kept. */
export type ImageCrop = { source: File; cropArea: CropArea };

const LibraryContext = createContext<Library | null>(null);

/**
 * Holds the uploaded tracks, album details and the audio player for the whole
 * app, so they survive navigating from the upload screen to the preview
 * screen. Object URLs are revoked only when an item is removed or replaced; a
 * full page reload frees them anyway.
 */
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albumArt, setAlbumArtState] = useState<AlbumArt | null>(null);
  const [artistHeader, setArtistHeaderState] = useState<AlbumArt | null>(
    null
  );
  const [albumTitle, setAlbumTitle] = useState("");
  const [artist, setArtist] = useState("");

  // One shared, hidden <audio> element: starting a track stops the previous one.
  const audio = useRef<HTMLAudioElement>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

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

  function moveTrack(id: string, overId: string) {
    setTracks((prev) => {
      const from = prev.findIndex((t) => t.id === id);
      const to = prev.findIndex((t) => t.id === overId);
      if (from < 0 || to < 0 || from === to) return prev;
      const next = [...prev];
      next.splice(to, 0, ...next.splice(from, 1));
      return next;
    });
  }

  function stop() {
    const el = audio.current;
    if (el) {
      el.pause();
      el.removeAttribute("src");
    }
    setCurrentId(null);
    setCurrentTime(0);
  }

  function removeTrack(id: string) {
    if (id === currentId) stop();
    const track = tracks.find((t) => t.id === id);
    if (track) URL.revokeObjectURL(track.url);
    setTracks((prev) => prev.filter((t) => t.id !== id));
  }

  /** Swaps an image, freeing the old object URL, then reads its colour. */
  function replaceImage(
    prev: AlbumArt | null,
    file: File | null,
    crop: ImageCrop | undefined,
    set: React.Dispatch<React.SetStateAction<AlbumArt | null>>
  ) {
    if (prev) URL.revokeObjectURL(prev.url);
    if (!file) return set(null);

    const url = URL.createObjectURL(file);
    set({
      file,
      url,
      color: null,
      source: crop?.source ?? file,
      cropArea: crop?.cropArea,
    });
    readAccentColor(url).then((color) =>
      set((current) => (current?.url === url ? { ...current, color } : current))
    );
  }

  function setAlbumArt(file: File | null, crop?: ImageCrop) {
    replaceImage(albumArt, file, crop, setAlbumArtState);
  }

  function setArtistHeader(file: File | null, crop?: ImageCrop) {
    replaceImage(artistHeader, file, crop, setArtistHeaderState);
  }

  function play(track: Track) {
    const el = audio.current;
    if (!el) return;
    if (track.id !== currentId) {
      el.src = track.url;
      setCurrentId(track.id);
      setCurrentTime(0);
    }
    // Rejects with AbortError if another track is picked before this starts.
    el.play().catch(() => {});
  }

  function togglePlay(id: string) {
    const track = tracks.find((t) => t.id === id);
    if (!track) return;
    if (id === currentId && audio.current && !audio.current.paused) {
      audio.current.pause();
    } else {
      play(track);
    }
  }

  function togglePlayAll() {
    const id = currentId ?? tracks[0]?.id;
    if (id) togglePlay(id);
  }

  function playNext() {
    const i = tracks.findIndex((t) => t.id === currentId);
    const next = tracks[i + 1];
    if (next) play(next);
    else stop();
  }

  function playPrevious() {
    const el = audio.current;
    const i = tracks.findIndex((t) => t.id === currentId);
    // Like most players: restart the track unless we're near its start.
    if (el && (el.currentTime > 3 || i <= 0)) {
      el.currentTime = 0;
      setCurrentTime(0);
    } else {
      play(tracks[i - 1]);
    }
  }

  function seek(seconds: number) {
    if (!audio.current) return;
    audio.current.currentTime = seconds;
    setCurrentTime(seconds);
  }

  return (
    <LibraryContext.Provider
      value={{
        tracks,
        albumArt,
        artistHeader,
        albumTitle,
        artist,
        addTracks,
        removeTrack,
        moveTrack,
        setAlbumArt,
        setArtistHeader,
        setAlbumTitle,
        setArtist,
        currentId,
        isPlaying,
        currentTime,
        togglePlay,
        togglePlayAll,
        playNext,
        playPrevious,
        seek,
      }}
    >
      {children}
      <audio
        ref={audio}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={playNext}
      />
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const library = useContext(LibraryContext);
  if (!library) throw new Error("useLibrary must be used within LibraryProvider");
  return library;
}
