"use client";

import ImageSlot from "@/components/ImageSlot";
import { useLibrary } from "@/components/LibraryProvider";
import ReleaseCard from "@/components/ReleaseCard";

export default function FileUpload() {
  const {
    releases,
    addRelease,
    artist,
    setArtist,
    artistHeader,
    setArtistHeader,
  } = useLibrary();

  return (
    <div className="flex w-full max-w-2xl flex-col gap-14">
      <section className="flex flex-col gap-5">
        <h2 className="text-lg font-semibold">Artist</h2>
        <ImageSlot
          label="Artist header"
          cta="Add artist header"
          image={artistHeader}
          onChange={setArtistHeader}
          sizeClass="h-40 w-full sm:h-48"
          aspect={2660 / 1140}
          maxWidth={2660}
          shapeLabel="Wide banner · 2660 × 1140"
        />
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground/60">
            Artist name
          </span>
          <input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Unknown Artist"
            className="rounded-lg border border-foreground/15 bg-transparent px-3 py-2.5 text-base transition-colors placeholder:text-foreground/40 hover:border-foreground/30 focus:border-foreground/50 sm:text-sm"
          />
        </label>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-lg font-semibold">Releases</h2>
        {releases.map((release, i) => (
          <ReleaseCard key={release.id} release={release} number={i + 1} />
        ))}
        <button
          type="button"
          onClick={addRelease}
          className="min-h-12 rounded-2xl border-2 border-dashed border-foreground/20 text-sm font-medium text-foreground/70 transition-colors hover:border-foreground/40 hover:bg-foreground/5 hover:text-foreground"
        >
          + Add another release
        </button>
      </section>
    </div>
  );
}
