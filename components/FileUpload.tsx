"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import CropDialog from "@/components/CropDialog";
import { CropIcon } from "@/components/icons";
import { useLibrary, type ImageCrop } from "@/components/LibraryProvider";
import { isAudio, isImage } from "@/lib/audio-utils";
import { cropImage } from "@/lib/crop";
import type { AlbumArt, CropArea } from "@/types/track";

/**
 * An image picker that doubles as its own preview: empty, it's a dashed
 * "add" tile (click or drop); filled, it shows the image with
 * Crop/Replace/Remove. Every new image goes through the crop dialog first.
 */
function ImageSlot({
  label,
  cta,
  hint,
  image,
  onChange,
  sizeClass,
  aspect,
  maxWidth,
  shapeLabel,
}: {
  label: string;
  /** Empty-state call to action, e.g. "Add album art". */
  cta: string;
  hint: string;
  image: AlbumArt | null;
  onChange: (file: File | null, crop?: ImageCrop) => void;
  sizeClass: string;
  /** Width / height the crop is locked to. */
  aspect: number;
  /** Cropped output is scaled down to at most this many pixels wide. */
  maxWidth: number;
  /** Shown in the crop dialog, e.g. "Square · 1:1". */
  shapeLabel: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editing, setEditing] = useState<{
    source: File;
    url: string;
    area?: CropArea;
  } | null>(null);

  function openCrop(source: File, area?: CropArea) {
    setEditing({ source, url: URL.createObjectURL(source), area });
  }

  function closeCrop() {
    if (editing) URL.revokeObjectURL(editing.url);
    setEditing(null);
  }

  async function saveCrop(area: CropArea) {
    if (!editing) return;
    const cropped = await cropImage(editing.source, area, maxWidth);
    onChange(cropped, { source: editing.source, cropArea: area });
    closeCrop();
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = Array.from(e.dataTransfer.files).find(isImage);
    if (file) openCrop(file);
  }

  return (
    <div
      className="flex flex-col gap-1.5"
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
    >
      <span className="text-sm font-medium text-foreground/60">{label}</span>
      {image ? (
        <div
          className={`group relative overflow-hidden rounded-lg ${sizeClass} ${
            isDragging ? "ring-2 ring-foreground" : ""
          }`}
        >
          {/* The whole image is the crop button. */}
          <button
            type="button"
            onClick={() => openCrop(image.source, image.cropArea)}
            aria-label={`Crop ${label.toLowerCase()}`}
            className="absolute inset-0 size-full"
          >
            {/* next/image can't optimize blob: URLs, so a plain img is used. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt={label} className="size-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-has-focus-visible:opacity-100">
              <CropIcon />
              <span className="pointer-coarse:hidden">Click to crop</span>
              <span className="hidden pointer-coarse:inline">Tap to crop</span>
            </span>
          </button>
          {/* pointer-events-none on the strip so taps between the pills still
              reach the image; the pills opt back in. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-linear-to-t from-black/60 to-transparent p-2">
            <span className="mr-auto hidden items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-black/80 pointer-coarse:flex">
              <CropIcon className="size-3" />
              Tap to crop
            </span>
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="pointer-events-auto rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-black/80"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="pointer-events-auto rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-black/80"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed p-3 text-center transition-colors ${sizeClass} ${
            isDragging
              ? "border-foreground bg-foreground/5"
              : "border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5"
          }`}
        >
          <span className="text-sm font-medium">+ {cta}</span>
          <span className="text-xs text-foreground/50">{hint}</span>
        </button>
      )}
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) openCrop(file);
          e.target.value = "";
        }}
      />
      {editing && (
        <CropDialog
          title={`Crop ${label.toLowerCase()}`}
          imageUrl={editing.url}
          aspect={aspect}
          shapeLabel={shapeLabel}
          initialArea={editing.area}
          onCancel={closeCrop}
          onSave={saveCrop}
        />
      )}
    </div>
  );
}

export default function FileUpload() {
  const {
    tracks,
    addTracks,
    albumArt,
    setAlbumArt,
    artistHeader,
    setArtistHeader,
    albumTitle,
    setAlbumTitle,
    artist,
    setArtist,
  } = useLibrary();
  const [isDragging, setIsDragging] = useState(false);
  const audioInput = useRef<HTMLInputElement>(null);

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
      <ImageSlot
        label="Artist header"
        cta="Add artist header"
        hint="Wide image"
        image={artistHeader}
        onChange={setArtistHeader}
        aspect={2660 / 1140}
        maxWidth={2660}
        shapeLabel="Wide banner · 2660 × 1140"
        sizeClass="h-40 w-full sm:h-48"
      />

      <section className="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground/60">Tracks</span>
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
            className={`flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              isDragging
                ? "border-foreground bg-foreground/5"
                : "border-foreground/20 hover:border-foreground/40"
            }`}
          >
            <p className="font-medium">
              <span className="pointer-coarse:hidden">
                Drop audio files
              </span>
              <span className="hidden pointer-coarse:inline">
                Add audio files
              </span>
            </p>
            <p className="text-xs text-foreground/50">
              Stays on your device
            </p>
            <button
              type="button"
              onClick={() => audioInput.current?.click()}
              className="min-h-11 w-full rounded-full bg-foreground px-5 text-sm font-medium text-background transition hover:bg-foreground/85 active:scale-[0.98] sm:w-auto"
            >
              {tracks.length > 0 ? "Add more files" : "Choose files"}
            </button>
            <input
              ref={audioInput}
              type="file"
              accept="audio/*"
              multiple
              hidden
              onChange={handleInput}
            />
          </div>
        </div>

        <ImageSlot
          label="Album art"
          cta="Add album art"
          hint="Square image"
          image={albumArt}
          onChange={setAlbumArt}
          aspect={1}
          maxWidth={1500}
          shapeLabel="Square · 1:1"
          sizeClass="aspect-square w-48 sm:w-full"
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground/60">
            Album title
          </span>
          <input
            value={albumTitle}
            onChange={(e) => setAlbumTitle(e.target.value)}
            placeholder="Untitled"
            className="rounded-lg border border-foreground/15 bg-transparent px-3 py-2.5 text-base transition-colors placeholder:text-foreground/40 hover:border-foreground/30 focus:border-foreground/50 sm:text-sm"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground/60">Artist</span>
          <input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Unknown Artist"
            className="rounded-lg border border-foreground/15 bg-transparent px-3 py-2.5 text-base transition-colors placeholder:text-foreground/40 hover:border-foreground/30 focus:border-foreground/50 sm:text-sm"
          />
        </label>
      </section>
    </div>
  );
}
