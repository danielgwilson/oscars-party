# 🎬 Oscars Party Game – Jackbox-Style Multiplayer Predictions 🎉  

**Version:** ULTIMATE EDITION™️  

## **1. Overview**  
You are a senior full-stack web developer building a **real-time multiplayer Oscars prediction game** inspired by Jackbox games. Players **join via a four-letter code**, predict Oscar winners, participate in **live AI-powered trivia**, and experience **real-time leaderboards and film insights** during the live Oscars ceremony.  

## **2. Existing Setup**  
- **Next.js 15 (App Router)** – SSR, API routes, and UI rendering  
- **Tailwind CSS v4** – Responsive, modern styling  
- **Shadcn UI** – Clean, component-based design  
- **@supabase/ssr installed** – Used for real-time synchronization  
- **Supabase credentials stored in `.env`**  
- **`OPENAI_API_KEY` stored in `.env`** for AI-generated insights  
- **Vercel Edge Functions available** for low-latency backend tasks  

## **3. Tech Stack**  
- **Next.js 15 (App Router)** – Server and client rendering  
- **TypeScript** – Type safety and scalability  
- **Tailwind CSS v4 + Shadcn UI** – UI components and styling  
- **Supabase** – Realtime WebSockets + Postgres for live multiplayer sync  
- **Vercel Edge Functions** – For fetching external APIs and real-time Oscars results  
- **Zustand** – Simple, performant state management  
- **OpenAI API** – AI-generated trivia and nominee insights  
- **TMDb API** – Film images, director info, metadata  
- **Wikipedia API** – Award category descriptions  
- **Oscars Results Scraper** – Auto-fetches live winners from trusted news sources  

---

## **4. Core Features**  
### **4.1. Instant Lobby System**  
✅ **Four-letter unique lobby codes** generated automatically  
✅ **Real-time player join/leave updates** (Supabase Realtime)  
✅ **Live player list UI with avatars and fun stats**  

### **4.2. Oscars Prediction Ballot**  
✅ **Mobile-friendly category selection UI**  
✅ **Auto-locking ballots before each category winner is announced**  
✅ **Secure storage of player picks in Supabase**  

### **4.3. Real-Time Scoring & Leaderboard**  
✅ **Automated winner detection via real-time Oscars data scraping**  
✅ **Backup: Manual host override if scraping fails**  
✅ **Instant, animated leaderboard updates when winners are revealed**  

### **4.4. Dynamic Trivia (Powered by OpenAI & TMDb)**  
✅ **Before each award, generate category-specific trivia questions**  
✅ **AI-generated, film-relevant trivia displayed in real time**  
✅ **Bonus point rounds for fastest correct answers**  

### **4.5. Film Insights & AI-Generated Predictions**  
✅ **Show nominee images, synopsis, director name (from TMDb)**  
✅ **AI-generated “Why It’s Going to Win” insights (GPT-powered)**  
✅ **Contextual award category explanations (via Wikipedia API)**  

### **4.6. Mobile-First, Immersive UI**  
✅ **Oscars-themed Hollywood aesthetic**  
✅ **Jackbox-style humor in UI copy & notifications**  
✅ **Cinematic animations for score updates, predictions, and trivia**  

### **4.7. Social & Interactive Elements**  
✅ **Emoji-react chat system for live reactions**  
✅ **Mini-games and bonus rounds during commercials**  
✅ **Live trivia leaderboards separate from main scoreboard**  

---

## **5. Data Architecture & APIs**  
### **5.1. Supabase Schema**  
- **`lobbies`** – Stores active game sessions (code, host, start time)  
- **`players`** – Tracks players and their picks  
- **`categories`** – Stores award categories, descriptions, historical facts  
- **`nominees`** – Holds nominee data (film, director, metadata, TMDb image URL)  
- **`winners`** – Updates in real time from scraping, triggering frontend updates  
- **`trivia`** – AI-generated trivia stored for each category  

