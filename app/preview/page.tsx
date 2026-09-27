import type { ReactNode } from "react";
import Link from "next/link";
import PlatformPicker from "@/components/PlatformPicker";
import RequireTracks from "@/components/RequireTracks";
import AppleMusicSkin from "@/components/skins/AppleMusicSkin";
import SpotifySkin from "@/components/skins/SpotifySkin";
import { getPlatform } from "@/lib/platforms";

export default async function PreviewPage({
  searchParams,
}: PageProps<"/preview">) {
  const { platform: id, view } = await searchParams;
  const platform = getPlatform(typeof id === "string" ? id : undefined);

  const skins: Record<string, ReactNode> = {
    spotify: <SpotifySkin view={view === "album" ? "album" : "artist"} />,
    "apple-music": <AppleMusicSkin />,
  };
  const skin = platform && skins[platform.id];

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-8 sm:gap-8 sm:py-16">
      <div
        className={`grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 ${
          platform ? "max-w-7xl" : "max-w-2xl"
        }`}
      >
        <Link
          href={platform ? "/preview" : "/"}
          className="-ml-2 justify-self-start rounded-md px-2 py-2 text-sm text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          ← {platform ? "Platforms" : "Back"}
        </Link>
        <h1 className="text-lg font-semibold sm:text-2xl">
          {platform ? platform.name : "Choose a platform"}
        </h1>
      </div>
      <RequireTracks>{skin ?? <PlatformPicker />}</RequireTracks>
    </main>
  );
}
