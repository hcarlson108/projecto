import Link from "next/link";
import { platforms, type Platform } from "@/lib/platforms";

function Swatch({ platform }: { platform: Platform }) {
  return (
    <span
      aria-hidden
      style={{ backgroundColor: platform.color }}
      className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ring-1 ring-foreground/10"
    >
      {platform.name[0]}
    </span>
  );
}

export default function PlatformPicker() {
  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      {platforms.map((platform) =>
        platform.available ? (
          <Link
            key={platform.id}
            href={`/preview?platform=${platform.id}`}
            className="flex items-center gap-4 rounded-2xl border border-foreground/10 p-4 transition hover:border-foreground/30 hover:bg-foreground/5 active:scale-[0.99]"
          >
            <Swatch platform={platform} />
            <span className="flex-1 font-medium">{platform.name}</span>
            <span aria-hidden className="text-foreground/40">
              →
            </span>
          </Link>
        ) : (
          <div
            key={platform.id}
            aria-disabled="true"
            className="flex items-center gap-4 rounded-2xl border border-dashed border-foreground/10 p-4 opacity-50"
          >
            <Swatch platform={platform} />
            <span className="flex-1 font-medium">{platform.name}</span>
            <span className="text-xs text-foreground/60">Coming soon</span>
          </div>
        )
      )}
    </div>
  );
}
