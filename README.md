# VietLaw Platform

A legal document research and collaboration platform for Vietnamese legal documents.

## Overview

VietLaw is designed for enterprise users who regularly work with Vietnamese legal documents, including:
- Enterprise legal/compliance staff
- Internal legal teams in companies
- Managers or specialists who need to interpret and apply legal documents
- Organizations that need shared access to legal knowledge

**Important**: This platform provides documents, references, annotations, and citations only. It does NOT provide legal advice.

## Features

- **Document Database**: Browse laws, decrees, circulars, and more
- **Article-level Search**: Full-text and semantic search at article level
- **Document Reader**: Clean reading experience with table of contents
- **Annotations**: Highlight and add notes to any text
- **Workspace Collaboration**: Share annotations within your organization
- **Practical References**: Court cases, expert articles linked to relevant articles

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, React, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL with Prisma ORM |
| Search | Meilisearch |
| Auth | JWT |

## Project Structure

```
vietlaw-platform/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/      # API endpoints
│   │   │   ├── middleware/  # Auth, error handling
│   │   │   └── controllers/
│   │   ├── services/        # Business logic
│   │   ├── config/          # Configuration
│   │   └── types/           # TypeScript types
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   ├── stores/          # Zustand stores
│   │   └── types/           # TypeScript types
│   └── package.json
└── docs/
    ├── ARCHITECTURE.md      # System design
    ├── FEATURES.md          # Feature specs
    └── API.md               # API documentation
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Meilisearch (or use Meilisearch Cloud)
- Redis (optional, for caching)

### 1. Clone and Install

```bash
# Clone the repository
cd vietlaw-platform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your database and Meilisearch credentials
```

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Database Setup

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed with sample data
npm run db:seed
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API docs: http://localhost:3001/api-docs (if enabled)

### 5. Initialize Search

```bash
cd backend
npm run search:sync
```

## Deployment

### Recommended Stack

| Service | Provider Options |
|---------|------------------|
| Frontend | Vercel, Netlify |
| Backend | Railway, Render, Fly.io |
| Database | Supabase, Neon, Railway |
| Search | Meilisearch Cloud |
| Redis | Upstash |

### Environment Variables (Production)

```bash
# Backend
DATABASE_URL="postgresql://..."
JWT_SECRET="secure-random-string"
MEILISEARCH_HOST="https://..."
MEILISEARCH_API_KEY="..."
FRONTEND_URL="https://your-domain.com"

# Frontend
NEXT_PUBLIC_API_URL="https://api.your-domain.com"
```

## Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Feature Specification](./docs/FEATURES.md)
- [API Documentation](./docs/API.md)

## Key Design Decisions

### Article-centric Architecture
Every legal document is decomposed into individual articles with stable unique IDs. This enables:
- Deep linking to specific articles
- Article-level search indexing
- Precise annotations

### Stable Article IDs
Format: `{document-slug}:{article-number}`
Example: `luat-dat-dai-2024:dieu-1`

These IDs remain stable even if internal database IDs change.

### Search Strategy
- **Global search**: Meilisearch indexes at article level
- **In-document search**: Two modes
  - Exact: Keyword matching
  - Semantic: Meaning-based using keywords and summaries

### Annotation Anchoring
Annotations are anchored to text using:
- Character offsets (start/end position)
- Selected text snapshot (for validation)

This provides resilience to minor document updates.

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact the development team.
