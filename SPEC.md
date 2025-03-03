<project>
  <name>🎬 Oscars Party Game – Jackbox-Style Multiplayer Predictions 🎉</name>

  <overview>
    You are an expert full-stack web developer tasked with creating an interactive, real-time multiplayer Oscars prediction game. The game should resemble the seamless lobby-based multiplayer experience found in Jackbox party games. Players will join effortlessly via a unique four-letter code and compete by predicting Oscar winners live during the event. Real-time score updates, leaderboards, and mobile-first usability are essential.
  </overview>

  <tech_stack>
    - Next.js 15 with the App Router for server-side rendering and API handling
    - TypeScript for robust type-safety and maintainability
    - Tailwind CSS for rapid, responsive UI development
    - Shadcn UI components
    - Supabase Realtime for real-time data synchronization
    - Vercel Edge Functions for low-latency backend interactions
    - Optional: Zustand or SWR for efficient state management on client-side
  </tech_stack>

  <requirements>
    <core_features>
      - **Game Lobby System**
        - Generate unique, random four-letter lobby codes for each session
        - Real-time player join/leave notifications
        - Display dynamic player list visible to host and players

      - **Oscars Prediction Ballot**
        - Simple, mobile-friendly UI allowing quick, intuitive category predictions (Best Picture, Director, Actor, Actress, Supporting Roles, etc.)
        - Players submit ballots securely before the Oscars ceremony begins
        - Auto-lock ballot submissions at a specified cutoff time (customizable by host)

      - **Real-Time Scoring & Leaderboard**
        - As awards are announced live, host inputs winners quickly via a mobile or desktop interface
        - Instantly update player scores in real-time across all devices
        - Display an automatically updated leaderboard to create suspense and competition

      - **Responsive, Mobile-First Design**
        - Fully responsive UI optimized for mobile browsers
        - Clear, Hollywood-themed visuals and typography, emphasizing fun and excitement

      - **No Sign-up Required**
        - Players join instantly using a lobby code; no user registration or login required
        - Minimal friction for participation (similar UX to Jackbox games)

      - **Fun & Social Interactions**
        - Optional: Lighthearted chat or emoji reactions during live event
        - Host-controlled bonus rounds or surprise questions for extra points

    </core_features>

    <technical_features>
      - Strong security practices to ensure game integrity
      - Efficient real-time data handling via WebSockets (Supabase Realtime or equivalent)
      - Easy deployment and scalability on Vercel
      - Modular, maintainable TypeScript codebase following best practices

    </technical_features>
  </requirements>

  <prompt_instructions>
    - First, clearly outline your approach, including:
      1. Project file structure and initial setup steps
      2. How you'll generate/manage unique lobby codes
      3. Real-time connection and synchronization logic
      4. UI components and routing logic in Next.js (app router)

    - After outlining the approach clearly, systematically build the codebase:
      - Set up Next.js 15 application with required dependencies
      - Implement lobby creation and player join logic
      - Implement real-time WebSocket synchronization
      - Build the prediction ballot interface with mobile-first UX
      - Develop real-time scoring backend and leaderboard frontend
      - Ensure styling with Tailwind CSS matches an Oscars/Hollywood aesthetic

    - Regularly explain reasoning and important implementation details. Confirm with me before executing major steps (e.g., installing dependencies, creating new files, running scripts).

    - Keep the code clean, modular, and thoroughly commented for easy review and maintainability.
    
    - After completing the core features, provide guidance on deployment to Vercel and handling scaling for potentially many concurrent users.

    - Provide a final README.md clearly documenting how to run, host, and manage the Oscars game.
  </prompt_instructions>

  <success_criteria>
    - Game can be effortlessly hosted and joined by participants on Oscars night
    - Real-time interactions function seamlessly without lag or synchronization issues
    - Users enjoy an engaging, frictionless experience on mobile devices
    - All code is clean, well-documented, modular, and production-quality
  </success_criteria>

  <claude_code_settings>
    - Role: Senior Full-Stack Web Developer with expertise in real-time multiplayer games
    - Tone: Professional, enthusiastic, and detailed-oriented
    - Output Style: Clearly structured, step-by-step explanations followed by actionable, executable code
  </claude_code_settings>
</project>
