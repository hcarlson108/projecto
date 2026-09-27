"use client";

import Link from "next/link";
import { useState } from "react";
import { displayArtist, useLibrary } from "@/components/LibraryProvider";
import { ChevronLeftIcon } from "@/components/icons";
import { byNewest, effectiveType } from "@/lib/releases";
import ReleaseTile from "./ReleaseTile";
import { ARTIST_HREF, AccentFade } from "./shared";

const filters = ["All", "Albums", "Singles and EPs"] as const;
type Filter = (typeof filters)[number];

/** Every release by the artist, newest first ("Show all" on the artist page). */
export default function DiscographyView() {
  const { releases, artist } = useLibrary();
  const [filter, setFilter] = useState<Filter>("All");
  const artistName = displayArtist(artist);

  const released = byNewest(releases.filter((r) => r.tracks.length > 0));
  const shown = released.filter(
    (r) =>
      filter === "All" ||
      (filter === "Albums"
        ? effectiveType(r) === "Album"
        : effectiveType(r) !== "Album")
  );

  return (
    <div className="relative min-h-[32rem] px-2 pt-4 pb-10 sm:px-6 sm:pt-6">
      <AccentFade />

      <div className="relative flex flex-col gap-6">
        <header className="flex items-center gap-3 px-2 sm:px-0">
          <Link
            href={ARTIST_HREF}
            aria-label={`Back to ${artistName}`}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-black/50 text-white transition hover:scale-105 hover:bg-black/70"
          >
            <ChevronLeftIcon />
          </Link>
          <div className="min-w-0">
            <Link
              href={ARTIST_HREF}
              className="block truncate text-sm text-white/70 hover:underline"
            >
              {artistName}
            </Link>
            <h2 className="text-2xl font-bold sm:text-3xl">Discography</h2>
          </div>
        </header>

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

        {shown.length > 0 ? (
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {shown.map((release) => (
              <ReleaseTile key={release.id} release={release} />
            ))}
          </div>
        ) : (
          <p className="px-2 text-sm text-white/60 sm:px-0">
            No {filter.toLowerCase()} yet.
          </p>
        )}
      </div>
    </div>
  );
}
