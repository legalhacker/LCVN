# VietLaw Platform - API Documentation

## Base URL
```
Development: http://localhost:3001/api
Production: https://api.vietlaw.vn/api
```

## Authentication
All authenticated endpoints require Bearer token:
```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### Auth

#### POST /auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "minimum8chars",
  "fullName": "Nguyễn Văn A"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A"
  },
  "token": "eyJhbG..."
}
```

#### POST /auth/login
Authenticate and get token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": { "id": "...", "email": "...", "fullName": "..." },
  "token": "eyJhbG..."
}
```

#### GET /auth/me
Get current user profile. **Requires auth.**

**Response:** `200 OK`
```json
{
  "id": "...",
  "email": "user@example.com",
  "fullName": "Nguyễn Văn A",
  "workspaceMemberships": [
    { "workspace": { "id": "...", "name": "Phòng Pháp chế", "slug": "..." }, "role": "MEMBER" }
  ]
}
```

---

### Documents

#### GET /documents
List documents with filters.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| type | string | Document type filter |
| status | string | Status filter |
| issuingBody | string | Issuing body filter |
| year | number | Year issued filter |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "...",
      "documentNumber": "45/2024/QH15",
      "title": "Luật Đất đai",
      "titleSlug": "luat-dat-dai-2024",
      "documentType": "LAW",
      "issuingBody": "Quốc hội",
      "issuedDate": "2024-01-18T00:00:00Z",
      "status": "EFFECTIVE",
      "_count": { "articles": 256 }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### GET /documents/:slug
Get document by slug with table of contents.

**Response:** `200 OK`
```json
{
  "id": "...",
  "documentNumber": "45/2024/QH15",
  "title": "Luật Đất đai",
  "articles": [...],
  "tableOfContents": [
    {
      "chapterNumber": "Chương I",
      "chapterTitle": "Những quy định chung",
      "sections": [],
      "articles": [
        { "articleId": "luat-dat-dai:dieu-1", "articleNumber": "Điều 1", "title": "Phạm vi điều chỉnh" }
      ]
    }
  ],
  "relatedFrom": [...],
  "relatedTo": [...]
}
```

#### GET /documents/:slug/full
Get document with full article content.

---

### Articles

#### GET /articles/:articleId
Get article by stable ID.

**Response:** `200 OK`
```json
{
  "id": "...",
  "articleId": "luat-dat-dai-2024:dieu-1",
  "articleNumber": "Điều 1",
  "title": "Phạm vi điều chỉnh",
  "content": "...",
  "contentHtml": "...",
  "keywords": ["phạm vi", "điều chỉnh", "đất đai"],
  "document": {
    "documentNumber": "45/2024/QH15",
    "title": "Luật Đất đai"
  },
  "versions": [...]
}
```

#### GET /articles/:articleId/resources
Get practical references for an article.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| tab | string | 'cases', 'expert', or 'workspace' |

**Response:** `200 OK`
```json
{
  "cases": [
    {
      "id": "...",
      "title": "Bản án số 45/2023/DS-PT",
      "source": "TAND TP.HCM",
      "resourceType": "COURT_CASE",
      "externalUrl": "https://...",
      "excerpt": "..."
    }
  ],
  "expertArticles": [...],
  "workspaceNotes": [...],
  "disclaimer": "Thông tin chỉ mang tính tham khảo..."
}
```

#### GET /articles/:articleId/annotations
Get annotations for article. **Requires auth.**

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| workspaceId | string | Include workspace annotations |

---

### Search

#### POST /search/global
Global search across all documents.

**Request:**
```json
{
  "q": "quyền sử dụng đất",
  "type": "LAW",
  "status": "EFFECTIVE",
  "page": 1,
  "limit": 20
}
```

**Response:** `200 OK`
```json
{
  "articles": {
    "hits": [
      {
        "id": "...",
        "articleId": "luat-dat-dai:dieu-5",
        "articleNumber": "Điều 5",
        "content": "...",
        "documentNumber": "45/2024/QH15",
        "_formatted": {
          "content": "...về <mark>quyền sử dụng đất</mark>..."
        }
      }
    ],
    "totalHits": 45,
    "page": 1,
    "limit": 20
  },
  "documents": {
    "hits": [...],
    "totalHits": 5
  }
}
```

#### POST /search/document
In-document search (advanced Ctrl+F).

**Request:**
```json
{
  "q": "chuyển nhượng",
  "documentId": "doc_123",
  "mode": "exact"  // or "semantic"
}
```

**Response:** `200 OK`
```json
{
  "hits": [
    {
      "id": "...",
      "articleId": "...",
      "articleNumber": "Điều 45",
      "_formatted": {
        "content": "...việc <mark>chuyển nhượng</mark> quyền..."
      }
    }
  ],
  "totalHits": 12,
  "mode": "exact"
}
```

#### GET /search/filters
Get available filter options.

---

### Workspaces

#### GET /workspaces
List user's workspaces. **Requires auth.**

#### POST /workspaces
Create workspace. **Requires auth.**

**Request:**
```json
{
  "name": "Phòng Pháp chế",
  "description": "Workspace cho phòng pháp chế",
  "companyName": "Công ty ABC"
}
```

#### POST /workspaces/:workspaceId/invite
Invite member to workspace. **Requires auth + admin.**

**Request:**
```json
{
  "email": "member@company.com",
  "role": "MEMBER"
}
```

#### GET /workspaces/:workspaceId/notes
Get workspace notes. **Requires auth + membership.**

---

### Annotations

#### GET /annotations
Get user's annotations. **Requires auth.**

#### POST /annotations
Create annotation. **Requires auth.**

**Request:**
```json
{
  "articleId": "luat-dat-dai:dieu-1",
  "workspaceId": "ws_123",
  "startOffset": 100,
  "endOffset": 150,
  "selectedText": "quyền sử dụng đất",
  "annotationType": "note",
  "highlightColor": "yellow",
  "noteContent": "Quan trọng cho dự án XYZ",
  "visibility": "WORKSPACE",
  "mentionUserIds": ["user_456"]
}
```

#### PUT /annotations/:id
Update annotation. **Requires auth + ownership.**

#### DELETE /annotations/:id
Delete annotation. **Requires auth + ownership.**

---

### Notifications

#### GET /notifications
Get user's notifications. **Requires auth.**

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| unread | boolean | Only unread if true |

#### POST /notifications/read
Mark notifications as read. **Requires auth.**

**Request:**
```json
{
  "ids": ["notif_1", "notif_2"]  // or omit for all
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": [...]  // For validation errors
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| AUTH_REQUIRED | 401 | Authentication required |
| INVALID_TOKEN | 401 | Invalid or expired token |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Request validation failed |
| NOT_MEMBER | 403 | Not a workspace member |
| INSUFFICIENT_ROLE | 403 | Role doesn't permit action |
