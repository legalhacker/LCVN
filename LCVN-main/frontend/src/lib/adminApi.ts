const API_BASE = '';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAdmin<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    const msg = error.code ? `${error.error} [${error.code}]` : (error.error || `HTTP ${response.status}`);
    throw new Error(msg);
  }

  return response.json();
}

export function createAdminApi(token: string) {
  const opts = (extra: FetchOptions = {}): FetchOptions => ({ ...extra, token });

  return {
    // Stats
    getStats: () => fetchAdmin('/api/admin/stats', opts()),

    // Documents
    getDocuments: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAdmin(`/api/admin/documents${q}`, opts());
    },
    getDocument: (id: string) => fetchAdmin(`/api/admin/documents/${id}`, opts()),
    createDocument: (data: Record<string, unknown>) =>
      fetchAdmin('/api/admin/documents', opts({ method: 'POST', body: JSON.stringify(data) })),
    updateDocument: (id: string, data: Record<string, unknown>) =>
      fetchAdmin(`/api/admin/documents/${id}`, opts({ method: 'PUT', body: JSON.stringify(data) })),
    deleteDocument: (id: string) =>
      fetchAdmin(`/api/admin/documents/${id}`, opts({ method: 'DELETE' })),
    // Ingest articles from a parsed JSON upload.
    // Supports legacy format (article.content) and new clause-level format (article.clauses[]).
    // Called after createDocument(); stores Article + Clause records.
    ingestJsonArticles: (id: string, articles: unknown[]) =>
      fetchAdmin(`/api/admin/documents/${id}/json-articles`, opts({ method: 'POST', body: JSON.stringify({ articles }) })),

    uploadDocument: (id: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetch(`${API_BASE}/api/admin/documents/${id}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      });
    },

    uploadDocumentFile: async (id: string, file: File) => {
      const { upload } = await import('@vercel/blob/client');
      const blob = await upload(`documents/${id}/${file.name}`, file, {
        access: 'public',
        handleUploadUrl: `/api/admin/documents/${id}/file`,
        // JWT + fileSize travel via clientPayload (HTTPS-encrypted body, not headers)
        clientPayload: JSON.stringify({ jwtToken: token, fileSize: file.size }),
      });
      return {
        success: true,
        downloadUrl: blob.url,
        downloadFileName: file.name,
        downloadFileSize: file.size,
      };
    },

    deleteDocumentFile: (id: string) =>
      fetchAdmin(`/api/admin/documents/${id}/file`, opts({ method: 'DELETE' })),

    // Articles
    getArticles: (docId: string) => fetchAdmin(`/api/admin/articles/document/${docId}`, opts()),
    getArticle: (id: string) => fetchAdmin(`/api/admin/articles/${id}`, opts()),
    createArticle: (docId: string, data: Record<string, unknown>) =>
      fetchAdmin(`/api/admin/articles/document/${docId}`, opts({ method: 'POST', body: JSON.stringify(data) })),
    updateArticle: (id: string, data: Record<string, unknown>) =>
      fetchAdmin(`/api/admin/articles/${id}`, opts({ method: 'PUT', body: JSON.stringify(data) })),
    deleteArticle: (id: string) =>
      fetchAdmin(`/api/admin/articles/${id}`, opts({ method: 'DELETE' })),
    reorderArticles: (docId: string, order: Array<{ id: string; orderIndex: number }>) =>
      fetchAdmin(`/api/admin/articles/document/${docId}/reorder`, opts({ method: 'PUT', body: JSON.stringify({ order }) })),

    // Article search (used to pick link targets — excludes current document)
    searchArticles: (params: Record<string, string>) => {
      const q = '?' + new URLSearchParams(params).toString();
      return fetchAdmin(`/api/admin/articles/search${q}`, opts());
    },

    // Article-level relations (cross-article amendment/guidance links)
    getArticleRelations: (articleId: string) =>
      fetchAdmin(`/api/admin/article-relations/article/${articleId}`, opts()),
    createArticleRelation: (data: Record<string, unknown>) =>
      fetchAdmin('/api/admin/article-relations', opts({ method: 'POST', body: JSON.stringify(data) })),
    deleteArticleRelation: (id: string) =>
      fetchAdmin(`/api/admin/article-relations/${id}`, opts({ method: 'DELETE' })),
    importArticleRelations: (relations: unknown[]) =>
      fetchAdmin('/api/admin/article-relations/import', opts({ method: 'POST', body: JSON.stringify({ relations }) })),

    // Article annotations (legal notes, admin-managed)
    importArticleAnnotations: (annotations: unknown[]) =>
      fetchAdmin('/api/admin/article-annotations/import', opts({ method: 'POST', body: JSON.stringify({ annotations }) })),

    // Document-level relations
    getRelations: (docId: string) => fetchAdmin(`/api/admin/relations/document/${docId}`, opts()),
    createRelation: (data: Record<string, unknown>) =>
      fetchAdmin('/api/admin/relations', opts({ method: 'POST', body: JSON.stringify(data) })),
    deleteRelation: (id: string) =>
      fetchAdmin(`/api/admin/relations/${id}`, opts({ method: 'DELETE' })),

    // Pages
    getPages: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAdmin(`/api/admin/pages${q}`, opts());
    },
    getPage: (id: string) => fetchAdmin(`/api/admin/pages/${id}`, opts()),
    createPage: (data: Record<string, unknown>) =>
      fetchAdmin('/api/admin/pages', opts({ method: 'POST', body: JSON.stringify(data) })),
    updatePage: (id: string, data: Record<string, unknown>) =>
      fetchAdmin(`/api/admin/pages/${id}`, opts({ method: 'PUT', body: JSON.stringify(data) })),
    deletePage: (id: string) =>
      fetchAdmin(`/api/admin/pages/${id}`, opts({ method: 'DELETE' })),

    // Updates
    getUpdates: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAdmin(`/api/admin/updates${q}`, opts());
    },
    getUpdate: (id: string) => fetchAdmin(`/api/admin/updates/${id}`, opts()),
    createUpdate: (data: Record<string, unknown>) =>
      fetchAdmin('/api/admin/updates', opts({ method: 'POST', body: JSON.stringify(data) })),
    updateUpdate: (id: string, data: Record<string, unknown>) =>
      fetchAdmin(`/api/admin/updates/${id}`, opts({ method: 'PUT', body: JSON.stringify(data) })),
    deleteUpdate: (id: string) =>
      fetchAdmin(`/api/admin/updates/${id}`, opts({ method: 'DELETE' })),

    uploadUpdateFile: async (id: string, file: File) => {
      const { upload } = await import('@vercel/blob/client');
      const blob = await upload(`updates/${id}/${file.name}`, file, {
        access: 'public',
        handleUploadUrl: `/api/admin/updates/${id}/file`,
        clientPayload: JSON.stringify({ jwtToken: token, fileSize: file.size }),
      });
      // Save blob URL to DB via PATCH (more reliable than onUploadCompleted callback)
      await fetchAdmin(`/api/admin/updates/${id}/file`, opts({
        method: 'PATCH',
        body: JSON.stringify({ downloadUrl: blob.url, downloadFileName: file.name, downloadFileSize: file.size }),
      }));
      return {
        success: true,
        downloadUrl: blob.url,
        downloadFileName: file.name,
        downloadFileSize: file.size,
      };
    },

    deleteUpdateFile: (id: string) =>
      fetchAdmin(`/api/admin/updates/${id}/file`, opts({ method: 'DELETE' })),
  };
}
