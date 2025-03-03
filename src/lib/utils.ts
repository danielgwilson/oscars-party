import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a random 4-letter code for game lobbies
export function generateLobbyCode() {
  // Use letters that are easy to distinguish (no I, O, 0, 1, etc.)
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  
  // Generate a movie-themed code like FILM, STAR, HERO if possible, otherwise random
  const movieThemes = ['FILM', 'STAR', 'HERO', 'CAST', 'REEL', 'PLOT', 'SHOW', 'EPIC', 'ACTS', 'PLAY'];
  if (Math.random() < 0.3) { // 30% chance of a themed code
    result = movieThemes[Math.floor(Math.random() * movieThemes.length)];
  } else {
    for (let i = 0; i < 4; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
  }
  
  return result;
}

// Format a date to a readable string
export function formatDate(date: string) {
  return new Date(date).toLocaleString();
}
