"use client";

import { useState, type DragEvent } from "react";
import ImageSlot from "@/components/ImageSlot";
import { displayTitle, useLibrary } from "@/components/LibraryProvider";
import TrackList from "@/components/TrackList";
import { ChevronDownIcon, TrashIcon } from "@/components/icons";
import { AUDIO_ACCEPT, isAudio, isImage } from "@/lib/audio-utils";
import { releaseType, todayISO } from "@/lib/releases";
import { useHydrated } from "@/lib/use-hydrated";
import type { Release, ReleaseType } from "@/types/track";

// One fixed height for every field, and native styling off, so iOS Safari's
// date and select controls match the text inputs instead of drawing their own
// (centred, differently sized) versions.
const fieldBase =
  "block h-11 w-full min-w-0 appearance-none rounded-lg border border-foreground/15 bg-transparent px-3 text-base transition-colors placeholder:text-foreground/40 hover:border-foreground/30 focus:border-foreground/50 sm:text-sm";
const field = `${fieldBase} text-left leading-normal`;

/**
 * A date field whose text we draw ourselves, perfectly centered, with the real
 * <input type="date"> laid invisibly on top. Every browser styles the native
 * date text differently (iOS ignores padding and alignment entirely), so this
 * is the only way it looks the same everywhere; tapping still opens the
 * native picker.
 */
function DateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const hydrated = useHydrated();
  // Empty means today; today is only known once in the browser.
  const iso = value || (hydrated ? todayISO() : "");
  const [y, m, d] = iso.split("-").map(Number);
  const label = iso
    ? new Date(y, m - 1, d).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <span className="group/date relative block">
      <span
        aria-hidden
        className={`${fieldBase} flex items-center justify-center group-hover/date:border-foreground/30 group-has-focus-visible/date:border-foreground/50 group-has-focus-visible/date:outline-2 group-has-focus-visible/date:outline-foreground`}
      >
        {label}
      </span>
      <input
        type="date"
        value={iso}
        onChange={(e) => onChange(e.target.value)}
        // Desktop browsers only open the calendar from their small icon;
        // open it from anywhere in the field.
        onClick={(e) => {
          try {
            e.currentTarget.showPicker();
          } catch {
            // Unsupported (older browsers) or already open: native behavior.
          }
        }}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
      />
    </span>
  );
}

function AudioDropZone({ release }: { release: Release }) {
  const { addTracks, setReleaseArt } = useLibrary();
  const [isDragging, setIsDragging] = useState(false);
  const [skipped, setSkipped] = useState<string[]>([]);
  const hasTracks = release.tracks.length > 0;

  function addFiles(files: File[]) {
    if (process.env.NODE_ENV === "development") {
      // Shows up in the dev server log (Next forwards browser logs), which
      // makes real-device upload problems debuggable.
      console.info(
        "[upload]",
        files.map((f) => `${f.name} type="${f.type}" ${f.size}B`).join(", ") ||
          "no files received",
      );
    }
    const audio = files.filter(isAudio);
    if (audio.length) addTracks(release.id, audio);
    // An image dropped here becomes the cover; click it to crop.
    const image = files.find(isImage);
    if (image) setReleaseArt(release.id, image);
    setSkipped(
      files.filter((f) => !isAudio(f) && f !== image).map((f) => f.name),
    );
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
          }
        }}
        onDrop={handleDrop}
        className={`flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-4 text-center transition-colors sm:flex-row sm:justify-between sm:text-left ${
          isDragging
            ? "border-foreground bg-foreground/5"
            : "border-foreground/20 hover:border-foreground/40"
        }`}
      >
        <p className="text-sm font-medium">
          <span className="pointer-coarse:hidden">Drop audio files</span>
          <span className="hidden pointer-coarse:inline">Add audio files</span>
        </p>
        {/* A <label> around the input opens the picker natively, with no
            scripted click(); the most reliable way on iOS Safari. */}
        <label className="flex min-h-10 w-full shrink-0 cursor-pointer items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition hover:bg-foreground/85 active:scale-[0.98] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-foreground sm:w-auto">
          {hasTracks ? "Add more files" : "Choose files"}
          <input
            type="file"
            accept={AUDIO_ACCEPT}
            multiple
            className="sr-only"
            onChange={(e) => {
              addFiles(Array.from(e.target.files ?? []));
              // Reset so selecting the same file again still fires onChange.
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {skipped.length > 0 && (
        <p role="status" className="text-xs text-foreground/60">
          Skipped {skipped.join(", ")}: not an audio file.
        </p>
      )}
    </div>
  );
}

export default function ReleaseCard({
  release,
  number,
}: {
  release: Release;
  number: number;
}) {
  const { releases, updateRelease, removeRelease, setReleaseArt } =
    useLibrary();
  const { tracks } = release;
  const autoType = releaseType(tracks);

  function handleRemove() {
    const title = displayTitle(release.title);
    if (
      tracks.length === 0 ||
      window.confirm(
        `Remove "${title}" and its ${tracks.length} ${
          tracks.length === 1 ? "track" : "tracks"
        }?`,
      )
    ) {
      removeRelease(release.id);
    }
  }

  return (
    <section
      aria-label={`Release ${number}: ${displayTitle(release.title)}`}
      className="flex flex-col gap-6 rounded-2xl border border-foreground/10 p-4 sm:p-6"
    >
      {/* Only worth numbering (and removing) once there's more than one. */}
      {releases.length > 1 && (
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-foreground/60">
            Release {number}
          </h3>
          <button
            type="button"
            onClick={handleRemove}
            aria-label={`Remove release ${number}`}
            className="flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-md px-2 text-sm text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <TrashIcon />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
        <ImageSlot
          label="Cover art"
          cta="Add cover"
          image={release.art}
          onChange={(file, crop) => setReleaseArt(release.id, file, crop)}
          sizeClass="aspect-square w-40 sm:w-full"
          aspect={1}
          maxWidth={1500}
          shapeLabel="Square · 1:1"
        />
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground/60">
              Title
            </span>
            <input
              value={release.title}
              onChange={(e) =>
                updateRelease(release.id, { title: e.target.value })
              }
              placeholder="Untitled"
              className={field}
            />
          </label>
          {/* Side by side from 360px; stacked on the narrowest phones. */}
          <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground/60">
                Type
              </span>
              <span className="relative">
                <select
                  value={release.type}
                  onChange={(e) =>
                    updateRelease(release.id, {
                      type: e.target.value as ReleaseType | "auto",
                    })
                  }
                  className={`${field} pr-8`}
                >
                  <option value="auto">Auto ({autoType})</option>
                  <option value="Album">Album</option>
                  <option value="EP">EP</option>
                  <option value="Single">Single</option>
                </select>
                <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-foreground/50" />
              </span>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground/60">
                Release date
              </span>
              <DateField
                value={release.releaseDate}
                onChange={(releaseDate) =>
                  updateRelease(release.id, { releaseDate })
                }
              />
            </label>
          </div>
        </div>
      </div>

      <AudioDropZone release={release} />

      <TrackList release={release} />
    </section>
  );
}
