"use client";

import { useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import type { CropArea } from "@/types/track";

export default function CropDialog({
  title,
  imageUrl,
  aspect,
  shapeLabel,
  initialArea,
  onCancel,
  onSave,
}: {
  title: string;
  /** Object URL of the uncropped image; owned (and revoked) by the caller. */
  imageUrl: string;
  aspect: number;
  /** Plain-language target shape, e.g. "Square · 1:1". */
  shapeLabel: string;
  /** Restores the previous crop when re-cropping. */
  initialArea?: CropArea;
  onCancel: () => void;
  onSave: (area: CropArea) => Promise<void>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<CropArea | null>(initialArea ?? null);
  const [isSaving, setIsSaving] = useState(false);

  // showModal() gives focus trapping, Esc to close and a backdrop for free.
  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  async function save() {
    if (!area) return;
    setIsSaving(true);
    try {
      await onSave(area);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      aria-labelledby="crop-title"
      className="m-auto w-[min(40rem,calc(100%-2rem))] overflow-hidden rounded-2xl bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <h2 id="crop-title" className="font-semibold">
            {title}
          </h2>
          <span className="truncate rounded-full bg-foreground/10 px-2 py-0.5 text-xs text-foreground/70">
            {shapeLabel}
          </span>
        </div>
        <p className="text-xs text-foreground/50 pointer-coarse:hidden">
          Drag to move · scroll to zoom
        </p>
        <p className="hidden text-xs text-foreground/50 pointer-coarse:block">
          Drag to move · pinch to zoom
        </p>
      </div>

      <div className="relative h-72 bg-black sm:h-96">
        <Cropper
          image={imageUrl}
          aspect={aspect}
          crop={crop}
          zoom={zoom}
          maxZoom={4}
          initialCroppedAreaPixels={initialArea}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          // onCropAreaChange (not onCropComplete) also fires when the zoom
          // slider moves, so Save always uses what's on screen.
          onCropAreaChange={(_, pixels) => setArea(pixels)}
        />
      </div>

      <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
        <label className="flex flex-1 items-center gap-3 text-sm text-foreground/60">
          Zoom
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-foreground"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-10 flex-1 rounded-full border border-foreground/20 px-5 text-sm font-medium transition hover:border-foreground/40 hover:bg-foreground/5 sm:flex-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!area || isSaving}
            className="min-h-10 flex-1 rounded-full bg-foreground px-5 text-sm font-medium text-background transition hover:bg-foreground/85 active:scale-[0.98] disabled:opacity-50 sm:flex-none"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
