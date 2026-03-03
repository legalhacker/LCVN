import mammoth from 'mammoth';

export interface ParsedArticle {
  articleNumber: string;
  title?: string;
  content: string;
  chapterNumber?: string;
  chapterTitle?: string;
  sectionNumber?: string;
  sectionTitle?: string;
  orderIndex: number;
}

export interface ParsedDocument {
  rawText: string;
  articles: ParsedArticle[];
}

const CHAPTER_RE = /^Chương\s+(I{1,4}V?|V?I{0,3}[IX]?|\d+)\b(.*)$/;
const ARTICLE_RE = /^Điều\s+(\d+)[.:\s]/;
const SECTION_RE = /^Mục\s+(\d+)\b(.*)$/;

export async function parseDocx(buffer: Buffer): Promise<ParsedDocument> {
  const { value: rawText } = await mammoth.extractRawText({ buffer });

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  const articles: ParsedArticle[] = [];
  let currentChapterNumber: string | undefined;
  let currentChapterTitle: string | undefined;
  let currentSectionNumber: string | undefined;
  let currentSectionTitle: string | undefined;
  let currentArticleNumber: string | undefined;
  let currentArticleTitle: string | undefined;
  let currentLines: string[] = [];
  let orderIndex = 0;

  const flushArticle = () => {
    if (!currentArticleNumber) return;
    articles.push({
      articleNumber: currentArticleNumber,
      title: currentArticleTitle,
      content: currentLines.join('\n').trim(),
      chapterNumber: currentChapterNumber,
      chapterTitle: currentChapterTitle,
      sectionNumber: currentSectionNumber,
      sectionTitle: currentSectionTitle,
      orderIndex: orderIndex++,
    });
    currentLines = [];
    currentArticleTitle = undefined;
  };

  for (const line of lines) {
    const chapterMatch = line.match(CHAPTER_RE);
    const articleMatch = line.match(ARTICLE_RE);
    const sectionMatch = line.match(SECTION_RE);

    if (chapterMatch) {
      flushArticle();
      currentArticleNumber = undefined;
      currentChapterNumber = chapterMatch[1].trim();
      currentChapterTitle = chapterMatch[2]?.trim() || undefined;
      currentSectionNumber = undefined;
      currentSectionTitle = undefined;
    } else if (sectionMatch) {
      flushArticle();
      currentArticleNumber = undefined;
      currentSectionNumber = sectionMatch[1].trim();
      currentSectionTitle = sectionMatch[2]?.trim() || undefined;
    } else if (articleMatch) {
      flushArticle();
      currentArticleNumber = articleMatch[1];
      // Check if rest of line (after number+delimiter) looks like a title
      const rest = line.replace(ARTICLE_RE, '').trim();
      if (rest && !rest.startsWith('1.') && rest.length < 200) {
        currentArticleTitle = rest;
      } else {
        currentArticleTitle = undefined;
        if (rest) currentLines.push(rest);
      }
    } else if (currentArticleNumber) {
      currentLines.push(line);
    }
  }

  flushArticle();

  return { rawText, articles };
}
