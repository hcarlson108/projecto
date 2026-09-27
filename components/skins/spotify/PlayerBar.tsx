"use client";

import {
  useCallback,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { displayArtist, useLibrary } from "@/components/LibraryProvider";
import {
  NextIcon,
  PauseIcon,
  PlayIcon,
  PlusCircleIcon,
  PreviousIcon,
  RepeatIcon,
  ShuffleIcon,
} from "@/components/icons";
import { formatDuration } from "@/lib/audio-utils";
import NowPlaying, { PHONE_QUERY } from "./NowPlaying";
import { Cover, Decoration, ProgressBar } from "./shared";


export default function PlayerBar() {
  const {
    tracks,
    releaseOf,
    artist,
    currentId,
    isPlaying,
    currentTime,
    toggleCurrent,
    playNext,
    playPrevious,
    seek,
  } = useLibrary();
  const [expanded, setExpanded] = useState(false);
  // Stable, so the sheet's open/scroll-lock effect runs once, not on every
  // timeupdate re-render.
  const collapse = useCallback(() => setExpanded(false), []);

  const current = tracks.find((t) => t.id === currentId);
  if (!current) return null;

  /** Phones: tapping the mini player (outside its controls) opens it up. */
  function openOnPhone(e: MouseEvent) {
    const target = e.target as Element;
    const onControl = target.closest("button:not([data-expand]), input");
    const phone = window.matchMedia(PHONE_QUERY).matches;
    if (process.env.NODE_ENV === "development") {
      // Forwarded to the dev server log, for debugging on a real phone.
      console.info(
        `[now-playing] tap on <${target.tagName.toLowerCase()}> control=${Boolean(onControl)} phone=${phone} width=${window.innerWidth}`
      );
    }
    if (onControl || !phone) return;
    setExpanded(true);
  }

  const artistName = displayArtist(artist);
  const art = releaseOf(current.id)?.art;
  const duration = current.duration ?? 0;

  return (
    <div
      style={
        {
          "--mini-bg": "color-mix(in srgb, rgb(var(--accent)) 55%, black)",
        } as CSSProperties
      }
      onClick={openOnPhone}
      className="sticky bottom-0 z-20 grid touch-manipulation select-none max-sm:cursor-pointer grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 bg-black px-3 py-2 transition-[background-color] duration-1000 max-sm:mx-2 max-sm:mb-2 max-sm:rounded-lg max-sm:bg-(--mini-bg) sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] sm:px-4 sm:py-3"
    >
      <div className="flex min-w-0 items-center gap-3">
        {/* A real button so keyboard and screen-reader users can open the
            phone view too; the bar's own click handler does the opening. */}
        <button
          type="button"
          data-expand
          aria-label={`Open now playing: ${current.title}`}
          aria-haspopup="dialog"
          className="flex min-w-0 items-center gap-3 text-left sm:pointer-events-none"
        >
          <Cover
            url={art?.url}
            className="size-10 shrink-0 rounded sm:size-12 lg:size-14"
          />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm">{current.title}</span>
            <span className="truncate text-xs text-white/60">{artistName}</span>
          </span>
        </button>
        <span className="hidden lg:block">
          <Decoration>
            <PlusCircleIcon />
          </Decoration>
        </span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-5">
          <span className="hidden sm:block">
            <Decoration>
              <ShuffleIcon />
            </Decoration>
          </span>
          <button
            type="button"
            onClick={playPrevious}
            aria-label="Previous"
            className="hidden text-white/70 transition-colors hover:text-white sm:block"
          >
            <PreviousIcon />
          </button>
          <button
            type="button"
            onClick={toggleCurrent}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex size-9 items-center justify-center rounded-full text-white transition hover:scale-105 active:scale-95 sm:size-8 sm:bg-white sm:text-black"
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            type="button"
            onClick={playNext}
            aria-label="Next"
            className="hidden text-white/70 transition-colors hover:text-white sm:block"
          >
            <NextIcon />
          </button>
          <span className="hidden sm:block">
            <Decoration>
              <RepeatIcon />
            </Decoration>
          </span>
        </div>
        <div className="hidden w-full items-center gap-2 text-xs tabular-nums text-white/60 sm:flex">
          <span className="w-10 text-right">{formatDuration(currentTime)}</span>
          <ProgressBar value={currentTime} max={duration} onSeek={seek} />
          <span className="w-10">
            -{formatDuration(Math.max(duration - currentTime, 0))}
          </span>
        </div>
      </div>

      {/* Mobile: thin display-only progress line, as in Spotify's app, so a
          tap anywhere on the mini player opens it instead of seeking. */}
      <div className="col-span-2 flex sm:hidden">
        <ProgressBar
          value={currentTime}
          max={duration}
          onSeek={seek}
          interactive={false}
          className="pointer-events-none h-1"
        />
      </div>
      {expanded && <NowPlaying onClose={collapse} />}
    </div>
  );
}
