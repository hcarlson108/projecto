"use client";

import { useId, useState, type DragEvent } from "react";
import CropDialog from "@/components/CropDialog";
import { CropIcon } from "@/components/icons";
import type { ImageCrop } from "@/components/LibraryProvider";
import { IMAGE_ACCEPT, isImage } from "@/lib/audio-utils";
import { cropImage } from "@/lib/crop";
import type { AlbumArt, CropArea } from "@/types/track";

/**
 * An image picker that doubles as its own preview: empty, it's a dashed
 * "add" tile (click or drop); filled, it shows the image with
 * Crop/Replace/Remove. Every new image goes through the crop dialog first.
 */
export default function ImageSlot({
  label,
  cta,
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
  // Labels pointing at the input open the picker natively (no scripted
  // click()), the most reliable way on iOS Safari.
  const inputId = useId();
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
            <span className="mr-auto hidden items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-black/80 pointer-coarse:px-3.5 pointer-coarse:py-2 pointer-coarse:text-sm pointer-coarse:flex">
              <CropIcon className="size-3" />
              Tap to crop
            </span>
            <label
              htmlFor={inputId}
              className="pointer-events-auto cursor-pointer rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-black/80 pointer-coarse:px-3.5 pointer-coarse:py-2 pointer-coarse:text-sm"
            >
              Replace
            </label>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="pointer-events-auto rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-black/80 pointer-coarse:px-3.5 pointer-coarse:py-2 pointer-coarse:text-sm"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed p-3 text-center transition-colors has-focus-visible:outline-2 ${sizeClass} ${
            isDragging
              ? "border-foreground bg-foreground/5"
              : "border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5"
          }`}
        >
          <span className="text-sm font-medium">+ {cta}</span>
        </label>
      )}
      <input
        id={inputId}
        type="file"
        accept={IMAGE_ACCEPT}
        aria-label={cta}
        className="sr-only"
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
