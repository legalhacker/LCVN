import { prisma } from "@/lib/prisma";
import type { CrawlerResult, CrawlRunResult } from "./types";

const LEGAL_FIELD_KEYWORDS: Record<string, string[]> = {
  "Doanh nghiệp": ["doanh nghiệp", "công ty", "kinh doanh", "thương mại", "đầu tư"],
  "Lao động": ["lao động", "người lao động", "tiền lương", "bảo hiểm xã hội", "việc làm"],
  "Thuế": ["thuế", "thu nhập", "giá trị gia tăng", "VAT", "TNCN", "TNDN"],
  "Đất đai": ["đất đai", "bất động sản", "nhà ở", "quy hoạch", "xây dựng"],
  "Tài chính - Ngân hàng": ["ngân hàng", "tài chính", "tín dụng", "chứng khoán", "bảo hiểm"],
  "Hình sự": ["hình sự", "tội phạm", "xử phạt", "vi phạm hành chính"],
  "Dân sự": ["dân sự", "hợp đồng", "thừa kế", "tài sản", "bồi thường"],
  "Hành chính": ["hành chính", "thủ tục", "cải cách", "công chức", "viên chức"],
  "Môi trường": ["môi trường", "khí thải", "ô nhiễm", "bảo vệ môi trường"],
  "Y tế": ["y tế", "sức khỏe", "dược phẩm", "bệnh viện", "khám chữa bệnh"],
  "Giáo dục": ["giáo dục", "đào tạo", "trường học", "sinh viên", "học sinh"],
  "Công nghệ": ["công nghệ", "số hóa", "dữ liệu", "an ninh mạng", "thương mại điện tử"],
};

const AFFECTED_SUBJECT_KEYWORDS: Record<string, string[]> = {
  "Doanh nghiệp": ["doanh nghiệp", "công ty", "tổ chức kinh tế", "nhà đầu tư"],
  "Người lao động": ["người lao động", "lao động", "nhân viên", "công nhân"],
  "Cá nhân": ["cá nhân", "công dân", "người dân", "cư dân"],
  "Cơ quan nhà nước": ["cơ quan nhà nước", "chính quyền", "UBND", "bộ ngành"],
  "Hộ kinh doanh": ["hộ kinh doanh", "hộ gia đình", "cá thể"],
  "Tổ chức nước ngoài": ["nước ngoài", "FDI", "quốc tế", "nhà đầu tư nước ngoài"],
};

export function extractLegalFields(text: string): string[] {
  const lower = text.toLowerCase();
  const matched: string[] = [];
  for (const [field, keywords] of Object.entries(LEGAL_FIELD_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      matched.push(field);
    }
  }
  return matched;
}

export function extractAffectedSubjects(text: string): string[] {
  const lower = text.toLowerCase();
  const matched: string[] = [];
  for (const [subject, keywords] of Object.entries(AFFECTED_SUBJECT_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      matched.push(subject);
    }
  }
  return matched;
}

export async function saveNewItems(
  items: CrawlerResult[],
  sourceName: string
): Promise<CrawlRunResult> {
  const result: CrawlRunResult = {
    source: sourceName,
    newItems: 0,
    skipped: 0,
    errors: [],
  };

  for (const item of items) {
    try {
      const existing = await prisma.crawledItem.findUnique({
        where: { sourceUrl: item.sourceUrl },
        select: { id: true },
      });

      if (existing) {
        result.skipped++;
        continue;
      }

      await prisma.crawledItem.create({
        data: {
          title: item.title,
          summary: item.summary,
          sourceUrl: item.sourceUrl,
          sourceName: item.sourceName,
          publishDate: item.publishDate,
          documentType: item.documentType,
          isDraft: item.isDraft,
          legalFields: item.legalFields,
          affectedSubjects: item.affectedSubjects,
          consultationStartDate: item.consultationStartDate ?? null,
          consultationEndDate: item.consultationEndDate ?? null,
          draftingAuthority: item.draftingAuthority ?? null,
          expectedApprovalTime: item.expectedApprovalTime ?? null,
          rawHtml: item.rawHtml ?? null,
        },
      });

      result.newItems++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      result.errors.push(`Failed to save "${item.title}": ${message}`);
    }
  }

  return result;
}
