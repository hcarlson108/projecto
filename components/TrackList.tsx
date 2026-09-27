"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLibrary } from "@/components/LibraryProvider";
import { GripIcon, PauseIcon, PlayIcon } from "@/components/icons";
import { formatDuration } from "@/lib/audio-utils";
import type { Track } from "@/types/track";

function TrackRow({ track, index }: { track: Track; index: number }) {
  const { removeTrack, currentId, isPlaying, togglePlay } = useLibrary();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id });

  const isCurrent = track.id === currentId;
  const showPause = isCurrent && isPlaying;

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      className={`group relative flex items-center gap-2 bg-background px-3 first:rounded-t-lg last:rounded-b-lg py-2 text-sm transition-colors sm:px-4 ${
        isDragging
          ? "z-10 shadow-lg ring-1 ring-foreground/15"
          : "hover:bg-foreground/[0.03]"
      }`}
    >
      {/* Only the handle starts a drag, so the row's buttons keep working and
          touch users can still scroll the list. */}
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${track.title}`}
        className={`-ml-2 flex size-9 shrink-0 touch-none items-center justify-center rounded-full text-foreground/30 transition-colors hover:bg-foreground/10 hover:text-foreground ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <GripIcon />
      </button>
      <button
        type="button"
        onClick={() => togglePlay(track.id)}
        aria-label={`${showPause ? "Pause" : "Play"} ${track.title}`}
        className="-ml-1 flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/40 transition-colors hover:bg-foreground/10 hover:text-foreground"
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
              {index + 1}
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
        className={`min-w-0 flex-1 truncate ${isCurrent ? "font-medium" : ""}`}
      >
        {track.title}
      </span>
      <span className="shrink-0 tabular-nums text-foreground/40">
        {formatDuration(track.duration)}
      </span>
      <button
        type="button"
        onClick={() => removeTrack(track.id)}
        aria-label={`Remove ${track.title}`}
        className="-mr-2 flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/40 transition-colors hover:bg-foreground/10 hover:text-foreground"
      >
        ✕
      </button>
    </li>
  );
}

export default function TrackList() {
  const { tracks, moveTrack } = useLibrary();
  const sensors = useSensors(
    // A few px of movement before a drag starts, so a plain click on the
    // handle doesn't count as one.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    // Touch: press and hold briefly, so a swipe still scrolls the page.
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (tracks.length === 0) return null;

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) {
      moveTrack(String(active.id), String(over.id));
    }
  }

  return (
    <section className="flex w-full max-w-2xl flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium text-foreground/60">
          {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
        </h2>
        {tracks.length > 1 && (
          <p className="text-xs text-foreground/40">Drag ⋮⋮ to reorder</p>
        )}
      </div>
      {/* A fixed id keeps dnd-kit's generated aria ids stable across
          server and client renders. */}
      <DndContext
        id="track-list"
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        // Only auto-scroll right at the window edge (default is 20%), so
        // dragging a row near the bottom doesn't overshoot its target.
        autoScroll={{ threshold: { x: 0, y: 0.1 }, acceleration: 5 }}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tracks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <ol className="flex flex-col divide-y divide-foreground/10 rounded-lg border border-foreground/10">
            {tracks.map((track, i) => (
              <TrackRow key={track.id} track={track} index={i} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </section>
  );
}
