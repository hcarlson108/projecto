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
import {
  displayTitle,
  useLibrary,
  type PlayContext,
} from "@/components/LibraryProvider";
import {
  GripIcon,
  MoreIcon,
  MoveIcon,
  PauseIcon,
  PlayIcon,
  StarIcon,
} from "@/components/icons";
import { formatDuration } from "@/lib/audio-utils";
import { effectiveType } from "@/lib/releases";
import type { Release, Track } from "@/types/track";

const iconButton =
  "flex size-8 shrink-0 items-center justify-center rounded-full text-foreground/40 transition-colors hover:bg-foreground/10 hover:text-foreground sm:size-9";

function TrackRow({
  track,
  index,
  context,
  releaseId,
}: {
  track: Track;
  index: number;
  context: PlayContext;
  releaseId: string;
}) {
  const {
    releases,
    removeTrack,
    moveTrackToRelease,
    togglePopular,
    currentId,
    isPlaying,
    togglePlay,
  } = useLibrary();
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
  const otherReleases = releases
    .map((r, i) => ({ release: r, number: i + 1 }))
    .filter(({ release }) => release.id !== releaseId);

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      className={`group relative flex items-center gap-1 bg-background px-2 py-1.5 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg sm:gap-2 sm:px-3 ${
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
        className={`${iconButton} touch-none text-foreground/30 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <GripIcon />
      </button>
      <button
        type="button"
        onClick={() => togglePlay(track.id, context)}
        aria-label={`${showPause ? "Pause" : "Play"} ${track.title}`}
        className={iconButton}
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
        className={`ml-1 min-w-0 flex-1 truncate ${
          isCurrent ? "font-medium" : ""
        }`}
      >
        {track.title}
      </span>
      {track.popular && (
        // On phones the star button lives in the ⋯ menu, so show the state here.
        <StarIcon filled className="size-3.5 shrink-0 text-amber-500 sm:hidden" />
      )}
      <span className="hidden shrink-0 px-1 tabular-nums text-foreground/40 sm:block">
        {formatDuration(track.duration)}
      </span>
      <button
        type="button"
        onClick={() => togglePopular(track.id)}
        aria-pressed={track.popular}
        aria-label={`Feature ${track.title} in Popular`}
        title="Feature in Popular on your artist page"
        className={`${iconButton} max-sm:hidden ${track.popular ? "text-amber-500 hover:text-amber-500" : ""}`}
      >
        <StarIcon filled={track.popular} />
      </button>
      {otherReleases.length > 0 && (
        // A native <select> laid invisibly over the icon: compact, and phones
        // get their own picker.
        <label
          title="Move to another release"
          className={`${iconButton} relative has-focus-visible:outline-2 has-focus-visible:outline-foreground max-sm:hidden`}
        >
          <MoveIcon />
          <select
            value=""
            onChange={(e) => moveTrackToRelease(track.id, e.target.value)}
            aria-label={`Move ${track.title} to another release`}
            className="absolute inset-0 cursor-pointer appearance-none opacity-0"
          >
            <option value="" disabled>
              Move to…
            </option>
            {otherReleases.map(({ release, number }) => (
              <option key={release.id} value={release.id}>
                {number}. {displayTitle(release.title)} ({effectiveType(release)})
              </option>
            ))}
          </select>
        </label>
      )}
      <button
        type="button"
        onClick={() => removeTrack(track.id)}
        aria-label={`Remove ${track.title}`}
        className={`${iconButton} max-sm:hidden`}
      >
        ✕
      </button>
      {/* Phones: star, move and remove folded into one native action menu,
          which leaves the title room to breathe. */}
      <label
        className={`${iconButton} relative has-focus-visible:outline-2 has-focus-visible:outline-foreground sm:hidden`}
      >
        <MoreIcon />
        <select
          value=""
          onChange={(e) => {
            const action = e.target.value;
            if (action === "popular") togglePopular(track.id);
            else if (action === "remove") removeTrack(track.id);
            else if (action.startsWith("move:"))
              moveTrackToRelease(track.id, action.slice(5));
          }}
          aria-label={`Options for ${track.title}`}
          className="absolute inset-0 cursor-pointer appearance-none opacity-0"
        >
          <option value="" disabled>
            {track.title}
          </option>
          <option value="popular">
            {track.popular ? "Remove from Popular" : "Feature in Popular"}
          </option>
          {otherReleases.map(({ release, number }) => (
            <option key={release.id} value={`move:${release.id}`}>
              Move to {number}. {displayTitle(release.title)}
            </option>
          ))}
          <option value="remove">Remove</option>
        </select>
      </label>
    </li>
  );
}

export default function TrackList({ release }: { release: Release }) {
  const { moveTrack } = useLibrary();
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

  const { tracks } = release;
  if (tracks.length === 0) return null;

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) {
      moveTrack(String(active.id), String(over.id));
    }
  }

  return (
    // A fixed, per-release id keeps dnd-kit's generated aria ids stable
    // across server and client renders.
    <DndContext
      id={`tracks-${release.id}`}
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
            <TrackRow
              key={track.id}
              track={track}
              index={i}
              context={`release:${release.id}`}
              releaseId={release.id}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}
