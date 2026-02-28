# VietLaw Platform - Feature Specification

## 1. Page Structure

### 1.1 Homepage (`/`)
- Hero section with global search
- Document type grid navigation
- Recent documents list
- Quick access to new legal analysis

### 1.2 Document Database (`/documents`)
- Filterable document list
- Filters: Type, Status, Issuing Body, Year
- Pagination with infinite scroll option
- Sort by: Date issued, Date effective, Relevance

### 1.3 Document Reader (`/documents/[slug]`) - CORE PAGE
Three-panel layout:
- **Left sidebar**: Table of contents (chapters, sections, articles)
- **Main content**: Article-by-article display with stable IDs
- **Right sidebar**: Notes, references, practical resources

### 1.4 Search Results (`/search`)
- Global search results
- Grouped by: Documents and Articles
- Highlighted matches
- Filter refinement

### 1.5 Workspace (`/workspace`)
- Workspace management
- Member list and invitations
- Shared annotations view
- Workspace notes

### 1.6 User Account (`/account`)
- Profile settings
- Bookmarks and history
- Notification preferences

---

## 2. Core Features

### 2.1 Document Management

| Feature | Priority | Description |
|---------|----------|-------------|
| Document listing | P0 | Browse and filter all documents |
| Document viewer | P0 | Read documents article by article |
| Table of contents | P0 | Navigate document structure |
| Deep linking | P0 | Stable URLs for each article |
| Related documents | P1 | Show amendments, references |
| Document history | P1 | Track document versions |

### 2.2 Search System

#### Global Search (P0)
```
Search targets:
- Document title
- Document number
- Article content
- Keywords

Filters:
- Document type (LAW, DECREE, etc.)
- Effective status
- Issuing date range
- Issuing body

Index: Meilisearch at article level
```

#### In-Document Search (P0)

**Mode A - Exact Match**
- Behaves like browser Ctrl+F
- Highlights exact matching words/phrases
- Navigate between matches with up/down arrows
- Show match count per article

**Mode B - Semantic Search**
- User enters intent/meaning description
- System finds relevant articles without exact keyword match
- Uses article metadata: keywords, summary
- Rule-based or embedding-based matching
- **IMPORTANT**: Does NOT provide legal conclusions

### 2.3 Annotation & Collaboration

#### Highlighting (P0)
- Select text in any article
- Choose highlight color (yellow, green, blue, pink)
- Highlight persists with text anchoring

#### Notes (P0)
- Attach notes to highlighted text
- Markdown support
- Private or workspace-shared
- Text range anchoring for stability

#### Mentions (P1)
- @username in notes
- In-app notifications
- Optional email notifications

#### Workspace Collaboration (P1)
- Company-level workspaces
- Shared annotations within workspace
- Role-based access (Admin, Member, Viewer)

### 2.4 Practical References (P1)

For important articles, show "Practical References" panel:

**Tab 1 - Real-world Cases**
- Court judgments
- Administrative penalty decisions
- Metadata + external links only

**Tab 2 - Expert Articles**
- Legal expert analyses
- Law firm publications
- Academic papers

**Tab 3 - Internal Workspace Notes**
- Organization-specific notes
- Visible to workspace members only

**Disclaimer**: All information is for reference only.

---

## 3. Database Schema Summary

### Core Tables

```
documents
├── id (PK)
├── documentNumber (unique)
├── title
├── titleSlug (unique)
├── documentType
├── issuingBody
├── issuedDate
├── effectiveDate
├── status
├── keywords[]
└── summary

articles
├── id (PK)
├── documentId (FK)
├── articleId (unique, stable ID)
├── articleNumber
├── title
├── content
├── contentHtml
├── chapterNumber
├── chapterTitle
├── orderIndex
├── keywords[]
├── summary
└── hasPracticalReferences

article_versions
├── id (PK)
├── articleId (FK)
├── versionNumber
├── content
├── changeType
├── effectiveFrom
└── effectiveUntil

article_resources
├── id (PK)
├── articleId (FK)
├── resourceType
├── title
├── source
├── externalUrl
└── excerpt
```

