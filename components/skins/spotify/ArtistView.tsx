"use client";

import { useState } from "react";
import { displayArtist, useLibrary } from "@/components/LibraryProvider";
import { MoreIcon, ShuffleIcon, VerifiedIcon } from "@/components/icons";
import { formatDuration } from "@/lib/audio-utils";
import { byNewest, effectiveType, popularTracks } from "@/lib/releases";
import Link from "next/link";
import ReleaseTile from "./ReleaseTile";
import {
  DISCOGRAPHY_HREF,
  AccentFade,
  Cover,
  Decoration,
  GreenPlayButton,
  TrackNumber,
  placeholderListeners,
  placeholderPlays,
} from "./shared";

const POPULAR_COLLAPSED = 5;

/**
 * Like Spotify, the artist page shows a single row of releases (as many as
 * fit: 2 / 3 / 5 / 6 columns) and "Show all" opens the full discography.
 */
function oneRow(index: number) {
  if (index < 2) return "";
  if (index === 2) return "max-sm:hidden";
  if (index < 5) return "max-lg:hidden";
  if (index === 5) return "max-xl:hidden";
  return "hidden";
}

const filters = ["Popular releases", "Albums", "Singles and EPs"] as const;
type Filter = (typeof filters)[number];

export default function ArtistView() {
  const {
    releases,
    tracks,
    artist,
    artistHeader,
    releaseOf,
    currentId,
    isPlaying,
    isContextPlaying,
    togglePlay,
    togglePlayContext,
  } = useLibrary();
  const [expanded, setExpanded] = useState(false);
  const [following, setFollowing] = useState(false);
  const [filter, setFilter] = useState<Filter>("Popular releases");

  const artistName = displayArtist(artist);
  const banner = artistHeader ?? releases.find((r) => r.art)?.art;
  const popular = popularTracks(tracks);
  const shownPopular = popular.slice(
    0,
    expanded ? popular.length : POPULAR_COLLAPSED
  );
  // Releases with no tracks yet aren't "out", so they stay off the page.
  const discography = byNewest(releases.filter((r) => r.tracks.length > 0))
    .filter(
      (r) =>
        filter === "Popular releases" ||
        (filter === "Albums"
          ? effectiveType(r) === "Album"
          : effectiveType(r) !== "Album")
    );

  return (
    <>
      {/* Artist banner: the uploaded header, or a cover standing in. */}
      <header className="relative flex h-72 items-end overflow-hidden sm:h-80 lg:h-96 xl:h-[28rem]">
        {banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner.url}
            alt=""
            className="absolute inset-0 size-full object-cover object-[center_30%]"
          />
        ) : (
          <div
            style={{ backgroundColor: "rgb(var(--accent))" }}
            className="absolute inset-0 transition-[background-color] duration-1000"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/10 to-black/60" />
        <div className="relative flex min-w-0 flex-col gap-1 px-4 pb-6 sm:gap-2 sm:px-6">
          <span className="flex items-center gap-2 text-sm">
            <VerifiedIcon className="size-6 text-[#4cb3ff]" />
            Verified Artist
          </span>
          <h2 className="text-5xl font-extrabold tracking-tight wrap-break-word drop-shadow-lg sm:text-7xl lg:text-8xl">
            {artistName}
          </h2>
          <p className="text-sm sm:text-base">
            {placeholderListeners(artistName)} monthly listeners
          </p>
        </div>
      </header>

      <div className="relative px-2 pb-10 sm:px-6">
        <AccentFade />

        <div className="relative flex flex-col gap-10">
          <div className="flex items-center gap-6 px-2 pt-6 sm:gap-8 sm:px-0">
            <GreenPlayButton
              isPlaying={isContextPlaying("popular")}
              onClick={() => togglePlayContext("popular")}
              className="max-sm:order-last max-sm:ml-auto"
            />
            <Decoration>
              <ShuffleIcon className="size-7" />
            </Decoration>
            <button
              type="button"
              onClick={() => setFollowing((f) => !f)}
              className="rounded-full border border-white/40 px-4 py-1.5 text-sm font-bold transition hover:scale-105 hover:border-white"
            >
              {following ? "Following" : "Follow"}
            </button>
            <Decoration>
              <MoreIcon className="size-7" />
            </Decoration>
          </div>

          <section className="flex flex-col gap-3">
            <h3 className="px-2 text-2xl font-bold sm:px-0">Popular</h3>
            <ol className="flex flex-col">
              {shownPopular.map((track, i) => {
                const isCurrent = track.id === currentId;
                const showPause = isCurrent && isPlaying;
                const plays = placeholderPlays(i);
                return (
                  <li key={track.id}>
                    <button
                      type="button"
                      onClick={() => togglePlay(track.id, "popular")}
                      aria-label={`${showPause ? "Pause" : "Play"} ${track.title}`}
                      className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-white/10 sm:grid-cols-[1.5rem_2.5rem_1fr_8rem_4rem] sm:gap-4 sm:px-4"
                    >
                      <TrackNumber
                        index={i}
                        isCurrent={isCurrent}
                        showPause={showPause}
                      />
                      <Cover
                        url={releaseOf(track.id)?.art?.url}
                        className="size-10 rounded"
                      />
                      <span className="flex min-w-0 flex-col">
                        <span
                          className={`truncate text-base ${
                            isCurrent ? "text-(--green)" : "text-white"
                          }`}
                        >
                          {track.title}
                        </span>
                        <span className="truncate text-sm text-white/60 sm:hidden">
                          {plays}
                        </span>
                      </span>
                      <span className="hidden text-right text-sm tabular-nums text-white/60 sm:block">
                        {plays}
                      </span>
                      <span className="hidden text-right text-sm tabular-nums text-white/60 sm:block">
                        {formatDuration(track.duration)}
                      </span>
                      <MoreIcon className="size-5 text-white/60 sm:hidden" />
                    </button>
                  </li>
                );
              })}
            </ol>
            {popular.length > POPULAR_COLLAPSED && (
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                aria-expanded={expanded}
                className="self-start px-2 text-sm font-bold text-white/60 transition-colors hover:text-white sm:px-4"
              >
                {expanded ? "Show less" : "See more"}
              </button>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between px-2 sm:px-0">
              <h3 className="text-2xl font-bold">Discography</h3>
              <Link
                href={DISCOGRAPHY_HREF}
                className="text-sm font-bold text-white/60 transition-colors hover:text-white hover:underline"
              >
                Show all
              </Link>
            </div>
            <div className="flex gap-2 overflow-x-auto px-2 sm:px-0">
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${
                    filter === f
                      ? "bg-white text-black"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {discography.length > 0 ? (
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                {discography.map((release, i) => (
                  <ReleaseTile
                    key={release.id}
                    release={release}
                    className={oneRow(i)}
                  />
                ))}
              </div>
            ) : (
              <p className="px-2 text-sm text-white/60 sm:px-0">
                No {filter.toLowerCase()} yet.
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
