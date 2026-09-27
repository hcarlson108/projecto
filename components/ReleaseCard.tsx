"use client";

import { useRef, useState, type DragEvent } from "react";
import ImageSlot from "@/components/ImageSlot";
import { displayTitle, useLibrary } from "@/components/LibraryProvider";
import TrackList from "@/components/TrackList";
import { TrashIcon } from "@/components/icons";
import { isAudio, isImage } from "@/lib/audio-utils";
import { releaseType, todayISO } from "@/lib/releases";
import { useHydrated } from "@/lib/use-hydrated";
import type { Release, ReleaseType } from "@/types/track";

const field =
  "w-full rounded-lg border border-foreground/15 bg-transparent px-3 py-2.5 text-base transition-colors placeholder:text-foreground/40 hover:border-foreground/30 focus:border-foreground/50 sm:text-sm";

function AudioDropZone({ release }: { release: Release }) {
  const { addTracks, setReleaseArt } = useLibrary();
  const [isDragging, setIsDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const hasTracks = release.tracks.length > 0;

  function addFiles(files: File[]) {
    const audio = files.filter(isAudio);
    if (audio.length) addTracks(release.id, audio);
    // An image dropped here becomes the cover; click it to crop.
    const image = files.find(isImage);
    if (image) setReleaseArt(release.id, image);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }

  return (
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
      <div>
        <p className="text-sm font-medium">
          <span className="pointer-coarse:hidden">Drop audio files</span>
          <span className="hidden pointer-coarse:inline">Add audio files</span>
        </p>
      </div>
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="min-h-10 w-full shrink-0 rounded-full bg-foreground px-5 text-sm font-medium text-background transition hover:bg-foreground/85 active:scale-[0.98] sm:w-auto"
      >
        {hasTracks ? "Add more files" : "Choose files"}
      </button>
      <input
        ref={input}
        type="file"
        accept="audio/*"
        multiple
        hidden
        onChange={(e) => {
          addFiles(Array.from(e.target.files ?? []));
          // Reset so selecting the same file again still fires onChange.
          e.target.value = "";
        }}
      />
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
  const hydrated = useHydrated();
  const { tracks } = release;
  const autoType = releaseType(tracks);

  function handleRemove() {
    const title = displayTitle(release.title);
    if (
      tracks.length === 0 ||
      window.confirm(
        `Remove "${title}" and its ${tracks.length} ${
          tracks.length === 1 ? "track" : "tracks"
        }?`
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
            className="-mr-2 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground"
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
              onChange={(e) => updateRelease(release.id, { title: e.target.value })}
              placeholder="Untitled"
              className={field}
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground/60">
                Type
              </span>
              <select
                value={release.type}
                onChange={(e) =>
                  updateRelease(release.id, {
                    type: e.target.value as ReleaseType | "auto",
                  })
                }
                className={field}
              >
                <option value="auto">Auto ({autoType})</option>
                <option value="Album">Album</option>
                <option value="EP">EP</option>
                <option value="Single">Single</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground/60">
                Release date
              </span>
              <input
                type="date"
                // Empty means today; today is only known once in the browser.
                value={release.releaseDate || (hydrated ? todayISO() : "")}
                onChange={(e) =>
                  updateRelease(release.id, { releaseDate: e.target.value })
                }
                className={field}
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