### User & Collaboration Tables

```
users
├── id (PK)
├── email (unique)
├── passwordHash
├── fullName
└── isActive

workspaces
├── id (PK)
├── name
├── slug (unique)
└── companyName

workspace_members
├── id (PK)
├── workspaceId (FK)
├── userId (FK)
└── role

annotations
├── id (PK)
├── articleId (FK)
├── userId (FK)
├── workspaceId (FK, nullable)
├── startOffset
├── endOffset
├── selectedText
├── annotationType
├── highlightColor
├── noteContent
└── visibility

mentions
├── id (PK)
├── annotationId (FK)
└── mentionedUserId (FK)

notifications
├── id (PK)
├── userId (FK)
├── type
├── title
├── message
└── isRead
```

---

## 4. Search Logic

### Meilisearch Configuration

**Documents Index**
```javascript
{
  searchableAttributes: ['title', 'documentNumber', 'keywords', 'summary'],
  filterableAttributes: ['documentType', 'status', 'issuingBody', 'issuedDate'],
  sortableAttributes: ['issuedDate', 'effectiveDate', 'title'],
}
```

**Articles Index** (Primary search)
```javascript
{
  searchableAttributes: ['content', 'title', 'articleNumber', 'keywords', 'summary'],
  filterableAttributes: ['documentId', 'documentNumber'],
  sortableAttributes: ['articleNumber'],
}
```

### In-Document Semantic Search

```
For semantic mode:
1. Query enters system
2. Search against article keywords and summaries
3. Meilisearch typo-tolerance helps with variants
4. Results ranked by relevance to meaning
5. Return matching articles with context

Enhancement options:
- Rule-based synonym expansion
- Embedding-based semantic similarity (future)
```

---

## 5. Collaboration & Permission Model

### Visibility Levels

| Level | Who Can See |
|-------|-------------|
| PRIVATE | Only the creator |
| WORKSPACE | All members of the workspace |

### Workspace Roles

| Role | Permissions |
|------|-------------|
| SUPER_ADMIN | Platform-level admin |
| WORKSPACE_ADMIN | Manage workspace members, all actions |
| MEMBER | Create/edit own annotations, view shared |
| VIEWER | Read-only access |

### Permission Matrix

| Action | Admin | Member | Viewer |
|--------|-------|--------|--------|
| View documents | ✓ | ✓ | ✓ |
| Create private annotation | ✓ | ✓ | ✓ |
| Create workspace annotation | ✓ | ✓ | ✗ |
| Edit own annotation | ✓ | ✓ | ✗ |
| Delete own annotation | ✓ | ✓ | ✗ |
| Invite members | ✓ | ✗ | ✗ |
| Remove members | ✓ | ✗ | ✗ |
| Create workspace notes | ✓ | ✓ | ✗ |

---

## 6. UX Design Guidelines

### Document Reader Experience
- Clean, distraction-free reading
- Serif font for article content (better readability)
- Generous line height and margins
- Sticky header with document info
- Smooth scroll to articles from TOC

### Search Experience
- Instant search suggestions
- Highlighted matches in results
- Clear indication of exact vs semantic mode
- Easy filter application/removal

### Annotation Experience
- Non-intrusive highlight popup
- Quick color selection
- Inline note editor
- Visual indicator for annotated sections

### Mobile Considerations
- Collapsible sidebars
- Touch-friendly annotation
- Swipe navigation between articles

---

## 7. Strict Constraints

1. **NO legal advice** - System provides documents, references, annotations only
2. **NO automated legal conclusions** - No AI-generated legal interpretations
3. **NO chatbot lawyer** - No conversational legal assistance
4. **ONLY document search, references, annotations, and collaboration**

All practical reference sections must include disclaimer:
> "Thông tin chỉ mang tính tham khảo, không cấu thành tư vấn pháp lý."
> ("Information is for reference only, does not constitute legal advice.")
