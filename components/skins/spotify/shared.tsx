"use client";

import type { ReactNode } from "react";
import { MusicNoteIcon, PauseIcon, PlayIcon } from "@/components/icons";

export const GREEN = "#1dd75f";
/** Neutral grey Spotify falls back to before (or without) an album colour. */
export const DEFAULT_ACCENT = "83, 83, 83";

export const ARTIST_HREF = "/preview?platform=spotify";
export const DISCOGRAPHY_HREF = "/preview?platform=spotify&view=discography";
export const releaseHref = (id: string) =>
  `/preview?platform=spotify&release=${id}`;

/** Spotify's own album-length format: "23 min 12 sec", "1 hr 4 min". */
export function formatTotal(seconds: number) {
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h} hr ${m} min` : `${m} min ${s % 60} sec`;
}

/** Stable 32-bit hash, so placeholder stats don't change between renders. */
function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

const number = new Intl.NumberFormat("en-US");

/**
 * Uploaded files have no real stats, so the preview shows believable
 * placeholders for an independent artist. Spotify doesn't show exact counts
 * under 1,000 plays, it shows "<1,000"; so the top track just clears that
 * bar and the rest sit under it.
 */
export function placeholderPlays(rank: number) {
  return rank === 0 ? number.format(1069) : "<1,000";
}

/** Monthly listeners, which Spotify does show exactly: 100–999. */
export function placeholderListeners(artist: string) {
  return number.format(100 + (hash(`${artist}:listeners`) % 900)); // 100–999
}

export function Cover({ url, className }: { url?: string; className: string }) {
  return url ? (
    // next/image can't optimize blob: URLs, so a plain img is used.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className={`object-cover ${className}`} />
  ) : (
    <div
      className={`flex items-center justify-center bg-[#282828] text-white/40 ${className}`}
    >
      <MusicNoteIcon className="size-1/3" />
    </div>
  );
}

/**
 * Look-only control: this is a preview, so shuffle, save, download etc. are
 * drawn for authenticity but do nothing.
 */
export function Decoration({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden
      className="text-white/60 transition hover:scale-105 hover:text-white"
    >
      {children}
    </span>
  );
}

export function GreenPlayButton({
  isPlaying,
  onClick,
  className = "",
}: {
  isPlaying: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPlaying ? "Pause" : "Play"}
      className={`flex size-14 shrink-0 items-center justify-center rounded-full bg-(--green) text-black shadow-[0_8px_16px_rgba(0,0,0,0.3)] transition hover:scale-105 hover:brightness-110 active:scale-95 ${className}`}
    >
      {isPlaying ? (
        <PauseIcon className="size-6" />
      ) : (
        <PlayIcon className="size-6" />
      )}
    </button>
  );
}

/** Album colour under the header, fading out behind the page content. */
export function AccentFade() {
  return (
    <div
      aria-hidden
      style={{
        backgroundColor: "rgb(var(--accent))",
        maskImage: "linear-gradient(rgba(0, 0, 0, 0.45), transparent)",
      }}
      className="absolute inset-x-0 top-0 h-80 transition-[background-color] duration-1000"
    />
  );
}

/** Track number that turns into play/pause on hover or while playing. */
export function TrackNumber({
  index,
  isCurrent,
  showPause,
}: {
  index: number;
  isCurrent: boolean;
  showPause: boolean;
}) {
  return (
    <span className="hidden justify-end text-white/60 sm:flex">
      {showPause ? (
        <PauseIcon className="size-3.5 text-white" />
      ) : (
        <>
          <span
            className={`tabular-nums group-hover:hidden ${
              isCurrent ? "text-(--green)" : ""
            }`}
          >
            {index + 1}
          </span>
          <PlayIcon className="hidden size-3.5 text-white group-hover:block" />
        </>
      )}
    </span>
  );
}

/** Seek bar: a styled track with an invisible native range on top. */
export function ProgressBar({
  value,
  max,
  onSeek,
  className = "",
  interactive = true,
}: {
  value: number;
  max: number;
  onSeek: (seconds: number) => void;
  className?: string;
  /** False for a display-only bar (like the phone mini player's). */
  interactive?: boolean;
}) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div
      className={`group relative flex h-3 flex-1 items-center rounded-full has-focus-visible:outline-2 has-focus-visible:outline-white ${className}`}
    >
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/30">
        <div
          className="h-full rounded-full bg-white group-hover:bg-(--green)"
          style={{ width: `${percent}%` }}
        />
      </div>
      {interactive && (
        <>
          {/* Invisible native range on top gives dragging, clicking and
              keyboard seeking for free. */}
          <input
            type="range"
            min={0}
            max={max || 0}
            step={0.1}
            value={value}
            onChange={(e) => onSeek(Number(e.target.value))}
            aria-label="Seek"
            className="absolute inset-0 w-full cursor-pointer opacity-0"
          />
        </>
      )}
    </div>
  );
}
