import FileUpload from "@/components/FileUpload";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-8 sm:gap-8 sm:py-16">
      <h1 className="text-2xl font-semibold">Projecto</h1>
      <FileUpload />
    </main>
  );
}
