"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useLibrary } from "@/components/LibraryProvider";
import { formatDuration, isAudio, isImage } from "@/lib/audio-utils";
import type { Track } from "@/types/track";

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className="size-4">
      <path d="M4 2.5v11a.5.5 0 0 0 .76.43l9-5.5a.5.5 0 0 0 0-.86l-9-5.5A.5.5 0 0 0 4 2.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className="size-4">
      <rect x="3" y="2" width="3.5" height="12" rx="1" />
      <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
    </svg>
  );
}

export default function FileUpload() {
  const { tracks, albumArt, addTracks, removeTrack, setAlbumArt } =
    useLibrary();
  const [isDragging, setIsDragging] = useState(false);
  const audioInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  // One shared, hidden <audio> element: starting a track stops the previous one.
  const audio = useRef<HTMLAudioElement>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  function togglePlay(track: Track) {
    const el = audio.current;
    if (!el) return;
    if (currentId === track.id && !el.paused) {
      el.pause();
      return;
    }
    if (currentId !== track.id) {
      el.src = track.url;
      setCurrentId(track.id);
    }
    // Rejects with AbortError if another track is picked before this starts.
    el.play().catch(() => {});
  }

  function handleRemove(id: string) {
    if (id === currentId && audio.current) {
      audio.current.pause();
      audio.current.removeAttribute("src");
      setCurrentId(null);
    }
    removeTrack(id);
  }

  function addFiles(files: File[]) {
    const audio = files.filter(isAudio);
    if (audio.length) addTracks(audio);

    const image = files.find(isImage);
    if (image) setAlbumArt(image);
  }

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files ?? []));
    // Reset so selecting the same file again still fires onChange.
    e.target.value = "";
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
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
        className={`flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-6 text-center sm:p-10 transition-colors ${
          isDragging
            ? "border-foreground bg-foreground/5"
            : "border-foreground/20 hover:border-foreground/40"
        }`}
      >
        <p className="text-lg font-medium">
          <span className="pointer-coarse:hidden">
            Drop audio files and album art here
          </span>
          <span className="hidden pointer-coarse:inline">
            Add your tracks and album art
          </span>
        </p>
        <p className="text-sm text-foreground/60">
          Files stay in your browser and are never uploaded.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={() => audioInput.current?.click()}
            className="min-h-11 rounded-full bg-foreground px-5 text-sm font-medium text-background transition hover:bg-foreground/85 active:scale-[0.98]"
          >
            Choose audio
          </button>
          <button
            type="button"
            onClick={() => coverInput.current?.click()}
            className="min-h-11 rounded-full border border-foreground/20 px-5 text-sm font-medium transition hover:border-foreground/40 hover:bg-foreground/5 active:scale-[0.98]"
          >
            Choose album art
          </button>
        </div>
        <input
          ref={audioInput}
          type="file"
          accept="audio/*"
          multiple
          hidden
          onChange={handleInput}
        />
        <input
          ref={coverInput}
          type="file"
          accept="image/*"
          hidden
          onChange={handleInput}
        />
      </div>

      {albumArt && (
        <section className="flex items-center gap-4">
          {/* next/image can't optimize blob: URLs, so a plain img is used. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={albumArt.url}
            alt="Album art"
            className="size-20 shrink-0 rounded-lg object-cover sm:size-24"
          />
          <div className="flex min-w-0 flex-col gap-1">
            <p className="truncate text-sm font-medium">{albumArt.file.name}</p>
            <button
              type="button"
              onClick={() => setAlbumArt(null)}
              className="-ml-2 self-start rounded-md px-2 py-2 text-sm text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              Remove
            </button>
          </div>
        </section>
      )}

      {tracks.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-foreground/60">
            {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
          </h2>
          <ol className="flex flex-col divide-y divide-foreground/10 overflow-hidden rounded-lg border border-foreground/10">
            {tracks.map((track, i) => {
              const isCurrent = track.id === currentId;
              const showPause = isCurrent && isPlaying;
              return (
                <li
                  key={track.id}
                  className="group flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-foreground/[0.03] sm:px-4"
                >
                  <button
                    type="button"
                    onClick={() => togglePlay(track)}
                    aria-label={`${showPause ? "Pause" : "Play"} ${track.title}`}
                    className="-ml-2 flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/40 transition-colors hover:bg-foreground/10 hover:text-foreground"
                  >
                    {showPause ? (
                      <span className="text-foreground">
                        <PauseIcon />
                      </span>
                    ) : (
                      <>
                        {/* Track number, swapped for a play icon on hover,
                            keyboard focus, touch devices, or when paused. */}
                        <span
                          className={`tabular-nums group-hover:hidden group-focus-within:hidden pointer-coarse:hidden ${
                            isCurrent ? "hidden" : ""
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span
                          className={`group-hover:block group-focus-within:block pointer-coarse:block ${
                            isCurrent ? "block text-foreground" : "hidden"
                          }`}
                        >
                          <PlayIcon />
                        </span>
                      </>
                    )}
                  </button>
                  <span
                    className={`min-w-0 flex-1 truncate ${
                      isCurrent ? "font-medium" : ""
                    }`}
                  >
                    {track.title}
                  </span>
                  <span className="shrink-0 tabular-nums text-foreground/40">
                    {formatDuration(track.duration)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(track.id)}
                    aria-label={`Remove ${track.title}`}
                    className="-mr-2 flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/40 transition-colors hover:bg-foreground/10 hover:text-foreground"
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <audio
        ref={audio}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}
