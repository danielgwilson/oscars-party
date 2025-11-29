import Link from 'next/link';
import { loadOscarsDataset } from '@/lib/load-oscars-dataset';

const formatDate = (timestamp: string) =>
  new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));

const statusPill = (label: string, enabled: boolean) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}
  >
    {enabled ? '✔︎' : '…'} {label}
  </span>
);

const StatCard = ({ title, value, description }: { title: string; value: string | number; description: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="text-sm font-semibold text-slate-500">{title}</div>
    <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
    <p className="mt-2 text-sm text-slate-600">{description}</p>
  </div>
);

const OscarsDatasetPage = () => {
  const dataset = loadOscarsDataset();
  const categoryCount = Object.keys(dataset.categories).length;
  const nomineeCount = Object.values(dataset.categories).reduce((acc, nominees) => acc + nominees.length, 0);
  const enrichedMovies = dataset.movies.filter((movie) => movie.tmdb || movie.wikipedia);
  const enrichedPeople = dataset.people.filter((person) => person.tmdb || person.wikipedia);
  const sampleMovies = dataset.movies.slice(0, 8);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-amber-600">Oscars forecasting dataset</p>
        <h1 className="mt-2 text-4xl font-black text-slate-900">Award intelligence hub</h1>
        <p className="mt-3 max-w-3xl text-lg text-slate-600">
          A consolidated dataset of upcoming Oscars categories, nominees, and metadata hooks ready for model training. Enrich it
          locally with your TMDb key to pull budgets, revenues, and popularity scores, then explore the snapshot below.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-700">
          {statusPill('TMDb enrichment', dataset.enrichment.tmdb)}
          {statusPill('Wikipedia enrichment', dataset.enrichment.wikipedia)}
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
            Generated {formatDate(dataset.generatedAt)}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Categories" value={categoryCount} description="Award categories covered" />
        <StatCard title="Nominees" value={nomineeCount} description="Individual contenders tracked" />
        <StatCard
          title="Films"
          value={`${dataset.movies.length} (${enrichedMovies.length} enriched)`}
          description="Unique films with optional TMDb + Wikipedia context"
        />
        <StatCard
          title="People"
          value={`${dataset.people.length} (${enrichedPeople.length} enriched)`}
          description="Performers and crew with linked bios"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Download the dataset</h2>
            <p className="text-sm text-slate-600">Static snapshot generated from nominees.json with enrichment stubs.</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/data/oscars-dataset.json"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              JSON
            </Link>
            <Link
              href="/data/oscars-dataset.csv"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
            >
              CSV
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Enrich locally</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>Set <code className="rounded bg-slate-200 px-1">TMDB_API_KEY</code> in your shell.</li>
              <li>Run <code className="rounded bg-slate-200 px-1">node scripts/build-oscars-dataset.mjs</code>.</li>
              <li>
                Optionally rerun with a Wikipedia-friendly network to pull bios and plot summaries for better context vectors.
              </li>
            </ol>
            <p className="mt-3 text-xs text-slate-600">
              Each run regenerates JSON + CSV under <code className="rounded bg-slate-200 px-1">/public/data</code> for the Next.js
              app to surface.
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">What&apos;s included</p>
            <ul className="mt-2 space-y-1">
              <li>Category ➜ nominee matrix for all tracked races.</li>
              <li>Unique film + person entities with optional TMDb IDs and popularity metrics.</li>
              <li>Wikipedia summaries (when the network allows) to seed embeddings or text models.</li>
              <li>CSV export for quick spreadsheet exploration.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Sample film enrichment</h2>
            <p className="text-sm text-slate-600">First {sampleMovies.length} films detected from nominees.json.</p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            {dataset.enrichment.tmdb ? 'TMDb hydrated' : 'Awaiting TMDb key'}
          </span>
        </div>
        <div className="mt-4 overflow-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Release</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Genres</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Popularity</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Wikipedia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sampleMovies.map((movie) => (
                <tr key={movie.title} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{movie.title}</div>
                    {movie.tmdb?.tmdbUrl && (
                      <a className="text-xs text-blue-600 hover:underline" href={movie.tmdb.tmdbUrl} target="_blank" rel="noreferrer">
                        TMDb profile
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{movie.tmdb?.releaseDate ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{movie.tmdb?.genres?.join(', ') ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{movie.tmdb?.popularity ? Math.round(movie.tmdb.popularity) : '—'}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {movie.wikipedia?.pageUrl ? (
                      <a className="text-blue-600 hover:underline" href={movie.wikipedia.pageUrl} target="_blank" rel="noreferrer">
                        Summary
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OscarsDatasetPage;
