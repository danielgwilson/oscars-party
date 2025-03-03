import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-[80vh] flex-col">
      <Spinner size="xl" color="accent" className="mb-4" />
      <p className="mt-4 text-amber-200 text-lg">Loading game...</p>
      <p className="text-amber-200/50 text-sm">Getting the latest Oscars info</p>
    </div>
  );
}