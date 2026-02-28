# VietLaw Platform - System Architecture

## Overview

A legal document research and collaboration platform for Vietnamese legal documents, optimized for enterprise users.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Next.js Frontend (React)                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │   │
│  │  │ Document │  │  Search  │  │Workspace │  │   Annotation     │   │   │
│  │  │  Reader  │  │  Pages   │  │  Pages   │  │   Components     │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS / REST API
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Node.js + Express Backend                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │   │
│  │  │ Document │  │  Search  │  │   User   │  │   Annotation     │   │   │
│  │  │   API    │  │   API    │  │   API    │  │      API         │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
┌───────────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐
│      PostgreSQL       │  │   Meilisearch   │  │     Redis (Cache)       │
│   (Primary Database)  │  │  (Full-text +   │  │  (Sessions, Rate Limit) │
│                       │  │   Semantic)     │  │                         │
│  - Documents          │  │                 │  │                         │
│  - Articles           │  │  - Article      │  │                         │
│  - Users              │  │    Index        │  │                         │
│  - Workspaces         │  │  - Document     │  │                         │
│  - Annotations        │  │    Index        │  │                         │
│  - Notifications      │  │                 │  │                         │
└───────────────────────┘  └─────────────────┘  └─────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14 (App Router) | SSR, routing, React framework |
| UI Components | Tailwind CSS + shadcn/ui | Rapid UI development |
| State Management | Zustand | Lightweight client state |
| Backend | Node.js + Express | REST API server |
| ORM | Prisma | Database access, migrations |
| Database | PostgreSQL 15+ | Primary data storage |
| Search Engine | Meilisearch | Full-text + semantic search |
| Cache | Redis | Session, rate limiting |
| Auth | JWT + bcrypt | Authentication |
| File Storage | S3-compatible | Document PDFs (optional) |

---

## Core Design Principles

1. **Article-centric architecture**: Every legal document is decomposed into individual articles with unique stable IDs
2. **Non-advisory**: System provides documents and references only, never legal conclusions
3. **Workspace isolation**: Multi-tenant with workspace-level data isolation
4. **Search-first UX**: Both global and in-document search are primary interaction patterns
5. **Annotation-rich**: Deep support for highlights, notes, and collaboration

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Production                                │
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │   Vercel    │    │   Railway   │    │   Managed Services  │ │
│  │  (Frontend) │    │  (Backend)  │    │                     │ │
│  │             │◄──►│             │◄──►│  - Supabase (PG)    │ │
│  │  Next.js    │    │  Express    │    │  - Meilisearch Cloud│ │
│  │             │    │             │    │  - Upstash (Redis)  │ │
│  └─────────────┘    └─────────────┘    └─────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Considerations

- All API endpoints require authentication (except public document views)
- Workspace data isolation at query level
- Rate limiting on search and API endpoints
- Input sanitization for search queries
- CORS restricted to known origins
- Audit logging for sensitive operations
