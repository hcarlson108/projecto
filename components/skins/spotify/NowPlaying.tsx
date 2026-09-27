"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import {
  displayArtist,
  displayTitle,
  useLibrary,
} from "@/components/LibraryProvider";
import {
  ChevronDownIcon,
  ListIcon,
  MoreIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PlusCircleIcon,
  PreviousIcon,
  RepeatIcon,
  ShuffleIcon,
} from "@/components/icons";
import { formatDuration } from "@/lib/audio-utils";
import { effectiveType } from "@/lib/releases";
import { Cover, DEFAULT_ACCENT, Decoration, ProgressBar } from "./shared";

/** Matches Tailwind's `sm` breakpoint: the full-screen player is phone-only. */
export const PHONE_QUERY = "(max-width: 639px)";

/** How far (px) a swipe down has to travel to dismiss the sheet. */
const DISMISS_DISTANCE = 120;
/** Keep in sync with the sheet's duration-[350ms] transition. */
const SLIDE_MS = 350;

/**
 * The phone "Now Playing" sheet, like Spotify's app: slides up over the page,
 * big cover, seek bar and full transport controls. Close with the chevron,
 * a swipe down, or Esc.
 */
export default function NowPlaying({ onClose }: { onClose: () => void }) {
  const {
    releases,
    releaseOf,
    tracks,
    artist,
    currentId,
    context,
    isPlaying,
    currentTime,
    toggleCurrent,
    playNext,
    playPrevious,
    seek,
  } = useLibrary();
  const dialog = useRef<HTMLDialogElement>(null);
  // Slide state: starts off-screen, "open" on the frame after mounting, and
  // back off-screen while closing. Driven by state rather than CSS
  // @starting-style, which iOS only supports from 17.5.
  const [shown, setShown] = useState(false);
  const [closing, setClosing] = useState(false);
  const [dragY, setDragY] = useState<number | null>(null);
  const dragStart = useRef(0);

  const track = tracks.find((t) => t.id === currentId);
  const release = currentId ? releaseOf(currentId) : undefined;
  const artistName = displayArtist(artist);
  const duration = track?.duration ?? 0;

  // "Playing from" follows where playback started, as in the real app.
  const source =
    context === "popular"
      ? { kind: "Artist", name: artistName }
      : (() => {
          const r = releases.find((r) => `release:${r.id}` === context);
          return r
            ? { kind: effectiveType(r), name: displayTitle(r.title) }
            : null;
        })();

  function requestClose() {
    setClosing(true);
    // A timer rather than transitionend, which never fires with reduced motion.
    setTimeout(onClose, SLIDE_MS);
  }

  useEffect(() => {
    const el = dialog.current;
    // Guarded: React runs effects twice in development, and older Safari
    // throws if showModal() is called on a dialog that's already open.
    // If showModal fails for any other reason, fall back to a plain open
    // dialog rather than showing nothing.
    if (el && !el.open) {
      try {
        el.showModal();
      } catch (error) {
        el.setAttribute("open", "");
        console.error("[now-playing] showModal failed", error);
      }
    }
    if (process.env.NODE_ENV === "development") {
      console.info(`[now-playing] mounted, dialog open=${el?.open}`);
      setTimeout(() => {
        const sheet = el?.firstElementChild?.getBoundingClientRect();
        console.info(
          `[now-playing] after slide: sheet top=${Math.round(sheet?.top ?? -1)} height=${Math.round(sheet?.height ?? -1)} viewport=${window.innerWidth}x${window.innerHeight}`
        );
      }, 600);
    }
    // Two frames: the first paints the sheet off-screen, the second slides
    // it in, so the transition always has a starting point.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setShown(true));
    });
    // No page scroll lock: the sheet is touch-none, so it can't scroll the
    // page anyway, and toggling overflow on iOS re-lays-out the page and
    // flashes Safari's toolbars mid-slide.
    // Phone-only: if the screen grows (rotation, resize), get out of the way
    // rather than leave an invisible modal blocking the page.
    const phone = window.matchMedia(PHONE_QUERY);
    const onChange = () => !phone.matches && onClose();
    phone.addEventListener("change", onChange);
    return () => {
      cancelAnimationFrame(frame);
      phone.removeEventListener("change", onChange);
      if (el?.open) el.close();
    };
  }, [onClose]);

  function onPointerDown(e: PointerEvent) {
    // Controls keep their own taps; anywhere else starts a swipe.
    if ((e.target as HTMLElement).closest("button, input, a")) return;
    dragStart.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragY(0);
  }

  function onPointerMove(e: PointerEvent) {
    if (dragY === null) return;
    setDragY(Math.max(0, e.clientY - dragStart.current));
  }

  function onPointerUp() {
    if (dragY === null) return;
    if (dragY > DISMISS_DISTANCE) requestClose();
    setDragY(null);
  }

  if (!track) return null;

  const accent = release?.art?.color ?? DEFAULT_ACCENT;

  return (
    <dialog
      ref={dialog}
      aria-label="Now playing"
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      // overflow-clip, not overflow-hidden: a hidden-overflow box is still
      // scrollable, and showModal() focusing the close button while the sheet
      // is below the screen would scroll the dialog and yank the slide-in.
      className="m-0 h-dvh max-h-none w-full max-w-none overflow-clip bg-transparent p-0 backdrop:bg-transparent sm:hidden"
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={
          {
            "--np": accent,
            background:
              "linear-gradient(rgb(var(--np)), color-mix(in srgb, rgb(var(--np)) 35%, #121212) 55%, #121212)",
            transform: dragY ? `translateY(${dragY}px)` : undefined,
          } as CSSProperties
        }
        className={`flex h-full touch-none flex-col gap-5 px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] text-white will-change-transform select-none motion-reduce:transition-none ${
          dragY !== null
            ? ""
            : // iOS's own sheet curve: quick start, long gentle settle.
              "transition-transform duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
        } ${shown && !closing ? "translate-y-0" : "translate-y-full"}`}
      >
        <header className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center">
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close now playing"
            className="-ml-2 flex size-10 items-center justify-center rounded-full transition hover:bg-white/10 active:scale-95"
          >
            <ChevronDownIcon className="size-6" />
          </button>
          <div className="min-w-0 text-center">
            {source && (
              <>
                <p className="text-[11px] tracking-widest text-white/70 uppercase">
                  Playing from {source.kind}
                </p>
                <p className="truncate text-sm font-bold">{source.name}</p>
              </>
            )}
          </div>
          <span className="justify-self-end">
            <Decoration>
              <MoreIcon className="size-6" />
            </Decoration>
          </span>
        </header>

        {/* The cover fills whatever the controls leave: a square as big as
            the smaller of the free width and height (container units), so it
            runs edge to edge on tall phones and shrinks only on short ones. */}
        <div className="flex min-h-0 flex-1 items-center justify-center [container-type:size]">
          <Cover
            url={release?.art?.url}
            className="size-[min(100cqw,100cqh)] rounded-lg shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-bold">{track.title}</h2>
            <p className="truncate text-base text-white/70">{artistName}</p>
          </div>
          <Decoration>
            <PlusCircleIcon className="size-7" />
          </Decoration>
        </div>

        <div className="flex flex-col gap-1">
          <ProgressBar
            value={currentTime}
            max={duration}
            onSeek={seek}
            className="h-6"
          />
          <div className="flex justify-between text-xs tabular-nums text-white/60">
            <span>{formatDuration(currentTime)}</span>
            <span>-{formatDuration(Math.max(duration - currentTime, 0))}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Decoration>
            <ShuffleIcon className="size-6" />
          </Decoration>
          <button
            type="button"
            onClick={playPrevious}
            aria-label="Previous"
            className="flex size-12 items-center justify-center rounded-full transition active:scale-90"
          >
            <PreviousIcon className="size-7" />
          </button>
          <button
            type="button"
            onClick={toggleCurrent}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex size-16 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <PauseIcon className="size-7" />
            ) : (
              <PlayIcon className="size-7" />
            )}
          </button>
          <button
            type="button"
            onClick={playNext}
            aria-label="Next"
            className="flex size-12 items-center justify-center rounded-full transition active:scale-90"
          >
            <NextIcon className="size-7" />
          </button>
          <Decoration>
            <RepeatIcon className="size-6" />
          </Decoration>
        </div>

        <div className="flex justify-end">
          <Decoration>
            <ListIcon className="size-5" />
          </Decoration>
        </div>
      </div>
    </dialog>
  );
}
