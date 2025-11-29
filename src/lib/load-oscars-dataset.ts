import fs from 'node:fs';
import path from 'node:path';

export interface NomineeRecord {
  name?: string;
  movie?: string;
}

export interface OscarsDataset {
  generatedAt: string;
  source: string;
  enrichment: {
    tmdb: boolean;
    wikipedia: boolean;
  };
  categories: Record<string, Array<string | NomineeRecord>>;
  movies: Array<{
    title: string;
    tmdb: null | {
      id: number;
      title: string;
      releaseDate: string;
      runtimeMinutes: number;
      budget: number;
      revenue: number;
      genres: string[];
      voteAverage: number;
      voteCount: number;
      popularity: number;
      tmdbUrl: string;
    };
    wikipedia: null | {
      title: string;
      extract: string;
      pageUrl: string;
    };
  }>;
  people: Array<{
    name: string;
    tmdb: null | {
      id: number;
      name: string;
      knownFor: string[];
      popularity: number;
      tmdbUrl: string;
    };
    wikipedia: null | {
      title: string;
      extract: string;
      pageUrl: string;
    };
  }>;
}

export const loadOscarsDataset = (): OscarsDataset => {
  const datasetPath = path.join(process.cwd(), 'public', 'data', 'oscars-dataset.json');
  const raw = fs.readFileSync(datasetPath, 'utf8');
  return JSON.parse(raw) as OscarsDataset;
};