### **5.2. Live Oscars Results (Real-Time Updates)**  
**Primary Source:** Oscars API (if available)  
**Backup:** Scraping Variety, IMDb, or official Oscars blog with headless browser  
**Fallback:** Host manually selects winners from a dropdown  

### **5.3. Film Images & Metadata**  
✅ **TMDb API → Fetch nominee posters, director names, synopsis**  
✅ **Store in Supabase to reduce API calls during event**  

### **5.4. Award Category Descriptions**  
✅ **Wikipedia API → Fetch brief, factual award category explanations**  
✅ **Store locally for faster retrieval during game**  

### **5.5. AI-Generated Predictions (OpenAI API)**  
✅ **Pre-generate “Why It’s Going to Win” insights using GPT**  
✅ **Prompt includes major precursor awards (Golden Globes, Critics’ Choice, etc.)**  
✅ **Stored ahead of time in Supabase to minimize latency during live game**  

---

## **6. Technical Implementation Plan**  
### **6.1. Step-by-Step Execution Plan**  
1. **Set up Supabase tables** (lobbies, players, categories, nominees, winners, trivia)  
2. **Build four-letter code lobby system** with WebSocket-powered live player list  
3. **Develop real-time Oscars result polling via scraper + API fallback**  
4. **Integrate TMDb API for film images & metadata**  
5. **Build category UI with Wikipedia API descriptions**  
6. **Develop live prediction ballot UX** (auto-locks when category winner is detected)  
7. **Implement AI trivia & insights using OpenAI API**  
8. **Deploy real-time updates via Supabase Realtime listeners**  
9. **Add Vercel Edge Functions to handle scraping & API calls efficiently**  
10. **Polish UI with animations, notifications, and cinematic effects**  

### **6.2. Real-Time Data Flow**
1. **Supabase Realtime WebSockets** → Instantly push updates for player joins, leaderboard changes, and trivia scores  
2. **Vercel Edge Functions** → Scrape live Oscars results every 30s, push updates to Supabase  
3. **Wikipedia & TMDb APIs** → Fetch educational content & film images  
4. **OpenAI API** → Pre-generate nominee insights & trivia before game starts  
5. **Frontend:** Next.js 15 UI subscribes to real-time changes  

---

## **7. Security & Performance Considerations**  
✅ **Rate-limiting on API calls** to prevent excessive requests  
✅ **Caching film data & award descriptions in Supabase** to reduce external API dependencies  
✅ **Error handling for failed scrapes** (automatically reattempt, notify host)  
✅ **Admin panel for emergency manual winner updates**  
✅ **Supabase row-level security (RLS) to prevent unauthorized data access**  

---

## **8. Deployment & Scaling Strategy**  
**Deployment:** Vercel (for Next.js frontend + Edge Functions)  
**Database & Realtime:** Supabase (scalable Postgres with WebSocket listeners)  
**Performance:**  
✅ **Images & assets CDN-hosted via TMDb + Vercel static serving**  
✅ **Serverless architecture ensures low-latency event performance**  

---

## **9. Success Criteria**  
✅ **Game automatically updates within seconds of an Oscar winner announcement**  
✅ **Players experience smooth, engaging, and interactive gameplay**  
✅ **Trivia and film insights educate & entertain without feeling intrusive**  
✅ **Game runs flawlessly on mobile & desktop during live event**  
✅ **No major delays or crashes under high concurrent usage**  

---

## **10. Claude Code Instructions**  
### **Expectations from Claude Code**  
- **Clearly explain implementation strategy before coding**  
- **Follow a structured, modular approach to building features**  
- **Use TypeScript and best practices for scalability**  
- **Ensure excellent documentation and maintainability**  
- **Confirm critical milestones before executing major steps**  

---

🚀 **Let’s build the ultimate Oscars party experience!** 🌟🎥🏆  
