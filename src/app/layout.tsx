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
  title: "You Call Yourself a Movie Buff? | AI-Powered Trivia & Roast Game",
  description: "Test your movie knowledge in this multiplayer trivia game where AI roasts you mercilessly for wrong answers and adapts questions to what you claim to know.",
  keywords: "movie trivia, movie roast, film quiz, movie buff, multiplayer, game, AI-powered, movie knowledge, film quiz",
  authors: [{ name: "You Call Yourself a Movie Buff?" }],
  openGraph: {
    title: "You Call Yourself a Movie Buff? | AI-Powered Trivia & Roast Game",
    description: "Test your movie knowledge in this multiplayer trivia game where AI roasts you mercilessly for wrong answers and adapts questions to what you claim to know.",
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
