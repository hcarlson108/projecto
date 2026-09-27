import type { Track } from "@/types/track";

const AUDIO_EXTENSIONS = ["mp3", "m4a", "aac", "wav", "aif", "aiff", "flac", "ogg", "opus"];
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"];

const extension = (file: File) =>
  file.name.split(".").pop()?.toLowerCase() ?? "";

// iOS often reports an empty or generic type for files from the Files app or
// iCloud, so fall back to the extension rather than silently dropping them.
export const isAudio = (file: File) =>
  file.type.startsWith("audio/") || AUDIO_EXTENSIONS.includes(extension(file));
export const isImage = (file: File) =>
  file.type.startsWith("image/") || IMAGE_EXTENSIONS.includes(extension(file));

/**
 * For <input accept>: listing extensions as well as the MIME wildcard stops
 * iOS from greying out files whose type it doesn't recognise.
 */
export const AUDIO_ACCEPT = [
  "audio/*",
  ...AUDIO_EXTENSIONS.map((e) => `.${e}`),
].join(",");
export const IMAGE_ACCEPT = [
  "image/*",
  ...IMAGE_EXTENSIONS.map((e) => `.${e}`),
].join(",");

// A counter rather than crypto.randomUUID(), which is unavailable over plain
// http (e.g. testing the dev server from a phone on the LAN).
let nextId = 0;

/**
 * Strips the extension and a leading track number: "01 - My Song.mp3",
 * "01 My Song.mp3" and "1. My Song.mp3" all become "My Song". A lone single
 * digit is kept, so "7 Rings.mp3" stays "7 Rings".
 */
export function titleFromFileName(name: string) {
  const base = name.replace(/\.[^.]+$/, "");
  const withoutNumber = base.replace(/^(\d{1,3}\s*[-_.]|\d{2,3}\s)\s*/, "");
  return (withoutNumber || base).replace(/_/g, " ").trim();
}

/** Wraps a file in a Track with a playable object URL. Duration loads later. */
export function createTrack(file: File): Track {
  return {
    id: `track-${nextId++}`,
    title: titleFromFileName(file.name),
    duration: null,
    url: URL.createObjectURL(file),
    file,
    popular: false,
  };
}

/** Resolves with the duration in seconds, or null if it can't be read. */
export function readDuration(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () =>
      resolve(Number.isFinite(audio.duration) ? audio.duration : null);
    audio.onerror = () => resolve(null);
    audio.src = url;
  });
}

/** 245.3 -> "4:05" */
export function formatDuration(seconds: number | null) {
  if (seconds === null) return "–:––";
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
