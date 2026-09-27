type IconProps = { className?: string };

export function PlayIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M4 2.5v11a.5.5 0 0 0 .76.43l9-5.5a.5.5 0 0 0 0-.86l-9-5.5A.5.5 0 0 0 4 2.5Z" />
    </svg>
  );
}

export function PauseIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <rect x="3" y="2" width="3.5" height="12" rx="1" />
      <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
    </svg>
  );
}

export function PreviousIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <rect x="2" y="2" width="2" height="12" rx="0.75" />
      <path d="M14 2.87v10.26a.6.6 0 0 1-.92.5L5.4 8.5a.6.6 0 0 1 0-1l7.68-5.13a.6.6 0 0 1 .92.5Z" />
    </svg>
  );
}

export function NextIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <rect x="12" y="2" width="2" height="12" rx="0.75" />
      <path d="M2 2.87v10.26a.6.6 0 0 0 .92.5L10.6 8.5a.6.6 0 0 0 0-1L2.92 2.37a.6.6 0 0 0-.92.5Z" />
    </svg>
  );
}

export function ClockIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden className={className}>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MusicNoteIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M13 1.5v9.25a2.25 2.25 0 1 1-1.5-2.12V4.3L6 5.42v6.83a2.25 2.25 0 1 1-1.5-2.12V3.5a.75.75 0 0 1 .6-.73l7-1.43a.75.75 0 0 1 .9.73V1.5Z" />
    </svg>
  );
}

export function ShuffleIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d="M1.5 4h2.2a3 3 0 0 1 2.5 1.35l3.6 5.3A3 3 0 0 0 12.3 12h2.2M1.5 12h2.2a3 3 0 0 0 2.5-1.35M9.8 5.35A3 3 0 0 1 12.3 4h2.2M12.5 2l2 2-2 2M12.5 10l2 2-2 2" />
    </svg>
  );
}

export function RepeatIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d="M4.5 3.5h7a3 3 0 0 1 3 3v1M11.5 12.5h-7a3 3 0 0 1-3-3v-1M9.5 1.5l2 2-2 2M6.5 10.5l-2 2 2 2" />
    </svg>
  );
}

export function PlusCircleIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" aria-hidden className={className}>
      <circle cx="8" cy="8" r="6.75" />
      <path d="M8 4.75v6.5M4.75 8h6.5" />
    </svg>
  );
}

export function DownloadCircleIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <circle cx="8" cy="8" r="6.75" />
      <path d="M8 4.5v6.5M5.25 8.5 8 11.25 10.75 8.5" />
    </svg>
  );
}

export function MoreIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <circle cx="3" cy="8" r="1.4" />
      <circle cx="8" cy="8" r="1.4" />
      <circle cx="13" cy="8" r="1.4" />
    </svg>
  );
}

export function ListIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" aria-hidden className={className}>
      <path d="M5.5 3.5h9M5.5 8h9M5.5 12.5h9M1.5 3.5h.5M1.5 8h.5M1.5 12.5h.5" />
    </svg>
  );
}

export function ChevronLeftIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d="M10 3 5 8l5 5" />
    </svg>
  );
}

export function VerifiedIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="currentColor"
        d="M12 1.5 14.6 3.4l3.2-.1 1 3 2.6 1.9-1 3.1 1 3.1-2.6 1.9-1 3-3.2-.1L12 22.5l-2.6-1.9-3.2.1-1-3-2.6-1.9 1-3.1-1-3.1 2.6-1.9 1-3 3.2.1Z"
      />
      <path d="m8 12.2 2.8 2.8L16.2 9.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GripIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <circle cx="6" cy="3.5" r="1.25" />
      <circle cx="10" cy="3.5" r="1.25" />
      <circle cx="6" cy="8" r="1.25" />
      <circle cx="10" cy="8" r="1.25" />
      <circle cx="6" cy="12.5" r="1.25" />
      <circle cx="10" cy="12.5" r="1.25" />
    </svg>
  );
}

export function CropIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d="M4 1v10a1 1 0 0 0 1 1h10M1 4h10a1 1 0 0 1 1 1v10" />
    </svg>
  );
}

export function StarIcon({
  className = "size-4",
  filled = false,
}: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden className={className}>
      <path d="m8 1.75 1.9 3.9 4.3.6-3.1 3 .73 4.25L8 11.5l-3.83 2 .73-4.25-3.1-3 4.3-.6Z" />
    </svg>
  );
}

export function MoveIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d="M2 5h10M9.5 2.5 12 5 9.5 7.5M14 11H4M6.5 8.5 4 11l2.5 2.5" />
    </svg>
  );
}

export function TrashIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d="M2.5 4h11M6 4V2.75h4V4M4 4l.6 9.1a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9L12 4" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d="m3.5 6 4.5 4.5L12.5 6" />
    </svg>
  );
}
