import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-amber-950 flex items-center justify-center">
      <div className="text-center p-6 rounded-lg bg-black/50 border border-amber-600 shadow-lg">
        <Spinner size="xl" color="accent" className="mb-4" />
        <p className="text-amber-200 text-xl">Loading...</p>
      </div>
    </div>
  );
}