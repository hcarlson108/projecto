import FileUpload from '@/components/FileUpload';
import NextButton from '@/components/NextButton';

export default function Home() {
  return (
    <main className='flex flex-1 flex-col items-center gap-12 px-4 py-12 sm:gap-16 sm:py-20'>
      <div className='flex flex-col items-center gap-2 text-center'>
        <h1 className='text-2xl font-semibold sm:text-3xl'>Musical Alias Visualizer</h1>
        <p className='text-foreground/60'>Visualize your music on popular streaming platforms</p>
      </div>
      <FileUpload />
      <NextButton />
    </main>
  );
}
