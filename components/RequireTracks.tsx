"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLibrary } from "@/components/LibraryProvider";

/**
 * Uploads live only in memory, so landing on /preview directly or after a
 * refresh leaves nothing to show. Send the user back to upload instead.
 */
export default function RequireTracks({ children }: { children: ReactNode }) {
  const { tracks } = useLibrary();
  if (tracks.length > 0) return children;

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-foreground/60">
        No tracks yet. Uploads are cleared when the page is refreshed.
      </p>
      <Link
        href="/"
        className="flex min-h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:bg-foreground/85 active:scale-[0.98]"
      >
        Upload tracks
      </Link>
    </div>
  );
}
