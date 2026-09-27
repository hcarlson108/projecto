import Link from "next/link";

/**
 * Sits below a full-height content area (see app/layout.tsx), so it only
 * comes into view once the user scrolls.
 */
export default function Footer() {
  return (
    <footer className="border-t border-foreground/10">
      <div className="flex flex-col items-center gap-3 px-4 py-8 text-center text-sm text-foreground/60 sm:px-6">
        <Link
          href="/"
          className="font-semibold tracking-tight text-foreground transition-opacity hover:opacity-70"
        >
          projecto<span className="text-foreground/40">.space</span>
        </Link>
        <div className="flex flex-col items-center gap-1">
          <p>Your files never leave your browser.</p>
          <p className="text-xs text-foreground/40">
            © {new Date().getFullYear()} projecto.space. All rights reserved.
            Not affiliated with Spotify, Apple, or any other streaming platform in
            the visualizer.
          </p>
          <p className="text-xs text-foreground/30">
            website by{" "}
            <a
              href="https://github.com/hcarlson108"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 transition-colors hover:text-foreground/60 hover:underline"
            >
              hcarlson108
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
