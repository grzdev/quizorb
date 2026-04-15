# QuizOrb

QuizOrb is a real-time multiplayer quiz platform that lets anyone create and play quizzes instantly, with no signup required.

Generate questions, share a link, and start playing in seconds.

## Live Demo

- Live App: https://quizorb.netlify.app  
- Demo Video: https://www.youtube.com/watch?v=wD7W_B6rfSI

## Features

- Real-time multiplayer gameplay using WebSockets
- No-signup, instant-play room creation
- AI-generated quizzes from any topic
- Trivia difficulty selection: Easy, Medium, and Hard
- Multiple game modes: Trivia, Custom, and Social
- Shareable join links with prefilled room codes
- Live gameplay with final leaderboard
- File upload to generate quiz content
- Instant play with no authentication required

## How It Works

1. Create a game by selecting a mode, topic, and difficulty.
2. Generate questions with AI, upload a file, use a preset pack, or input custom questions.
3. Create a room.
4. Share the room link or room code.
5. Players join instantly.
6. Play in real time.
7. View final results on the leaderboard.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Socket.IO Client

### Backend

- Node.js
- Express
- Socket.IO
- TypeScript
- Multer for file uploads

### AI

- Groq API using an OpenAI-compatible client

### Deployment

- Netlify for the frontend
- Render for the backend

### Testing

- TestSprite MCP
- Playwright-based frontend validation

## Project Structure

```text
client/            React frontend
server/            Express and Socket.IO backend
testsprite_tests/  TestSprite-generated test cases and results
netlify.toml       Netlify frontend build configuration
render.yaml        Render backend deployment configuration
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- pnpm
- A Groq API key for AI-powered quiz generation

### Backend Setup

Create `server/.env`:

```env
GROQ_API_KEY=your_groq_api_key
PORT=4000
```

Install dependencies and start the API server:

```bash
cd server
pnpm install
pnpm dev
```

By default, the backend runs on:

```text
http://localhost:4000
```

### Frontend Setup

Create a frontend environment file if you need to point the client at a custom backend URL:

```env
VITE_API_URL=http://localhost:4000
```

Install dependencies and start the Vite dev server:

```bash
cd client
pnpm install
pnpm dev
```

By default, the frontend runs on:

```text
http://localhost:5173
```

## Available Scripts

### Client

```bash
pnpm dev       # Start the Vite development server
pnpm build     # Type-check and build the frontend
pnpm lint      # Run ESLint
pnpm preview   # Preview the production build locally
```

### Server

```bash
pnpm dev       # Start the backend in watch mode
pnpm build     # Compile TypeScript to dist/
pnpm start     # Run the compiled backend
```

## Environment Variables

### Client

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | No | Backend API and Socket.IO server URL. Defaults to `http://localhost:4000`. |

### Server

| Variable | Required | Description |
| --- | --- | --- |
| `GROQ_API_KEY` | Yes | API key used for Groq-powered quiz generation. |
| `PORT` | No | Port for the Express and Socket.IO server. Defaults to `4000`. |

## API Overview

The backend exposes REST endpoints for quiz generation and room setup, while gameplay is synchronized through Socket.IO events.

### REST Endpoints

- `POST /api/quizzes/generate` - generate built-in topic questions
- `POST /api/quizzes/groq-generate` - generate AI trivia questions from a topic
- `POST /api/quizzes/from-file` - generate questions from an uploaded PDF, DOCX, or TXT file
- `GET /api/packs` - list available social quiz packs
- `GET /api/packs/:pack` - fetch questions from a social quiz pack
- `POST /api/rooms/create` - create a multiplayer room
- `GET /api/rooms/:roomCode` - fetch room details

### File Uploads

QuizOrb supports quiz generation from:

- PDF files
- DOCX files
- TXT files

Uploaded files are processed in memory and are limited to 2 MB.

## Testing

This project uses TestSprite MCP to generate structured test cases and validate application behavior.

All test artifacts are stored in:

```text
testsprite_tests/
```

### Coverage

Frontend, Playwright-based:

- Quiz creation flow
- Trivia generation
- Deep link join with `/join?code=...`
- Gameplay and leaderboard flow
- Replay flow

Backend:

- API validation for quiz generation
- Room lifecycle: create, fetch, and invalid cases

### Results

Testing was performed in multiple iterations:

- Initial run exposed issues in deep link joining, room creation state, invalid room handling, and replay flow.
- Subsequent fixes improved stability.
- Final round validated the core flows successfully.
- Backend smoke tests: 4/4 passed.

## Deployment Notes

The frontend is configured for Netlify through `netlify.toml`:

- Base directory: `client`
- Build command: `pnpm build`
- Publish directory: `client/dist`

The backend is configured for Render through `render.yaml`:

- Root directory: `server`
- Build command: `pnpm install --frozen-lockfile && pnpm build`
- Start command: `pnpm start`
- Required secret: `GROQ_API_KEY`

For production, set `VITE_API_URL` in Netlify to the deployed Render backend URL.

## Design Goals

The project focuses on reducing friction in multiplayer quiz experiences:

- Fast setup
- AI-assisted content generation
- Simple sharing and joining
- Clear live feedback during gameplay
- A final leaderboard that makes each round feel complete

The goal is to make starting a multiplayer quiz as easy as sending a link.

## Notes for Contributors

- Keep room and gameplay behavior synchronized between the REST API and Socket.IO events.
- Avoid committing secrets or local `.env` files.
- Run the client build and relevant smoke tests before deployment.
- Update `testsprite_tests/` when TestSprite generates new validation artifacts.
