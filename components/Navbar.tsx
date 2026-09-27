import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-foreground/10 bg-background/80 backdrop-blur">
      <nav className="flex h-full items-center px-4 sm:px-6">
        <Link
          href="/"
          className="-ml-2 rounded-md px-2 py-1 font-semibold tracking-tight transition-opacity hover:opacity-70"
        >
          projecto<span className="text-foreground/40">.space</span>
        </Link>
      </nav>
    </header>
  );
}
