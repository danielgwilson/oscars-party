# 🎬 You Call Yourself a Movie Buff? – AI-Powered Movie Trivia & Roast Game

## **1. Overview**

**Project Type:** Multiplayer, real-time, AI-driven movie trivia & comedy game  
**Pivot Notice:** This is a **complete pivot** from the previous Oscars prediction game. **All prior game logic, components, and APIs should be removed or cleaned up** as we are now building a fresh experience.

**Game Concept:**  
This is a **movie trivia game where AI adapts questions based on movies the players know** and **roasts them mercilessly when they get answers wrong.** The goal is to make players laugh while keeping the game engaging, personal, and competitive.

## **2. Tech Stack**

✅ **Next.js 15 (App Router)** – Handles routing, SSR, and API endpoints  
✅ **TypeScript** – Type safety and scalability  
✅ **Tailwind CSS v4 + Shadcn UI** – Responsive and stylish UI  
✅ **Supabase** – Real-time WebSockets + Postgres for live multiplayer sync  
✅ **Vercel Edge Functions** – Handles trivia fetching, AI interactions, and score updates  
✅ **Zustand** – Simple, performant state management  
✅ **OpenAI API** – Generates AI-driven roasts & trivia  
✅ **TMDb API** – Fetches movie details & images  
✅ **Wikipedia API** – Provides category & film insights  

---

## **3. Core Features**

### **3.1. Instant Lobby System**
- Players **join via a four-letter code** (Jackbox-style)
- **Real-time player list updates** (Supabase Realtime)
- Fun, movie-themed avatars

### **3.2. Smart AI Trivia Engine**
- **At game start, players enter their top 5 favorite movies**
- AI generates **trivia questions tailored to what players actually know**
- AI adapts **difficulty dynamically** based on correct/incorrect answers

### **3.3. Real-Time Scoring & Leaderboard**
- **Live score updates via Supabase Realtime**
- Streaks & multipliers for consecutive correct answers
- AI keeps a **"Shame List" of movies players need to watch** if they miss too many questions

### **3.4. AI-Generated Roasts & Commentary**
- When a player **gets a question wrong, AI roasts them**
- Examples:
  - _"Danny, you claim to love sci-fi but just failed a _Blade Runner_ question. Hand over your nerd card."_
  - _"Yash, you missed a _Fast & Furious_ question? You are now permanently banned from saying ‘family.’"_
- AI tracks player performance and **customizes insults dynamically**

### **3.5. Movie Info & Insights**
- **Before each trivia round**, AI provides **fun facts about the featured movie**
- **Pulls images, synopsis, and cast from TMDb API**
- AI explains why **this movie is great—or why it sucks**

### **3.6. Social & Interactive Elements**
- **Emoji-react chat system** for live reactions
- AI generates **custom “Letterboxd-style” reviews** for each player’s performance
- **“Final Burn”** – AI does a **grand roast of the worst-performing player at the end**

---

## **4. Data Architecture & APIs**

### **4.1. Supabase Schema**
- **`lobbies`** – Stores active games (code, host, start time)
- **`players`** – Tracks players & their trivia accuracy
- **`questions`** – Stores dynamically generated AI trivia
- **`movies`** – Caches TMDb movie data for trivia
- **`roasts`** – AI-generated insults for each player’s mistakes

### **4.2. AI-Driven Features (OpenAI API)**
- **Trivia Generation:** AI formulates questions based on **movies players actually know**
- **Dynamic Roasts:** AI writes **customized insults based on player performance**
- **Final Burn:** AI delivers **a brutal, but hilarious endgame summary**

### **4.3. Real-Time Multiplayer (Supabase + Vercel Edge)**
- **Supabase Realtime WebSockets** – Live updates for scores & chat
- **Vercel Edge Functions** – AI trivia & roasts with minimal latency
- **TMDb API** – Fetches movie posters, cast info, synopses

---

## **5. Implementation Plan**

### **5.1. Step-by-Step Execution Plan**
1. **Clean up old Oscars code** – Remove all legacy functionality
2. **Set up new Supabase schema** – Lobbies, players, questions, roasts
3. **Develop game lobby system** – Generate four-letter codes, track players
4. **Integrate OpenAI trivia system** – Generate custom questions
5. **Implement real-time scoring & leaderboard UI**
6. **Build AI-powered roast system** – Dynamic responses to wrong answers
7. **Develop final burn mechanic** – AI summarizes funniest game moments
8. **Polish UI with animations, notifications, and cinematic effects**

---

## **6. Success Criteria**
✅ **Game runs smoothly with live players**
✅ **AI roasts are actually funny & engaging**
✅ **Trivia dynamically adapts to player knowledge**
✅ **Scoring, animations, and social elements work seamlessly**
✅ **Easily expandable with future game modes**

---

### 🚀 **Let’s build this!**
**Claude Code should implement this game in a modular way** so that **future game modes can be easily added later.** 🎥🔥
