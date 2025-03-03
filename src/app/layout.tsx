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
  title: "Oscars Party 2025 | Multiplayer Prediction Game",
  description: "Join the ultimate Oscars prediction game with real-time updates, trivia, and live leaderboard during the Academy Awards ceremony.",
  keywords: "Oscars 2025, Academy Awards, predictions, multiplayer, game, trivia, movies, film",
  authors: [{ name: "Oscars Party Game" }],
  openGraph: {
    title: "Oscars Party 2025 | Multiplayer Prediction Game",
    description: "Join the ultimate Oscars prediction game with real-time updates, trivia, and live leaderboard during the Academy Awards ceremony.",
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
