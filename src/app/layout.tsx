import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movie Night Party | Multiplayer Film Prediction & Trivia Game",
  description: "Join the ultimate movie night party with real-time predictions, trivia challenges, and live leaderboard for award shows, franchise marathons, and movie nights.",
  keywords: "movie night, film trivia, predictions, multiplayer, game, award shows, box office, movie ratings, film quiz",
  authors: [{ name: "Movie Night Party" }],
  openGraph: {
    title: "Movie Night Party | Multiplayer Film Prediction & Trivia Game",
    description: "Join the ultimate movie night party with real-time predictions, trivia challenges, and live leaderboard for award shows, franchise marathons, and movie nights.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
