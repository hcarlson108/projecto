"use client";

import Link from "next/link";
import {
  displayArtist,
  displayTitle,
  useLibrary,
} from "@/components/LibraryProvider";
import {
  ChevronLeftIcon,
  ClockIcon,
  DownloadCircleIcon,
  ListIcon,
  MoreIcon,
  PlusCircleIcon,
  ShuffleIcon,
} from "@/components/icons";
import { formatDuration } from "@/lib/audio-utils";
import { byNewest, effectiveType, releaseDateOf } from "@/lib/releases";
import type { Release } from "@/types/track";
import ReleaseTile from "./ReleaseTile";
import {
  ARTIST_HREF,
  AccentFade,
  Cover,
  Decoration,
  GreenPlayButton,
  TrackNumber,
  formatTotal,
} from "./shared";

export default function AlbumView({ release }: { release: Release }) {
  const {
    releases,
    artist,
    currentId,
    isPlaying,
    isContextPlaying,
    togglePlay,
    togglePlayContext,
  } = useLibrary();

  const context = `release:${release.id}` as const;
  const { tracks } = release;
  const title = displayTitle(release.title);
  const artistName = displayArtist(artist);
  const type = effectiveType(release);
  const total = tracks.reduce((sum, t) => sum + (t.duration ?? 0), 0);
  const date = releaseDateOf(release);
  const year = date.getFullYear();
  const moreBy = byNewest(
    releases.filter((r) => r.id !== release.id && r.tracks.length > 0)
  );

  return (
    <>
      {/* Album colour, darkening toward the bottom. background-color (not a
          gradient) carries the colour so it can fade when the colour loads. */}
      <header
        style={{
          backgroundColor: "rgb(var(--accent))",
          backgroundImage: "linear-gradient(transparent, rgba(0, 0, 0, 0.5))",
        }}
        className="relative flex flex-col items-center gap-4 px-4 pt-14 pb-6 transition-[background-color] duration-1000 sm:flex-row sm:items-end sm:gap-6 sm:px-6 sm:pt-20"
      >
        <Link
          href={ARTIST_HREF}
          aria-label={`Back to ${artistName}`}
          className="absolute top-3 left-3 flex size-8 items-center justify-center rounded-full bg-black/50 text-white transition hover:scale-105 hover:bg-black/70 sm:top-4 sm:left-4"
        >
          <ChevronLeftIcon />
        </Link>
        <Cover
          url={release.art?.url}
          className="size-52 shrink-0 rounded shadow-[0_4px_60px_rgba(0,0,0,0.5)] sm:size-48 lg:size-58"
        />
        <div className="flex min-w-0 flex-col gap-2 self-stretch sm:self-auto">
          <span className="hidden text-sm font-medium sm:block">{type}</span>
          <h2 className="text-2xl font-extrabold tracking-tight wrap-break-word sm:text-5xl lg:text-6xl xl:text-8xl">
            {title}
          </h2>
          {/* Desktop: one line. Mobile (like the app): artist, then details. */}
          <div className="flex flex-col gap-1.5 text-sm text-white/70 sm:flex-row sm:items-center sm:gap-1">
            <Link
              href={ARTIST_HREF}
              className="flex min-w-0 items-center gap-2 self-start sm:self-auto"
            >
              <Cover
                url={release.art?.url}
                className="size-6 shrink-0 rounded-full"
              />
              <span className="truncate font-bold text-white hover:underline">
                {artistName}
              </span>
            </Link>
            <span>
              <span className="sm:hidden">{type} • </span>
              <span className="hidden sm:inline">• </span>
              {year} • {tracks.length} {tracks.length === 1 ? "song" : "songs"}
              {total > 0 && `, ${formatTotal(total)}`}
            </span>
          </div>
        </div>
      </header>

      <div className="relative px-2 pb-8 sm:px-6">
        <AccentFade />

        <div className="relative">
          <div className="flex items-center gap-6 px-2 py-6 sm:gap-8 sm:px-0">
            <GreenPlayButton
              isPlaying={isContextPlaying(context)}
              onClick={() => togglePlayContext(context)}
              className="max-sm:order-last max-sm:ml-auto"
            />
            <Decoration>
              <ShuffleIcon className="size-7" />
            </Decoration>
            <Decoration>
              <PlusCircleIcon className="size-7" />
            </Decoration>
            <Decoration>
              <DownloadCircleIcon className="size-7" />
            </Decoration>
            <Decoration>
              <MoreIcon className="size-7" />
            </Decoration>
            <span
              aria-hidden
              className="ml-auto hidden items-center gap-2 text-sm text-white/60 sm:flex"
            >
              List <ListIcon />
            </span>
          </div>

          <div className="hidden grid-cols-[1.5rem_1fr_auto] gap-4 border-b border-white/10 px-4 pb-2 text-sm text-white/60 sm:grid">
            <span className="text-right">#</span>
            <span>Title</span>
            <ClockIcon className="mr-6 size-4" />
          </div>

          <ol className="flex flex-col pt-2">
            {tracks.map((track, i) => {
              const isCurrent = track.id === currentId;
              const showPause = isCurrent && isPlaying;
              return (
                <li key={track.id}>
                  <button
                    type="button"
                    onClick={() => togglePlay(track.id, context)}
                    aria-label={`${showPause ? "Pause" : "Play"} ${track.title}`}
                    className="group grid w-full grid-cols-[1fr_auto] items-center gap-4 rounded-md px-2 py-2 text-left transition-colors hover:bg-white/10 sm:grid-cols-[1.5rem_1fr_auto] sm:px-4"
                  >
                    <TrackNumber
                      index={i}
                      isCurrent={isCurrent}
                      showPause={showPause}
                    />
                    <span className="flex min-w-0 flex-col">
                      <span
                        className={`truncate text-base ${
                          isCurrent ? "text-(--green)" : "text-white"
                        }`}
                      >
                        {track.title}
                      </span>
                      <span className="truncate text-sm text-white/60 group-hover:text-white">
                        {artistName}
                      </span>
                    </span>
                    <span className="mr-6 hidden text-sm tabular-nums text-white/60 sm:block">
                      {formatDuration(track.duration)}
                    </span>
                    <MoreIcon className="size-5 text-white/60 sm:hidden" />
                  </button>
                </li>
              );
            })}
          </ol>

          <footer className="px-2 pt-8 text-xs text-white/60 sm:px-0">
            <p className="text-sm">
              {date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p>
              © {year} {artistName}
            </p>
            <p>
              ℗ {year} {artistName}
            </p>
          </footer>

          {moreBy.length > 0 && (
            <section className="flex flex-col gap-3 pt-10">
              <div className="flex items-baseline justify-between px-2 sm:px-0">
                <h3 className="text-2xl font-bold">
                  <Link href={ARTIST_HREF} className="hover:underline">
                    More by {artistName}
                  </Link>
                </h3>
                <Link
                  href={ARTIST_HREF}
                  className="text-sm font-bold text-white/60 hover:underline"
                >
                  See discography
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                {moreBy.map((r) => (
                  <ReleaseTile key={r.id} release={r} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
