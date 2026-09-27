"use client";

import Link from "next/link";
import { displayTitle, useLibrary } from "@/components/LibraryProvider";
import { PauseIcon, PlayIcon } from "@/components/icons";
import { effectiveType, releaseDateOf } from "@/lib/releases";
import type { Release } from "@/types/track";
import { Cover, releaseHref } from "./shared";

/** A discography card: cover, title, "2026 • EP", hover-to-play. */
export default function ReleaseTile({
  release,
  className = "",
}: {
  release: Release;
  className?: string;
}) {
  const { isContextPlaying, togglePlayContext } = useLibrary();
  const title = displayTitle(release.title);
  const playing = isContextPlaying(`release:${release.id}`);

  return (
    <div
      className={`group relative flex flex-col gap-2 rounded-md p-2 transition-colors hover:bg-white/10 sm:p-3 ${className}`}
    >
      <div className="relative">
        <Cover
          url={release.art?.url}
          className="aspect-square w-full rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        />
        <button
          type="button"
          onClick={() => togglePlayContext(`release:${release.id}`)}
          aria-label={playing ? `Pause ${title}` : `Play ${title}`}
          className={`absolute right-2 bottom-2 z-10 flex size-12 items-center justify-center rounded-full bg-(--green) text-black shadow-[0_8px_16px_rgba(0,0,0,0.3)] transition-all hover:scale-105 hover:brightness-110 focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 pointer-coarse:hidden ${
            playing ? "" : "translate-y-2 opacity-0"
          }`}
        >
          {playing ? (
            <PauseIcon className="size-5" />
          ) : (
            <PlayIcon className="size-5" />
          )}
        </button>
      </div>
      {/* The link's ::after stretches over the whole card, so any click on it
          opens the release; the play button sits above. */}
      <Link
        href={releaseHref(release.id)}
        className="truncate font-bold after:absolute after:inset-0 after:rounded-md"
      >
        {title}
      </Link>
      <p className="-mt-1.5 truncate text-sm text-white/60">
        {releaseDateOf(release).getFullYear()} • {effectiveType(release)}
      </p>
    </div>
  );
}
