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
import { popularTracks } from "@/lib/releases";
import type { AlbumArt, CropArea, Release, Track } from "@/types/track";

/** Passed with a cropped image: the original upload and the area kept. */
export type ImageCrop = { source: File; cropArea: CropArea };

type ReleaseDetails = Partial<Pick<Release, "title" | "type" | "releaseDate">>;

/**
 * What the player is working through, so next/previous follow the list the
 * user started from: the artist's "Popular" list or one release.
 */
export type PlayContext = "popular" | `release:${string}`;

type Library = {
  releases: Release[];
  /** Every track across all releases, in release order. */
  tracks: Track[];
  /** As typed; empty means "not set". Use displayArtist() to show it. */
  artist: string;
  setArtist: (artist: string) => void;
  /** Wide banner for the artist page; skins fall back to the album art. */
  artistHeader: AlbumArt | null;
  setArtistHeader: (file: File | null, crop?: ImageCrop) => void;

  addRelease: () => void;
  updateRelease: (id: string, details: ReleaseDetails) => void;
  removeRelease: (id: string) => void;
  setReleaseArt: (id: string, file: File | null, crop?: ImageCrop) => void;
  releaseOf: (trackId: string) => Release | undefined;

  addTracks: (releaseId: string, files: File[]) => void;
  removeTrack: (id: string) => void;
  /** Moves a track to where another in the same release sits (drag-and-drop). */
  moveTrack: (id: string, overId: string) => void;
  /** Moves a track to the end of another release. */
  moveTrackToRelease: (id: string, releaseId: string) => void;
  togglePopular: (id: string) => void;

  /** The loaded track, whether playing or paused. */
  currentId: string | null;
  /** The list the current track was started from. */
  context: PlayContext | null;
  isPlaying: boolean;
  /** Playback position of the current track, in seconds. */
  currentTime: number;
  /** Whether this context is the one currently playing (not paused). */
  isContextPlaying: (context: PlayContext) => boolean;
  togglePlay: (id: string, context: PlayContext) => void;
  /** Plays a context from its first track, or pauses/resumes it. */
  togglePlayContext: (context: PlayContext) => void;
  /** Pauses or resumes whatever is loaded. */
  toggleCurrent: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (seconds: number) => void;
};

export const displayTitle = (title: string) => title.trim() || "Untitled";
export const displayArtist = (artist: string) =>
  artist.trim() || "Unknown Artist";

// The first release has a fixed id so server and client renders agree.
const FIRST_RELEASE_ID = "release-0";
let nextReleaseId = 1;
function newRelease(id = `release-${nextReleaseId++}`): Release {
  return {
    id,
    title: "",
    type: "auto",
    releaseDate: "",
    art: null,
    tracks: [],
  };
}

const LibraryContext = createContext<Library | null>(null);

/**
 * Holds the artist, their releases and tracks, and the audio player for the
 * whole app, so they survive navigating from the upload screen to the preview.
 * Object URLs are revoked only when an item is removed or replaced; a full
 * page reload frees them anyway.
 */
