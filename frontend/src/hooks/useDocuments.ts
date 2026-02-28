'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getDocuments,
  getDocumentBySlug,
  getDocumentFull,
  getArticle,
  getArticleContent,
  getArticleResources,
  globalSearch,
  type DocumentFilters,
  type SearchParams,
} from '@/lib/api';

export function useDocuments(filters: DocumentFilters = {}) {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: () => getDocuments(filters),
  });
}

export function useDocument(slug: string) {
  return useQuery({
    queryKey: ['document', slug],
    queryFn: () => getDocumentBySlug(slug),
    enabled: !!slug,
  });
}

export function useDocumentFull(slug: string) {
  return useQuery({
    queryKey: ['document-full', slug],
    queryFn: () => getDocumentFull(slug),
    enabled: !!slug,
  });
}

export function useArticle(articleId: string) {
  return useQuery({
    queryKey: ['article', articleId],
    queryFn: () => getArticle(articleId),
    enabled: !!articleId,
  });
}

export function useArticleContent(articleId: string) {
  return useQuery({
    queryKey: ['article-content', articleId],
    queryFn: () => getArticleContent(articleId),
    enabled: !!articleId,
  });
}

export function useArticleResources(articleId: string) {
  return useQuery({
    queryKey: ['article-resources', articleId],
    queryFn: () => getArticleResources(articleId),
    enabled: !!articleId,
  });
}

export function useGlobalSearch(params: SearchParams | null) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => globalSearch(params!),
    enabled: !!params && !!params.q,
  });
}
