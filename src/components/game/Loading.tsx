export default function Loading() {
  return (
    <div className="flex items-center justify-center h-[80vh] flex-col">
      <div className="relative w-24 h-24">
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-amber-400 opacity-25"></div>
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-amber-400 animate-spin"></div>
      </div>
      <p className="mt-4 text-amber-200 text-lg">Loading game...</p>
      <p className="text-amber-200/50 text-sm">Getting the latest Oscars info</p>
    </div>
  );
}