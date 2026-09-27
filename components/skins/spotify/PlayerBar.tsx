"use client";

import type { CSSProperties } from "react";
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
import { Cover, Decoration } from "./shared";

function ProgressBar({
  value,
  max,
  onSeek,
}: {
  value: number;
  max: number;
  onSeek: (seconds: number) => void;
}) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="group relative flex h-3 flex-1 items-center rounded-full has-focus-visible:outline-2 has-focus-visible:outline-white">
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/30">
        <div
          className="h-full rounded-full bg-white group-hover:bg-(--green)"
          style={{ width: `${percent}%` }}
        />
      </div>
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
    </div>
  );
}

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

  const current = tracks.find((t) => t.id === currentId);
  if (!current) return null;

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
      className="sticky bottom-0 z-20 grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 bg-black px-3 py-2 transition-[background-color] duration-1000 max-sm:mx-2 max-sm:mb-2 max-sm:rounded-lg max-sm:bg-(--mini-bg) sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] sm:px-4 sm:py-3"
    >
      <div className="flex min-w-0 items-center gap-3">
        <Cover
          url={art?.url}
          className="size-10 shrink-0 rounded sm:size-12 lg:size-14"
        />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm">{current.title}</span>
          <span className="truncate text-xs text-white/60">{artistName}</span>
        </div>
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

      {/* Mobile: thin full-width progress bar under the mini player. */}
      <div className="col-span-2 flex sm:hidden">
        <ProgressBar value={currentTime} max={duration} onSeek={seek} />
      </div>
    </div>
  );
}
