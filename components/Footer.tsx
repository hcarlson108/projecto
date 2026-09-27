import Link from "next/link";

/**
 * Sits below a full-height content area (see app/layout.tsx), so it only
 * comes into view once the user scrolls.
 */
export default function Footer() {
  return (
    <footer className="border-t border-foreground/10">
      <div className="flex flex-col gap-3 px-4 py-8 sm:px-6 text-sm text-foreground/60 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="self-start font-semibold tracking-tight text-foreground transition-opacity hover:opacity-70"
        >
          projecto<span className="text-foreground/40">.space</span>
        </Link>
        <div className="flex flex-col gap-1 sm:items-end">
          <p>Your files never leave your browser.</p>
          <p className="text-xs text-foreground/40">
            © {new Date().getFullYear()} projecto.space · Not affiliated with
            Spotify or Apple.
          </p>
        </div>
      </div>
    </footer>
  );
}
