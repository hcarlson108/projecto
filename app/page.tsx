import FileUpload from "@/components/FileUpload";
import NextButton from "@/components/NextButton";
import TrackList from "@/components/TrackList";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-8 sm:gap-8 sm:py-16">
      <h1 className="text-2xl font-semibold">Preview your release</h1>
      <FileUpload />
      <TrackList />
      <NextButton />
    </main>
  );
}
