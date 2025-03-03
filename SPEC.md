# Movie Night Party App Specification

## Overview

Create a real-time multiplayer prediction and trivia game for movie nights and film award shows. Users join virtual "parties" where they make predictions about films, actors, and awards, and compete for points in real-time.

## Core Features

### Lobby System
- Hosts create game lobbies with unique 4-letter codes
- Players join using lobby code and username
- Host controls game state (prediction phase, live phase)
- Real-time list of connected players
- Spectator mode for viewers who don't want to compete

### Prediction System
- Multiple prediction categories available (awards, box office, movie ratings, etc.)
- One category displayed per screen with clear options
- Large tap targets with images for each option
- Players swipe or tap to navigate between prediction categories
- Visual progress indicator showing completion percentage
- Optional category weighting (assign more points to categories)
- Host can lock predictions when appropriate

### Live Updates
- Host marks correct answers in real-time as events occur
- Scoring updates live on leaderboard
- Player predictions revealed after each category is complete
- Animation/visual effects for correct predictions

### Scoring & Leaderboard
- Standard scoring: 1 point per correct prediction
- Optional weighted scoring for difficulty
- Real-time leaderboard showing rankings
- Streak bonuses for consecutive correct answers
- Achievement badges and visual rewards
- Celebratory animations for points earned
- Daily challenges and bonus opportunities
- Visual indicators for position changes

### Trivia Rounds
- Optional trivia questions about movies, actors, and film history
- Full-screen card for each question (Duolingo-style)
- Multiple choice format with large tap targets
- Visual countdown timer for quick-answer bonus points
- Immediate feedback with sound effects and animations
- Streaks and combo mechanics for consecutive correct answers
- Movie facts, behind-the-scenes info, and film history
- Custom trivia packs for specific genres or franchises

## Technical Requirements

### Performance & UX Design
- Support 2-50 concurrent users per lobby
- Low latency (<2s) for real-time updates
- Mobile-first portrait orientation design
- Single-screen gameplay (no scrolling within activities)
- Focus on one prediction/question at a time
- Duolingo-inspired gamification elements

### Data Model
- User accounts (optional)
- Lobbies with access codes
- Categories and nominees
- Player predictions
- Live results
- Trivia questions and answers

### Security
- Rate limiting for lobby creation
- Appropriate database permissions
- No sensitive user data collection

### Deployment
- Cloud hosting for reliability
- Database with real-time capabilities
- CI/CD pipeline with automated tests

## Future Enhancements
- Historical stats for returning users
- Social sharing of results
- Custom categories and predictions
- Theme customization for different movie genres
- Chat functionality
- Integrated viewing party features
- Movie recommendation engine
- Integration with movie rating APIs
- Custom game templates for popular franchises

## Game Types
- Award Show Predictions (Oscars, Golden Globes, etc.)
- Movie Night Trivia
- Box Office Battle (predict earnings)
- Franchise Marathon (specific trivia for movie series)
- Critics' Corner (predict critics' ratings)
- Themed Movie Nights (horror, sci-fi, comedy, etc.)