export function LibraryProvider({ children }: { children: ReactNode }) {
  // Everyone starts with one release; more are optional.
  const [releases, setReleases] = useState<Release[]>(() => [
    newRelease(FIRST_RELEASE_ID),
  ]);
  const [artist, setArtist] = useState("");
  const [artistHeader, setArtistHeaderState] = useState<AlbumArt | null>(
    null
  );

  // One shared, hidden <audio> element: starting a track stops the previous one.
  const audio = useRef<HTMLAudioElement>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [context, setContext] = useState<PlayContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const tracks = releases.flatMap((r) => r.tracks);
  const findTrack = (id: string) => tracks.find((t) => t.id === id);
  const releaseOf = (trackId: string) =>
    releases.find((r) => r.tracks.some((t) => t.id === trackId));

  /** Applies `update` to every track, across all releases. */
  function updateTracks(update: (tracks: Track[]) => Track[]) {
    setReleases((prev) =>
      prev.map((r) => {
        const tracks = update(r.tracks);
        return tracks === r.tracks ? r : { ...r, tracks };
      })
    );
  }

  function updateRelease(id: string, details: ReleaseDetails) {
    setReleases((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...details } : r))
    );
  }

  function addRelease() {
    setReleases((prev) => [...prev, newRelease()]);
  }

  function removeRelease(id: string) {
    const release = releases.find((r) => r.id === id);
    if (!release) return;
    if (release.tracks.some((t) => t.id === currentId)) stop();
    release.tracks.forEach((t) => URL.revokeObjectURL(t.url));
    if (release.art) URL.revokeObjectURL(release.art.url);
    setReleases((prev) => {
      const rest = prev.filter((r) => r.id !== id);
      return rest.length > 0 ? rest : [newRelease()];
    });
  }

  function addTracks(releaseId: string, files: File[]) {
    const added = files.map(createTrack);
    setReleases((prev) =>
      prev.map((r) =>
        r.id === releaseId ? { ...r, tracks: [...r.tracks, ...added] } : r
      )
    );

    for (const track of added) {
      readDuration(track.url).then((duration) =>
        updateTracks((list) =>
          list.some((t) => t.id === track.id)
            ? list.map((t) => (t.id === track.id ? { ...t, duration } : t))
            : list
        )
      );
    }
  }

  function removeTrack(id: string) {
    if (id === currentId) stop();
    const track = findTrack(id);
    if (track) URL.revokeObjectURL(track.url);
    updateTracks((list) =>
      list.some((t) => t.id === id) ? list.filter((t) => t.id !== id) : list
    );
  }

  function moveTrack(id: string, overId: string) {
    updateTracks((list) => {
      const from = list.findIndex((t) => t.id === id);
      const to = list.findIndex((t) => t.id === overId);
      if (from < 0 || to < 0 || from === to) return list;
      const next = [...list];
      next.splice(to, 0, ...next.splice(from, 1));
      return next;
    });
  }

  function moveTrackToRelease(id: string, releaseId: string) {
    const track = findTrack(id);
    if (!track || releaseOf(id)?.id === releaseId) return;
    setReleases((prev) =>
      prev.map((r) =>
        r.id === releaseId
          ? { ...r, tracks: [...r.tracks, track] }
          : { ...r, tracks: r.tracks.filter((t) => t.id !== id) }
      )
    );
  }

  function togglePopular(id: string) {
    updateTracks((list) =>
      list.some((t) => t.id === id)
        ? list.map((t) => (t.id === id ? { ...t, popular: !t.popular } : t))
        : list
    );
  }

  /** Revokes the old image's URL, stores the new one, then reads its colour. */
  function loadImage(
    prev: AlbumArt | null,
    file: File | null,
    crop: ImageCrop | undefined,
    store: (update: (current: AlbumArt | null) => AlbumArt | null) => void
  ) {
    if (prev) URL.revokeObjectURL(prev.url);
    if (!file) return store(() => null);

    const url = URL.createObjectURL(file);
    store(() => ({
      file,
      url,
      color: null,
      source: crop?.source ?? file,
      cropArea: crop?.cropArea,
    }));
    readAccentColor(url).then((color) =>
      store((current) =>
        current?.url === url ? { ...current, color } : current
      )
    );
  }

  function setReleaseArt(id: string, file: File | null, crop?: ImageCrop) {
    const release = releases.find((r) => r.id === id);
    loadImage(release?.art ?? null, file, crop, (update) =>
      setReleases((prev) =>
        prev.map((r) => (r.id === id ? { ...r, art: update(r.art) } : r))
      )
    );
  }

  function setArtistHeader(file: File | null, crop?: ImageCrop) {
    loadImage(artistHeader, file, crop, setArtistHeaderState);
  }

  // ---- Player ---------------------------------------------------------------

  /** Track ids for a context, read live so edits apply to the queue. */
  function contextIds(ctx: PlayContext) {
    const list =
      ctx === "popular"
        ? popularTracks(tracks)
        : (releases.find((r) => `release:${r.id}` === ctx)?.tracks ?? []);
    return list.map((t) => t.id);
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

  function play(track: Track, ctx: PlayContext) {
    const el = audio.current;
    if (!el) return;
    setContext(ctx);
    if (track.id !== currentId) {
      el.src = track.url;
      setCurrentId(track.id);
      setCurrentTime(0);
    }
    // Rejects with AbortError if another track is picked before this starts.
    el.play().catch(() => {});
  }

  function togglePlay(id: string, ctx: PlayContext) {
    const track = findTrack(id);
    if (!track) return;
    if (id === currentId && audio.current && !audio.current.paused) {
      audio.current.pause();
    } else {
      play(track, ctx);
    }
  }

  function togglePlayContext(ctx: PlayContext) {
    const id =
      context === ctx && currentId ? currentId : contextIds(ctx)[0];
    if (id) togglePlay(id, ctx);
  }

  function toggleCurrent() {
    const el = audio.current;
    if (!el || !currentId) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  }

  function isContextPlaying(ctx: PlayContext) {
    return isPlaying && context === ctx;
  }

  function step(direction: 1 | -1) {
    const ids = context ? contextIds(context) : [];
    const i = currentId ? ids.indexOf(currentId) : -1;
    const target = ids[i + direction];
    const track = target ? findTrack(target) : undefined;
    if (track && context) play(track, context);
    return Boolean(track);
  }

  function playNext() {
    if (!step(1)) stop();
  }

  function playPrevious() {
    const el = audio.current;
    // Like most players: restart the track unless we're near its start.
    if (el && el.currentTime > 3) {
      el.currentTime = 0;
      setCurrentTime(0);
    } else if (!step(-1) && el) {
      el.currentTime = 0;
      setCurrentTime(0);
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
        releases,
        tracks,
        artist,
        setArtist,
        artistHeader,
        setArtistHeader,
        addRelease,
        updateRelease,
        removeRelease,
        setReleaseArt,
        releaseOf,
        addTracks,
        removeTrack,
        moveTrack,
        moveTrackToRelease,
        togglePopular,
        currentId,
        context,
        isPlaying,
        currentTime,
        isContextPlaying,
        togglePlay,
        togglePlayContext,
        toggleCurrent,
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
