"use client";

import Link from "next/link";
import { useLibrary } from "@/components/LibraryProvider";

/** Shown once at least one track is added; leads to the platform picker. */
export default function NextButton() {
  const { tracks } = useLibrary();
  if (tracks.length === 0) return null;

  return (
    <div className="flex w-full max-w-2xl justify-end">
      <Link
        href="/preview"
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:bg-foreground/85 active:scale-[0.98] sm:w-auto"
      >
        Next
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
