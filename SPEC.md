# Oscars Party App Specification

## Overview

Create a real-time multiplayer prediction game for the Academy Awards. Users join virtual "parties" where they make predictions for Oscar categories and compete for points during the live show.

## Core Features

### Lobby System
- Hosts create game lobbies with unique 4-letter codes
- Players join using lobby code and username
- Host controls game state (prediction phase, live phase)
- Real-time list of connected players
- Spectator mode for viewers who don't want to compete

### Prediction System
- All major Oscar categories available for predictions
- Complete list of nominees per category with images
- Players select one nominee per category before show starts
- Optional category weighting (assign more points to categories)
- Host can lock predictions when ceremony begins

### Live Updates
- Host marks winners in real-time as awards are announced
- Scoring updates live on leaderboard
- Player predictions revealed after category is complete
- Animation/visual effects for correct predictions

### Scoring & Leaderboard
- Standard scoring: 1 point per correct prediction
- Optional weighted scoring for difficulty
- Real-time leaderboard showing rankings
- Visual indicators for position changes

### Trivia Rounds
- Optional trivia questions between awards
- Multiple choice format
- Quick-answer bonus points
- Oscars history and current nominee facts

## Technical Requirements

### Performance
- Support 2-50 concurrent users per lobby
- Low latency (<2s) for real-time updates
- Mobile-friendly responsive design

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
- Theme customization
- Chat functionality
- Integrated viewing party features

## Timeline
- Initial planning & design: 2 weeks
- Core features development: 6 weeks
- Testing & refinement: 2 weeks
- Launch: Prior to Academy Awards ceremony