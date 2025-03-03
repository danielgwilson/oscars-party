import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-amber-950 text-white">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-amber-400">🎬 You Call Yourself a Movie Buff? 🔥</h1>
          <p className="text-xl md:text-2xl text-amber-200 mb-8">Get roasted for your terrible movie opinions!</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          <Card className="bg-black/60 border-amber-600 shadow-amber-400/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-amber-400">Host a Game</CardTitle>
              <CardDescription className="text-amber-200">Create a new game for your friends</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Start a new AI-powered movie trivia game. Invite friends to join with a unique 4-letter code and prepare to be roasted when you miss questions!
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="default" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold">
                <Link href="/create">Host New Game</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-black/60 border-amber-600 shadow-amber-400/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-amber-400">Join a Game</CardTitle>
              <CardDescription className="text-amber-200">Enter a game code to join</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Got a code from a friend? Enter it to join their movie trivia party and see if you can avoid being publicly shamed for your movie knowledge!
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full border-amber-500 text-amber-400 hover:bg-amber-500/10">
                <Link href="/join">Join Game</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-16 max-w-3xl text-center">
          <h2 className="text-2xl font-semibold text-amber-400 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">🎬</div>
              <h3 className="text-xl font-medium text-amber-300 mb-2">1. Share Your Faves</h3>
              <p>Tell us your favorite movies so we can tailor trivia to what you know</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">🎮</div>
              <h3 className="text-xl font-medium text-amber-300 mb-2">2. Answer Trivia</h3>
              <p>Test your movie knowledge with dynamic AI-generated questions</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">🔥</div>
              <h3 className="text-xl font-medium text-amber-300 mb-2">3. Get Roasted</h3>
              <p>The AI will mercilessly mock you when you get answers wrong</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}