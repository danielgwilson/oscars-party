import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const projectRoot = path.resolve(new URL('.', import.meta.url).pathname, '..');
const nomineesPath = path.join(projectRoot, 'nominees.json');
const outputDir = path.join(projectRoot, 'public', 'data');
const jsonOutput = path.join(outputDir, 'oscars-dataset.json');
const csvOutput = path.join(outputDir, 'oscars-dataset.csv');

const tmdbKey = process.env.TMDB_API_KEY ?? process.env.NEXT_PUBLIC_TMDB_API_KEY ?? '';
const tmdbHeaders = tmdbKey
  ? {
      accept: 'application/json',
      Authorization: `Bearer ${tmdbKey.startsWith('ey') ? tmdbKey : ''}`,
    }
  : undefined;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const readNominees = () => {
  const raw = fs.readFileSync(nomineesPath, 'utf8');
  return JSON.parse(raw);
};

const searchTmdb = async (endpoint, query) => {
  if (!tmdbHeaders) return null;
  try {
    const url = new URL(`https://api.themoviedb.org/3/search/${endpoint}`);
    url.searchParams.set('query', query);
    url.searchParams.set('language', 'en-US');

    const response = await fetch(url, {
      headers: {
        ...tmdbHeaders,
      },
    });

    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data.results) && data.results.length > 0 ? data.results[0] : null;
  } catch (error) {
    console.warn(`TMDb search failed for ${query}:`, error?.message ?? error);
    return null;
  }
};

const fetchMovieDetails = async (title) => {
  const hit = await searchTmdb('movie', title);
  if (!hit) return null;

  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${hit.id}?language=en-US`, {
      headers: {
        ...tmdbHeaders,
      },
    });

    if (!response.ok) return null;
    const data = await response.json();
    return {
      id: data.id,
      title: data.title,
      releaseDate: data.release_date,
      runtimeMinutes: data.runtime,
      budget: data.budget,
      revenue: data.revenue,
      genres: (data.genres ?? []).map((g) => g.name),
      voteAverage: data.vote_average,
      voteCount: data.vote_count,
      popularity: data.popularity,
      tmdbUrl: `https://www.themoviedb.org/movie/${data.id}`,
    };
  } catch (error) {
    console.warn(`TMDb movie lookup failed for ${title}:`, error?.message ?? error);
    return null;
  }
};

const fetchPersonDetails = async (name) => {
  const hit = await searchTmdb('person', name);
  if (!hit) return null;

  return {
    id: hit.id,
    name: hit.name,
    knownFor: (hit.known_for ?? []).map((item) => item.title || item.name).filter(Boolean),
    popularity: hit.popularity,
    tmdbUrl: `https://www.themoviedb.org/person/${hit.id}`,
  };
};

const fetchWikipediaSummary = async (title) => {
  try {
    const url = new URL('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title));
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return {
      title: data.title,
      extract: data.extract,
      pageUrl: data.content_urls?.desktop?.page,
    };
  } catch (error) {
    console.warn(`Wikipedia summary failed for ${title}:`, error?.message ?? error);
    return null;
  }
};

const collectMovies = async (categories) => {
  const movieSet = new Set();
  Object.values(categories).forEach((entries) => {
    entries.forEach((entry) => {
      if (typeof entry === 'string') {
        movieSet.add(entry);
      } else if (entry.movie) {
        movieSet.add(entry.movie);
      }
    });
  });

  const movies = [];
  for (const title of movieSet) {
    const [tmdb, wiki] = await Promise.all([
      fetchMovieDetails(title),
      fetchWikipediaSummary(title),
    ]);

    movies.push({
      title,
      tmdb,
      wikipedia: wiki,
    });

    if (tmdbHeaders) {
      await delay(250);
    }
  }

  return movies;
};

const collectPeople = async (categories) => {
  const names = new Set();
  Object.values(categories).forEach((entries) => {
    entries.forEach((entry) => {
      if (typeof entry === 'object' && entry.name) {
        names.add(entry.name);
      }
    });
  });

  const people = [];
  for (const name of names) {
    const [tmdb, wiki] = await Promise.all([
      fetchPersonDetails(name),
      fetchWikipediaSummary(name),
    ]);

    people.push({
      name,
      tmdb,
      wikipedia: wiki,
    });

    if (tmdbHeaders) {
      await delay(250);
    }
  }

  return people;
};

const buildCsv = (categories) => {
  const rows = ['category,nominee,movie'];
  Object.entries(categories).forEach(([category, entries]) => {
    entries.forEach((entry) => {
      if (typeof entry === 'string') {
        rows.push(`${JSON.stringify(category)},${JSON.stringify(entry)},`);
      } else {
        rows.push(`${JSON.stringify(category)},${JSON.stringify(entry.name)},${JSON.stringify(entry.movie)}`);
      }
    });
  });
  return rows.join('\n');
};

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const run = async () => {
  ensureDir(outputDir);
  const categories = readNominees();
  const [movies, people] = await Promise.all([
    collectMovies(categories),
    collectPeople(categories),
  ]);

  const dataset = {
    generatedAt: new Date().toISOString(),
    source: 'nominees.json with optional enrichment from TMDb and Wikipedia',
    enrichment: {
      tmdb: Boolean(tmdbHeaders),
      wikipedia: true,
    },
    categories,
    movies,
    people,
  };

  fs.writeFileSync(jsonOutput, JSON.stringify(dataset, null, 2));
  fs.writeFileSync(csvOutput, buildCsv(categories));

  console.log(`Dataset written to ${jsonOutput}`);
  console.log(`CSV written to ${csvOutput}`);
  console.log(`Movies: ${movies.length}, People: ${people.length}`);
};

run().catch((error) => {
  console.error('Failed to build dataset', error);
  process.exit(1);
});
