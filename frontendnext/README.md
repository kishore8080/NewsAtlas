# EazyPrepAI Frontend

A modern, responsive frontend for EazyPrepAI - an AI-powered UPSC preparation platform built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- 🏠 **Homepage** - Beautiful landing page with feature overview
- 📊 **Dashboard** - Analytics and progress tracking
- 📚 **Study Planner** - AI-powered personalized study plans
- 🎯 **Daily Quiz** - Interactive MCQ quizzes
- 📋 **Test Series** - Comprehensive test series for UPSC preparation
- 📰 **Current Affairs** - Daily news and updates
- 📝 **AI Notes** - Curated study notes by subject
- ✍️ **Answer Evaluation** - AI-powered answer evaluation with feedback
- 🤖 **AI Mentor** - 24/7 chat-based mentorship

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running (see main README)

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Set up environment variables:
Create a `.env.local` file in the `frontendnext` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
# Or your production API URL
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontendnext/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Dashboard with analytics
│   ├── study-planner/      # AI study planner
│   ├── quiz/               # Quiz pages
│   ├── test-series/        # Test series
│   ├── current-affairs/    # Current affairs news
│   ├── notes/              # AI-curated notes
│   ├── answer-evaluation/  # Answer evaluation
│   ├── mentorship/         # AI mentor chat
│   └── layout.tsx          # Root layout with navigation
├── components/             # Reusable components
│   ├── ui/                 # UI components (Button, Card)
│   └── Navigation.tsx      # Main navigation component
├── lib/                    # Utility functions
│   └── api.ts              # API client functions
└── public/                 # Static assets
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Fonts**: Geist Sans & Geist Mono

## API Integration

The frontend expects a FastAPI backend running on `http://localhost:8000` by default. Update `NEXT_PUBLIC_API_URL` in your `.env.local` file to point to your backend.

Current API endpoints used:
- `GET /quiz/daily` - Fetch daily quiz questions

## Building for Production

```bash
npm run build
npm start
```

## Next Steps

1. **Connect Backend APIs**: Update API calls in each page to connect to your actual backend endpoints
2. **Add Authentication**: Implement user authentication and protected routes
3. **Add State Management**: Consider adding Zustand or Redux for global state
4. **Enhance UI**: Add animations, loading states, and error handling
5. **Add Testing**: Set up Jest and React Testing Library
6. **Optimize Performance**: Add image optimization, code splitting, etc.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
